import 'dart:typed_data';

import 'utilisateur.dart';

/// Ce que renvoie le formulaire de création d'un groupe
class NouveauGroupe {
  const NouveauGroupe({
    required this.nom,
    required this.participants,
    this.premierMessage,
    this.image,
  });

  final String nom;
  final List<Utilisateur> participants;

  /// null si aucun message n'a été saisi
  final String? premierMessage;

  /// Contenu de la photo choisie (null si aucune)
  final Uint8List? image;
}
