import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/evenement_liste_card.dart';
import 'package:frontend_app/listevenement.dart';
import 'package:frontend_app/evenement_card.dart';

void main() {
  Evenement evenement({required String type}) => Evenement(
    nom: 'Finale',
    date: '6 déc.',
    dateTime: DateTime(2026, 12, 6),
    heureDebut: '14:00',
    heureFin: '16:00',
    lieu: 'Gymnase',
    ville: 'Grenoble',
    equipe1: 'Aigles',
    equipe2: 'Tigres',
    arbitre: 'Paul',
    presents: const ['Léa'],
    absents: const ['Tom'],
    type: type,
    description: 'Bilan de la saison',
  );

  testWidgets('EvenementListeCard affiche un match', (tester) async {
    var tapped = false;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: EvenementListeCard(
            evenement: evenement(type: 'Match amical'),
            onTap: () => tapped = true,
          ),
        ),
      ),
    );

    expect(find.text('Aigles'), findsWidgets);
    expect(find.text('Tigres'), findsWidgets);
    await tester.tap(find.byType(GestureDetector));
    expect(tapped, isTrue);
  });

  testWidgets('EvenementListeCard affiche une réunion', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: EvenementListeCard(
            evenement: evenement(type: 'Réunion'),
            onTap: () {},
          ),
        ),
      ),
    );
    expect(find.text('Réunion'), findsOneWidget);
    expect(find.text('Bilan de la saison'), findsOneWidget);
  });

  testWidgets('EvenementListeCard affiche la variante Autres', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: EvenementListeCard(
            evenement: evenement(type: 'Autres'),
            onTap: () {},
          ),
        ),
      ),
    );
    expect(find.text('Finale'), findsOneWidget);
    expect(find.text('Gymnase, Grenoble'), findsOneWidget);
  });

  testWidgets('EvenementCard affiche une variante de match', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: EvenementCard(evenement: evenement(type: 'Match compétition')),
        ),
      ),
    );

    expect(find.text('Match'), findsOneWidget);
    expect(find.text('Aigles'), findsWidgets);
    expect(find.text('Tigres'), findsWidgets);
  });

  testWidgets('EvenementCard affiche une variante entraînement', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: EvenementCard(evenement: evenement(type: 'Entraînement')),
        ),
      ),
    );

    expect(find.text('Entraînement'), findsOneWidget);
    expect(find.text('Participants'), findsOneWidget);
  });

  testWidgets('EvenementCard affiche une réunion avec description', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: EvenementCard(evenement: evenement(type: 'Réunion')),
        ),
      ),
    );

    expect(find.text('Réunion'), findsOneWidget);
    expect(find.text('Description'), findsOneWidget);
  });
}
