import 'package:flutter/material.dart';

class EvenementCard extends StatefulWidget {
  const EvenementCard({
    super.key,
    required this.titre,
    required this.date,
    required this.horaire,
    required this.lieu,
    required this.couleurFond,
    required this.couleurTexte,
    required this.couleurAccent,
    this.present = false,
  });

  final String titre;
  final String date;
  final String horaire;
  final String lieu;
  final Color couleurFond;
  final Color couleurTexte;

  // Couleur du rond quand on est "présent"
  final Color couleurAccent;

  // État de départ de l'interrupteur
  final bool present;

  @override
  State<EvenementCard> createState() => _EvenementCardState();
}

class _EvenementCardState extends State<EvenementCard> {
  late bool _present = widget.present;

  @override
  Widget build(BuildContext context) {
    final gras = TextStyle(
      color: widget.couleurTexte,
      fontWeight: FontWeight.bold,
    );

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: widget.couleurFond,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(widget.titre, style: gras.copyWith(fontSize: 28)),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // Infos à gauche
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.date, style: gras),
                    Text(widget.horaire, style: gras),
                    const SizedBox(height: 8),

                    //lieu
                    Row(
                      children: [
                        Icon(
                          Icons.location_on,
                          size: 16,
                          color: widget.couleurTexte,
                        ),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            widget.lieu,
                            style: TextStyle(color: widget.couleurTexte),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Statut + interrupteur à droite
              Column(
                children: [
                  Text(
                    _present ? 'PRÉSENT' : 'À CONFIRMER',
                    style: gras.copyWith(fontSize: 12),
                  ),
                  const SizedBox(height: 8),
                  _interrupteur(),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _interrupteur() {
    return GestureDetector(
      onTap: () => setState(() => _present = !_present),
      child: Container(
        width: 100,
        height: 46,
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(23),
        ),
        child: AnimatedAlign(
          duration: const Duration(milliseconds: 200),
          alignment: _present ? Alignment.centerRight : Alignment.centerLeft,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: _present ? widget.couleurAccent : const Color(0xFFC8C8C8),
            ),
          ),
        ),
      ),
    );
  }
}
