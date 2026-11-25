// Valeurs de l'enum "Pronom" de la BDD
enum Pronom {
  il('Il'),
  elle('Elle'),
  iel('Iel'),
  autre('Autre');

  const Pronom(this.libelle);

  // Texte affiché dans l'app
  final String libelle;
}

class Utilisateur {
  const Utilisateur({
    required this.id,
    required this.nom,
    required this.prenom,
    this.mail,
    this.tel,
    this.role,
    this.dateNaissance,
    this.pronom,
  });

  final int id;
  final String nom;
  final String prenom;
  final String? mail;
  final String? tel;
  final String? role;
  final DateTime? dateNaissance;
  final Pronom? pronom;

  String get nomComplet => '$prenom $nom';

  // Copie de l'utilisateur avec quelques valeurs changées
  Utilisateur copyWith({
    String? nom,
    String? prenom,
    String? mail,
    String? tel,
    DateTime? dateNaissance,
    Pronom? pronom,
  }) {
    return Utilisateur(
      id: id,
      nom: nom ?? this.nom,
      prenom: prenom ?? this.prenom,
      mail: mail ?? this.mail,
      tel: tel ?? this.tel,
      role: role,
      dateNaissance: dateNaissance ?? this.dateNaissance,
      pronom: pronom ?? this.pronom,
    );
  }
}
