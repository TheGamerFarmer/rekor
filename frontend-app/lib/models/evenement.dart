enum TypeEvenement { cours, match }

class Evenement {
  const Evenement({
    required this.titre,
    required this.date,
    required this.horaire,
    required this.lieu,
    required this.type,
    this.present = false,
  });

  final String titre;
  final String date;
  final String horaire;
  final String lieu;
  final TypeEvenement type;
  final bool present;
}
