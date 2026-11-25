import '../models/stat_event.dart';

// Mon équipe : sert à savoir si un match est une victoire ou une défaite
const String monEquipe = 'Grenoble Volley';

class SetScore {
  final int domicile;
  final int exterieur;
  const SetScore(this.domicile, this.exterieur);
}

class ResultatMatch {
  final String equipeDomicile;
  final String equipeExterieur;
  final DateTime date;
  final List<SetScore> sets;
  final List<StatEvent> actions;

  ResultatMatch({
    required this.equipeDomicile,
    required this.equipeExterieur,
    required this.date,
    required this.sets,
    this.actions = const [],
  });

  bool get _domicile => equipeDomicile == monEquipe;

  String get adversaire => _domicile ? equipeExterieur : equipeDomicile;

  int get setsGagnes => sets
      .where(
        (s) => _domicile ? s.domicile > s.exterieur : s.exterieur > s.domicile,
      )
      .length;

  int get setsPerdus => sets.length - setsGagnes;

  int get pointsMarques =>
      sets.fold(0, (t, s) => t + (_domicile ? s.domicile : s.exterieur));

  int get pointsEncaisses =>
      sets.fold(0, (t, s) => t + (_domicile ? s.exterieur : s.domicile));

  bool get victoire => setsGagnes > setsPerdus;
}

// Données de test (à remplacer par les vrais résultats de l'arbitrage)
final List<ResultatMatch> listeResultats = [
  ResultatMatch(
    equipeDomicile: 'Grenoble Volley',
    equipeExterieur: 'Lyon Volley-Club',
    date: DateTime(2026, 9, 12),
    sets: const [SetScore(25, 20), SetScore(25, 22), SetScore(25, 18)],
    actions: [
      StatEvent(
        player: 'LUCIE',
        action: 'SERVICE ACE',
        seconds: 120,
        setNumber: 1,
      ),
      StatEvent(
        player: 'LEO',
        action: 'ATTAQUE REUSSITE',
        seconds: 200,
        setNumber: 1,
      ),
      StatEvent(
        player: 'MARC',
        action: 'SERVICE RATER',
        seconds: 300,
        setNumber: 2,
      ),
    ],
  ),
  ResultatMatch(
    equipeDomicile: 'Annecy',
    equipeExterieur: 'Grenoble Volley',
    date: DateTime(2026, 9, 26),
    sets: const [
      SetScore(25, 23),
      SetScore(20, 25),
      SetScore(25, 22),
      SetScore(25, 19),
    ],
    actions: [
      StatEvent(
        player: 'CAMILLE',
        action: 'ATTAQUE RATER',
        seconds: 90,
        setNumber: 1,
      ),
      StatEvent(
        player: 'LOLA',
        action: 'SERVICE REUSSI',
        seconds: 150,
        setNumber: 2,
      ),
    ],
  ),
  ResultatMatch(
    equipeDomicile: 'Grenoble Volley',
    equipeExterieur: 'Chambéry',
    date: DateTime(2026, 10, 3),
    sets: const [SetScore(25, 15), SetScore(25, 17), SetScore(25, 21)],
    actions: [
      StatEvent(
        player: 'LUCIE',
        action: 'SERVICE ACE',
        seconds: 60,
        setNumber: 1,
      ),
      StatEvent(
        player: 'HUGO',
        action: 'ATTAQUE REUSSITE',
        seconds: 110,
        setNumber: 1,
      ),
      StatEvent(
        player: 'EMMA',
        action: 'ATTAQUE REUSSITE',
        seconds: 240,
        setNumber: 3,
      ),
    ],
  ),
  ResultatMatch(
    equipeDomicile: 'Valence',
    equipeExterieur: 'Grenoble Volley',
    date: DateTime(2026, 10, 10),
    sets: const [
      SetScore(25, 20),
      SetScore(25, 23),
      SetScore(22, 25),
      SetScore(25, 21),
    ],
    actions: [
      StatEvent(
        player: 'CARL',
        action: 'SERVICE RATER',
        seconds: 180,
        setNumber: 2,
      ),
      StatEvent(
        player: 'LEO',
        action: 'ATTAQUE REUSSITE',
        seconds: 220,
        setNumber: 3,
      ),
    ],
  ),
  ResultatMatch(
    equipeDomicile: 'Grenoble Volley',
    equipeExterieur: 'Annecy',
    date: DateTime(2026, 10, 24),
    sets: const [SetScore(25, 22), SetScore(25, 19), SetScore(25, 23)],
    actions: [
      StatEvent(
        player: 'LUCIE',
        action: 'SERVICE REUSSI',
        seconds: 75,
        setNumber: 1,
      ),
      StatEvent(
        player: 'MARC',
        action: 'ATTAQUE REUSSITE',
        seconds: 130,
        setNumber: 2,
      ),
    ],
  ),
  ResultatMatch(
    equipeDomicile: 'Lyon Volley-Club',
    equipeExterieur: 'Grenoble Volley',
    date: DateTime(2026, 11, 7),
    sets: const [SetScore(25, 18), SetScore(25, 21), SetScore(25, 20)],
    actions: [
      StatEvent(
        player: 'CAMILLE',
        action: 'ATTAQUE RATER',
        seconds: 95,
        setNumber: 1,
      ),
      StatEvent(
        player: 'LOLA',
        action: 'SERVICE RATER',
        seconds: 140,
        setNumber: 2,
      ),
    ],
  ),
];
