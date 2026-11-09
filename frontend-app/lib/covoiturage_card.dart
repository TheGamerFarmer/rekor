import 'package:flutter/material.dart';

import 'convoiturage.dart';

// Une carte = un covoiturage.
// C'est ta carte d'origine, mais les textes viennent de l'objet "covoiturage".
class CovoiturageCard extends StatefulWidget {
  final Covoiturage covoiturage;

  const CovoiturageCard({super.key, required this.covoiturage});

  @override
  State<CovoiturageCard> createState() => _CovoiturageCardState();
}

class _CovoiturageCardState extends State<CovoiturageCard> {
  int _placesReservees = 1;
  int? _boutonSelectionne;

  final Color jaune = const Color(0xFFFFDA1A);
  final Color bleu = const Color(0xFF2864D7);
  final Color grisBouton = const Color(0xFFCCCCCC);

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
                          color: const Color(0xFF494000),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          c.placesDisponibles > 1
                              ? '${c.placesDisponibles} places'
                              : '${c.placesDisponibles} place',
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 10,
                            color: Color(0xFFFFDA1A),
                          ),
                        ),
                      ),
                    ],
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

                      // BOUTON MOINS
                      SizedBox(
                        width: 15,
                        height: 15,
                        child: IconButton(
                          onPressed: () {
                            setState(() {
                              _boutonSelectionne = 0;
                              if (_placesReservees > 1) {
                                _placesReservees--;
                              }
                            });
                          },
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints.tightFor(
                            width: 20,
                            height: 22,
                          ),
                          visualDensity: VisualDensity.compact,
                          icon: const Icon(
                            Icons.remove,
                            size: 13,
                            color: Colors.white,
                          ),
                          style: IconButton.styleFrom(
                            backgroundColor: _boutonSelectionne == 0
                                ? bleu
                                : grisBouton,
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

                      // BOUTON PLUS
                      SizedBox(
                        width: 15,
                        height: 15,
                        child: IconButton(
                          onPressed: () {
                            setState(() {
                              _boutonSelectionne = 1;
                              // On ne dépasse pas les places disponibles
                              if (_placesReservees < c.placesDisponibles) {
                                _placesReservees++;
                              }
                            });
                          },
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints.tightFor(
                            width: 20,
                            height: 22,
                          ),
                          visualDensity: VisualDensity.compact,
                          icon: const Icon(
                            Icons.add,
                            size: 13,
                            color: Colors.white,
                          ),
                          style: IconButton.styleFrom(
                            backgroundColor: _boutonSelectionne == 1
                                ? bleu
                                : grisBouton,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(5),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

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

                  // BOUTON VALIDER
                  Align(
                    alignment: Alignment.centerRight,
                    child: SizedBox(
                      width: 80,
                      height: 35,
                      child: OutlinedButton(
                        onPressed: () {},
                        style: OutlinedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Colors.white, width: 1),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: EdgeInsets.zero,
                        ),
                        child: const Text(
                          'VALIDER',
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 10,
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
                children: [
                  // DÉPART
                  Row(
                    children: [
                      Text(
                        c.heureDepart,
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 10,
                          color: jaune,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(Icons.stop_rounded, color: jaune, size: 10),
                      const SizedBox(width: 3),
                      Expanded(
                        child: Text(
                          c.lieuDepart,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 12,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),

                  // LIGNE POINTILLÉE ET FLÈCHE
                  Padding(
                    padding: const EdgeInsets.only(left: 30, top: 3, bottom: 3),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Column(
                        children: [
                          ...List.generate(
                            10,
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
                  ),

                  // ARRIVÉE
                  Row(
                    children: [
                      Text(
                        c.heureArrivee,
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 12,
                          color: jaune,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          c.lieuArrivee,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 12,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
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
