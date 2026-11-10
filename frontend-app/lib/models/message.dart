class Message {
  const Message({
    required this.id,
    required this.corps,
    required this.auteur,
    required this.date,
  });

  final int id;
  final String corps;
  final String auteur;
  final DateTime date;
}
