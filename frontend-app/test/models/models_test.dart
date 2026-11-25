import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/convoiturage.dart';
import 'package:frontend_app/listevenement.dart';
import 'package:frontend_app/models/equipe.dart';
import 'package:frontend_app/models/fiche_presence.dart';
import 'package:frontend_app/models/groupe.dart';
import 'package:frontend_app/models/message.dart';
import 'package:frontend_app/models/stat_event.dart';
import 'package:frontend_app/models/utilisateur.dart';

void main() {
  group('Modèles', () {
    test(
      'Groupe calcule ses messages, son activité et son état de lecture',
      () {
        final ancien = DateTime(2026, 1, 1);
        final recent = DateTime(2026, 1, 2);
        final message = Message(
          id: 1,
          corps: 'Bonjour',
          auteur: 'Léa',
          date: recent,
        );
        final groupe = Groupe(
          id: 7,
          nom: 'Équipe',
          dateCreation: ancien,
          dernierMessage: message,
          messages: [message],
          participantIds: {1, 2},
          derniereLecture: ancien,
        );

        expect(groupe.tousLesMessages, [message]);
        expect(groupe.derniereActivite, recent);
        expect(groupe.nonLu, isTrue);

        final sansMessage = groupe.copyWith(
          nom: 'Autre',
          dernierMessage: null,
          messages: const [],
          participantIds: {3},
          derniereLecture: recent,
        );
        expect(sansMessage.nom, 'Autre');
        expect(sansMessage.participantIds, {3});
        expect(sansMessage.nonLu, isFalse);

        final moi = Groupe(
          id: 8,
          nom: 'Moi',
          dateCreation: ancien,
          dernierMessage: Message(
            id: 2,
            corps: 'Message',
            auteur: 'Moi',
            date: recent,
          ),
        );
        expect(moi.nonLu, isFalse);
      },
    );

    test('Utilisateur expose son nom complet, ses libellés et ses copies', () {
      const utilisateur = Utilisateur(
        id: 1,
        nom: 'Martin',
        prenom: 'Léa',
        mail: 'lea@example.fr',
        pronom: Pronom.elle,
      );

      expect(utilisateur.nomComplet, 'Léa Martin');
      expect(Pronom.elle.libelle, 'Elle');
      expect(Pronom.iel.libelle, 'Iel');
      expect(
        utilisateur.copyWith(prenom: 'Camille', pronom: Pronom.autre),
        isA<Utilisateur>(),
      );
    });

    test('Equipe copie ses membres et expose tous les postes', () {
      const membres = {1: Poste.passeur, 2: Poste.libero, 3: Poste.central};
      const equipe = Equipe(
        id: 1,
        nom: 'Aigles',
        capitaineId: 1,
        membres: membres,
      );

      expect(Poste.passeur.label, 'Passeur');
      expect(Poste.pointu.label, 'Pointu');
      expect(Poste.central.label, 'Central');
      expect(Poste.receptionneurAttaquant.label, 'Réceptionneur-attaquant');
      expect(Poste.libero.label, 'Libéro');
      expect(equipe.copyWith(nom: 'Tigres').nom, 'Tigres');
      expect(equipe.copyWith(capitaineId: 2).capitaineId, 2);
      expect(
        equipe.copyWith(membres: const {4: Poste.pointu}).membres[4],
        Poste.pointu,
      );

      const user = Utilisateur(id: 1, nom: 'Martin', prenom: 'Léa');
      expect(user.nomComplet, 'Léa Martin');
    });

    test('FichePresence copie ses présences', () {
      final fiche = FichePresence(
        id: 1,
        equipeId: 2,
        date: DateTime(2026, 12, 6),
      );
      final copie = fiche.copyWith(presences: {1: true, 2: false});
      expect(copie.presences[1], isTrue);
      expect(copie.presences[2], isFalse);
      expect(copie.equipeId, 2);
    });

    test('StatEvent conserve les valeurs et Evenement expose son état', () {
      const statistique = StatEvent(
        player: 'Léa',
        action: 'Ace',
        seconds: 42,
        setNumber: 2,
      );
      expect(statistique.player, 'Léa');
      expect(statistique.action, 'Ace');
      expect(statistique.seconds, 42);
      expect(statistique.setNumber, 2);

      final futur = Evenement(
        nom: 'Match',
        date: '6 déc.',
        dateTime: DateTime.now().add(const Duration(days: 1)),
        heureDebut: '14:00',
        heureFin: '16:00',
        lieu: 'Gymnase',
        ville: 'Grenoble',
        equipe1: 'A',
        equipe2: 'B',
        arbitre: 'Paul',
        presents: const [],
        absents: const [],
      );
      expect(futur.estTermine, isFalse);
      expect(futur.toString(), contains('Match'));
    });
  });

  group('Covoiturage', () {
    Covoiturage creerCovoiturage({Map<String, int>? passagers}) {
      return Covoiturage(
        id: 'test',
        evenement: evenements.first,
        lieuDepart: 'Départ',
        lieuArrivee: 'Arrivée',
        heureDepart: '13:00',
        heureArrivee: '14:00',
        carburant: 'ESSENCE',
        placesTotales: 4,
        coutTotal: 20,
        conducteur: 'Paul',
        date: DateTime(2026, 12, 6),
        passagers: passagers,
      );
    }

    test('calcule les places, les coûts, l’inscription et la date', () {
      final covoiturage = creerCovoiturage(passagers: {'Léa': 2});

      expect(covoiturage.placesReservees, 2);
      expect(covoiturage.placesDisponibles, 2);
      expect(covoiturage.coutParPersonne, 4);
      expect(covoiturage.montantDe('Léa'), 8);
      expect(covoiturage.estInscrit('Léa'), isTrue);
      expect(covoiturage.estInscrit('Tom'), isFalse);
      expect(covoiturage.statutPaiement('Tom'), StatutPaiement.aPayer);
      expect(covoiturage.dateFormatee, '6 décembre 2026');
    });

    test('gere les transitions de paiement', () {
      final covoiturage = creerCovoiturage(passagers: {'Léa': 1});

      covoiturage.declarerPaiement('Tom');
      expect(covoiturage.statutPaiement('Tom'), StatutPaiement.enAttente);

      covoiturage.declarerPaiement('Léa');
      expect(covoiturage.statutPaiement('Léa'), StatutPaiement.enAttente);
      covoiturage.validerPaiement('Léa');
      expect(covoiturage.statutPaiement('Léa'), StatutPaiement.valide);

      covoiturage.declarerPaiement('Léa');
      covoiturage.validerPaiement('Tom');
      expect(covoiturage.statutPaiement('Léa'), StatutPaiement.valide);
    });

    test('filtre les covoiturages pour un évènement', () {
      final resultat = CovoiturageRepository.pourEvenement(evenements.first);
      expect(resultat, isNotEmpty);
    });
  });
}
