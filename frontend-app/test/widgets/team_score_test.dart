import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/widgets/team_score.dart';

void main() {
  testWidgets(
    'TeamScore affiche le nom et les scores et déclenche les actions',
    (tester) async {
      var increment = 0;
      var decrement = 0;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TeamScore(
              name: 'Équipe A',
              score: 12,
              onIncrement: () => increment++,
              onDecrement: () => decrement++,
            ),
          ),
        ),
      );

      expect(find.text('Équipe A'), findsOneWidget);
      expect(find.text('12'), findsOneWidget);

      await tester.tap(find.byIcon(Icons.keyboard_arrow_up));
      await tester.tap(find.byIcon(Icons.keyboard_arrow_down));

      expect(increment, 1);
      expect(decrement, 1);
    },
  );
}
