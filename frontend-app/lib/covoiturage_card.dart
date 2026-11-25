import 'package:flutter/material.dart';

import 'convoiturage.dart';

// Une carte = un covoiturage.
// Les textes viennent de l'objet "covoiturage".
class CovoiturageCard extends StatefulWidget {
  final Covoiturage covoiturage;

  // Appelé après une inscription / désinscription
  // pour que la page parente se rafraîchisse
  final VoidCallback onChange;

  const CovoiturageCard({
    super.key,
    required this.covoiturage,
    required this.onChange,
  });

  @override
  State<CovoiturageCard> createState() => _CovoiturageCardState();
}

class _CovoiturageCardState extends State<CovoiturageCard> {
  // Si déjà inscrit, on reprend le nombre de places réservées
  late int _placesReservees =
      widget.covoiturage.passagers[utilisateurActuel] ?? 1;
  int? _boutonSelectionne;

  final Color jaune = const Color(0xFFFFDA1A);
  final Color bleu = const Color(0xFF2864D7);
  final Color grisBouton = const Color(0xFFCCCCCC);

  bool get _inscrit => widget.covoiturage.estInscrit(utilisateurActuel);

  // S'inscrire ou annuler son inscription
  void _toggleInscription() {
    final c = widget.covoiturage;
    setState(() {
      if (_inscrit) {
        c.passagers.remove(utilisateurActuel);
        _placesReservees = 1;
      } else if (c.placesDisponibles >= _placesReservees) {
        c.passagers[utilisateurActuel] = _placesReservees;
      }
    });
    widget.onChange();
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.covoiturage;

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 7),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xCC252525), Color(0xFF303030)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(25),
      ),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // PARTIE GAUCHE : INFORMATIONS
            Expanded(
              flex: 5,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // DATE ET PLACES DISPONIBLES
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          c.dateFormatee,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 5),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 9,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          // Fond bleu transparent
                          color: bleu.withValues(alpha: 0.25),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          c.placesDisponibles > 1
                              ? '${c.placesDisponibles} places'
                              : '${c.placesDisponibles} place',
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: bleu,
                          ),
                        ),
                      ),
                    ],
                  ),

                  // NOM DE L'ÉVÈNEMENT LIÉ
                  const SizedBox(height: 6),
                  Text(
                    c.evenement.nom,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 12,
                      color: jaune,
                    ),
                  ),

                  const SizedBox(height: 10),

                  // CONDUCTEUR
                  Text.rich(
                    TextSpan(
                      children: [
                        const TextSpan(text: 'Conducteur : '),
                        TextSpan(
                          text: c.conducteur,
                          style: const TextStyle(fontStyle: FontStyle.italic),
                        ),
                      ],
                    ),
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 15,
                      color: Colors.white,
                    ),
                  ),

                  const SizedBox(height: 5),

                  // COMPTEUR DE PLACES
                  Row(
                    children: [
                      const Flexible(
                        child: Text(
                          'Je réserve pour :',
                          maxLines: 1,
                          softWrap: false,
                          overflow: TextOverflow.clip,
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 11,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 2),

                      // BOUTON MOINS (désactivé une fois inscrit)
                      SizedBox(
                        width: 15,
                        height: 15,
                        child: IconButton(
                          // Grisé si inscrit ou si on est au minimum (1 place)
                          onPressed: (_inscrit || _placesReservees <= 1)
                              ? null
                              : () {
                                  setState(() {
                                    _boutonSelectionne = 0;
                                    _placesReservees--;
                                  });
                                },
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints.tightFor(
                            width: 20,
                            height: 22,
                          ),
                          visualDensity: VisualDensity.compact,
                          icon: Icon(
                            Icons.remove,
                            size: 13,
                            color: (_inscrit || _placesReservees <= 1)
                                ? Colors.white38
                                : Colors.white,
                          ),
                          style: IconButton.styleFrom(
                            backgroundColor: _boutonSelectionne == 0
                                ? bleu
                                : grisBouton,
                            disabledBackgroundColor: grisBouton.withValues(
                              alpha: 0.4,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(5),
                            ),
                          ),
                        ),
                      ),

                      // NOMBRE DE PLACES
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 3),
                        child: Text(
                          '$_placesReservees',
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 11,
                            color: Colors.white,
                          ),
                        ),
                      ),

                      // BOUTON PLUS (désactivé une fois inscrit)
                      SizedBox(
                        width: 15,
                        height: 15,
                        child: IconButton(
                          // Grisé si inscrit ou si on est au maximum
                          // (places disponibles)
                          onPressed:
                              (_inscrit ||
                                  _placesReservees >= c.placesDisponibles)
                              ? null
                              : () {
                                  setState(() {
                                    _boutonSelectionne = 1;
                                    _placesReservees++;
                                  });
                                },
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints.tightFor(
                            width: 20,
                            height: 22,
                          ),
                          visualDensity: VisualDensity.compact,
                          icon: Icon(
                            Icons.add,
                            size: 13,
                            color:
                                (_inscrit ||
                                    _placesReservees >= c.placesDisponibles)
                                ? Colors.white38
                                : Colors.white,
                          ),
                          style: IconButton.styleFrom(
                            backgroundColor: _boutonSelectionne == 1
                                ? bleu
                                : grisBouton,
                            disabledBackgroundColor: grisBouton.withValues(
                              alpha: 0.4,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(5),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),

                  // COÛT
                  Text(
                    'Coût : ${c.coutParPersonne.toStringAsFixed(2)} € / personne',
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 11,
                      color: Colors.white70,
                    ),
                  ),
                  Text(
                    'Total à rembourser : '
                    '${(c.coutParPersonne * _placesReservees).toStringAsFixed(2)} €',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: jaune,
                    ),
                  ),

                  const SizedBox(height: 6),

                  // PHRASE D'ENGAGEMENT
                  const Text(
                    'En validant le covoiturage, je m’engage à '
                    'rembourser au conducteur le montant correspondant '
                    'aux réservations que j’ai effectuées.',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 8,
                      fontStyle: FontStyle.italic,
                      color: Colors.white,
                    ),
                  ),

                  const SizedBox(height: 15),
                  // BOUTON S'INSCRIRE / ANNULER / COMPLET
                  Align(
                    alignment: Alignment.centerRight,
                    child: SizedBox(
                      width: 70,
                      height: 20,
                      child: OutlinedButton(
                        onPressed: (!_inscrit && c.placesDisponibles == 0)
                            ? null
                            : _toggleInscription,
                        style: OutlinedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          foregroundColor: _inscrit
                              ? Colors.redAccent
                              : Colors.white,
                          side: BorderSide(
                            color: _inscrit ? Colors.redAccent : Colors.white,
                            width: 1,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: EdgeInsets.zero,
                        ),
                        child: Text(
                          _inscrit
                              ? 'ANNULER'
                              : (c.placesDisponibles == 0
                                    ? 'COMPLET'
                                    : 'S’INSCRIRE'),
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // SÉPARATION VERTICALE
            Container(
              width: 1,
              margin: const EdgeInsets.symmetric(horizontal: 10),
              color: const Color(0xFF777777),
            ),

            // PARTIE DROITE : TRAJET
            Expanded(
              flex: 2,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // DÉPART : heure puis lieu (le lieu peut passer sur
                  // plusieurs lignes, plus de "...")
                  Row(
                    children: [
                      Icon(Icons.stop_rounded, color: jaune, size: 10),
                      const SizedBox(width: 3),
                      Text(
                        c.heureDepart,
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 11,
                          color: jaune,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    c.lieuDepart,
                    softWrap: true,
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 12,
                      color: Colors.white,
                    ),
                  ),

                  // LIGNE POINTILLÉE ET FLÈCHE
                  Padding(
                    padding: const EdgeInsets.only(left: 2, top: 6, bottom: 3),
                    child: Column(
                      children: [
                        ...List.generate(
                          9,
                          (index) => Container(
                            width: 5,
                            height: 7,
                            margin: const EdgeInsets.only(bottom: 4),
                            decoration: BoxDecoration(
                              color: jaune,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                        Icon(Icons.arrow_downward, color: jaune, size: 10),
                      ],
                    ),
                  ),

                  // ARRIVÉE : heure puis lieu
                  Text(
                    c.heureArrivee,
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 11,
                      color: jaune,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    c.lieuArrivee,
                    softWrap: true,
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 12,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
