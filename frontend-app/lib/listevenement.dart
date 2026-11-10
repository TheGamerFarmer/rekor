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
}
