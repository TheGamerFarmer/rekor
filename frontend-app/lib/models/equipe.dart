// À placer dans lib/models/equipe.dart
import 'utilisateur.dart';

enum Poste { passeur, pointu, central, receptionneurAttaquant, libero }

extension PosteLabel on Poste {
  String get label => switch (this) {
    Poste.passeur => 'Passeur',
    Poste.pointu => 'Pointu',
    Poste.central => 'Central',
    Poste.receptionneurAttaquant => 'Réceptionneur-attaquant',
    Poste.libero => 'Libéro',
  };
}

extension UtilisateurNom on Utilisateur {
  String get nomComplet => '$prenom $nom';
}

class Equipe {
  final int id;
  final String nom;
  final int capitaineId; // association "est-capitaine" (1,1)
  final Map<int, Poste> membres; // association "appartient" : userId -> poste

  const Equipe({
    required this.id,
    required this.nom,
    required this.capitaineId,
    required this.membres,
  });

  Equipe copyWith({String? nom, int? capitaineId, Map<int, Poste>? membres}) {
    return Equipe(
      id: id,
      nom: nom ?? this.nom,
      capitaineId: capitaineId ?? this.capitaineId,
      membres: membres ?? this.membres,
    );
  }
}
