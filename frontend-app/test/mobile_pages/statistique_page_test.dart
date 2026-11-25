import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/mobile_pages/statistique_page.dart';

void main() {
  Future<void> afficher(WidgetTester tester) async {
    await tester.binding.setSurfaceSize(const Size(1200, 1100));
    await tester.pumpWidget(const MaterialApp(home: StatistiquePage()));
    await tester.pumpAndSettle();
  }

  testWidgets(
    'affiche le résumé et détaille les statistiques par match et joueur',
    (tester) async {
      await afficher(tester);

      expect(find.text('STATISTIQUES'), findsOneWidget);
      expect(find.text('Choisis une équipe'), findsOneWidget);
      expect(find.text('6 matchs joués'), findsOneWidget);

      await tester.tap(find.text('Grenoble Volley'));
      await tester.pumpAndSettle();

      expect(find.text('Équipe : Grenoble Volley'), findsOneWidget);
      expect(find.text('Résumé'), findsOneWidget);
      expect(find.text('Victoires'), findsOneWidget);
      expect(find.text('Défaites'), findsOneWidget);
      expect(find.text('50 %'), findsOneWidget);
      expect(find.text('Service réussi'), findsOneWidget);
      expect(find.text('Attaque réussie'), findsOneWidget);

      await tester.tap(find.widgetWithText(ChoiceChip, 'Match'));
      await tester.pumpAndSettle();
      expect(find.text('Match contre Lyon Volley-Club'), findsOneWidget);
      expect(find.text('Résultat'), findsOneWidget);
      expect(find.text('Défaite'), findsOneWidget);
      expect(
        find.text('07/11/2026 · Lyon Volley-Club - Grenoble Volley'),
        findsOneWidget,
      );
      expect(find.textContaining('Sets : 25-18'), findsOneWidget);

      await tester.tap(find.byType(DropdownButton<int>));
      await tester.pumpAndSettle();
      await tester.tap(find.text('24/10/2026 · vs Annecy').last);
      await tester.pumpAndSettle();
      expect(find.text('Match contre Annecy'), findsOneWidget);
      expect(find.text('Victoire'), findsOneWidget);
      expect(find.textContaining('Sets : 25-22'), findsOneWidget);

      await tester.tap(find.widgetWithText(ChoiceChip, 'Joueur'));
      await tester.pumpAndSettle();
      expect(find.text('Joueur : CAMILLE'), findsOneWidget);
      expect(find.text('Aces'), findsOneWidget);
      expect(find.text('% réussite'), findsNWidgets(2));

      await tester.tap(find.byType(DropdownButton<String>));
      await tester.pumpAndSettle();
      await tester.tap(find.text('LUCIE').last);
      await tester.pumpAndSettle();
      expect(find.text('Joueur : LUCIE'), findsOneWidget);
      expect(find.text('100 %'), findsOneWidget);
      expect(find.text('Attaque'), findsOneWidget);
    },
  );

  testWidgets('affiche le cas sans match et permet de changer d’équipe', (
    tester,
  ) async {
    await afficher(tester);

    await tester.tap(find.text('Grenoble Volley 2'));
    await tester.pumpAndSettle();
    expect(find.text('Aucun match joué pour le moment.'), findsOneWidget);

    await tester.tap(find.text('Changer d\'équipe'));
    await tester.pumpAndSettle();
    expect(find.text('Choisis une équipe'), findsOneWidget);
  });
}
