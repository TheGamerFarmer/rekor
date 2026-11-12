import 'dart:typed_data';

import 'message.dart';

class Groupe {
  const Groupe({
    required this.id,
    required this.nom,
    required this.dateCreation,
    this.dernierMessage,
    this.messages = const [],
    this.image,
    this.imageLocale,
    this.participantIds = const {},
    this.derniereLecture,
  });

  final int id;
  final String nom;
  final DateTime dateCreation;
  final Message? dernierMessage;
  final String? image;
  final List<Message>? messages;
  final Uint8List? imageLocale;
  final Set<int> participantIds;

  // Date où l'utilisateur connecté a lu ce groupe pour la dernière fois
  final DateTime? derniereLecture;

  // Tous les messages du groupe, y compris le dernier s'il n'est pas dans la liste
  List<Message> get tousLesMessages {
    final liste = List<Message>.from(messages ?? const []);
    final dernier = dernierMessage;
    if (dernier != null && !liste.any((m) => m.id == dernier.id)) {
      liste.add(dernier);
    }
    return liste;
  }

  // Date du dernier message (ou de création s'il n'y en a pas encore)
  DateTime get derniereActivite => dernierMessage?.date ?? dateCreation;

  // Calculé (plus de champ) : le dernier message est-il arrivé après la dernière lecture ?
  bool get nonLu {
    final dernier = dernierMessage;
    if (dernier == null) return false;
    if (dernier.auteur == 'Moi')
      return false; // TODO : comparer avec l'id de l'utilisateur connecté
    final lecture = derniereLecture;
    return lecture == null || dernier.date.isAfter(lecture);
  }

  // Copie du groupe avec quelques valeurs changées
  Groupe copyWith({
    String? nom,
    Message? dernierMessage,
    List<Message>? messages,
    Set<int>? participantIds,
    DateTime? derniereLecture,
  }) {
    return Groupe(
      id: id,
      nom: nom ?? this.nom,
      dateCreation: dateCreation,
      dernierMessage: dernierMessage ?? this.dernierMessage,
      image: image,
      imageLocale: imageLocale,
      participantIds: participantIds ?? this.participantIds,
      messages: messages ?? this.messages,
      derniereLecture: derniereLecture ?? this.derniereLecture,
    );
  }
}
