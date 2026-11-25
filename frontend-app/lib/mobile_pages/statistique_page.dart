// À placer dans lib/mobile_pages/statistique_page.dart (remplace l'ancien)
import 'package:flutter/material.dart';

import '../layouts/main_layout.dart';
import '../models/stat_event.dart';
import '../widgets/resultat_match.dart';

// Équipes du club proposées au premier écran.
// Plus tard : à charger depuis la BDD (table Equipe).
const List<String> equipesDuClub = [monEquipe, 'Grenoble Volley 2'];

enum VueStats { equipe, match, joueur }

class StatistiquePage extends StatefulWidget {
  const StatistiquePage({super.key});

  @override
  State<StatistiquePage> createState() => _StatistiquePageState();
}

class _StatistiquePageState extends State<StatistiquePage> {
  static const Color jaune = Color(0xFFFFDA1A);

  String? _equipe; // null = on est encore sur le choix de l'équipe
  VueStats _vue = VueStats.equipe;
  int _matchIndex = 0; // position dans la liste (0 = match le plus récent)
  String? _joueur;

  // ---------- OUTILS ----------

  String _pct(int a, int b) => b == 0 ? '–' : '${(a * 100 / b).round()} %';

  String _deux(int n) => n.toString().padLeft(2, '0');

  String _formatDate(DateTime d) =>
      '${_deux(d.day)}/${_deux(d.month)}/${d.year}';

  int _nb(List<StatEvent> actions, String nomAction) =>
      actions.where((e) => e.action == nomAction).length;

  // Matchs d'une équipe (domicile ou extérieur)
  List<ResultatMatch> _matchsDe(String equipe) => listeResultats
      .where((m) => m.equipeDomicile == equipe || m.equipeExterieur == equipe)
      .toList();

  // Résultat d'un match vu depuis l'équipe choisie
  // (comme ResultatMatch, mais pour n'importe quelle équipe et pas seulement monEquipe)
  bool _domicile(ResultatMatch m, String eq) => m.equipeDomicile == eq;

  String _adversaire(ResultatMatch m, String eq) =>
      _domicile(m, eq) ? m.equipeExterieur : m.equipeDomicile;

  int _setsGagnes(ResultatMatch m, String eq) => m.sets
      .where(
        (s) => _domicile(m, eq)
            ? s.domicile > s.exterieur
            : s.exterieur > s.domicile,
      )
      .length;

  int _setsPerdus(ResultatMatch m, String eq) =>
      m.sets.length - _setsGagnes(m, eq);

  int _pointsMarques(ResultatMatch m, String eq) => m.sets.fold(
    0,
    (t, s) => t + (_domicile(m, eq) ? s.domicile : s.exterieur),
  );

  int _pointsEncaisses(ResultatMatch m, String eq) => m.sets.fold(
    0,
    (t, s) => t + (_domicile(m, eq) ? s.exterieur : s.domicile),
  );

  bool _victoire(ResultatMatch m, String eq) =>
      _setsGagnes(m, eq) > _setsPerdus(m, eq);

  // Compte une action par joueur, trié du plus au moins
  List<MapEntry<String, int>> _parJoueur(
    List<StatEvent> actions,
    String nomAction,
  ) {
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

  void _choisirEquipe(String? equipe) {
    setState(() {
      _equipe = equipe;
      // On repart de zéro à chaque changement d'équipe
      _vue = VueStats.equipe;
      _matchIndex = 0;
      _joueur = null;
    });
  }

  // ---------- PAGE ----------

  @override
  Widget build(BuildContext context) {
    final equipe = _equipe;

    return MainLayout(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 40, 20, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 130),
              const Text(
                'STATISTIQUES',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: jaune,
                ),
              ),
              const SizedBox(height: 5),
              if (equipe == null)
                ..._choixEquipe()
              else
                ..._statsEquipe(equipe),
            ],
          ),
        ),
      ),
    );
  }

  // ---------- ÉTAPE 1 : CHOIX DE L'ÉQUIPE ----------

  List<Widget> _choixEquipe() {
    return [
      const Text(
        'Choisis une équipe',
        style: TextStyle(color: Colors.white, fontStyle: FontStyle.italic),
      ),
      const SizedBox(height: 25),
      for (final nom in equipesDuClub)
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: InkWell(
            borderRadius: BorderRadius.circular(20),
            onTap: () => _choisirEquipe(nom),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF303030).withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white10),
              ),
              child: Row(
                children: [
                  const CircleAvatar(
                    backgroundColor: Colors.white10,
                    child: Icon(Icons.groups, color: Colors.white),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          nom,
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          '${_matchsDe(nom).length} matchs joués',
                          style: const TextStyle(
                            color: Colors.white54,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: Colors.white54),
                ],
              ),
            ),
          ),
        ),
    ];
  }

  // ---------- ÉTAPE 2 : STATS DE L'ÉQUIPE CHOISIE ----------

  List<Widget> _statsEquipe(String equipe) {
    // Matchs de l'équipe, du plus récent au plus ancien
    final tousLesMatchs = _matchsDe(equipe)
      ..sort((a, b) => b.date.compareTo(a.date));
    final toutesLesActions = tousLesMatchs.expand((m) => m.actions).toList();

    // Joueurs connus (pour le menu de la vue Joueur)
    final joueurs = toutesLesActions.map((e) => e.player).toSet().toList()
      ..sort();
    final joueurChoisi = joueurs.contains(_joueur)
        ? _joueur
        : (joueurs.isEmpty ? null : joueurs.first);

    final matchIndex = _matchIndex < tousLesMatchs.length ? _matchIndex : 0;
    final matchChoisi = tousLesMatchs.isEmpty
        ? null
        : tousLesMatchs[matchIndex];

    // 1) Quels matchs ?  2) Quelles actions ?
    final matchs = _vue == VueStats.match
        ? [?matchChoisi]
        : tousLesMatchs;

    final actions = switch (_vue) {
      VueStats.joueur =>
        toutesLesActions.where((e) => e.player == joueurChoisi).toList(),
      _ => matchs.expand((m) => m.actions).toList(),
    };

    return [
      Text(
        switch (_vue) {
          VueStats.equipe => 'Équipe : $equipe',
          VueStats.match =>
            matchChoisi == null
                ? 'Match'
                : 'Match contre ${_adversaire(matchChoisi, equipe)}',
          VueStats.joueur => 'Joueur : ${joueurChoisi ?? '-'}',
        },
        style: const TextStyle(
          color: Colors.white,
          fontStyle: FontStyle.italic,
        ),
      ),

      // Retour au choix de l'équipe
      Align(
        alignment: Alignment.centerLeft,
        child: TextButton.icon(
          style: TextButton.styleFrom(
            padding: EdgeInsets.zero,
            minimumSize: const Size(0, 32),
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          onPressed: () => _choisirEquipe(null),
          icon: const Icon(Icons.arrow_back, color: Colors.white70, size: 16),
          label: const Text(
            'Changer d\'équipe',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
        ),
      ),

      const SizedBox(height: 8),

      // CHOIX DE LA VUE
      Wrap(
        spacing: 8,
        children: [
          for (final v in VueStats.values)
            ChoiceChip(
              label: Text(switch (v) {
                VueStats.equipe => 'Équipe',
                VueStats.match => 'Match',
                VueStats.joueur => 'Joueur',
              }),
              selected: _vue == v,
              showCheckmark: false,
              selectedColor: jaune,
              backgroundColor: Colors.white10,
              side: const BorderSide(color: Colors.white24),
              labelStyle: TextStyle(
                color: Colors.black,
                fontWeight: FontWeight.bold,
              ),
              onSelected: (_) => setState(() => _vue = v),
            ),
        ],
      ),

      // MENU : quel match ?
      if (_vue == VueStats.match && tousLesMatchs.isNotEmpty) ...[
        const SizedBox(height: 12),
        _menu<int>(
          valeur: matchIndex,
          items: [
            for (int i = 0; i < tousLesMatchs.length; i++)
              DropdownMenuItem(
                value: i,
                child: Text(
                  '${_formatDate(tousLesMatchs[i].date)} · '
                  'vs ${_adversaire(tousLesMatchs[i], equipe)}',
                ),
              ),
          ],
          onChanged: (i) => setState(() => _matchIndex = i!),
        ),
      ],

      // MENU : quel joueur ?
      if (_vue == VueStats.joueur && joueurs.isNotEmpty) ...[
        const SizedBox(height: 12),
        _menu<String>(
          valeur: joueurChoisi,
          items: [
            for (final j in joueurs) DropdownMenuItem(value: j, child: Text(j)),
          ],
          onChanged: (j) => setState(() => _joueur = j),
        ),
      ],

      const SizedBox(height: 25),

      if (tousLesMatchs.isEmpty)
        const Text(
          'Aucun match joué pour le moment.',
          style: TextStyle(color: Colors.white70),
        )
      else if (_vue == VueStats.joueur) ...[
        if (joueurChoisi == null)
          const Text(
            'Aucun joueur pour le moment.',
            style: TextStyle(color: Colors.white70),
          )
        else
          _carteJoueur(actions),
        const SizedBox(height: 100),
      ] else ...[
        if (_vue == VueStats.match && matchChoisi != null)
          _carteMatch(matchChoisi, equipe)
        else
          _carteResume(matchs, equipe),
        const SizedBox(height: 15),
        ..._cartesActions(actions),
        const SizedBox(height: 100),
      ],
    ];
  }

  // ---------- CARTES ----------

  // Vue Équipe : résumé de tous les matchs
  Widget _carteResume(List<ResultatMatch> matchs, String equipe) {
    final joues = matchs.length;
    final victoires = matchs.where((m) => _victoire(m, equipe)).length;
    final defaites = joues - victoires;

    return _carte('Résumé', Icons.bar_chart, [
      Row(
        children: [
          _tuile('$joues', 'Matchs'),
          _tuile('$victoires', 'Victoires', couleur: Colors.greenAccent),
          _tuile('$defaites', 'Défaites', couleur: Colors.redAccent),
          _tuile(_pct(victoires, joues), '% victoires', couleur: jaune),
        ],
      ),
    ]);
  }

  // Vue Match : résultat du match choisi
  Widget _carteMatch(ResultatMatch m, String equipe) {
    final victoire = _victoire(m, equipe);
    final couleur = victoire ? Colors.greenAccent : Colors.redAccent;

    return _carte('Résultat', Icons.emoji_events, [
      Row(
        children: [
          _tuile(
            '${_setsGagnes(m, equipe)} - ${_setsPerdus(m, equipe)}',
            victoire ? 'Victoire' : 'Défaite',
            couleur: couleur,
          ),
          _tuile('${_pointsMarques(m, equipe)}', 'Points marqués'),
          _tuile('${_pointsEncaisses(m, equipe)}', 'Points encaissés'),
        ],
      ),
      const SizedBox(height: 12),
      Text(
        '${_formatDate(m.date)} · ${m.equipeDomicile} - ${m.equipeExterieur}',
        style: const TextStyle(color: Colors.white54, fontSize: 10),
      ),
      const SizedBox(height: 4),
      Text(
        'Sets : ${m.sets.map((s) => '${s.domicile}-${s.exterieur}').join('  ·  ')}',
        style: const TextStyle(color: Colors.white54, fontSize: 10),
      ),
    ]);
  }

  // Vue Joueur : total de chaque action pour la personne choisie
  Widget _carteJoueur(List<StatEvent> actions) {
    final serviceReussi = _nb(actions, 'SERVICE REUSSI');
    final ace = _nb(actions, 'SERVICE ACE');
    final serviceRate = _nb(actions, 'SERVICE RATER');
    final attaqueReussie = _nb(actions, 'ATTAQUE REUSSITE');
    final attaqueRatee = _nb(actions, 'ATTAQUE RATER');

    return Column(
      children: [
        _carte('Service', Icons.sports_volleyball, [
          Row(
            children: [
              _tuile('$serviceReussi', 'Réussis', couleur: Colors.greenAccent),
              _tuile('$ace', 'Aces', couleur: jaune),
              _tuile('$serviceRate', 'Ratés', couleur: Colors.redAccent),
              _tuile(
                _pct(serviceReussi + ace, serviceReussi + ace + serviceRate),
                '% réussite',
              ),
            ],
          ),
        ]),
        const SizedBox(height: 15),
        _carte('Attaque', Icons.flash_on, [
          Row(
            children: [
              _tuile(
                '$attaqueReussie',
                'Réussies',
                couleur: Colors.greenAccent,
              ),
              _tuile('$attaqueRatee', 'Ratées', couleur: Colors.redAccent),
              _tuile(
                _pct(attaqueReussie, attaqueReussie + attaqueRatee),
                '% réussite',
              ),
            ],
          ),
        ]),
      ],
    );
  }

  // Vues Équipe et Match : service + attaque, classement par joueur
  List<Widget> _cartesActions(List<StatEvent> actions) {
    final serviceReussi = _parJoueur(actions, 'SERVICE REUSSI');
    final serviceRate = _parJoueur(actions, 'SERVICE RATER');
    final ace = _parJoueur(actions, 'SERVICE ACE');
    final attaqueReussie = _parJoueur(actions, 'ATTAQUE REUSSITE');
    final attaqueRatee = _parJoueur(actions, 'ATTAQUE RATER');

    return [
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
        _section('Service raté', Icons.cancel, Colors.redAccent, serviceRate),
      ]),
      const SizedBox(height: 15),
      _carte('Attaque', Icons.flash_on, [
        _section(
          'Attaque réussie',
          Icons.check_circle,
          Colors.greenAccent,
          attaqueReussie,
        ),
        const SizedBox(height: 18),
        _section('Attaque ratée', Icons.cancel, Colors.redAccent, attaqueRatee),
      ]),
    ];
  }

  // ---------- WIDGETS ----------

  Widget _menu<T>({
    required T? valeur,
    required List<DropdownMenuItem<T>> items,
    required ValueChanged<T?> onChanged,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: Colors.white10,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white24),
      ),
      child: DropdownButton<T>(
        value: valeur,
        isExpanded: true,
        underline: const SizedBox(),
        dropdownColor: const Color(0xFF303030),
        iconEnabledColor: Colors.white70,
        style: const TextStyle(color: Colors.white, fontSize: 14),
        items: items,
        onChanged: onChanged,
      ),
    );
  }

  Widget _carte(String titre, IconData icone, List<Widget> contenu) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF303030).withValues(alpha: 0.85),
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
