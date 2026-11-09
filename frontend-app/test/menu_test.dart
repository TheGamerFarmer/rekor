import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/mobile_pages/home_page.dart';
import 'package:frontend_app/widgets/app_menu.dart';
import 'package:flutter/material.dart';

void main() {
  group('AppMenu', () {
    testWidgets('Affiche le menu', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppMenu(onClose: () {}),
          ),
        ),
      );

      expect(find.text('Menu'), findsOneWidget);
    });

    testWidgets('Affiche les icônes du menu', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppMenu(onClose: () {}),
          ),
        ),
      );

      final icons = [
        Icons.home,
        Icons.chat,
        Icons.directions_car,
        Icons.calendar_month,
        Icons.emoji_events,
        Icons.sports,
        Icons.bar_chart,
        Icons.campaign,
        Icons.settings,
      ];

      for (final icon in icons) {
        await tester.scrollUntilVisible(
          find.byIcon(icon),
          100,
          scrollable: find.byType(Scrollable).last,
        );
        expect(find.byIcon(icon), findsOneWidget);
      }
    });

    testWidgets('Affiche les noms du menu', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppMenu(onClose: () {}),
          ),
        ),
      );

      final elements = [
        'Accueil',
        'Discussions',
        'Covoiturage',
        'Évènements',
        'Compétition',
        'Arbitrage',
        'Statistiques',
        'News',
        'Paramètres',
      ];

      for (final element in elements) {
        await tester.scrollUntilVisible(
          find.text(element),
          100,
          scrollable: find.byType(Scrollable).last,
        );

        expect(find.text(element), findsOneWidget);
      }
    });

    testWidgets('Le bouton de fermeture appelle onClose', (tester) async {
      bool menuFerme = false;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppMenu(
              onClose: () {
                menuFerme = true;
              },
            ),
          ),
        ),
      );
      await tester.tap(find.byTooltip('Close'));
      await tester.pump();
      expect(menuFerme, isTrue);
    });

    testWidgets('Le clic sur Accueil permet de naviguer vers MyHomePage',
            (tester) async {
          await tester.pumpWidget(
            MaterialApp(
              home: Scaffold(
                body: AppMenu(onClose: () {}),
              ),
            ),
          );

          await tester.tap(find.bySemanticsLabel('Accueil'));
          await tester.pumpAndSettle();

          expect(find.byType(MyHomePage), findsOneWidget);
        });
  });
}
