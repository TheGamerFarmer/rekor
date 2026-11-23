class Evenement {
  final String nom;
  final DateTime dateTime;
  final String date;
  final String heureDebut;
  final String heureFin;
  final String lieu;
  final String ville;
  final String equipe1;
  final String equipe2;
  final String arbitre;
  final List<String> presents;
  final List<String> absents;
  final String type;
  final String description;

  Evenement({
    required this.nom,
    required this.date,
    required this.dateTime,
    required this.heureDebut,
    required this.heureFin,
    required this.lieu,
    required this.ville,
    required this.equipe1,
    required this.equipe2,
    required this.arbitre,
    required this.presents,
    required this.absents,
    this.type = 'Match amical',
    this.description = '',
  });

  bool get estTermine => dateTime.isBefore(DateTime.now());

  // Texte affiché dans la liste déroulante de création de covoiturage
  @override
  String toString() => '$nom • $date';
}

// Liste globale des évènements, accessible depuis toutes les pages
// (page évènements, création de covoiturage, covoiturage statique...)
// Remplace ces exemples par tes vrais évènements.
final List<Evenement> evenements = [
  Evenement(
    nom: 'Match 1',
    type: 'Match amical',
    date: '6 déc. 2026',
    dateTime: DateTime(2026, 12, 6, 14, 0),
    heureDebut: '14:00',
    heureFin: '16:00',
    lieu: 'Salle des sports',
    ville: 'Meylan',
    equipe1: 'Équipe A',
    equipe2: 'Équipe B',
    arbitre: 'Arbitre 1',
    presents: ['Paul', 'Léa', 'Tom'],
    absents: ['Sam'],
  ),
  Evenement(
    nom: 'Match 2',
    type: 'Match compétition',
    date: '13 déc. 2026',
    dateTime: DateTime(2026, 12, 13, 15, 30),
    heureDebut: '15:30',
    heureFin: '17:30',
    lieu: 'Gymnase municipal',
    ville: 'Grenoble',
    equipe1: 'Équipe A',
    equipe2: 'Équipe C',
    arbitre: 'Arbitre 2',
    presents: ['Paul', 'Léa'],
    absents: [],
  ),
  Evenement(
    nom: 'Entraînement',
    type: 'Entraînement',
    date: '9 déc. 2026',
    dateTime: DateTime(2026, 12, 9, 19, 0),
    heureDebut: '19:00',
    heureFin: '21:00',
    lieu: 'Gymnase de Meylan',
    ville: 'Meylan',
    equipe1: '',
    equipe2: '',
    arbitre: '',
    presents: ['Tom'],
    absents: [],
  ),
];
