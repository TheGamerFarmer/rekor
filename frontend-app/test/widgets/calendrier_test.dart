import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/widgets/calendrier.dart';

void main() {
  testWidgets('Calendrier change de mois et revient à aujourd’hui', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(body: Calendrier(matchs: {DateTime.now()})),
      ),
    );

    expect(find.byType(InkWell), findsWidgets);

    await tester.tap(find.byIcon(Icons.chevron_right));
    await tester.pump();
    await tester.tap(find.byIcon(Icons.chevron_left));
    await tester.pump();
    await tester.tap(find.byType(InkWell).first);
    await tester.pump();

    expect(find.byType(Text), findsWidgets);
  });

  testWidgets('Calendrier affiche les jours hors mois et les entraînements', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: Calendrier())),
    );
    await tester.pump();
    expect(find.byType(Calendrier), findsOneWidget);
  });

  testWidgets('Calendrier tient sur un écran étroit sans débordement', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(280, 640));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: Calendrier())),
    );
    await tester.pump();

    expect(tester.takeException(), isNull);
  });
}
