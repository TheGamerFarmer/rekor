import 'package:flutter/material.dart';

import '../health_status.dart';
import '../layouts/main_layout.dart';
import 'CovoituragePage.dart';
import 'creationconvoiturage.dart';
import 'evenementPage.dart';
import '../models/evenement.dart';
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

  // Liste des évènements (plus tard : chargée depuis la BDD)
  final List<Evenement> _evenements = const [
    Evenement(
      titre: 'Cours du Mardi',
      date: '2 Décembre',
      horaire: '19h - 20h',
      lieu: 'Gymnase court sur foin',
      type: TypeEvenement.cours,
      present: true,
    ),
    Evenement(
      titre: 'Match amical',
      date: '6 Décembre',
      horaire: '18h - 20h',
      lieu: 'Gymnase court sur foin',
      type: TypeEvenement.match,
    ),
  ];

  @override
  Widget build(BuildContext context) {
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

            // On affiche les évènements de la liste
            for (final e in _evenements.take(_maxEvenements))
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: EvenementCard(
                  titre: e.titre,
                  date: e.date,
                  horaire: e.horaire,
                  lieu: e.lieu,
                  couleurFond: e.type == TypeEvenement.match ? _jaune : _bleu,
                  couleurTexte: e.type == TypeEvenement.match
                      ? Colors.black
                      : Colors.white,
                  couleurAccent: e.type == TypeEvenement.match ? _bleu : _jaune,
                  present: e.present,
                ),
              ),

            const SizedBox(height: 130),
          ],
        ),
      ),
    );
  }
}
