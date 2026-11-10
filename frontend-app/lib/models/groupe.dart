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
  });

  final int id;
  final String nom;
  final DateTime dateCreation;
  final Message? dernierMessage;
  final String? image;
  final List<Message>? messages;
  final Uint8List? imageLocale;
  final Set<int> participantIds;

  // Tous les messages du groupe, y compris le dernier s'il n'est pas dans la liste
  List<Message> get tousLesMessages {
    final liste = List<Message>.from(messages ?? const []);
    final dernier = dernierMessage;
    if (dernier != null && !liste.any((m) => m.id == dernier.id)) {
      liste.add(dernier);
    }
    return liste;
  }
}
