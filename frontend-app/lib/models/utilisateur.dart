class Utilisateur {
  const Utilisateur({
    required this.id,
    required this.nom,
    required this.prenom,
  });

  final int id;
  final String nom;
  final String prenom;

  String get nomComplet => '$prenom $nom';
}
