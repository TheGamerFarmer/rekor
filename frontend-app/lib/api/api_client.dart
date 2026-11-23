import 'package:flutter/cupertino.dart';
import 'package:http/http.dart' as http;
import 'package:rekor_api/api.dart' as generated;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

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

  static const FlutterSecureStorage _storage = FlutterSecureStorage();

  /// Instance utilisée par l'application. Les tests peuvent la remplacer
  /// (par exemple par un client qui simule les réponses du back).
  static ApiClient instance = ApiClient(
    const String.fromEnvironment(
      'API_URL',
      defaultValue: 'http://10.0.2.2:3000',
      //defaultValue: 'http://10.0.2.2:3000/api',
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

    await _storage.write(key: 'refresh_token', value: response.refreshToken);

    return response.accessToken;
  }

  /// Configure le token utilisé pour les prochaines requêtes.
  void setAccessToken(String token) {
    _bearerAuth.accessToken = token;
  }

  /// Récupère le profil de l'utilisateur connecté.
  Future<generated.UserDetails?> getMyProfile() {
    return authenticatedRequest(() => _users.getMyProfile());
  }

  /// Restaure la session utilisateur au démarrage de l'application.
  Future<bool> restoreSession() async {
    final refreshToken = await getRefreshToken();

    // Aucun utilisateur précédemment connecté.
    if (refreshToken == null || refreshToken.isEmpty) {
      return false;
    }

    // Tentative de renouvellement des tokens.
    return await refreshAccessToken();
  }

  /*/// Déconnecte localement l'utilisateur.
  void logout() {
    _bearerAuth.accessToken = null;
  }*/

  /// Déconnecte l'utilisateur côté serveur et localement.
  Future<void> logout() async {
    try {
      final refreshToken = await getRefreshToken();

      if (refreshToken != null && refreshToken.isNotEmpty) {
        await _auth.logout(
          generated.RefreshTokenInput(refreshToken: refreshToken),
        );
      }
    } catch (e) {
      debugPrint('Erreur lors de la déconnexion serveur : $e');
      // La déconnexion locale doit fonctionner même si le serveur est inaccessible ou le token invalide.
    } finally {
      // Suppression de l'access token en mémoire.
      _bearerAuth.accessToken = '';

      // Suppression du refresh token sécurisé.
      await _storage.delete(key: 'refresh_token');
    }
  }

  /// Récupre le refresh token
  Future<String?> getRefreshToken() async {
    return await _storage.read(key: 'refresh_token');
  }

  /// Renouvelle les deux tokens à partir du refresh token enregistré.
  Future<bool> refreshAccessToken() async {
    final refreshToken = await _storage.read(key: 'refresh_token');

    if (refreshToken == null || refreshToken.isEmpty) {
      return false;
    }

    try {
      final response = await _auth.refreshTokens(
        generated.RefreshTokenInput(refreshToken: refreshToken),
      );

      if (response == null ||
          response.accessToken.isEmpty ||
          response.refreshToken.isEmpty) {
        return false;
      }

      // Mise à jour de l'access token.
      setAccessToken(response.accessToken);

      // Remplacement du refresh token.
      await _storage.write(key: 'refresh_token', value: response.refreshToken);

      return true;
    } on generated.ApiException catch (e) {
      debugPrint('Erreur API lors du renouvellement : $e');

      // Le refresh token est invalide ou expiré.
      if (e.code == 401) {
        await logout();
      }

      return false;
    } catch (e) {
      debugPrint('Erreur lors du renouvellement des tokens : $e');
      return false;
    }
  }

  /// Exécute une requête et renouvelle le token si nécessaire.
  Future<T> authenticatedRequest<T>(Future<T> Function() request) async {
    try {
      return await request();
    } on generated.ApiException catch (e) {
      // Vérification de l'expiration de l'access token.
      if (e.code != 401) rethrow;

      // Tentative de renouvellement.
      final refreshed = await refreshAccessToken();

      if (!refreshed) rethrow;

      // Nouvelle tentative avec le nouvel access token.
      return await request();
    }
  }
}
