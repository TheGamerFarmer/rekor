import 'package:flutter/material.dart';

import '../layouts/main_layout.dart';
import '../../convoiturage.dart';
import '../../covoiturage_card.dart';
import 'cout_page.dart';
import 'creationconvoiturage.dart';

// Les trois onglets de la page
enum _Onglet { tout, mes, couts }

class CovoituragePage extends StatefulWidget {
  const CovoituragePage({super.key});

  @override
  State<CovoituragePage> createState() => _CovoituragePageState();
}

class _CovoituragePageState extends State<CovoituragePage> {
  final Color jaune = const Color(0xFFFFDA1A);

  // Onglet sélectionné
  _Onglet _onglet = _Onglet.tout;

  // Liste affichée selon le filtre (onglets TOUT / MES COVOITURAGES)
  List<Covoiturage> get _affiches => _onglet == _Onglet.mes
      ? CovoiturageRepository.liste
            .where(
              (c) =>
                  c.conducteur == utilisateurActuel ||
                  c.estInscrit(utilisateurActuel),
            )
            .toList()
      : CovoiturageRepository.liste;

  // Ouvre la page de création et attend le résultat
  Future<void> _ouvrirCreation() async {
    final Covoiturage? nouveau = await Navigator.push<Covoiturage>(
      context,
      MaterialPageRoute(builder: (context) => const CreationCovoituragePage()),
    );

    // Si l'utilisateur a validé, on ajoute la carte en haut de la liste
    if (nouveau != null) {
      setState(() {
        CovoiturageRepository.liste.insert(0, nouveau);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final affiches = _affiches;

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
                  _boutonNavigation(
                    'TOUT',
                    actif: _onglet == _Onglet.tout,
                    onPressed: () => setState(() => _onglet = _Onglet.tout),
                  ),
                  _boutonNavigation(
                    'MES COVOITURAGES',
                    actif: _onglet == _Onglet.mes,
                    onPressed: () => setState(() => _onglet = _Onglet.mes),
                  ),
                  _boutonNavigation(
                    'MES COÛTS',
                    actif: _onglet == _Onglet.couts,
                    onPressed: () => setState(() => _onglet = _Onglet.couts),
                  ),
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

              // CONTENU SELON L'ONGLET
              if (_onglet == _Onglet.couts)
                MesCoutsView(onChange: () => setState(() {}))
              else if (affiches.isEmpty)
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
                for (final c in affiches)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 15),
                    child: CovoiturageCard(
                      key: ValueKey(c.id),
                      covoiturage: c,
                      onChange: () => setState(() {}),
                    ),
                  ),
              const SizedBox(height: 2000),
            ],
          ),
        ),
      ),
    );
  }

  // Bouton de filtre : le bouton actif est entouré en jaune
  Widget _boutonNavigation(
    String texte, {
    required bool actif,
    required VoidCallback onPressed,
  }) {
    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: actif ? jaune : Colors.white,
        side: BorderSide(color: actif ? jaune : Colors.white, width: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(40)),
      ),
      child: Text(texte, style: const TextStyle(fontFamily: 'Poppins')),
    );
  }
}
