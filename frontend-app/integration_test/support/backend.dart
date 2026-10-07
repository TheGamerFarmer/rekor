import 'dart:async';
import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/api/api_client.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

/// Quels modes lancer : `mock`, `real` ou `all` (par défaut).
/// Exemple : flutter test integration_test --dart-define=BACKEND=mock
const selectedBackend = String.fromEnvironment('BACKEND', defaultValue: 'all');

/// Adresse du vrai back. 10.0.2.2 = la machine hôte, vue depuis l'émulateur Android.
const apiUrl = String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:3000');

const backendModes = ['mock', 'real'];

bool isSelected(String mode) => selectedBackend == 'all' || selectedBackend == mode;

http.Response jsonResponse(Object body, [int status = 200]) =>
    http.Response(jsonEncode(body), status, headers: {'content-type': 'application/json'});

/// Réponses simulées par défaut ("METHODE /chemin" -> réponse).
final Map<String, http.Response Function()> _defaultMocks = {
  'GET /': () => jsonResponse({'status': 'ok'}),
};

/// Installe le client API utilisé par l'application pour le mode demandé.
///
/// - `real` : le vrai back, à [apiUrl].
/// - `mock` : les réponses viennent de [_defaultMocks] et de [mocks]. Tout appel non simulé
///   échoue en 501 "Mock manquant" au lieu de passer inaperçu.
void installBackend(String mode, {Map<String, http.Response Function()> mocks = const {}}) {
  if (mode == 'real') {
    ApiClient.instance = ApiClient(apiUrl);
    return;
  }
  final responses = {..._defaultMocks, ...mocks};
  ApiClient.instance = ApiClient(
    apiUrl,
    client: MockClient((request) async {
      final route = '${request.method} ${request.url.path}';
      final handler = responses[route];
      if (handler == null) {
        return jsonResponse({'message': 'Mock manquant : $route'}, 501);
      }
      return handler();
    }),
  );
}

/// Fait avancer l'interface jusqu'à ce que [finder] trouve quelque chose (réponse réseau attendue).
Future<void> pumpUntilFound(
  WidgetTester tester,
  Finder finder, {
  Duration timeout = const Duration(seconds: 10),
}) async {
  final end = DateTime.now().add(timeout);
  while (DateTime.now().isBefore(end)) {
    await tester.pump(const Duration(milliseconds: 100));
    if (finder.evaluate().isNotEmpty) return;
  }
  throw TimeoutException('Introuvable après $timeout : $finder');
}
