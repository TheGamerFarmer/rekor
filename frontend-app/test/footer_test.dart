import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/mobile_pages/home_page.dart';
import 'package:frontend_app/widgets/app_footer.dart';
import 'package:frontend_app/widgets/app_menu.dart';
import 'package:flutter/material.dart';

void main() {
  group('AppFooter', () {
    testWidgets('Affiche accueil', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(body: AppFooter(onMenuTap: () {})),
        ),
      );

      expect(find.text('Accueil'), findsOneWidget);
    });

    testWidgets('Affiche menu', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(body: AppFooter(onMenuTap: () {})),
        ),
      );

      expect(find.text('Menu'), findsOneWidget);
    });

    testWidgets('Affiche discussions', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(body: AppFooter(onMenuTap: () {})),
        ),
      );

      expect(find.text('Discussions'), findsOneWidget);
    });

    testWidgets('Le bouton Menu ouvre le menu', (tester) async {
      bool menuOuvert = false;

      await tester.pumpWidget(
        MaterialApp(
          home: StatefulBuilder(
            builder: (context, setState) {
              return Scaffold(
                body: Stack(
                  children: [
                    AppFooter(
                      onMenuTap: () {
                        setState(() {
                          menuOuvert = !menuOuvert;
                        });
                      },
                    ),

                    if (menuOuvert)
                      AppMenu(
                        onClose: () {
                          setState(() {
                            menuOuvert = false;
                          });
                        },
                      ),
                  ],
                ),
              );
            },
          ),
        ),
      );

      // Vérifie que le menu n'est pas ouvert de base
      expect(find.text('Covoiturage'), findsNothing);

      // Appuie sur le bouton Menu
      await tester.tap(find.text('Menu'));
      await tester.pumpAndSettle();

      // Vérifie que le menu est ouvert
      expect(find.text('Covoiturage'), findsOneWidget);
    });

    testWidgets('Le bouton Accueil ouvre la page d\'accueil', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(body: AppFooter(onMenuTap: () {})),
        ),
      );

      await tester.tap(find.text('Accueil'));
      await tester.pumpAndSettle();

      expect(find.byType(MyHomePage), findsOneWidget);
    });
  });
}
