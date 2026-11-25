import 'dart:convert';

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

    test('Récupère les associations disponibles', () async {
      final api = ApiClient(
        'http://localhost:3000',
        client: MockClient((request) async {
          expect(request.method, 'GET');
          expect(request.url.path, '/association');
          return http.Response(
            '[{"_id":"1","name":"Gières Volley-Ball","address":"Gières"}]',
            200,
            headers: {'content-type': 'application/json'},
          );
        }),
      );

      final associations = await api.getAssociations();

      expect(associations, hasLength(1));
      expect(associations.single.name, 'Gières Volley-Ball');
    });

    test('Récupère le profil de l’utilisateur connecté', () async {
      final api = ApiClient(
        'http://localhost:3000',
        client: MockClient((request) async {
          expect(request.method, 'GET');
          expect(request.url.path, '/users/me');
          expect(request.headers['authorization'], 'Bearer access');
          return http.Response(
            '{"id":"1","name":"Lovelace","firstName":"Ada",'
            '"email":"ada@exemple.fr","role":"Adhérent","pronoun":"Elle"}',
            200,
            headers: {'content-type': 'application/json'},
          );
        }),
      )..setAccessToken('access');

      final profile = await api.getMyProfile();

      expect(profile?.id, '1');
      expect(profile?.email, 'ada@exemple.fr');
      expect(profile?.firstName, 'Ada');
      expect(profile?.medicalCertificate, isFalse);
      expect(profile?.rightOfPublicity, isFalse);
    });

    test('Modifie le profil de l’utilisateur connecté', () async {
      final api = ApiClient(
        'http://localhost:3000',
        client: MockClient((request) async {
          expect(request.method, 'PATCH');
          expect(request.url.path, '/users/me');
          expect(request.headers['authorization'], 'Bearer access');
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          expect(body['email'], 'ada.nouveau@exemple.fr');
          expect(body['firstName'], 'Ada');
          return http.Response('', 204);
        }),
      )..setAccessToken('access');

      await api.updateMyProfile(
        generated.UpdateProfileInput(
          email: 'ada.nouveau@exemple.fr',
          firstName: 'Ada',
        ),
      );
    });

    test('Supprime le profil de l’utilisateur connecté', () async {
      final api = ApiClient(
        'http://localhost:3000',
        client: MockClient((request) async {
          expect(request.method, 'DELETE');
          expect(request.url.path, '/users/me');
          expect(request.headers['authorization'], 'Bearer access');
          return http.Response('', 204);
        }),
      )..setAccessToken('access');

      await api.deleteMyProfile();
    });

    test('Modifie le mot de passe de l’utilisateur connecté', () async {
      final api = ApiClient(
        'http://localhost:3000',
        client: MockClient((request) async {
          expect(request.method, 'PUT');
          expect(request.url.path, '/users/me/password');
          expect(request.headers['authorization'], 'Bearer access');
          expect(jsonDecode(request.body), {
            'old_password': 'ancien',
            'new_password': 'nouveau',
          });
          return http.Response('', 204);
        }),
      )..setAccessToken('access');

      await api.changeMyPassword(oldPassword: 'ancien', newPassword: 'nouveau');
    });

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

      expect(
        await api.login('ada@exemple.fr', 'motdepasse', 'Gières Volley-Ball'),
        'access',
      );
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

      await expectLater(
        api.login('ada@exemple.fr', 'bad', 'Gières Volley-Ball'),
        throwsStateError,
      );
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

    test('Signale une erreur lorsqu’une réponse santé est invalide', () async {
      final mockClient = MockClient((_) async => http.Response('', 500));
      final api = ApiClient('http://localhost:3000', client: mockClient);

      await expectLater(api.health(), throwsA(anyOf(isA<Exception>())));
    });

    test('Conserve les paramètres de connexion du client', () {
      final api = ApiClient('http://localhost:3000');
      expect(api.baseUrl, 'http://localhost:3000');
    });
  });
}
