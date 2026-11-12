import 'package:flutter/material.dart';

import 'listevenement.dart';

class EvenementCard extends StatelessWidget {
  final Evenement evenement;

  const EvenementCard({super.key, required this.evenement});

  final Color jaune = const Color(0xFFFFDA1A);

  bool get _estMatch =>
      evenement.type == 'Match amical' || evenement.type == 'Match compétition';

  bool get _aDescription =>
      evenement.type == 'Réunion' || evenement.type == 'Autres';

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF303030).withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white10),
      ),
      child: _estMatch ? _pageMatch() : _pageAutre(),
    );
  }

  // =====================================================
  //                    PAGE MATCH
  // =====================================================
  Widget _pageMatch() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // IMAGE ET INFORMATIONS
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 5,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(22),
                child: Image.asset(
                  'public/img/event.png',
                  height: 160,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      height: 160,
                      color: Colors.black26,
                      child: const Icon(
                        Icons.sports_volleyball,
                        size: 60,
                        color: Colors.white,
                      ),
                    );
                  },
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              flex: 5,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    evenement.nom,
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 10),
                  _information(
                    Icons.calendar_today,
                    evenement.date,
                    '${evenement.heureDebut}-${evenement.heureFin}',
                  ),
                  const SizedBox(height: 12),
                  _information(
                    Icons.location_on,
                    evenement.lieu,
                    evenement.ville,
                  ),
                  const SizedBox(height: 15),
                  const Row(
                    children: [
                      Icon(Icons.groups, color: Colors.blue, size: 18),
                      SizedBox(width: 5),
                      Flexible(
                        child: Text(
                          'Équipes participantes',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    evenement.equipe1,
                    style: const TextStyle(color: Colors.white, fontSize: 10),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    evenement.equipe2,
                    style: const TextStyle(color: Colors.white, fontSize: 10),
                  ),
                ],
              ),
            ),
          ],
        ),

        const SizedBox(height: 22),

        // MATCH
        const Text(
          'Match',
          style: TextStyle(
            fontFamily: 'Poppins',
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 15,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: _equipe(evenement.equipe1)),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text('VS', style: TextStyle(color: jaune, fontSize: 11)),
            ),
            Expanded(child: _equipe(evenement.equipe2)),
          ],
        ),

        const SizedBox(height: 18),

        // JOUEURS ET ARBITRE
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Joueurs',
              style: TextStyle(
                fontFamily: 'Poppins',
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 15,
              ),
            ),
            OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                foregroundColor: jaune,
                side: BorderSide(color: jaune),
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 5,
                ),
                minimumSize: Size.zero,
              ),
              child: const Text('Arbitre', style: TextStyle(fontSize: 11)),
            ),
          ],
        ),
        Text(
          evenement.arbitre,
          style: const TextStyle(color: Colors.white54, fontSize: 10),
        ),

        const SizedBox(height: 10),

        ..._presences(),

        const SizedBox(height: 75),
      ],
    );
  }

  // =====================================================
  //        PAGE ENTRAÎNEMENT / RÉUNION / AUTRES
  // =====================================================
  Widget _pageAutre() {
    final duree = _duree();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // EN-TÊTE : icône + titre
        Row(
          children: [
            Container(
              width: 54,
              height: 54,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.blue.withValues(alpha: 0.15),
                border: Border.all(color: Colors.blue, width: 1.5),
              ),
              child: Icon(_iconeType(), color: Colors.blue, size: 28),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    evenement.type,
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  // Nom uniquement pour "Autres"
                  if (evenement.type == 'Autres')
                    Text(
                      evenement.nom,
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 13,
                        color: jaune,
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),

        const SizedBox(height: 18),
        const Divider(color: Color(0xFF444444), height: 1),
        const SizedBox(height: 18),

        // INFOS EN LIGNES PLEINE LARGEUR
        _ligneInfo(Icons.calendar_today, evenement.date),
        const SizedBox(height: 14),
        _ligneInfo(
          Icons.access_time,
          '${evenement.heureDebut} - ${evenement.heureFin}'
          '${duree.isEmpty ? '' : '  ($duree)'}',
        ),
        const SizedBox(height: 14),
        _ligneInfo(
          Icons.location_on,
          evenement.ville.isEmpty
              ? evenement.lieu
              : '${evenement.lieu}\n${evenement.ville}',
        ),

        // DESCRIPTION (Réunion et Autres)
        if (_aDescription) ...[
          const SizedBox(height: 18),
          const Divider(color: Color(0xFF444444), height: 1),
          const SizedBox(height: 18),
          const Text(
            'Description',
            style: TextStyle(
              fontFamily: 'Poppins',
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            evenement.description,
            style: const TextStyle(
              fontFamily: 'Poppins',
              color: Colors.white70,
              fontSize: 12,
            ),
          ),
        ],

        const SizedBox(height: 18),
        const Divider(color: Color(0xFF444444), height: 1),
        const SizedBox(height: 18),

        // PARTICIPANTS
        const Text(
          'Participants',
          style: TextStyle(
            fontFamily: 'Poppins',
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 15,
          ),
        ),
        const SizedBox(height: 10),

        ..._presences(),

        const SizedBox(height: 75),
      ],
    );
  }

  // =====================================================
  //                    OUTILS
  // =====================================================

  // Présents + absents (commun à toutes les pages)
  List<Widget> _presences() {
    return [
      Text(
        'Présents (${evenement.presents.length})',
        style: const TextStyle(color: Colors.greenAccent, fontSize: 10),
      ),
      const SizedBox(height: 12),
      Wrap(
        spacing: 5,
        runSpacing: 18,
        children: evenement.presents.map((nom) => _joueur(nom)).toList(),
      ),
      const SizedBox(height: 25),
      Text(
        'Absents (${evenement.absents.length})',
        style: const TextStyle(color: Colors.redAccent, fontSize: 10),
      ),
      const SizedBox(height: 12),
      Wrap(
        spacing: 5,
        runSpacing: 18,
        children: evenement.absents.map((nom) => _joueur(nom)).toList(),
      ),
    ];
  }

  // Barre verte / rouge : participation d'un coup d'œil
  /*Widget _barreParticipation() {
    final p = evenement.presents.length;
    final a = evenement.absents.length;

    if (p + a == 0) {
      return const Text(
        'Aucune réponse pour le moment.',
        style: TextStyle(color: Colors.white54, fontSize: 11),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: SizedBox(
            height: 7,
            child: Row(
              children: [
                if (p > 0)
                  Expanded(
                    flex: p,
                    child: Container(color: Colors.greenAccent),
                  ),
                if (a > 0)
                  Expanded(
                    flex: a,
                    child: Container(color: Colors.redAccent),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          '$p présent${p > 1 ? 's' : ''} / $a absent${a > 1 ? 's' : ''}',
          style: const TextStyle(color: Colors.white70, fontSize: 11),
        ),
      ],
    );
  }*/

  // Une ligne d'info : icône + texte
  Widget _ligneInfo(IconData icone, String texte) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icone, color: jaune, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            texte,
            style: const TextStyle(
              fontFamily: 'Poppins',
              color: Colors.white,
              fontSize: 13,
            ),
          ),
        ),
      ],
    );
  }

  // Durée calculée à partir des heures ("2h", "1h30", "45 min")
  String _duree() {
    try {
      final d = evenement.heureDebut.split(':');
      final f = evenement.heureFin.split(':');
      final debut = int.parse(d[0]) * 60 + int.parse(d[1]);
      final fin = int.parse(f[0]) * 60 + int.parse(f[1]);
      final diff = fin - debut;
      if (diff <= 0) return '';
      final h = diff ~/ 60;
      final m = diff % 60;
      if (h == 0) return '$m min';
      if (m == 0) return '${h}h';
      return '${h}h${m.toString().padLeft(2, '0')}';
    } catch (_) {
      return '';
    }
  }

  // Même icône que sur la carte de la liste
  IconData _iconeType() {
    switch (evenement.type) {
      case 'Entraînement':
        return Icons.fitness_center;
      case 'Réunion':
        return Icons.groups;
      default:
        return Icons.event;
    }
  }

  // INFORMATIONS DATE ET LIEU (pages match)
  Widget _information(IconData icon, String titre, String sousTitre) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: Colors.white, size: 20),
        const SizedBox(width: 5),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                titre,
                style: const TextStyle(color: Colors.white, fontSize: 9),
              ),
              const SizedBox(height: 3),
              Text(
                sousTitre,
                style: const TextStyle(color: Colors.white54, fontSize: 9),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ÉQUIPES
  Widget _equipe(String nom) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 5),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.white70, width: 1.5),
        borderRadius: BorderRadius.circular(7),
      ),
      child: Text(
        nom,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(color: Colors.white, fontSize: 9),
      ),
    );
  }

  // JOUEURS
  Widget _joueur(String nom) {
    return SizedBox(
      width: 98,
      child: Row(
        children: [
          const CircleAvatar(
            radius: 12,
            backgroundColor: Colors.white24,
            child: Icon(Icons.person, color: Colors.white, size: 15),
          ),
          const SizedBox(width: 4),
          Expanded(
            child: Text(
              nom,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white, fontSize: 9),
            ),
          ),
        ],
      ),
    );
  }
}
