import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/api/api_client.dart';
import 'package:frontend_app/mobile_pages/arbitrage.dart';
import 'package:frontend_app/mobile_pages/cout_page.dart';
import 'package:frontend_app/mobile_pages/evenement_page.dart';
import 'package:frontend_app/mobile_pages/fiche_presence_page.dart';
import 'package:frontend_app/mobile_pages/parametres_page.dart';
import 'package:frontend_app/mobile_pages/gestion.dart';
import 'package:frontend_app/mobile_pages/groupe.dart';
import 'package:frontend_app/mobile_pages/groupe_detail_page.dart';
import 'package:frontend_app/mobile_pages/creationconvoiturage.dart';
import 'package:frontend_app/models/groupe.dart';
import 'package:frontend_app/models/equipe.dart';
import 'package:frontend_app/models/fiche_presence.dart';
import 'package:frontend_app/models/utilisateur.dart';
import 'package:rekor_api/api.dart' as generated;

void main() {
  final apiClientOriginal = ApiClient.instance;

  Future<void> afficher(WidgetTester tester, Widget page) async {
    await tester.binding.setSurfaceSize(const Size(1200, 1100));
    await tester.pumpWidget(MaterialApp(home: page));
    await tester.pump();
  }

  group('ArbitragePage', () {
    testWidgets('sélectionne un match, modifie les scores et le chronomètre', (
      tester,
    ) async {
      await afficher(tester, const ArbitragePage());

      expect(find.text('ARBITRAGE'), findsOneWidget);

      await tester.tap(find.text('Sélectionner un match'));
      await tester.pumpAndSettle();
      await tester.tap(
        find
            .text('Match amical : Grenoble Volley/Lyon Volley-Club du 3/10/26')
            .last,
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.keyboard_arrow_up).first);
      await tester.pump();
      expect(find.text('1'), findsWidgets);

      await tester.tap(find.byIcon(Icons.play_arrow));
      await tester.pump(const Duration(seconds: 2));
      expect(find.text("00'02"), findsOneWidget);
      await tester.tap(find.byIcon(Icons.pause));
      await tester.pump();

      await tester.tap(find.text('SERVICE ACE'));
      await tester.pump();
      await tester.tap(find.text('VALIDER'));
      await tester.pump();
      expect(find.text('VALIDER'), findsWidgets);
    });

    testWidgets('ouvre la sélection des joueurs du set', (tester) async {
      await afficher(tester, const ArbitragePage());

      await tester.tap(find.byIcon(Icons.add).last);
      await tester.pumpAndSettle();
      expect(find.text('Joueurs du set N°1'), findsOneWidget);
      await tester.tap(find.text('Annuler').last);
      await tester.pumpAndSettle();
    });
  });

  group('ParametresPage', () {
    late _ApiClientProfilFictif apiClientProfil;

    setUp(() {
      apiClientProfil = _ApiClientProfilFictif();
      ApiClient.instance = apiClientProfil;
    });

    tearDown(() {
      ApiClient.instance = apiClientOriginal;
    });

    testWidgets('affiche les informations reçues du profil API', (
      tester,
    ) async {
      await afficher(tester, const ParametresPage());
      await tester.pumpAndSettle();

      expect(find.text('Ada'), findsOneWidget);
      expect(find.text('Lovelace'), findsWidgets);
      expect(find.text('ada@exemple.fr'), findsOneWidget);
      expect(find.text('Adhérent'), findsOneWidget);
    });

    testWidgets('modifie les interrupteurs de notification', (tester) async {
      await afficher(tester, const ParametresPage());

      await tester.tap(find.byType(Switch).first);
      await tester.pump();
      expect(find.byType(Switch), findsNWidgets(2));

      await tester.tap(find.byType(Switch).last);
      await tester.pump();
      expect(find.byType(Switch), findsNWidgets(2));
    });

    testWidgets('modifie le prénom depuis le dialogue', (tester) async {
      await afficher(tester, const ParametresPage());

      await tester.tap(find.text('Prénom'));
      await tester.pumpAndSettle();
      expect(find.text('Prénom'), findsWidgets);

      await tester.enterText(find.byType(TextField).last, 'Camille');
      await tester.tap(find.text('Enregistrer'));
      await tester.pumpAndSettle();
      expect(find.text('Camille'), findsWidgets);
      expect(apiClientProfil.updates.single.firstName, 'Camille');
    });

    testWidgets('modifie l’adresse mail depuis le dialogue', (tester) async {
      await afficher(tester, const ParametresPage());

      await tester.tap(find.text('Adresse mail'));
      await tester.pumpAndSettle();
      await tester.enterText(
        find.byType(TextField).last,
        'camille@example.com',
      );
      await tester.tap(find.text('Enregistrer'));
      await tester.pumpAndSettle();

      expect(find.text('camille@example.com'), findsOneWidget);
      expect(apiClientProfil.updates.single.email, 'camille@example.com');
    });

    testWidgets('choisit un pronom depuis les options', (tester) async {
      await afficher(tester, const ParametresPage());

      await tester.tap(find.text('Pronom'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Iel'));
      await tester.pumpAndSettle();
      expect(find.text('Iel'), findsWidgets);
      expect(
        apiClientProfil.updates.single.pronoun,
        generated.UpdateProfileInputPronounEnum.iel,
      );
    });

    testWidgets('déconnecte et revient à la connexion', (tester) async {
      FlutterSecureStorage.setMockInitialValues({});
      await afficher(tester, const ParametresPage());

      await tester.ensureVisible(find.text('Se déconnecter'));
      await tester.pump();
      await tester.tap(find.text('Se déconnecter'));
      await tester.pumpAndSettle();

      expect(find.text('Connexion'), findsOneWidget);
      expect(find.text('Se déconnecter'), findsNothing);
    });

    testWidgets('annule la suppression du compte', (tester) async {
      await afficher(tester, const ParametresPage());

      await tester.ensureVisible(find.text('Supprimer mon compte'));
      await tester.pump();
      await tester.tap(find.text('Supprimer mon compte'));
      await tester.pumpAndSettle();
      expect(find.text('Supprimer le compte ?'), findsOneWidget);
      await tester.tap(find.text('Annuler').first);
      await tester.pumpAndSettle();
      expect(find.text('Supprimer mon compte'), findsWidgets);
    });
  });

  group('FichePresencePage', () {
    testWidgets('déroule une fiche et modifie une présence', (tester) async {
      await afficher(
        tester,
        FichePresencePage(
          equipe: const Equipe(
            id: 1,
            nom: 'Aigles',
            capitaineId: 1,
            membres: {1: Poste.passeur},
          ),
          utilisateurs: const [
            Utilisateur(id: 1, nom: 'Martin', prenom: 'Léa'),
          ],
          fiches: [
            FichePresence(
              id: 1,
              equipeId: 1,
              date: DateTime(2026, 12, 6),
              presences: const {1: false},
            ),
          ],
          onFicheAjoutee: (_) {},
          onFicheModifiee: (_) {},
        ),
      );

      await tester.tap(find.textContaining('Fiche du'));
      await tester.pumpAndSettle();
      await tester.tap(find.byType(CheckboxListTile));
      await tester.pump();
      expect(find.text('1/1 présents'), findsOneWidget);
    });

    testWidgets('crée une fiche avec tous les joueurs présents', (
      tester,
    ) async {
      await afficher(
        tester,
        FichePresencePage(
          equipe: const Equipe(
            id: 1,
            nom: 'Aigles',
            capitaineId: 1,
            membres: {1: Poste.passeur, 2: Poste.libero},
          ),
          utilisateurs: const [
            Utilisateur(id: 1, nom: 'Martin', prenom: 'Léa'),
            Utilisateur(id: 2, nom: 'Durand', prenom: 'Tom'),
          ],
          fiches: const [],
          onFicheAjoutee: (_) {},
          onFicheModifiee: (_) {},
        ),
      );

      await tester.tap(find.byType(FloatingActionButton));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Tout cocher'));
      await tester.pump();
      await tester.tap(find.text('Valider'));
      await tester.pumpAndSettle();
      expect(find.textContaining('Fiche du'), findsOneWidget);
      expect(find.text('2/2 présents'), findsOneWidget);
    });
  });

  group('MesCoutsView', () {
    testWidgets('affiche les sections et valide un paiement conducteur', (
      tester,
    ) async {
      await tester.binding.setSurfaceSize(const Size(1200, 1100));
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(body: MesCoutsView(onChange: () {})),
        ),
      );
      await tester.pump();

      expect(find.text('Ce que je dois'), findsOneWidget);
      expect(find.text('Ce qu’on me doit'), findsOneWidget);

      final valider = find.text('VALIDER');
      if (valider.evaluate().isNotEmpty) {
        await tester.tap(valider.first);
        await tester.pumpAndSettle();
        await tester.tap(find.text('OUI'));
        await tester.pumpAndSettle();
      }
    });
  });

  group('Evenementpage', () {
    testWidgets('ouvre le formulaire de création puis l’annule', (
      tester,
    ) async {
      await afficher(tester, const Evenementpage());

      await tester.tap(find.byIcon(Icons.add));
      await tester.pumpAndSettle();
      expect(find.text('Créer un évènement'), findsOneWidget);

      await tester.tap(find.text('ANNULER').last);
      await tester.pumpAndSettle();
      expect(find.text('Créer un évènement'), findsNothing);
    });

    testWidgets('teste les filtres terminés et les tris', (tester) async {
      await afficher(tester, const Evenementpage());

      await tester.tap(find.text('Terminés'));
      await tester.pump();
      expect(find.text('Terminés'), findsOneWidget);

      await tester.tap(find.byIcon(Icons.sort));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Date décroissante').last);
      await tester.pump();

      await tester.tap(find.byIcon(Icons.sort));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Type').last);
      await tester.pump();
    });
  });

  group('GestionPage', () {
    testWidgets('affiche une équipe et ouvre sa fiche de présence', (
      tester,
    ) async {
      await afficher(tester, const GestionPage());

      expect(find.text('Equipe 1'), findsOneWidget);
      await tester.tap(find.text('Equipe 1'));
      await tester.pumpAndSettle();
      expect(find.text('EQUIPE 1'), findsOneWidget);
      await tester.pageBack();
      await tester.pumpAndSettle();
    });

    testWidgets('ouvre le formulaire de création d’équipe', (tester) async {
      await afficher(tester, const GestionPage());

      await tester.tap(find.byIcon(Icons.add));
      await tester.pumpAndSettle();
      expect(find.text('Nouvelle équipe'), findsOneWidget);
      await tester.tap(find.text('Valider'));
      await tester.pump();
      expect(find.text("Donne un nom à l'équipe"), findsOneWidget);
    });

    testWidgets('ouvre le formulaire de modification d’équipe', (tester) async {
      await afficher(tester, const GestionPage());

      await tester.tap(find.byIcon(Icons.edit));
      await tester.pumpAndSettle();
      expect(find.text("Modifier l'équipe"), findsOneWidget);
      await tester.tap(find.text('Annuler'));
      await tester.pumpAndSettle();
    });
  });

  group('GroupesPage', () {
    testWidgets('filtre les groupes puis ouvre une discussion', (tester) async {
      await afficher(tester, const GroupesPage());

      await tester.enterText(find.byType(TextField), 'Club');
      await tester.pump();
      expect(find.text('Club'), findsWidgets);

      await tester.enterText(find.byType(TextField), 'Equipe');
      await tester.pump();
      await tester.tap(find.text('Equipe Groupe 3'));
      await tester.pumpAndSettle();
      expect(find.text('Equipe Groupe 3'), findsOneWidget);
    });

    testWidgets('ouvre puis ferme le formulaire de nouveau groupe', (
      tester,
    ) async {
      await afficher(tester, const GroupesPage());

      await tester.tap(find.byIcon(Icons.add));
      await tester.pumpAndSettle();
      expect(find.text('Nouveau groupe'), findsOneWidget);
      await tester.tap(find.byIcon(Icons.close).first);
      await tester.pumpAndSettle();
      expect(find.text('Nouveau groupe'), findsNothing);
    });
  });

  group('GroupeDetailsPage', () {
    testWidgets('affiche les participants et ouvre le dialogue départ', (
      tester,
    ) async {
      final groupe = Groupe(
        id: 1,
        nom: 'Aigles',
        dateCreation: DateTime(2026, 1, 1),
        participantIds: const {1},
      );

      await afficher(
        tester,
        GroupeDetailsPage(
          groupe: groupe,
          utilisateurs: const [
            Utilisateur(id: 1, nom: 'Martin', prenom: 'Léa'),
            Utilisateur(id: 2, nom: 'Durand', prenom: 'Tom'),
          ],
          participantIds: const {1},
          onAjouter: (_) {},
        ),
      );

      expect(find.text('Participants (1)'), findsOneWidget);
      expect(find.text('Léa Martin'), findsOneWidget);
      expect(find.text('Créé le 01/01/2026'), findsOneWidget);

      await tester.ensureVisible(find.text('Quitter le groupe'));
      await tester.tap(find.text('Quitter le groupe'));
      await tester.pumpAndSettle();
      expect(find.text('Quitter le groupe'), findsWidgets);
      await tester.tap(find.text('Annuler').first);
      await tester.pumpAndSettle();
    });

    testWidgets('ouvre le choix des personnes à ajouter', (tester) async {
      final groupe = Groupe(
        id: 1,
        nom: 'Aigles',
        dateCreation: DateTime(2026, 1, 1),
        participantIds: const {1},
      );

      await afficher(
        tester,
        GroupeDetailsPage(
          groupe: groupe,
          utilisateurs: const [
            Utilisateur(id: 1, nom: 'Martin', prenom: 'Léa'),
            Utilisateur(id: 2, nom: 'Durand', prenom: 'Tom'),
          ],
          participantIds: const {1},
          onAjouter: (_) {},
        ),
      );

      await tester.ensureVisible(find.text('Ajouter des personnes'));
      await tester.tap(find.text('Ajouter des personnes'));
      await tester.pumpAndSettle();
      expect(find.text('Ajouter des personnes'), findsWidgets);
    });

    testWidgets('confirme le départ du groupe', (tester) async {
      final groupe = Groupe(
        id: 1,
        nom: 'Aigles',
        dateCreation: DateTime(2026, 1, 1),
        participantIds: const {1},
      );

      await afficher(
        tester,
        GroupeDetailsPage(
          groupe: groupe,
          utilisateurs: const [
            Utilisateur(id: 1, nom: 'Martin', prenom: 'Léa'),
          ],
          participantIds: const {1},
          onAjouter: (_) {},
        ),
      );

      await tester.ensureVisible(find.text('Quitter le groupe'));
      await tester.tap(find.text('Quitter le groupe'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Quitter').last);
      await tester.pumpAndSettle();
    });
  });

  group('CreationCovoituragePage', () {
    testWidgets('remplit les champs, coche l’assurance et valide', (
      tester,
    ) async {
      await afficher(tester, const CreationCovoituragePage());

      await tester.enterText(find.byType(TextField).at(0), 'Gymnase de Meylan');
      await tester.enterText(find.byType(TextField).at(1), 'Salle des sports');
      await tester.enterText(find.byType(TextField).at(4), '20');

      await tester.tap(find.byType(Checkbox));
      await tester.pump();

      await tester.tap(find.text('VALIDER'));
      await tester.pump();
      expect(find.text('Merci de remplir tous les champs.'), findsOneWidget);
    });

    testWidgets('annule la création du covoiturage', (tester) async {
      await afficher(tester, const CreationCovoituragePage());
      await tester.ensureVisible(find.text('ANNULER'));
      await tester.tap(find.text('ANNULER'));
      await tester.pumpAndSettle();
    });
  });
}

class _ApiClientProfilFictif extends ApiClient {
  _ApiClientProfilFictif() : super('http://localhost:3000');

  final updates = <generated.UpdateProfileInput>[];

  @override
  Future<generated.UserDetails?> getMyProfile() async {
    return generated.UserDetails(
      id: '1',
      name: 'Lovelace',
      firstName: 'Ada',
      email: 'ada@exemple.fr',
      role: generated.UserDetailsRoleEnum.adhrent,
      pronoun: generated.UserDetailsPronounEnum.elle,
      medicalCertificate: false,
      rightOfPublicity: false,
    );
  }

  @override
  Future<void> updateMyProfile(generated.UpdateProfileInput profile) async {
    updates.add(profile);
  }

  @override
  Future<void> logout() async {}
}
