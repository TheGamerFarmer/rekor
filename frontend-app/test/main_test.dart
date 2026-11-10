import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/main.dart';
import 'package:frontend_app/mobile_pages/home_page.dart';

void main() {
  group('MyApp', () {
    testWidgets('Lance correctement l’application', (tester) async {
      await tester.pumpWidget(const MyApp());

      expect(find.byType(MaterialApp), findsOneWidget);
    });

    testWidgets('Possède le bon titre', (tester) async {
      await tester.pumpWidget(const MyApp());

      final app = tester.widget<MaterialApp>(find.byType(MaterialApp));

      expect(app.title, 'Mon application');
    });

    /*testWidgets('Affiche la page MyHomePage', (tester) async {
      await tester.pumpWidget(const MyApp());

      expect(find.byType(MyHomePage), findsOneWidget);
    });*/
  });
}
