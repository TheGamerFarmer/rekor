import 'package:http/http.dart' as http;
import 'package:rekor_api/api.dart' as generated;

/// Client du back-end, au-dessus du client généré depuis le contrat OpenAPI (api_client/).
/// Ne modifie jamais le code généré : si le contrat change, relance `npm run clients:generate` dans backend/.
///
/// Par défaut, il vise la machine hôte vue depuis l'émulateur Android (10.0.2.2).
/// Pour une autre adresse : `flutter run --dart-define=API_URL=http://192.168.1.10:3000`
class ApiClient {
  ApiClient(this.baseUrl, {http.Client? client})
      : _health = generated.HealthApi(
          generated.ApiClient(basePath: baseUrl)..client = client ?? http.Client(),
        );

  final String baseUrl;
  final generated.HealthApi _health;

  /// Instance utilisée par l'application. Les tests peuvent la remplacer
  /// (par exemple par un client qui simule les réponses du back).
  static ApiClient instance = ApiClient(
    const String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:3000'),
  );

  /// GET / : le statut du back ("ok" quand tout va bien).
  Future<String> health() async {
    final response = await _health.getHealth();
    if (response == null) throw StateError('Réponse vide du back');
    return response.status;
  }
}
