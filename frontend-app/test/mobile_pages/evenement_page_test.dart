import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/mobile_pages/evenement_page.dart';

void main() {
  Future<void> afficher(WidgetTester tester) async {
    await tester.binding.setSurfaceSize(const Size(1200, 1100));
    await tester.pumpWidget(const MaterialApp(home: Evenementpage()));
    await tester.pumpAndSettle();
  }

  testWidgets('filtre les évènements à venir et terminés', (tester) async {
    await afficher(tester);

    expect(find.text('ÉVÈNEMENTS'), findsOneWidget);
    expect(find.text('Entraînement'), findsWidgets);
    expect(find.text('Les Aigles'), findsOneWidget);
    expect(
      find.text('Bilan de la saison et préparation du prochain tournoi.'),
      findsNothing,
    );

    await tester.tap(find.text('Terminés'));
    await tester.pumpAndSettle();
    expect(find.text('Entraînement'), findsNothing);
    expect(find.text('Réunion'), findsOneWidget);
    expect(
      find.text('Bilan de la saison et préparation du prochain tournoi.'),
      findsOneWidget,
    );

    await tester.tap(find.text('À venir'));
    await tester.pumpAndSettle();
    expect(find.text('Entraînement'), findsWidgets);
    expect(find.text('Réunion'), findsNothing);
  });

  testWidgets(
    'ouvre les détails d’un évènement terminé et son formulaire de modification',
    (tester) async {
      await afficher(tester);

      await tester.tap(find.text('Terminés'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Réunion'));
      await tester.pumpAndSettle();

      expect(find.text('Réunion : détails'), findsOneWidget);
      expect(
        find.text('Bilan de la saison et préparation du prochain tournoi.'),
        findsOneWidget,
      );

      await tester.tap(find.text('MODIFIER'));
      await tester.pumpAndSettle();
      expect(find.text('Modifier l’évènement'), findsOneWidget);
      expect(find.text('Description :'), findsOneWidget);
      expect(find.text('ANNULER'), findsOneWidget);

      await tester.tap(find.text('ANNULER'));
      await tester.pumpAndSettle();
      expect(find.text('Modifier l’évènement'), findsNothing);

      await tester.tap(find.byIcon(Icons.arrow_back));
      await tester.pumpAndSettle();
      expect(find.text('ÉVÈNEMENTS'), findsOneWidget);
    },
  );

  testWidgets('signale les champs obligatoires manquants à la création', (
    tester,
  ) async {
    await afficher(tester);

    await tester.tap(find.byIcon(Icons.add));
    await tester.pumpAndSettle();
    expect(find.text('Créer un évènement'), findsOneWidget);

    await tester.ensureVisible(find.text('VALIDER'));
    await tester.tap(find.text('VALIDER'));
    await tester.pumpAndSettle();
    expect(find.text('Merci de remplir tous les champs.'), findsOneWidget);
    expect(find.text('Créer un évènement'), findsOneWidget);

    await tester.tap(find.text('ANNULER'));
    await tester.pumpAndSettle();
  });
}
