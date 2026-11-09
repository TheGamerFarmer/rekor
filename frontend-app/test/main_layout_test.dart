import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/layouts/main_layout.dart';
import 'package:frontend_app/widgets/app_header.dart';
import 'package:frontend_app/widgets/app_footer.dart';

void main() {
  group('MainLayout', () {
    testWidgets('Affiche le contenu de la page, le header et le footer', (
      tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(home: MainLayout(child: Text('Contenu de la page'))),
      );

      expect(find.text('Contenu de la page'), findsOneWidget);
      expect(find.byType(AppHeader), findsOneWidget);
      expect(find.byType(AppFooter), findsOneWidget);
    });
  });
}
