// À placer dans lib/mobile_pages/gestion_page.dart (remplace l'ancien)
import 'package:flutter/material.dart';

import '../layouts/main_layout.dart';
import '../models/equipe.dart';
import '../models/fiche_presence.dart';
import '../models/utilisateur.dart';
import '../widgets/equipe_form_dialog.dart';
import 'fiche_presence_page.dart';

class GestionPage extends StatefulWidget {
  const GestionPage({super.key});

  @override
  State<GestionPage> createState() => _GestionPageState();
}

class _GestionPageState extends State<GestionPage> {
  static const _jaune = Color(0xFFFFD60A);

  // Plus tard : table User (idéalement à partager avec GroupesPage)
  final List<Utilisateur> _utilisateurs = const [
    Utilisateur(id: 1, prenom: 'Lucie', nom: 'Loury'),
    Utilisateur(id: 2, prenom: 'Guillaume', nom: 'Morel'),
    Utilisateur(id: 3, prenom: 'Camille', nom: 'Chapuis'),
    Utilisateur(id: 4, prenom: 'Thibault', nom: 'Verron'),
    Utilisateur(id: 5, prenom: 'Sarah', nom: 'Bernard'),
    Utilisateur(id: 6, prenom: 'Hugo', nom: 'Martin'),
    Utilisateur(id: 7, prenom: 'Emma', nom: 'Petit'),
  ];

  // Plus tard : chargé depuis l'API
  final List<Equipe> _equipes = [
    const Equipe(
      id: 1,
      nom: 'Equipe 1',
      capitaineId: 1,
      membres: {
        1: Poste.pointu,
        2: Poste.passeur,
        3: Poste.central,
        4: Poste.libero,
      },
    ),
  ];

  final List<FichePresence> _fiches = [
    FichePresence(
      id: 1,
      equipeId: 1,
      date: DateTime(2026, 11, 19),
      presences: const {1: true, 2: true, 3: false, 4: true},
    ),
  ];

  Utilisateur? _utilisateur(int id) {
    for (final u in _utilisateurs) {
      if (u.id == id) return u;
    }
    return null;
  }

  Future<void> _creerEquipe() async {
    final equipe = await showDialog<Equipe>(
      context: context,
      builder: (_) => EquipeFormDialog(utilisateurs: _utilisateurs),
    );
    if (equipe == null || !mounted) return;
    // TODO : envoyer à l'API (équipe + appartient + capitaine)
    setState(() => _equipes.add(equipe));
  }

  Future<void> _modifierEquipe(Equipe equipe) async {
    final modifiee = await showDialog<Equipe>(
      context: context,
      builder: (_) =>
          EquipeFormDialog(utilisateurs: _utilisateurs, equipe: equipe),
    );
    if (modifiee == null || !mounted) return;
    // TODO : PUT à l'API
    setState(() {
      _equipes[_equipes.indexWhere((e) => e.id == equipe.id)] = modifiee;
    });
  }

  void _ouvrirFiche(Equipe equipe) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => FichePresencePage(
          equipe: equipe,
          utilisateurs: _utilisateurs,
          fiches: _fiches.where((f) => f.equipeId == equipe.id).toList(),
          onFicheAjoutee: (f) {
            // TODO : API (nouvelle fiche + présences)
            _fiches.add(f);
          },
          onFicheModifiee: (f) {
            // TODO : API (mise à jour des présences)
            _fiches[_fiches.indexWhere((x) => x.id == f.id)] = f;
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MainLayout(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 130, 16, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'GESTION',
              style: TextStyle(
                color: _jaune,
                fontSize: 32,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Expanded(
                  child: Text(
                    'Équipes',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.white10,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white24),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.add, color: Colors.white),
                    onPressed: _creerEquipe,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (_equipes.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Text(
                  'Aucune équipe. Crée-en une avec le bouton +',
                  style: TextStyle(color: Colors.white70),
                ),
              ),
            for (int i = 0; i < _equipes.length; i++) ...[
              if (i > 0) const Divider(color: Colors.white12, height: 1),
              ListTile(
                contentPadding: EdgeInsets.zero,
                onTap: () => _ouvrirFiche(_equipes[i]),
                leading: const CircleAvatar(
                  backgroundColor: Colors.white10,
                  child: Icon(Icons.groups, color: Colors.white),
                ),
                title: Text(
                  _equipes[i].nom,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                subtitle: Text(
                  '${_equipes[i].membres.length} joueurs · capitaine : '
                  '${_utilisateur(_equipes[i].capitaineId)?.nomComplet ?? '-'}',
                  style: const TextStyle(color: Colors.white70),
                ),
                trailing: IconButton(
                  icon: const Icon(Icons.edit, color: Colors.white70),
                  onPressed: () => _modifierEquipe(_equipes[i]),
                ),
              ),
            ],
            const SizedBox(height: 130),
          ],
        ),
      ),
    );
  }
}
