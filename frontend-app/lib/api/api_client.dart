import 'package:http/http.dart' as http;
import 'package:rekor_api/api.dart' as generated;

/// Client du back-end, au-dessus du client généré depuis le contrat OpenAPI (api_client/).
/// Ne modifie jamais le code généré : si le contrat change, relance `npm run clients:generate` dans backend/.
///
/// Par défaut, il vise la machine hôte vue depuis l'émulateur Android (10.0.2.2).
/// Pour une autre adresse : `flutter run --dart-define=API_URL=http://192.168.1.10:3000`
class ApiClient {
  ApiClient(this.baseUrl, {http.Client? client})
    : _httpClient = client ?? http.Client(),
      _bearerAuth = generated.HttpBearerAuth() {
    _apiClient = generated.ApiClient(
      basePath: baseUrl,
      authentication: _bearerAuth,
    )..client = _httpClient;

    _health = generated.HealthApi(_apiClient);
    _auth = generated.AuthenticationApi(_apiClient);
    _users = generated.UsersApi(_apiClient);
  }

  final String baseUrl;
  final http.Client _httpClient;
  final generated.HttpBearerAuth _bearerAuth;

  late final generated.ApiClient _apiClient;
  late final generated.HealthApi _health;
  late final generated.AuthenticationApi _auth;
  late final generated.UsersApi _users;

  /// Instance utilisée par l'application. Les tests peuvent la remplacer
  /// (par exemple par un client qui simule les réponses du back).
  static ApiClient instance = ApiClient(
    const String.fromEnvironment(
      'API_URL',
      defaultValue: 'http://10.0.2.2:3000',
    ),
  );

  /// GET / : le statut du back ("ok" quand tout va bien).
  Future<String> health() async {
    final response = await _health.getHealth();
    if (response == null) throw StateError('Réponse vide du back');
    return response.status;
  }

  /// Connexion auprès du back-end.
  Future<String> login(String email, String password) async {
    final response = await _auth.login(
      generated.LoginInput(email: email, password: password),
    );

    if (response == null || response.accessToken.isEmpty) {
      throw StateError('Aucun token reçu lors de la connexion');
    }

    setAccessToken(response.accessToken);
    return response.accessToken;
  }

  /// Configure le token utilisé pour les prochaines requêtes.
  void setAccessToken(String token) {
    _bearerAuth.accessToken = token;
  }

  /// Récupère le profil de l'utilisateur connecté.
  Future<generated.UserDetails?> getMyProfile() {
    return _users.getMyProfile();
  }

  /// Déconnecte localement l'utilisateur.
  void logout() {
    _bearerAuth.accessToken = null;
  }
}
