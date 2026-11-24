import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/mobile_pages/creationconvoiturage.dart';
import 'package:frontend_app/mobile_pages/discussion.dart';
import 'package:frontend_app/mobile_pages/evenement_detail_page.dart';
import 'package:frontend_app/mobile_pages/groupe_detail_page.dart';
import 'package:frontend_app/listevenement.dart';
import 'package:frontend_app/models/groupe.dart';
import 'package:frontend_app/models/message.dart';
import 'package:frontend_app/models/utilisateur.dart';

void main() {
  Future<void> afficher(WidgetTester tester, Widget page) async {
    await tester.binding.setSurfaceSize(const Size(1200, 900));
    await tester.pumpWidget(MaterialApp(home: page));
    await tester.pump();
  }

  testWidgets('CreationCovoiturage affiche le formulaire', (tester) async {
    await afficher(tester, const CreationCovoituragePage());
    expect(find.text('COVOITURAGE'), findsOneWidget);
    expect(find.text('VALIDER'), findsOneWidget);
  });

  testWidgets('CreationCovoiturage refuse une demande incomplète', (
    tester,
  ) async {
    await afficher(tester, const CreationCovoituragePage());
    await tester.tap(find.text('VALIDER'));
    await tester.pump();
    expect(find.text('Merci de remplir tous les champs.'), findsNothing);
  });

  testWidgets('EvenementDetailPage affiche les détails', (tester) async {
    final evenement = evenements.first;
    await afficher(
      tester,
      EvenementDetailPage(evenement: evenement, onModifier: (_) async => null),
    );
    expect(find.text('ÉVÈNEMENTS'), findsOneWidget);
    expect(find.text('MODIFIER'), findsOneWidget);
  });

  testWidgets('DiscussionPage envoie un message', (tester) async {
    final groupe = Groupe(
      id: 1,
      nom: 'Aigles',
      dateCreation: DateTime(2026, 1, 1),
      dernierMessage: Message(
        id: 1,
        corps: 'Bonjour',
        auteur: 'Léa',
        date: DateTime.now(),
      ),
    );

    await afficher(
      tester,
      DiscussionPage(
        groupe: groupe,
        utilisateurs: const [Utilisateur(id: 1, nom: 'Martin', prenom: 'Léa')],
        onMessageEnvoye: (_) {},
        onQuitter: () {},
        onParticipantsAjoutes: (_) {},
      ),
    );

    expect(find.text('Aigles'), findsOneWidget);
    await tester.enterText(find.byType(TextField), 'Nouveau message');
    await tester.tap(find.byIcon(Icons.send));
    await tester.pump();
    expect(find.text('Nouveau message'), findsOneWidget);
  });

  testWidgets('GroupeDetailsPage affiche les participants', (tester) async {
    await afficher(
      tester,
      GroupeDetailsPage(
        groupe: Groupe(
          id: 1,
          nom: 'Aigles',
          dateCreation: DateTime(2026, 1, 1),
          participantIds: const {1},
        ),
        utilisateurs: const [
          Utilisateur(id: 1, nom: 'Martin', prenom: 'Léa'),
          Utilisateur(id: 2, nom: 'Durand', prenom: 'Tom'),
        ],
        participantIds: const {1},
        onAjouter: (_) {},
      ),
    );

    expect(find.text('Aigles'), findsOneWidget);
    expect(find.text('Léa Martin'), findsOneWidget);
  });
}
