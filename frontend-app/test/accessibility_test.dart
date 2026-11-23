import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/api/api_client.dart';
import 'package:frontend_app/main.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  setUp(() {
    // Le back est simulé : le test ne dépend d'aucun réseau.
    ApiClient.instance = ApiClient(
      'http://localhost',
      client: MockClient(
        (_) async => http.Response(
          '{"status":"ok"}',
          200,
          headers: {'content-type': 'application/json'},
        ),
      ),
    );
  });

  // Une entrée par écran de l'application.
  testWidgets("la page d'accueil respecte les consignes d'accessibilité", (
    tester,
  ) async {
    final semantics = tester.ensureSemantics();

    await tester.pumpWidget(MyApp(sessionFuture: Future.value(true)));

    await tester.pumpAndSettle();

    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    await expectLater(tester, meetsGuideline(textContrastGuideline));

    semantics.dispose();
  });
}
