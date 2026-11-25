import 'package:flutter/material.dart';

import '../layouts/main_layout.dart';
import '../../convoiturage.dart'; // pour utilisateurActuel
import '../../listevenement.dart'; // liste globale des évènements
import '../widgets/calendrier.dart';
import '../widgets/evenement_card.dart';

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  static const _jaune = Color(0xFFFFD60A);
  static const _bleu = Color(0xFF2556C4);
  static const _maxEvenements = 3;

  // Jours de match (à adapter)
  final Set<DateTime> _matchs = {DateTime(2026, 12, 5), DateTime(2026, 12, 12)};

  bool _estMatch(Evenement e) =>
      e.type == 'Match amical' || e.type == 'Match compétition';

  @override
  Widget build(BuildContext context) {
    // Prochains évènements (non terminés), du plus proche au plus lointain.
    // La liste vient de listevenement.dart : c'est la même que sur la page
    // évènements, donc les présents / absents sont partagés.
    final prochains = evenements.where((e) => !e.estTermine).toList()
      ..sort((a, b) => a.dateTime.compareTo(b.dateTime));

    return MainLayout(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const SizedBox(height: 130),
            const Text(
              'Gières Volley ball Club',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            Calendrier(matchs: _matchs),
            const SizedBox(height: 24),
            const Text(
              'PROCHAIN ÉVÈNEMENT',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            if (prochains.isEmpty)
              const Text(
                'Aucun évènement à venir.',
                style: TextStyle(color: Colors.white70),
              ),

            // On affiche les prochains évènements
            for (final e in prochains.take(_maxEvenements))
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: EvenementCard(
                  key: ObjectKey(e),
                  titre: e.nom,
                  date: e.date,
                  horaire: '${e.heureDebut} - ${e.heureFin}',
                  lieu: e.lieu,
                  couleurFond: _estMatch(e) ? _jaune : _bleu,
                  couleurTexte: _estMatch(e) ? Colors.black : Colors.white,
                  couleurAccent: _estMatch(e) ? _bleu : _jaune,
                  present: e.estPresent(utilisateurActuel),
                  // Quand on bascule l'interrupteur : on met à jour les
                  // listes présents / absents de l'évènement
                  onChanged: (present) => setState(
                    () => e.definirPresence(utilisateurActuel, present),
                  ),
                ),
              ),

            const SizedBox(height: 130),
          ],
        ),
      ),
    );
  }
}
