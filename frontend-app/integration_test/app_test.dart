import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:frontend_app/main.dart' as app;

import 'support/backend.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  // Les mêmes tests tournent deux fois : back simulé (mock), puis vrai back (real).
  for (final mode in backendModes.where(isSelected)) {
    group('backend $mode', () {
      testWidgets("le compteur démarre à 0 et s'incrémente au clic", (
        tester,
      ) async {
        installBackend(mode);
        // Lance l'application réelle (main.dart), comme sur un appareil
        app.main();
        await tester.pumpAndSettle();

        expect(find.text('0'), findsOneWidget);

        await tester.tap(find.byIcon(Icons.add));
        await tester.pumpAndSettle();

        expect(find.text('1'), findsOneWidget);
        expect(find.text('0'), findsNothing);
      });

      testWidgets("affiche le statut du back", (tester) async {
        installBackend(mode);
        app.main();

        await pumpUntilFound(tester, find.text('Backend : ok'));
      });
    });
  }
}
