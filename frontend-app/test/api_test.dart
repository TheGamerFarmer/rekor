import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:frontend_app/api/api_client.dart';

void main() {
  group('ApiClient', () {
    test('Retourne ok lorsque le backend répond correctement', () async {
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

      final result = await api.health();

      expect(result, 'ok');
    });
  });
}
