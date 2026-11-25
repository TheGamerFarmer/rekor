import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/main.dart';

void main() {
  group('MyApp', () {
    testWidgets('Lance correctement l\'application', (tester) async {
      await tester.pumpWidget(const MyApp());
      expect(find.byType(MaterialApp), findsOneWidget);
    });

    testWidgets('Possede le bon titre', (tester) async {
      await tester.pumpWidget(const MyApp());
      final app = tester.widget<MaterialApp>(find.byType(MaterialApp));
      expect(app.title, 'Mon application');
    });

    testWidgets('Affiche le chargement avant la restauration de session', (
      tester,
    ) async {
      await tester.pumpWidget(MyApp(sessionFuture: Completer<bool>().future));
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('Affiche la connexion sans session restauree', (tester) async {
      await tester.pumpWidget(MyApp(sessionFuture: Future.value(false)));
      await tester.pumpAndSettle();
      expect(find.text('Connexion'), findsOneWidget);
    });

    testWidgets('Affiche l\'accueil avec une session restauree', (
      tester,
    ) async {
      await tester.pumpWidget(MyApp(sessionFuture: Future.value(true)));
      await tester.pumpAndSettle();
      expect(find.text('Bienvenue sur la page d\u2019accueil'), findsOneWidget);
    });
  });
}
