import 'package:flutter/material.dart';

import '../layouts/main_layout.dart';
import '../../convoiturage.dart';
import '../../covoiturage_card.dart';
import 'creationconvoiturage.dart';

class CovoituragePage extends StatefulWidget {
  const CovoituragePage({super.key});

  @override
  State<CovoituragePage> createState() => _CovoituragePageState();
}

class _CovoituragePageState extends State<CovoituragePage> {
  final Color jaune = const Color(0xFFFFDA1A);

  // La liste des covoiturages affichés sur la page
  final List<Covoiturage> _covoiturages = [];

  // Ouvre la page de création et attend le résultat
  Future<void> _ouvrirCreation() async {
    final Covoiturage? nouveau = await Navigator.push<Covoiturage>(
      context,
      MaterialPageRoute(builder: (context) => const CreationCovoituragePage()),
    );

    // Si l'utilisateur a validé, on ajoute la carte en haut de la liste
    if (nouveau != null) {
      setState(() {
        _covoiturages.insert(0, nouveau);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainLayout(
      child: SingleChildScrollView(
        child: Padding(
          // gauche, haut, droite, bas
          padding: const EdgeInsets.fromLTRB(20, 40, 20, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // TITRE
              SizedBox(height: 130),
              Text(
                'COVOITURAGE',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: jaune,
                ),
              ),

              const SizedBox(height: 25),

              // BOUTONS DE NAVIGATION
              Wrap(
                spacing: 10,
                runSpacing: 10,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  _boutonNavigation('TOUT'),
                  _boutonNavigation('MES COVOITURAGES'),
                  OutlinedButton(
                    onPressed: _ouvrirCreation,
                    style: OutlinedButton.styleFrom(
                      backgroundColor: const Color(0xFF333333),
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white, width: 2),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(40),
                      ),
                      padding: const EdgeInsets.all(10),
                      minimumSize: const Size(45, 45),
                    ),
                    child: const Icon(Icons.add, color: Colors.white, size: 24),
                  ),
                ],
              ),

              const SizedBox(height: 25),

              // LISTE DES CARTES
              if (_covoiturages.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 7),
                  child: Text(
                    'Aucun covoiturage pour le moment.\n'
                    'Appuie sur + pour en créer un.',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 13,
                      color: Colors.white70,
                    ),
                  ),
                )
              else
                for (final c in _covoiturages)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 15),
                    child: CovoiturageCard(covoiturage: c),
                  ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _boutonNavigation(String texte) {
    return OutlinedButton(
      onPressed: () {},
      style: OutlinedButton.styleFrom(
        foregroundColor: Colors.white,
        side: const BorderSide(color: Colors.white, width: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(40)),
      ),
      child: Text(texte, style: const TextStyle(fontFamily: 'Poppins')),
    );
  }
}
