import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/api/api_client.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:rekor_api/api.dart' as generated;

void main() {
  group('ApiClient', () {
    setUp(() {
      FlutterSecureStorage.setMockInitialValues({});
    });

    test('Retourne ok lorsque le backend repond correctement', () async {
      final mockClient = MockClient((request) async {
        expect(request.method, 'GET');
        expect(request.url.path, '/');
        return http.Response(
          '{"status":"ok"}',
          200,
          headers: {'content-type': 'application/json'},
        );
      });
      final api = ApiClient('http://localhost:3000', client: mockClient);

      expect(await api.health(), 'ok');
    });

    test(
      'Retourne une erreur si le backend ne renvoie pas de statut',
      () async {
        final api = ApiClient(
          'http://localhost:3000',
          client: MockClient((_) async => http.Response('', 200)),
        );

        await expectLater(api.health(), throwsStateError);
      },
    );

    test('Effectue la connexion et stocke le refresh token', () async {
      final api = ApiClient(
        'http://localhost:3000',
        client: MockClient((request) async {
          expect(request.method, 'POST');
          expect(request.url.path, '/auth/login');
          expect(
            request.body,
            '{"email":"ada@exemple.fr","password":"motdepasse","associationName":"Gières Volley-Ball"}',
          );
          return http.Response(
            '{"access_token":"access","refresh_token":"refresh"}',
            200,
            headers: {'content-type': 'application/json'},
          );
        }),
      );

      expect(await api.login('ada@exemple.fr', 'motdepasse', 'Gières Volley-Ball',), 'access',);
      expect(await api.getRefreshToken(), 'refresh');
    });

    test('Refuse une reponse de connexion sans token', () async {
      final api = ApiClient(
        'http://localhost:3000',
        client: MockClient(
          (_) async => http.Response(
            '{"access_token":"","refresh_token":"refresh"}',
            200,
            headers: {'content-type': 'application/json'},
          ),
        ),
      );

      await expectLater(api.login('ada@exemple.fr', 'bad', 'Gières Volley-Ball'), throwsStateError,);
      expect(await api.getRefreshToken(), isNull);
    });

    test('restoreSession retourne false sans refresh token', () async {
      final api = ApiClient(
        'http://localhost:3000',
        client: MockClient((_) async => http.Response('', 500)),
      );

      expect(await api.restoreSession(), isFalse);
    });

    test('restoreSession renouvelle les tokens enregistrés', () async {
      FlutterSecureStorage.setMockInitialValues({'refresh_token': 'old'});
      final api = ApiClient(
        'http://localhost:3000',
        client: MockClient((request) async {
          expect(request.url.path, '/auth/refresh');
          return http.Response(
            '{"access_token":"new-access","refresh_token":"new-refresh"}',
            200,
            headers: {'content-type': 'application/json'},
          );
        }),
      );

      expect(await api.restoreSession(), isTrue);
      expect(await api.getRefreshToken(), 'new-refresh');
    });

    test('refreshAccessToken retourne false sans refresh token', () async {
      final api = ApiClient(
        'http://localhost:3000',
        client: MockClient((_) async => http.Response('', 500)),
      );

      expect(await api.refreshAccessToken(), isFalse);
    });

    test('refreshAccessToken traite une reponse invalide', () async {
      FlutterSecureStorage.setMockInitialValues({'refresh_token': 'old'});
      final api = ApiClient(
        'http://localhost:3000',
        client: MockClient(
          (_) async => http.Response(
            '{"access_token":"","refresh_token":""}',
            200,
            headers: {'content-type': 'application/json'},
          ),
        ),
      );

      expect(await api.refreshAccessToken(), isFalse);
    });

    test(
      'authenticatedRequest relance une requete apres renouvellement',
      () async {
        FlutterSecureStorage.setMockInitialValues({'refresh_token': 'old'});
        var attempts = 0;
        final api = ApiClient(
          'http://localhost:3000',
          client: MockClient((request) async {
            if (request.url.path == '/auth/refresh') {
              return http.Response(
                '{"access_token":"new-access","refresh_token":"new-refresh"}',
                200,
                headers: {'content-type': 'application/json'},
              );
            }
            throw Exception('unexpected request');
          }),
        );

        final result = await api.authenticatedRequest(() async {
          attempts++;
          if (attempts == 1) {
            throw generated.ApiException(401, 'expired');
          }
          return 'ok';
        });

        expect(result, 'ok');
        expect(attempts, 2);
      },
    );

    test('authenticatedRequest propage une erreur autre que 401', () async {
      final api = ApiClient(
        'http://localhost:3000',
        client: MockClient((_) async => http.Response('', 500)),
      );

      await expectLater(
        api.authenticatedRequest<String>(
          () async => throw generated.ApiException(500, 'server error'),
        ),
        throwsA(isA<generated.ApiException>()),
      );
    });

    test('logout supprime les tokens locaux', () async {
      FlutterSecureStorage.setMockInitialValues({'refresh_token': 'refresh'});
      final api = ApiClient(
        'http://localhost:3000',
        client: MockClient((_) async => http.Response('', 200)),
      );

      api.setAccessToken('access');
      await api.logout();

      expect(await api.getRefreshToken(), isNull);
    });

    test('logout reste fonctionnel si le backend echoue', () async {
      FlutterSecureStorage.setMockInitialValues({'refresh_token': 'refresh'});
      final api = ApiClient(
        'http://localhost:3000',
        client: MockClient(
          (_) async => throw Exception('backend indisponible'),
        ),
      );

      await api.logout();

      expect(await api.getRefreshToken(), isNull);
    });
  });
}
