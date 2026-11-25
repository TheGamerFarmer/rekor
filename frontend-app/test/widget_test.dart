import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/main.dart';
import 'package:frontend_app/mobile_pages/home_page.dart';

void main() {
  testWidgets('Affiche le widget racine de l\'application', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(MyApp(sessionFuture: Future.value(true)));
    await tester.pumpAndSettle();

    expect(find.byType(MaterialApp), findsOneWidget);
    expect(find.byType(MyHomePage), findsOneWidget);
  });
}
