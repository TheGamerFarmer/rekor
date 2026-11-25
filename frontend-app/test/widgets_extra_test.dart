import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/models/groupe.dart';
import 'package:frontend_app/models/message.dart';
import 'package:frontend_app/widgets/all_player.dart';
import 'package:frontend_app/widgets/groupe_tile.dart';
import 'package:frontend_app/widgets/evenement_card.dart';

void main() {
  testWidgets('PlayerChip déclenche le clic et affiche le style sélectionné', (
    tester,
  ) async {
    var taps = 0;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: PlayerChip(name: 'Léa', selected: true, onTap: () => taps++),
        ),
      ),
    );

    expect(find.text('Léa'), findsOneWidget);
    await tester.tap(find.text('Léa'));
    expect(taps, 1);
  });

  testWidgets(
    'GroupeTile couvre les variantes photo, message, lecture et sans message',
    (tester) async {
      final now = DateTime.now();
      final groupe = Groupe(
        id: 1,
        nom: 'Équipe',
        dateCreation: now,
        dernierMessage: Message(
          id: 1,
          corps: 'Bonjour',
          auteur: 'Léa',
          date: now.subtract(const Duration(minutes: 5)),
        ),
        imageLocale: null,
        derniereLecture: now.subtract(const Duration(hours: 1)),
      );
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GroupeTile(groupe: groupe, onTap: () => tapped = true),
          ),
        ),
      );

      expect(find.text('Équipe'), findsOneWidget);
      expect(find.textContaining('Bonjour'), findsOneWidget);
      await tester.tap(find.byType(InkWell));
      expect(tapped, isTrue);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GroupeTile(
              groupe: Groupe(
                id: 2,
                nom: 'Sans message',
                dateCreation: now,
                image: 'https://example.com/group.png',
              ),
            ),
          ),
        ),
      );
      expect(find.text('Aucun message'), findsOneWidget);
    },
  );

  testWidgets('EvenementCard bascule entre absent et présent', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: EvenementCard(
            titre: 'Match amical',
            date: '6 Décembre',
            horaire: '18h - 20h',
            lieu: 'Gymnase',
            couleurFond: const Color(0xFFFFD60A),
            couleurTexte: Colors.black,
            couleurAccent: const Color(0xFF2556C4),
            present: false,
          ),
        ),
      ),
    );

    expect(find.text('ABSENT'), findsOneWidget);
    await tester.tap(find.byType(GestureDetector));
    await tester.pumpAndSettle();
    expect(find.text('PRÉSENT'), findsOneWidget);
  });
}
