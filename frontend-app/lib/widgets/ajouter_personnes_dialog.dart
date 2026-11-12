import 'package:flutter/material.dart';

import '../models/utilisateur.dart';

// Popup pour choisir des personnes à ajouter à un groupe existant
class AjouterPersonnesDialog extends StatefulWidget {
  const AjouterPersonnesDialog({super.key, required this.candidats});

  // Les personnes qui ne sont pas encore dans le groupe
  final List<Utilisateur> candidats;

  @override
  State<AjouterPersonnesDialog> createState() => _AjouterPersonnesDialogState();
}

class _AjouterPersonnesDialogState extends State<AjouterPersonnesDialog> {
  static const _jaune = Color(0xFFFFD60A);

  // ids des personnes cochées
  final Set<int> _selection = {};
  String _recherche = '';

  @override
  Widget build(BuildContext context) {
    // personnes dont le nom contient le texte recherché
    final filtres = widget.candidats
        .where(
          (u) => u.nomComplet.toLowerCase().contains(_recherche.toLowerCase()),
        )
        .toList();

    // Message affiché quand la liste est vide
    final messageVide = widget.candidats.isEmpty
        ? 'Tout le monde est déjà dans le groupe'
        : 'Aucune personne trouvée';

    return Dialog(
      backgroundColor: const Color(0xFF1C1C1E),
      insetPadding: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 500),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Titre + croix de fermeture
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Ajouter des personnes',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Recherche
              TextField(
                style: const TextStyle(color: Colors.white),
                cursorColor: Colors.white,
                onChanged: (texte) => setState(() => _recherche = texte),
                decoration: InputDecoration(
                  hintText: 'Chercher une personne...',
                  hintStyle: const TextStyle(color: Colors.white54),
                  prefixIcon: const Icon(Icons.search, color: Colors.white54),
                  filled: true,
                  fillColor: Colors.white10,
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: Colors.white24),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: Colors.white54),
                  ),
                ),
              ),
              const SizedBox(height: 8),

              // Liste à cocher : prend toute la place restante
              Expanded(
                child: filtres.isEmpty
                    ? Center(
                        child: Text(
                          messageVide,
                          style: const TextStyle(color: Colors.white54),
                        ),
                      )
                    : ListView(
                        children: [
                          for (final u in filtres)
                            CheckboxListTile(
                              value: _selection.contains(u.id),
                              onChanged: (coche) => setState(() {
                                if (coche == true) {
                                  _selection.add(u.id);
                                } else {
                                  _selection.remove(u.id);
                                }
                              }),
                              title: Text(
                                u.nomComplet,
                                style: const TextStyle(color: Colors.white),
                              ),
                              activeColor: _jaune,
                              checkColor: Colors.black,
                              side: const BorderSide(color: Colors.white54),
                              controlAffinity: ListTileControlAffinity.leading,
                              contentPadding: EdgeInsets.zero,
                            ),
                        ],
                      ),
              ),
              const SizedBox(height: 12),

              // Bouton de validation : renvoie les ids cochés
              FilledButton(
                onPressed: _selection.isEmpty
                    ? null
                    : () => Navigator.pop(context, _selection),
                style: FilledButton.styleFrom(
                  backgroundColor: _jaune,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: Text(
                  'Ajouter (${_selection.length})',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
