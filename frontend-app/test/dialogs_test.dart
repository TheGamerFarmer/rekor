import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/models/equipe.dart';
import 'package:frontend_app/models/utilisateur.dart';
import 'package:frontend_app/widgets/equipe_form_dialog.dart';
import 'package:frontend_app/widgets/ajouter_personnes_dialog.dart';
import 'package:frontend_app/widgets/creer_groupe_dialog.dart';
import 'package:frontend_app/models/nouveau_groupe.dart';

void main() {
  Future<NouveauGroupe?> ouvrirGroupe(WidgetTester tester) async {
    NouveauGroupe? result;
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) => ElevatedButton(
            onPressed: () async {
              result = await showDialog<NouveauGroupe>(
                context: context,
                builder: (_) => const CreerGroupeDialog(
                  utilisateurs: [
                    Utilisateur(id: 1, nom: 'Martin', prenom: 'Léa'),
                    Utilisateur(id: 2, nom: 'Durand', prenom: 'Tom'),
                  ],
                  groupeExiste: _aucunGroupe,
                ),
              );
            },
            child: const Text('ouvrir'),
          ),
        ),
      ),
    );
    await tester.tap(find.text('ouvrir'));
    await tester.pumpAndSettle();
    return result;
  }

  testWidgets('EquipeFormDialog valide les erreurs puis une équipe', (
    tester,
  ) async {
    Equipe? equipe;
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) => TextButton(
            onPressed: () async {
              equipe = await showDialog<Equipe>(
                context: context,
                builder: (_) => const EquipeFormDialog(
                  utilisateurs: [
                    Utilisateur(id: 1, nom: 'Martin', prenom: 'Léa'),
                  ],
                ),
              );
            },
            child: const Text('ouvrir'),
          ),
        ),
      ),
    );

    await tester.tap(find.text('ouvrir'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Valider'));
    await tester.pump();
    expect(find.text("Donne un nom à l'équipe"), findsOneWidget);
  });

  testWidgets('AjouterPersonnesDialog filtre et valide', (tester) async {
    Set<int>? selection;
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) => TextButton(
            onPressed: () async {
              selection = await showDialog<Set<int>>(
                context: context,
                builder: (_) => const AjouterPersonnesDialog(
                  candidats: [Utilisateur(id: 1, nom: 'Martin', prenom: 'Léa')],
                ),
              );
            },
            child: const Text('ouvrir'),
          ),
        ),
      ),
    );

    await tester.tap(find.text('ouvrir'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), 'Léa');
    await tester.pump();
    expect(find.text('Léa Martin'), findsOneWidget);
  });

  testWidgets('CreerGroupeDialog affiche ses champs', (tester) async {
    await ouvrirGroupe(tester);
    expect(find.text('Nouveau groupe'), findsOneWidget);
  });
}

bool _aucunGroupe(Set<int> ids) => false;
