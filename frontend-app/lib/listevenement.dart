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

  // ---------- PRÉSENCE ----------

  bool estPresent(String nom) => presents.contains(nom);

  // Met à jour les listes "présents" / "absents" :
  // la personne est retirée des deux, puis ajoutée dans la bonne
  void definirPresence(String nom, bool present) {
    presents.remove(nom);
    absents.remove(nom);
    (present ? presents : absents).add(nom);
  }

  // Texte affiché dans la liste déroulante de création de covoiturage
  @override
  String toString() => '$nom • $date';
}

// Liste globale des évènements, partagée par toutes les pages
// (accueil, page évènements, création de covoiturage, covoiturages...).
// Remplace ces exemples par tes vrais évènements.
// NB : le premier évènement sert de lien pour les covoiturages de démo.
final List<Evenement> evenements = [
  Evenement(
    nom: 'Match amical',
    type: 'Match amical',
    dateTime: DateTime(2026, 12, 15, 20, 0), // futur → À venir
    date: '15 déc.',
    heureDebut: '18:00',
    heureFin: '20:00',
    lieu: 'Gymnase Jean Moulin',
    ville: 'Grenoble',
    equipe1: 'Les Aigles',
    equipe2: 'Les Tigres',
    arbitre: 'Sophie Durand',
    presents: ['Alice', 'Bob'],
    absents: ['Chloé', 'David'],
  ),
  Evenement(
    nom: 'Cours du Mardi',
    type: 'Entraînement',
    dateTime: DateTime(2026, 12, 2, 20, 0), // futur → À venir
    date: '2 déc.',
    heureDebut: '19:00',
    heureFin: '20:00',
    lieu: 'Gymnase court sur foin',
    ville: 'Gières',
    equipe1: '',
    equipe2: '',
    arbitre: '',
    presents: ['Alice', 'Bob', 'Moi'],
    absents: ['David'],
  ),
  Evenement(
    nom: 'Match amical',
    type: 'Match amical',
    dateTime: DateTime(2026, 12, 6, 20, 0), // futur → À venir
    date: '6 déc.',
    heureDebut: '18:00',
    heureFin: '20:00',
    lieu: 'Gymnase court sur foin',
    ville: 'Gières',
    equipe1: 'Gières VBC',
    equipe2: 'À définir',
    arbitre: 'À définir',
    presents: ['Alice'],
    absents: [],
  ),
  Evenement(
    nom: 'Match amical',
    type: 'Match amical',
    dateTime: DateTime(2026, 10, 20, 20, 0), // passé → Terminés
    date: '20 oct.',
    heureDebut: '18:00',
    heureFin: '20:00',
    lieu: 'Gymnase Jean Moulin',
    ville: 'Grenoble',
    equipe1: 'Les Aigles',
    equipe2: 'Les Lions',
    arbitre: 'Paul Martin',
    presents: ['Alice', 'Bob', 'Chloé'],
    absents: ['David'],
  ),
  Evenement(
    nom: 'Réunion',
    type: 'Réunion',
    description: 'Bilan de la saison et préparation du prochain tournoi.',
    dateTime: DateTime(2026, 11, 5, 19, 0), // passé → Terminés
    date: '5 nov.',
    heureDebut: '18:00',
    heureFin: '19:00',
    lieu: 'Salle des fêtes',
    ville: 'Grenoble',
    equipe1: '',
    equipe2: '',
    arbitre: '',
    presents: ['Alice', 'Bob', 'Chloé'],
    absents: ['David'],
  ),
];
