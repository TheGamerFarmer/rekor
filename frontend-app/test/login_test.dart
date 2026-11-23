import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/api/api_client.dart';
import 'package:frontend_app/mobile_pages/login.dart';
import 'package:flutter/material.dart';
import 'package:frontend_app/widgets/app_header.dart';

void main() {
  group('AppLogin', () {
    late ApiClient originalApiClient;

    setUp(() {
      originalApiClient = ApiClient.instance;
      ApiClient.instance = FakeApiClient();
    });

    tearDown(() {
      ApiClient.instance = originalApiClient;
    });
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

    testWidgets(
      'Affiche les messages d\'erreur si mauvais e-mail ou mot de passe',
      (tester) async {
        await tester.pumpWidget(
          const MaterialApp(home: Scaffold(body: MyLoginPage())),
        );

        await tester.enterText(
          find.byType(TextFormField).at(0),
          'ada@exemple.fr',
        );
        await tester.enterText(find.byType(TextFormField).at(1), 'motdep@sse');

        await tester.tap(find.text('Se connecter'));
        await tester.pumpAndSettle();

        expect(find.text('E-mail ou mot de passe incorrect'), findsOneWidget);
      },
    );

    testWidgets('Vérifie que la connexion marche', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: MyLoginPage())),
      );

      await tester.enterText(
        find.byType(TextFormField).at(0),
        'ada@exemple.fr',
      );
      await tester.enterText(find.byType(TextFormField).at(1), 'motdepasse');

      await tester.tap(find.text('Se connecter'));
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.account_circle), findsOneWidget);
    });

    testWidgets('Vérifie que la déconnexion renvoie sur la page de connexion', (
      tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: MyLoginPage())),
      );

      await tester.enterText(
        find.byType(TextFormField).at(0),
        'ada@exemple.fr',
      );
      await tester.enterText(find.byType(TextFormField).at(1), 'motdepasse');

      await tester.tap(find.text('Se connecter'));
      await tester.pumpAndSettle();

      expect(find.byType(AppHeader), findsOneWidget);

      await tester.tap(find.byIcon(Icons.account_circle));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Déconnexion'));
      await tester.pumpAndSettle();

      expect(find.text('Connexion'), findsOneWidget);
    });
  });
}

class FakeApiClient extends ApiClient {
  FakeApiClient() : super('http://localhost:3000');

  @override
  Future<String> login(String email, String password) async {
    if (email == 'ada@exemple.fr' && password == 'motdepasse') {
      return 'fake-access-token';
    }

    throw Exception('Identifiants incorrects');
  }

  @override
  Future<void> logout() async {
    // Simulation d'une déconnexion réussie.
  }
}
