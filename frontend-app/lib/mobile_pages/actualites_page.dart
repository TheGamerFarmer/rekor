// À placer dans lib/mobile_pages/actualites_page.dart
import 'package:flutter/material.dart';

import '../layouts/main_layout.dart';
import '../models/actualite.dart';

class ActualitesPage extends StatefulWidget {
  const ActualitesPage({super.key});

  @override
  State<ActualitesPage> createState() => _ActualitesPageState();
}

class _ActualitesPageState extends State<ActualitesPage> {
  static const _jaune = Color(0xFFFFD60A);

  // Données de test (plus tard : chargées depuis l'API)
  final List<Actualite> _actualites = [
    Actualite(
      id: 1,
      titre: 'Belle victoire de l\'équipe 1 à domicile',
      corps:
          'Samedi dernier, l\'équipe 1 s\'est imposée 3 sets à 0 devant son public. '
          'Une belle performance collective, avec un service très solide en début de match. '
          'Prochain rendez-vous le week-end du 13 décembre.',
      date: DateTime(2026, 11, 22),
      categorie: CategorieActu.match,
    ),
    Actualite(
      id: 2,
      titre: 'Soirée du club : réservez la date',
      corps:
          'Le club organise une soirée ouverte à tous les licenciés et leurs proches. '
          'Au programme : repas partagé, tournoi amical et remise des maillots. '
          'Les inscriptions ouvrent la semaine prochaine.',
      date: DateTime(2026, 11, 20),
      categorie: CategorieActu.evenement,
    ),
    Actualite(
      id: 3,
      titre: 'Changement d\'horaire des entraînements',
      corps:
          'À partir de la semaine prochaine, l\'entraînement du jeudi commence à 20h00 '
          'au lieu de 19h30. Merci de prévenir si vous ne pouvez pas être présents.',
      date: DateTime(2026, 11, 18),
      categorie: CategorieActu.info,
    ),
    Actualite(
      id: 4,
      titre: 'Les licences 2026-2027 sont ouvertes',
      corps:
          'Il est encore possible de s\'inscrire auprès du bureau du club. '
          'Pensez à fournir le certificat médical et la photo d\'identité.',
      date: DateTime(2026, 11, 10),
      categorie: CategorieActu.club,
    ),
  ];

  String _deux(int n) => n.toString().padLeft(2, '0');

  String _formatDate(DateTime d) =>
      '${_deux(d.day)}/${_deux(d.month)}/${d.year}';

  Color _couleur(CategorieActu c) => switch (c) {
    CategorieActu.match => Colors.greenAccent,
    CategorieActu.club => _jaune,
    CategorieActu.evenement => Colors.lightBlueAccent,
    CategorieActu.info => Colors.orangeAccent,
  };

  Widget _pastille(CategorieActu c) {
    final couleur = _couleur(c);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: couleur.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: couleur.withOpacity(0.6)),
      ),
      child: Text(
        c.label,
        style: TextStyle(
          color: couleur,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  // Lit l'article en entier
  void _ouvrir(Actualite a) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1C1C1E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _pastille(a.categorie),
                  const SizedBox(width: 10),
                  Text(
                    _formatDate(a.date),
                    style: const TextStyle(color: Colors.white54, fontSize: 12),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Text(
                a.titre,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                a.corps,
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Plus récentes en premier
    final liste = [..._actualites]..sort((a, b) => b.date.compareTo(a.date));

    return MainLayout(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 130, 16, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'ACTUALITÉS',
              style: TextStyle(
                color: _jaune,
                fontSize: 32,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 16),
            if (liste.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Text(
                  'Aucune actualité pour le moment.',
                  style: TextStyle(color: Colors.white70),
                ),
              ),
            for (final a in liste)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: InkWell(
                  borderRadius: BorderRadius.circular(20),
                  onTap: () => _ouvrir(a),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF303030).withOpacity(0.85),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white10),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            _pastille(a.categorie),
                            const Spacer(),
                            Text(
                              _formatDate(a.date),
                              style: const TextStyle(
                                color: Colors.white54,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          a.titre,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          a.corps,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
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
