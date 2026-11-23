import 'package:flutter/material.dart';

import '../layouts/main_layout.dart';
import '../widgets/resultat_match.dart';

class StatistiquePage extends StatelessWidget {
  const StatistiquePage({super.key});

  final Color jaune = const Color(0xFFFFDA1A);

  String _pct(int a, int b) => b == 0 ? '–' : '${(a * 100 / b).round()} %';

  // Compte une action par joueur, trié du plus au moins
  List<MapEntry<String, int>> _parJoueur(List actions, String nomAction) {
    final map = <String, int>{};
    for (final e in actions) {
      if (e.action == nomAction) {
        map[e.player] = (map[e.player] ?? 0) + 1;
      }
    }
    final liste = map.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return liste;
  }

  @override
  Widget build(BuildContext context) {
    final matchs = [...listeResultats]
      ..sort((a, b) => a.date.compareTo(b.date));

    final joues = matchs.length;
    final victoires = matchs.where((m) => m.victoire).length;
    final defaites = joues - victoires;

    final actions = matchs.expand((m) => m.actions).toList();

    final serviceReussi = _parJoueur(actions, 'SERVICE REUSSI');
    final serviceRate = _parJoueur(actions, 'SERVICE RATER');
    final ace = _parJoueur(actions, 'SERVICE ACE');
    final attaqueReussie = _parJoueur(actions, 'ATTAQUE REUSSITE');
    final attaqueRatee = _parJoueur(actions, 'ATTAQUE RATER');

    return MainLayout(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 40, 20, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 130),

              Text(
                'STATISTIQUES',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: jaune,
                ),
              ),
              const SizedBox(height: 5),
              const Text(
                'Équipe : Grenoble Volley',
                style: TextStyle(
                  color: Colors.white,
                  fontStyle: FontStyle.italic,
                ),
              ),

              const SizedBox(height: 25),

              if (joues == 0)
                const Text(
                  'Aucun match joué pour le moment.',
                  style: TextStyle(color: Colors.white70),
                )
              else ...[
                // RÉSUMÉ
                _carte('Résumé', Icons.bar_chart, [
                  Row(
                    children: [
                      _tuile('$joues', 'Matchs'),
                      _tuile(
                        '$victoires',
                        'Victoires',
                        couleur: Colors.greenAccent,
                      ),
                      _tuile(
                        '$defaites',
                        'Défaites',
                        couleur: Colors.redAccent,
                      ),
                      _tuile(
                        _pct(victoires, joues),
                        '% victoires',
                        couleur: jaune,
                      ),
                    ],
                  ),
                ]),

                const SizedBox(height: 15),

                // SERVICE
                _carte('Service', Icons.sports_volleyball, [
                  _section(
                    'Service réussi',
                    Icons.check_circle,
                    Colors.greenAccent,
                    serviceReussi,
                  ),
                  const SizedBox(height: 18),
                  _section('Ace', Icons.star, jaune, ace),
                  const SizedBox(height: 18),
                  _section(
                    'Service raté',
                    Icons.cancel,
                    Colors.redAccent,
                    serviceRate,
                  ),
                ]),

                const SizedBox(height: 15),

                // ATTAQUE
                _carte('Attaque', Icons.flash_on, [
                  _section(
                    'Attaque réussie',
                    Icons.check_circle,
                    Colors.greenAccent,
                    attaqueReussie,
                  ),
                  const SizedBox(height: 18),
                  _section(
                    'Attaque ratée',
                    Icons.cancel,
                    Colors.redAccent,
                    attaqueRatee,
                  ),
                ]),
                const SizedBox(height: 100),
              ],
            ],
          ),
        ),
      ),
    );
  }

  // ---------- WIDGETS ----------

  Widget _carte(String titre, IconData icone, List<Widget> contenu) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
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
              Icon(icone, color: Colors.blue, size: 20),
              const SizedBox(width: 8),
              Text(
                titre,
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Divider(color: Color(0xFF444444), height: 14),
          const SizedBox(height: 8),
          ...contenu,
        ],
      ),
    );
  }

  Widget _tuile(String valeur, String label, {Color couleur = Colors.white}) {
    return Expanded(
      child: Column(
        children: [
          Text(
            valeur,
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: couleur,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white54, fontSize: 9),
          ),
        ],
      ),
    );
  }

  // Un type d'action : titre + total + joueurs avec leur nombre
  Widget _section(
    String titre,
    IconData icone,
    Color couleur,
    List<MapEntry<String, int>> joueurs,
  ) {
    final total = joueurs.fold(0, (t, e) => t + e.value);
    final max = joueurs.isEmpty ? 1 : joueurs.first.value;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icone, color: couleur, size: 16),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                titre,
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
            Text(
              '$total',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: couleur,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        if (joueurs.isEmpty)
          const Text(
            'Personne pour le moment.',
            style: TextStyle(color: Colors.white54, fontSize: 10),
          )
        else
          ...joueurs.map((j) => _ligneJoueur(j.key, j.value, max, couleur)),
      ],
    );
  }

  Widget _ligneJoueur(String nom, int nb, int max, Color couleur) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 11,
            backgroundColor: Colors.white24,
            child: Icon(Icons.person, color: Colors.white, size: 14),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: 70,
            child: Text(
              nom,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white, fontSize: 11),
            ),
          ),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: LinearProgressIndicator(
                value: nb / max,
                minHeight: 6,
                backgroundColor: Colors.white12,
                valueColor: AlwaysStoppedAnimation<Color>(couleur),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Text(
            '$nb',
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: couleur,
            ),
          ),
        ],
      ),
    );
  }
}
