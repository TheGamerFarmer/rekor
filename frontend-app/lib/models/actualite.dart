// À placer dans lib/models/actualite.dart

enum CategorieActu { match, club, evenement, info }

extension CategorieActuLabel on CategorieActu {
  String get label => switch (this) {
    CategorieActu.match => 'Match',
    CategorieActu.club => 'Club',
    CategorieActu.evenement => 'Évènement',
    CategorieActu.info => 'Info',
  };
}

class Actualite {
  final int id;
  final String titre;
  final String corps;
  final DateTime date;
  final CategorieActu categorie;

  const Actualite({
    required this.id,
    required this.titre,
    required this.corps,
    required this.date,
    required this.categorie,
  });
}
