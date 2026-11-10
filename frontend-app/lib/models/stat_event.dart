class StatEvent {
  const StatEvent({
    required this.player,
    required this.action,
    required this.seconds,
    required this.setNumber,
  });

  final String player;
  final String action;
  final int seconds;
  final int setNumber;
}
