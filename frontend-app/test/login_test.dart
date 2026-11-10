import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/mobile_pages/login.dart';
import 'package:flutter/material.dart';

void main() {
  group('AppLogin', () {
    testWidgets('Affiche l\'icone et le texte Connexion', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: MyLoginPage())),
      );

      expect(find.byIcon(Icons.account_circle), findsOneWidget);
      expect(find.text('Connexion'), findsOneWidget);
    });

    testWidgets('Affiche le champ adresse e-mail', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: MyLoginPage())),
      );

      expect(find.byIcon(Icons.email), findsOneWidget);
      expect(find.text('Adresse e-mail'), findsOneWidget);
    });

    testWidgets('Affiche le champ mot de passe', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: MyLoginPage())),
      );

      expect(find.byIcon(Icons.lock), findsOneWidget);
      expect(find.text('Mot de passe'), findsOneWidget);

      final vis = find.byIcon(Icons.visibility);
      final visOff = find.byIcon(Icons.visibility_off);
      expect(vis.evaluate().isNotEmpty || visOff.evaluate().isNotEmpty, isTrue);
    });

    testWidgets('Affiche le bouton Se connecter', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: MyLoginPage())),
      );

      expect(find.text('Se connecter'), findsOneWidget);
    });

    testWidgets('Affiche l\'option Mot de passe oublié', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: MyLoginPage())),
      );

      expect(find.text('Mot de passe oublié'), findsOneWidget);
    });

    testWidgets('Changer le visible du mot de passe', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: MyLoginPage())),
      );

      await tester.tap(find.byIcon(Icons.visibility_off));
      await tester.pump();
      expect(find.byIcon(Icons.visibility), findsOneWidget);
    });

    testWidgets('Affiche les messages de champs vides', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: MyLoginPage())),
      );

      await tester.tap(find.text('Se connecter'));
      await tester.pump();

      expect(find.text('Veuillez saisir votre e-mail'), findsOneWidget);
      expect(find.text('Veuillez saisir votre mot de passe'), findsOneWidget);
    });

    testWidgets('Affiche les messages de champs invalides', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: MyLoginPage())),
      );

      await tester.enterText(find.byType(TextFormField).at(0), 'a');
      await tester.enterText(find.byType(TextFormField).at(1), 'apo');

      await tester.tap(find.text('Se connecter'));
      await tester.pump();

      expect(find.text('Adresse e-mail invalide'), findsOneWidget);
      expect(find.text('8 caractères minimum'), findsOneWidget);
    });
  });
}
