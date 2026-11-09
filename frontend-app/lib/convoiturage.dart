class Covoiturage {
  final String? evenement;
  final String lieuDepart;
  final String lieuArrivee;
  final String heureDepart;
  final String heureArrivee;
  final String carburant;
  final int placesDisponibles;
  final String conducteur;
  final DateTime date;

  const Covoiturage({
    this.evenement,
    required this.lieuDepart,
    required this.lieuArrivee,
    required this.heureDepart,
    required this.heureArrivee,
    required this.carburant,
    required this.placesDisponibles,
    required this.conducteur,
    required this.date,
  });

  static const List<String> _mois = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];

  String get dateFormatee =>
      '${date.day} ${_mois[date.month - 1]} ${date.year}';
}
