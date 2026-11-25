import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../models/nouveau_groupe.dart';
import '../models/utilisateur.dart';

//le pop up de création de groupe
class CreerGroupeDialog extends StatefulWidget {
  const CreerGroupeDialog({
    super.key,
    required this.utilisateurs,
    required this.groupeExiste,
  });

  // Toutes les personnes que l'on peut ajouter au groupe
  final List<Utilisateur> utilisateurs;

  // Dit si un groupe avec exactement ces personnes existe déjà
  final bool Function(Set<int> ids) groupeExiste;

  @override
  State<CreerGroupeDialog> createState() => _CreerGroupeDialogState();
}

class _CreerGroupeDialogState extends State<CreerGroupeDialog> {
  static const _jaune = Color(0xFFFFD60A);

  //les champs à remplir en tapant
  final _nomCtrl = TextEditingController();
  final _messageCtrl = TextEditingController();

  // ids des personnes cochées
  final Set<int> _selection = {};
  String _recherche = '';

  // photo choisie pour le groupe (null = aucune)
  Uint8List? _image;

  @override
  void dispose() {
    _nomCtrl.dispose();
    _messageCtrl.dispose();
    super.dispose();
  }

  // ouvre la galerie et garde l'image choisie
  Future<void> _choisirImage() async {
    final fichier = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 512,
      imageQuality: 80,
    );

    // null = l'utilisateur a annulé
    if (fichier == null) return;

    final octets = await fichier.readAsBytes();
    if (!mounted) return;
    setState(() => _image = octets);
  }

  // style commun aux champs de texte
  InputDecoration _champ(String hint, {IconData? icone}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.white54),
      prefixIcon: icone == null ? null : Icon(icone, color: Colors.white54),
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
    );
  }

  Future<void> _valider() async {
    // Un groupe avec exactement ces personnes existe déjà : on demande confirmation
    if (widget.groupeExiste(_selection)) {
      final confirme = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: const Color(0xFF1C1C1E),
          title: const Text(
            'Ce groupe existe déjà',
            style: TextStyle(color: Colors.white),
          ),
          content: const Text(
            'Un groupe avec exactement les mêmes personnes existe déjà. '
            'Voulez-vous quand même en créer un nouveau ?',
            style: TextStyle(color: Colors.white70),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              style: TextButton.styleFrom(foregroundColor: Colors.white70),
              child: const Text('Annuler'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(context, true),
              style: FilledButton.styleFrom(
                backgroundColor: _jaune,
                foregroundColor: Colors.black,
              ),
              child: const Text('Créer quand même'),
            ),
          ],
        ),
      );

      // Annuler (ou clic à côté) : on reste dans le formulaire
      if (confirme != true || !mounted) return;
    }

    final message = _messageCtrl.text.trim();
    Navigator.pop(
      context,
      NouveauGroupe(
        nom: _nomCtrl.text.trim(),
        participants: widget.utilisateurs
            .where((u) => _selection.contains(u.id))
            .toList(),
        premierMessage: message.isEmpty ? null : message,
        image: _image,
      ),
    );
  }

  //recherche sur le nom des personnes à ajouter
  @override
  Widget build(BuildContext context) {
    // personnes dont le nom contient le texte recherché
    final filtres = widget.utilisateurs
        .where(
          (u) => u.nomComplet.toLowerCase().contains(_recherche.toLowerCase()),
        )
        .toList();

    // Le bouton n'est actif que si on a un nom et au moins un participant
    final peutCreer = _nomCtrl.text.trim().isNotEmpty && _selection.isNotEmpty;

    // Sert uniquement à afficher l'avertissement (ne bloque rien)
    final existeDeja = _selection.isNotEmpty && widget.groupeExiste(_selection);

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
                      'Nouveau groupe',
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
              const SizedBox(height: 8),

              // Photo du groupe : un clic ouvre la galerie
              Center(
                child: InkWell(
                  customBorder: const CircleBorder(),
                  onTap: _choisirImage,
                  child: Stack(
                    children: [
                      CircleAvatar(
                        radius: 36,
                        backgroundColor: Colors.white24,
                        backgroundImage: _image != null
                            ? MemoryImage(_image!)
                            : null,
                        child: _image == null
                            ? const Icon(
                                Icons.group,
                                color: Colors.white,
                                size: 32,
                              )
                            : null,
                      ),
                      // Petit appareil photo en bas à droite
                      const Positioned(
                        right: 0,
                        bottom: 0,
                        child: CircleAvatar(
                          radius: 12,
                          backgroundColor: _jaune,
                          child: Icon(
                            Icons.camera_alt,
                            size: 14,
                            color: Colors.black,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Nom du groupe
              TextField(
                controller: _nomCtrl,
                style: const TextStyle(color: Colors.white),
                cursorColor: Colors.white,
                onChanged: (_) => setState(() {}),
                decoration: _champ('Nom du groupe'),
              ),
              const SizedBox(height: 20),

              // Participants
              Text(
                'Participants (${_selection.length})',
                style: const TextStyle(
                  color: _jaune,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                style: const TextStyle(color: Colors.white),
                cursorColor: Colors.white,
                onChanged: (texte) => setState(() => _recherche = texte),
                decoration: _champ(
                  'Chercher une personne...',
                  icone: Icons.search,
                ),
              ),
              const SizedBox(height: 8),

              // Liste à cocher : prend toute la place restante
              Expanded(
                child: filtres.isEmpty
                    ? const Center(
                        child: Text(
                          'Aucune personne trouvée',
                          style: TextStyle(color: Colors.white54),
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

              // Avertissement si un groupe identique existe déjà
              if (existeDeja)
                const Padding(
                  padding: EdgeInsets.only(top: 8),
                  child: Text(
                    '⚠ Un groupe avec exactement ces personnes existe déjà',
                    style: TextStyle(color: _jaune, fontSize: 12),
                  ),
                ),
              const SizedBox(height: 12),

              // Premier message (facultatif)
              TextField(
                controller: _messageCtrl,
                style: const TextStyle(color: Colors.white),
                cursorColor: Colors.white,
                minLines: 1,
                maxLines: 3,
                decoration: _champ('Premier message (facultatif)'),
              ),
              const SizedBox(height: 16),

              // Bouton de validation
              FilledButton(
                onPressed: peutCreer ? _valider : null,
                style: FilledButton.styleFrom(
                  backgroundColor: _jaune,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text(
                  'Créer le groupe',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
