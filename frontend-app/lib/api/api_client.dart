import 'dart:convert';

import 'package:http/http.dart' as http;

/// Client du back-end.
///
/// Par défaut, il vise la machine hôte vue depuis l'émulateur Android (10.0.2.2).
/// Pour une autre adresse : `flutter run --dart-define=API_URL=http://192.168.1.10:3000`
class ApiClient {
  ApiClient(this.baseUrl, {http.Client? client}) : _client = client ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  /// Instance utilisée par l'application. Les tests peuvent la remplacer
  /// (par exemple par un client qui simule les réponses du back).
  static ApiClient instance = ApiClient(
    const String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:3000'),
  );

  /// GET / : le statut du back ("ok" quand tout va bien).
  Future<String> health() async {
    final response = await _client.get(Uri.parse('$baseUrl/'));
    if (response.statusCode != 200) {
      throw ApiException(response.statusCode, response.body);
    }
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    return body['status'] as String;
  }
}

class ApiException implements Exception {
  ApiException(this.statusCode, this.body);

  final int statusCode;
  final String body;

  @override
  String toString() => 'ApiException($statusCode): $body';
}
