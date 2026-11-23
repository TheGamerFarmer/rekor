import 'package:flutter/material.dart';

import '../../convoiturage.dart';

// Contenu de l'onglet "MES COÛTS" :
//  - Ce que je dois (je suis passager) -> bouton "J'AI PAYÉ"
//  - Ce qu'on me doit (je suis conducteur) -> bouton "VALIDER"
class MesCoutsView extends StatelessWidget {
  // Appelé après une action pour rafraîchir la page parente
  final VoidCallback onChange;

  const MesCoutsView({super.key, required this.onChange});

  static const Color jaune = Color(0xFFFFDA1A);
  static const Color bleu = Color(0xFF2864D7);

  @override
  Widget build(BuildContext context) {
    // Covoiturages où je suis passager (je dois de l'argent au conducteur)
    final dettes = CovoiturageRepository.liste
        .where(
          (c) =>
              c.conducteur != utilisateurActuel &&
              c.estInscrit(utilisateurActuel),
        )
        .toList();

    // Covoiturages où je suis conducteur et où il y a des passagers
    final creances = CovoiturageRepository.liste
        .where(
          (c) => c.conducteur == utilisateurActuel && c.passagers.isNotEmpty,
        )
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ---------- CE QUE JE DOIS ----------
        _titreSection('Ce que je dois'),
        if (dettes.isEmpty)
          _vide('Tu ne dois rien pour le moment.')
        else ...[
          _total('Total à rembourser', _totalDu(dettes)),
          const SizedBox(height: 12),
          for (final c in dettes) _carteDette(context, c),
        ],

        const SizedBox(height: 20),

        // ---------- CE QU'ON ME DOIT ----------
        _titreSection('Ce qu’on me doit'),
        if (creances.isEmpty)
          _vide('Personne ne te doit d’argent pour le moment.')
        else ...[
          _total('Total à recevoir', _totalAttendu(creances)),
          const SizedBox(height: 12),
          for (final c in creances) _carteCreance(context, c),
        ],
      ],
    );
  }

  // ---------- CALCULS ----------

  // Ce que je dois encore (paiements non validés)
  double _totalDu(List<Covoiturage> dettes) {
    double total = 0;
    for (final c in dettes) {
      if (c.statutPaiement(utilisateurActuel) != StatutPaiement.valide) {
        total += c.montantDe(utilisateurActuel);
      }
    }
    return total;
  }

  // Ce qu'on me doit encore (paiements non validés)
  double _totalAttendu(List<Covoiturage> creances) {
    double total = 0;
    for (final c in creances) {
      for (final passager in c.passagers.keys) {
        if (c.statutPaiement(passager) != StatutPaiement.valide) {
          total += c.montantDe(passager);
        }
      }
    }
    return total;
  }

  String _euros(double v) => '${v.toStringAsFixed(2)} €';

  String _placesTexte(int n) => '$n place${n > 1 ? 's' : ''}';

  // ---------- CARTE : CE QUE JE DOIS ----------

  Widget _carteDette(BuildContext context, Covoiturage c) {
    final statut = c.statutPaiement(utilisateurActuel);
    final places = c.passagers[utilisateurActuel] ?? 0;
    final montant = c.montantDe(utilisateurActuel);

    String labelBadge;
    Color couleurBadge;
    if (statut == StatutPaiement.aPayer) {
      labelBadge = 'À PAYER';
      couleurBadge = jaune;
    } else if (statut == StatutPaiement.enAttente) {
      labelBadge = 'EN ATTENTE';
      couleurBadge = bleu;
    } else {
      labelBadge = 'PAYÉ';
      couleurBadge = Colors.greenAccent;
    }

    return _carte(
      children: [
        // À qui je dois + statut
        Row(
          children: [
            Expanded(
              child: Text(
                'À ${c.conducteur}',
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
            _badge(labelBadge, couleurBadge),
          ],
        ),
        const SizedBox(height: 6),
        _infosTrajet(c),
        const SizedBox(height: 10),

        // Montant + bouton
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${_placesTexte(places)} × ${_euros(c.coutParPersonne)}',
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 11,
                      color: Colors.white70,
                    ),
                  ),
                  Text(
                    _euros(montant),
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: jaune,
                    ),
                  ),
                ],
              ),
            ),
            if (statut == StatutPaiement.aPayer)
              _bouton(
                'J’AI PAYÉ',
                () => _confirmer(
                  context,
                  titre: 'Confirmer le virement',
                  message:
                      'Confirmes-tu avoir envoyé ${_euros(montant)} à ${c.conducteur} ?',
                  onConfirm: () {
                    c.declarerPaiement(utilisateurActuel);
                    onChange();
                  },
                ),
              ),
          ],
        ),

        if (statut == StatutPaiement.enAttente)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              'En attente de la validation de ${c.conducteur}.',
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 10,
                fontStyle: FontStyle.italic,
                color: Colors.white54,
              ),
            ),
          ),
      ],
    );
  }

  // ---------- CARTE : CE QU'ON ME DOIT ----------

  Widget _carteCreance(BuildContext context, Covoiturage c) {
    return _carte(
      children: [
        _infosTrajet(c),
        const SizedBox(height: 8),
        const Divider(color: Color(0xFF444444), height: 1),
        for (final passager in c.passagers.keys)
          _ligneCreance(context, c, passager),
      ],
    );
  }

  Widget _ligneCreance(BuildContext context, Covoiturage c, String passager) {
    final statut = c.statutPaiement(passager);
    final places = c.passagers[passager] ?? 0;
    final montant = c.montantDe(passager);

    String labelBadge;
    Color couleurBadge;
    if (statut == StatutPaiement.aPayer) {
      labelBadge = 'NON PAYÉ';
      couleurBadge = Colors.redAccent;
    } else if (statut == StatutPaiement.enAttente) {
      labelBadge = 'À VALIDER';
      couleurBadge = jaune;
    } else {
      labelBadge = 'PAYÉ';
      couleurBadge = Colors.greenAccent;
    }

    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  passager,
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  '${_placesTexte(places)} • ${_euros(montant)}',
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(height: 5),
                _badge(labelBadge, couleurBadge),
              ],
            ),
          ),
          // Le bouton n'apparaît que si le passager a annoncé son virement
          if (statut == StatutPaiement.enAttente)
            _bouton(
              'VALIDER',
              () => _confirmer(
                context,
                titre: 'Valider le paiement',
                message:
                    'Confirmes-tu avoir reçu ${_euros(montant)} de $passager ?',
                onConfirm: () {
                  c.validerPaiement(passager);
                  onChange();
                },
              ),
            ),
        ],
      ),
    );
  }

  // ---------- WIDGETS RÉUTILISABLES ----------

  // Titre de section (même style que "Créer un covoiturage")
  Widget _titreSection(String texte) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          texte,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: jaune,
          ),
        ),
        const Divider(color: Color(0xFF444444), height: 12),
        const SizedBox(height: 6),
      ],
    );
  }

  Widget _vide(String texte) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 7),
      child: Text(
        texte,
        style: const TextStyle(
          fontFamily: 'Poppins',
          fontSize: 13,
          color: Colors.white70,
        ),
      ),
    );
  }

  Widget _total(String label, double montant) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 7),
      child: Text.rich(
        TextSpan(
          children: [
            TextSpan(text: '$label : '),
            TextSpan(
              text: _euros(montant),
              style: const TextStyle(fontWeight: FontWeight.bold, color: jaune),
            ),
          ],
        ),
        style: const TextStyle(
          fontFamily: 'Poppins',
          fontSize: 13,
          color: Colors.white,
        ),
      ),
    );
  }

  // Même fond que la carte covoiturage
  Widget _carte({required List<Widget> children}) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(7, 0, 7, 15),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xCC252525), Color(0xFF303030)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(25),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
      ),
    );
  }

  // Évènement, date et trajet
  Widget _infosTrajet(Covoiturage c) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          c.evenement.nom,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 12,
            color: jaune,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          '${c.dateFormatee} • ${c.lieuDepart} → ${c.lieuArrivee}',
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 11,
            color: Colors.white70,
          ),
        ),
      ],
    );
  }

  // Petit badge de statut (même style que le badge des places)
  Widget _badge(String texte, Color couleur) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
      decoration: BoxDecoration(
        color: couleur.withValues(alpha: 0.25),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        texte,
        style: TextStyle(
          fontFamily: 'Poppins',
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: couleur,
        ),
      ),
    );
  }

  Widget _bouton(String texte, VoidCallback onPressed) {
    return SizedBox(
      height: 26,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: Colors.white,
          side: const BorderSide(color: Colors.white, width: 1),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12),
        ),
        child: Text(
          texte,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 9,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  // Fenêtre de confirmation avant de valider (évite les clics par erreur)
  Future<void> _confirmer(
    BuildContext context, {
    required String titre,
    required String message,
    required VoidCallback onConfirm,
  }) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          titre,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: jaune,
          ),
        ),
        content: Text(
          message,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 13,
            color: Colors.white,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text(
              'NON',
              style: TextStyle(fontFamily: 'Poppins', color: Colors.white70),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text(
              'OUI',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.bold,
                color: jaune,
              ),
            ),
          ),
        ],
      ),
    );

    if (ok == true) onConfirm();
  }
}
