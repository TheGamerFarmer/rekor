import 'package:flutter/material.dart';

class Calendrier extends StatefulWidget {
  const Calendrier({super.key, this.matchs = const {}});

  /// Jours de match, affichés en jaune
  final Set<DateTime> matchs;

  @override
  State<Calendrier> createState() => _CalendrierState();
}

class _CalendrierState extends State<Calendrier> {
  static const _jaune = Color(0xFFFFD60A);
  static const _bleu = Color(0xFF2556C4);
  static const _taille = 44.0;
  static const _tailleRond = 36.0;

  //tout les mois
  static const _nomsMois = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];
  //tout les jours
  static const _initiales = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  // Mois affiché (toujours le 1er du mois)
  late DateTime _mois = DateTime(DateTime.now().year, DateTime.now().month);

  void _changerMois(int delta) {
    setState(() {
      _mois = DateTime(_mois.year, _mois.month + delta);
    });
  }

  @override
  Widget build(BuildContext context) {
    // Calcul de la grille
    final decalage = DateTime(_mois.year, _mois.month, 1).weekday - 1;
    final nbJours = DateTime(_mois.year, _mois.month + 1, 0).day;
    final nbSemaines = ((decalage + nbJours) / 7).ceil();
    final debut = DateTime(_mois.year, _mois.month, 1 - decalage);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white10,
        borderRadius: BorderRadius.circular(25),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          //mois
          _entete(),
          //espace
          const SizedBox(height: 16),
          //jour
          _joursSemaine(),
          //espace
          const SizedBox(height: 8),
          //mois en entier
          for (int s = 0; s < nbSemaines; s++)
            Row(
              children: [
                for (int j = 0; j < 7; j++)
                  Expanded(
                    child: _cellule(
                      DateTime(debut.year, debut.month, debut.day + s * 7 + j),
                    ),
                  ),
              ],
            ),
        ],
      ),
    );
  }

  // Flèches + nom du mois
  Widget _entete() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        IconButton(
          icon: const Icon(Icons.chevron_left, color: Colors.white),
          onPressed: () => _changerMois(-1),
        ),
        SizedBox(
          width: 120,
          child: Text(
            _nomsMois[_mois.month - 1],
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        IconButton(
          mouseCursor: SystemMouseCursors.click,
          icon: const Icon(Icons.chevron_right, color: Colors.white),
          onPressed: () => _changerMois(1),
        ),
      ],
    );
  }

  // L M M J V S D
  Widget _joursSemaine() {
    return Row(
      children: [
        for (final lettre in _initiales)
          Expanded(
            child: Center(
              child: Text(
                lettre,
                style: const TextStyle(
                  color: _jaune,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
      ],
    );
  }

  // Une case du calendrier
  Widget _cellule(DateTime jour) {
    final dansMois = jour.month == _mois.month;
    final estMatch = widget.matchs.contains(jour);
    final estEntrainement = dansMois && jour.weekday == DateTime.tuesday;

    // Arrondi en haut / en bas de la colonne bleue
    final debutPilule =
        estEntrainement &&
        DateTime(jour.year, jour.month, jour.day - 7).month != _mois.month;
    final finPilule =
        estEntrainement &&
        DateTime(jour.year, jour.month, jour.day + 7).month != _mois.month;

    return Center(
      child: Container(
        width: estMatch ? _tailleRond : _taille,
        height: estMatch ? _tailleRond : _taille,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: estMatch ? _jaune : (estEntrainement ? _bleu : null),
          shape: estMatch ? BoxShape.circle : BoxShape.rectangle,
          borderRadius: estMatch
              ? null
              : BorderRadius.vertical(
                  top: Radius.circular(debutPilule ? _taille / 2 : 0),
                  bottom: Radius.circular(finPilule ? _taille / 2 : 0),
                ),
        ),
        child: Text(
          '${jour.day}',
          style: TextStyle(
            color: estMatch
                ? Colors.black
                : (dansMois ? Colors.white : Colors.white38),
          ),
        ),
      ),
    );
  }
}
