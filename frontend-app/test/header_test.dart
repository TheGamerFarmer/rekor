import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/mobile_pages/home_page.dart';
import 'package:frontend_app/widgets/app_header.dart';
import 'package:flutter/material.dart';

void main() {
  group('AppHeader', () {
    testWidgets('Affiche le logo et le bouton profil', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppHeader(),
          ),
        ),
      );

      expect(find.byType(Image), findsOneWidget);
      expect(find.byIcon(Icons.account_circle), findsOneWidget);
    });

    testWidgets('Le logo permet de naviguer vers Accueil', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppHeader(),
          ),
        ),
      );

      await tester.tap(find.bySemanticsLabel('Accueil'));
      await tester.pumpAndSettle();

      expect(find.byType(MyHomePage), findsOneWidget);
    });

    testWidgets('Le bouton profil ouvre le menu', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppHeader(),
          ),
        ),
      );

      await tester.tap(find.byIcon(Icons.account_circle));
      await tester.pumpAndSettle();

      expect(find.text('Mon profil'), findsOneWidget);
      expect(find.text('Déconnexion'), findsOneWidget);
    });

    testWidgets('Le choix Mon profil ferme le menu', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppHeader(),
          ),
        ),
      );

      await tester.tap(find.byIcon(Icons.account_circle));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Mon profil'));
      await tester.pumpAndSettle();

      expect(find.text('Mon profil'), findsNothing);
    });

    testWidgets('Le choix Déconnexion ferme le menu', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppHeader(),
          ),
        ),
      );

      await tester.tap(find.byIcon(Icons.account_circle));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Déconnexion'));
      await tester.pumpAndSettle();

      expect(find.text('Déconnexion'), findsNothing);
    });
  });

}
