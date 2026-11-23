import 'listevenement.dart'; // adapte le chemin si besoin

// Utilisateur connecté (à remplacer par ton vrai système de compte)
const String utilisateurActuel = 'Moi';

// Statut du remboursement d'un passager envers le conducteur
enum StatutPaiement {
  aPayer, // le passager n'a pas encore payé
  enAttente, // le passager dit avoir fait le virement, le conducteur doit valider
  valide, // le conducteur a confirmé la réception
}

class Covoiturage {
  final String id;
  final Evenement evenement; // lien avec l'évènement
  final String lieuDepart;
  final String lieuArrivee;
  final String heureDepart;
  final String heureArrivee;
  final String carburant;
  final int placesTotales;
  final double coutTotal; // coût total du trajet en €
  final String conducteur;
  final DateTime date;

  // nom du passager -> nombre de places réservées
  final Map<String, int> passagers;

  // nom du passager -> statut de son paiement (absent = à payer)
  final Map<String, StatutPaiement> paiements;

  Covoiturage({
    required this.id,
    required this.evenement,
    required this.lieuDepart,
    required this.lieuArrivee,
    required this.heureDepart,
    required this.heureArrivee,
    required this.carburant,
    required this.placesTotales,
    required this.coutTotal,
    required this.conducteur,
    required this.date,
    Map<String, int>? passagers,
    Map<String, StatutPaiement>? paiements,
  }) : passagers = passagers ?? {},
       paiements = paiements ?? {};

  int get placesReservees => passagers.values.fold(0, (a, b) => a + b);
  int get placesDisponibles => placesTotales - placesReservees;

  // Coût partagé entre tous les occupants (conducteur inclus)
  double get coutParPersonne => coutTotal / (placesTotales + 1);

  bool estInscrit(String nom) => passagers.containsKey(nom);

  // ---------- PAIEMENTS ----------

  StatutPaiement statutPaiement(String passager) =>
      paiements[passager] ?? StatutPaiement.aPayer;

  // Montant dû par un passager (coût par personne x places réservées)
  double montantDe(String passager) =>
      coutParPersonne * (passagers[passager] ?? 0);

  // Le passager annonce qu'il a fait le virement
  void declarerPaiement(String passager) {
    if (statutPaiement(passager) == StatutPaiement.aPayer) {
      paiements[passager] = StatutPaiement.enAttente;
    }
  }

  // Le conducteur confirme avoir reçu le virement
  void validerPaiement(String passager) {
    if (statutPaiement(passager) == StatutPaiement.enAttente) {
      paiements[passager] = StatutPaiement.valide;
    }
  }

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

// "Base de données" en mémoire : elle survit à la navigation entre pages
// (mais pas à la fermeture de l'app)
class CovoiturageRepository {
  static final List<Covoiturage> liste = [
    // Covoiturage statique : toujours présent au lancement de l'app
    Covoiturage(
      id: 'demo1',
      evenement: evenements.first, // ta liste d'évènements
      lieuDepart: 'Gymnase de Meylan',
      lieuArrivee: 'Salle des sports',
      heureDepart: '13:00',
      heureArrivee: '14:00',
      carburant: 'ESSENCE SP95',
      placesTotales: 4,
      coutTotal: 20,
      conducteur: 'Paul',
      date: evenements.first.dateTime,
    ),

    // DÉMO : covoiturage dont JE suis le conducteur, avec deux passagers,
    // pour tester l'onglet "MES COÛTS" (partie "Ce qu'on me doit").
    // Tu peux supprimer ce bloc quand tu as fini de tester.
    Covoiturage(
      id: 'demo2',
      evenement: evenements.first,
      lieuDepart: 'Gare de Grenoble',
      lieuArrivee: 'Salle des sports',
      heureDepart: '12:30',
      heureArrivee: '13:30',
      carburant: 'DIESEL',
      placesTotales: 4,
      coutTotal: 25,
      conducteur: utilisateurActuel,
      date: evenements.first.dateTime,
      passagers: {'Léa': 1, 'Tom': 2},
      paiements: {'Léa': StatutPaiement.enAttente},
    ),
  ];

  static List<Covoiturage> pourEvenement(Evenement e) =>
      liste.where((c) => c.evenement == e).toList();
}
