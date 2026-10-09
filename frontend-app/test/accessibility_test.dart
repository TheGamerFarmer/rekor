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
    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();

    // On analyse la page une fois affichée, pas pendant le chargement.
    expect(find.text('Backend : ok'), findsOneWidget);

    // Zones tactiles assez grandes (48 dp sur Android, 44 pt sur iOS)
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
    // Chaque élément cliquable a un libellé que lira un lecteur d'écran
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    // Contraste suffisant entre le texte et son fond
    await expectLater(tester, meetsGuideline(textContrastGuideline));

    semantics.dispose();
  });
}
