import 'package:flutter/material.dart';

import '../../listevenement.dart';
import '../../evenement_card.dart';
import '../layouts/main_layout.dart';

class EvenementDetailPage extends StatelessWidget {
  final Evenement evenement;

  const EvenementDetailPage({super.key, required this.evenement});

  @override
  Widget build(BuildContext context) {
    return MainLayout(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 40, 20, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 130),

              // FLÈCHE RETOUR + TITRE
              Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white),
                      ),
                      child: const Icon(
                        Icons.arrow_back,
                        color: Color(0xFFFFDA1A),
                        size: 20,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'ÉVÈNEMENTS',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFFFDA1A),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 5),

              Text(
                '${evenement.type} : détails',
                style: const TextStyle(
                  color: Colors.white,
                  fontStyle: FontStyle.italic,
                ),
              ),

              const SizedBox(height: 25),

              EvenementCard(evenement: evenement),
            ],
          ),
        ),
      ),
    );
  }
}
