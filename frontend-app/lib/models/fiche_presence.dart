// À placer dans lib/models/fiche_presence.dart (remplace seance.dart)

/// Une fiche de présence : une date, une équipe, et qui était là.
class FichePresence {
  final int id;
  final int equipeId;
  final DateTime date;
  final Map<int, bool> presences; // userId -> présent

  const FichePresence({
    required this.id,
    required this.equipeId,
    required this.date,
    this.presences = const {},
  });

  FichePresence copyWith({Map<int, bool>? presences}) {
    return FichePresence(
      id: id,
      equipeId: equipeId,
      date: date,
      presences: presences ?? this.presences,
    );
  }
}
