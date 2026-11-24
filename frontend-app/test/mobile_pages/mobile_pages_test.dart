import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/mobile_pages/covoiturage_page.dart';
import 'package:frontend_app/mobile_pages/evenement_page.dart';
import 'package:frontend_app/mobile_pages/fiche_presence_page.dart';
import 'package:frontend_app/mobile_pages/gestion.dart';
import 'package:frontend_app/mobile_pages/groupe.dart';
import 'package:frontend_app/mobile_pages/home_page.dart';
import 'package:frontend_app/mobile_pages/parametres_page.dart';
import 'package:frontend_app/mobile_pages/statistique_page.dart';
import 'package:frontend_app/models/equipe.dart';
import 'package:frontend_app/models/fiche_presence.dart';
import 'package:frontend_app/models/utilisateur.dart';

void main() {
  Future<void> afficher(WidgetTester tester, Widget page) async {
    await tester.binding.setSurfaceSize(const Size(1200, 900));
    await tester.pumpWidget(MaterialApp(home: page));
    await tester.pump();
  }

  tearDown(() async {
    TestWidgetsFlutterBinding
            .instance
            .platformDispatcher
            .onSemanticsEnabledChanged =
        null;
  });

  testWidgets('MyHomePage affiche le calendrier et les prochains évènements', (
    tester,
  ) async {
    await afficher(tester, const MyHomePage(title: 'Accueil'));
    expect(find.text('Gières Volley ball Club'), findsOneWidget);
    expect(find.text('PROCHAIN ÉVÈNEMENT'), findsOneWidget);
  });

  testWidgets('Evenementpage change d’onglet et de tri', (tester) async {
    await afficher(tester, const Evenementpage());

    expect(find.text('ÉVÈNEMENTS'), findsOneWidget);
    await tester.tap(find.text('Terminés'));
    await tester.pump();
    await tester.tap(find.byIcon(Icons.sort));
    await tester.pump();

    expect(find.text('Type'), findsOneWidget);
  });

  testWidgets('CovoituragePage change ses trois onglets', (tester) async {
    await afficher(tester, const CovoituragePage());

    expect(find.text('COVOITURAGE'), findsOneWidget);
    await tester.tap(find.text('MES COVOITURAGES'));
    await tester.pump();
    expect(find.text('MES COVOITURAGES'), findsOneWidget);

    await tester.tap(find.text('MES COÛTS'));
    await tester.pump();
    expect(find.text('MES COÛTS'), findsOneWidget);

    await tester.tap(find.text('TOUT'));
    await tester.pump();
    expect(find.text('TOUT'), findsOneWidget);
  });

  testWidgets('StatistiquePage affiche les statistiques', (tester) async {
    await afficher(tester, const StatistiquePage());
    expect(find.byType(StatistiquePage), findsOneWidget);
  });

  testWidgets('GroupesPage recherche un groupe', (tester) async {
    await afficher(tester, const GroupesPage());
    expect(find.text('DISCUSSIONS'), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'Club');
    await tester.pump();
    expect(find.text('Club'), findsWidgets);
  });

  testWidgets('GestionPage affiche les équipes', (tester) async {
    await afficher(tester, const GestionPage());
    expect(find.text('GESTION'), findsOneWidget);
  });

  testWidgets('FichePresencePage affiche les fiches', (tester) async {
    await afficher(
      tester,
      FichePresencePage(
        equipe: const Equipe(
          id: 1,
          nom: 'Aigles',
          capitaineId: 1,
          membres: {1: Poste.passeur},
        ),
        utilisateurs: const [Utilisateur(id: 1, nom: 'Martin', prenom: 'Léa')],
        fiches: [
          FichePresence(
            id: 1,
            equipeId: 1,
            date: DateTime(2026, 12, 6),
            presences: const {1: true},
          ),
        ],
        onFicheAjoutee: (_) {},
        onFicheModifiee: (_) {},
      ),
    );
    expect(find.text('AIGLES'), findsOneWidget);
  });

  testWidgets('ParametresPage affiche le profil', (tester) async {
    await afficher(tester, const ParametresPage());
    expect(find.text('PARAMÈTRES'), findsOneWidget);
  });
}
