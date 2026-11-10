import 'package:flutter/material.dart';

import 'listevenement.dart';

class EvenementListeCard extends StatelessWidget {
  final Evenement evenement;
  final VoidCallback onTap;

  const EvenementListeCard({
    super.key,
    required this.evenement,
    required this.onTap,
  });

  final Color jaune = const Color(0xFFFFDA1A);

  bool get _estMatch =>
      evenement.type == 'Match amical' || evenement.type == 'Match compétition';

  bool get _estReunionOuAutres =>
      evenement.type == 'Réunion' || evenement.type == 'Autres';

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 15),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: const Color(0xFF303030).withOpacity(0.9),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Row(
          children: [
            // DATE ET HEURE
            Container(
              width: 65,
              padding: const EdgeInsets.symmetric(vertical: 5),
              decoration: const BoxDecoration(
                border: Border(
                  right: BorderSide(color: Colors.white24, width: 2),
                ),
              ),
              child: Column(
                children: [
                  Text(
                    evenement.date,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 25),
                  Text(
                    evenement.heureDebut,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 12),

            // CONTENU SELON LE TYPE
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // TYPE
                  if (_estMatch)
                    // Matchs : comme avant, en jaune à droite
                    Align(
                      alignment: Alignment.centerRight,
                      child: Text(
                        evenement.type,
                        style: TextStyle(color: jaune, fontSize: 12),
                      ),
                    )
                  else
                    // Entraînement, Réunion, Autres : type en blanc + icône bleue à droite
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            evenement.type,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                        Icon(_iconeType(), color: Colors.blue, size: 20),
                      ],
                    ),

                  const SizedBox(height: 10),

                  if (_estMatch) ..._contenuMatch(),
                  if (_estReunionOuAutres) ..._contenuReunionAutres(),

                  const SizedBox(height: 15),

                  // LIEU (commun à tous les types)
                  _lieu(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ICÔNE SELON LE TYPE
  IconData _iconeType() {
    switch (evenement.type) {
      case 'Entraînement':
        return Icons.fitness_center;
      case 'Réunion':
        return Icons.groups;
      default: // Autres
        return Icons.event;
    }
  }

  // MATCH : équipe 1 / équipe 2
  List<Widget> _contenuMatch() {
    return [
      Text(
        evenement.equipe1,
        style: const TextStyle(color: Colors.white, fontSize: 16),
      ),
      const SizedBox(height: 15),
      Text(
        evenement.equipe2,
        style: const TextStyle(color: Colors.white, fontSize: 16),
      ),
    ];
  }

  // RÉUNION / AUTRES : nom (pour "Autres") + description
  List<Widget> _contenuReunionAutres() {
    return [
      if (evenement.type == 'Autres')
        Text(
          evenement.nom,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      if (evenement.type == 'Autres') const SizedBox(height: 6),
      Text(
        evenement.description,
        maxLines: 3,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(color: Colors.white70, fontSize: 12),
      ),
    ];
  }

  // LIEU + VILLE
  Widget _lieu() {
    final texte = evenement.ville.isEmpty
        ? evenement.lieu
        : '${evenement.lieu}, ${evenement.ville}';

    return Row(
      children: [
        const Icon(Icons.location_on, color: Colors.blue, size: 15),
        Expanded(
          child: Text(
            texte,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white70, fontSize: 10),
          ),
        ),
      ],
    );
  }
}
