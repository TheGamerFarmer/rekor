import 'package:flutter/material.dart';

import '../../listevenement.dart';
import '../../evenement_card.dart';
import '../layouts/main_layout.dart';

class EvenementDetailPage extends StatefulWidget {
  final Evenement evenement;

  final Future<Evenement?> Function(Evenement) onModifier;

  const EvenementDetailPage({
    super.key,
    required this.evenement,
    required this.onModifier,
  });

  @override
  State<EvenementDetailPage> createState() => _EvenementDetailPageState();
}

class _EvenementDetailPageState extends State<EvenementDetailPage> {
  late Evenement _evenement;

  @override
  void initState() {
    super.initState();
    _evenement = widget.evenement;
  }

  Future<void> _modifier() async {
    final modifie = await widget.onModifier(_evenement);
    if (modifie != null) {
      setState(() => _evenement = modifie);
    }
  }

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

              // SOUS-TITRE + BOUTON MODIFIER
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${_evenement.type} : détails',
                    style: const TextStyle(
                      color: Colors.white,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                  SizedBox(
                    height: 30,
                    child: OutlinedButton.icon(
                      onPressed: _modifier,
                      icon: const Icon(
                        Icons.edit,
                        size: 14,
                        color: Color(0xFFFFDA1A),
                      ),
                      label: const Text(
                        'MODIFIER',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white, width: 1),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 25),

              EvenementCard(evenement: _evenement),
            ],
          ),
        ),
      ),
    );
  }
}
