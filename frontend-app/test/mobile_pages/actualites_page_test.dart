import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/mobile_pages/actualites_page.dart';

void main() {
  testWidgets('affiche les actualités triées et leurs catégories', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(1200, 1100));
    await tester.pumpWidget(const MaterialApp(home: ActualitesPage()));
    await tester.pumpAndSettle();

    expect(find.text('ACTUALITÉS'), findsOneWidget);
    expect(
      find.text('Belle victoire de l\'équipe 1 à domicile'),
      findsOneWidget,
    );
    expect(find.text('Soirée du club : réservez la date'), findsOneWidget);
    expect(
      find.text('Changement d\'horaire des entraînements'),
      findsOneWidget,
    );
    expect(find.text('Les licences 2026-2027 sont ouvertes'), findsOneWidget);
    expect(find.text('Match'), findsOneWidget);
    expect(find.text('Évènement'), findsOneWidget);
    expect(find.text('Info'), findsOneWidget);
    expect(find.text('Club'), findsOneWidget);
    expect(find.text('22/11/2026'), findsOneWidget);
    expect(find.text('20/11/2026'), findsOneWidget);

    final actualiteLaPlusRecente = tester.getTopLeft(
      find.text('Belle victoire de l\'équipe 1 à domicile'),
    );
    final actualiteSuivante = tester.getTopLeft(
      find.text('Soirée du club : réservez la date'),
    );
    expect(actualiteLaPlusRecente.dy, lessThan(actualiteSuivante.dy));
  });

  testWidgets('ouvre une actualité pour lire son contenu complet', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(1200, 1100));
    await tester.pumpWidget(const MaterialApp(home: ActualitesPage()));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Belle victoire de l\'équipe 1 à domicile'));
    await tester.pumpAndSettle();

    final bottomSheet = find.byType(BottomSheet);
    expect(
      find.descendant(
        of: bottomSheet,
        matching: find.text('Belle victoire de l\'équipe 1 à domicile'),
      ),
      findsOneWidget,
    );
    expect(
      find.descendant(
        of: bottomSheet,
        matching: find.text(
          'Samedi dernier, l\'équipe 1 s\'est imposée 3 sets à 0 devant son public. '
          'Une belle performance collective, avec un service très solide en début de match. '
          'Prochain rendez-vous le week-end du 13 décembre.',
        ),
      ),
      findsOneWidget,
    );
    expect(
      find.descendant(of: bottomSheet, matching: find.text('Match')),
      findsOneWidget,
    );
    expect(
      find.descendant(of: bottomSheet, matching: find.text('22/11/2026')),
      findsOneWidget,
    );

    Navigator.of(tester.element(bottomSheet)).pop();
    await tester.pumpAndSettle();
    expect(find.text('ACTUALITÉS'), findsOneWidget);
  });
}
