// À placer dans lib/widgets/equipe_form_dialog.dart
import 'package:flutter/material.dart';

import '../models/equipe.dart';
import '../models/utilisateur.dart';

/// Popup de création (equipe == null) ou de modification d'une équipe.
/// Renvoie l'Equipe validée, ou null si on ferme sans valider.
class EquipeFormDialog extends StatefulWidget {
  final List<Utilisateur> utilisateurs;
  final Equipe? equipe;

  const EquipeFormDialog({super.key, required this.utilisateurs, this.equipe});

  @override
  State<EquipeFormDialog> createState() => _EquipeFormDialogState();
}

class _EquipeFormDialogState extends State<EquipeFormDialog> {
  static const _jaune = Color(0xFFFFD60A);

  late final TextEditingController _nom;
  late final Map<int, Poste> _membres;
  int? _capitaineId;
  String? _erreur;

  @override
  void initState() {
    super.initState();
    _nom = TextEditingController(text: widget.equipe?.nom ?? '');
    _membres = Map.of(widget.equipe?.membres ?? {});
    _capitaineId = widget.equipe?.capitaineId;
  }

  @override
  void dispose() {
    _nom.dispose();
    super.dispose();
  }

  void _valider() {
    if (_nom.text.trim().isEmpty) {
      setState(() => _erreur = 'Donne un nom à l\'équipe');
    } else if (_membres.isEmpty) {
      setState(() => _erreur = 'Ajoute au moins un joueur');
    } else if (_capitaineId == null || !_membres.containsKey(_capitaineId)) {
      setState(() => _erreur = 'Choisis un capitaine (étoile)');
    } else {
      Navigator.pop(
        context,
        Equipe(
          id: widget.equipe?.id ?? DateTime.now().millisecondsSinceEpoch,
          nom: _nom.text.trim(),
          capitaineId: _capitaineId!,
          membres: _membres,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: const Color(0xFF1C1C1E),
      insetPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 24),
      contentPadding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      title: Text(
        widget.equipe == null ? 'Nouvelle équipe' : 'Modifier l\'équipe',
        style: const TextStyle(color: _jaune, fontWeight: FontWeight.w900),
      ),
      content: SizedBox(
        width: double.maxFinite,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                controller: _nom,
                style: const TextStyle(color: Colors.white),
                cursorColor: Colors.white,
                decoration: const InputDecoration(
                  labelText: 'Nom de l\'équipe',
                  labelStyle: TextStyle(color: Colors.white70),
                  enabledBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.white24),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Joueurs (étoile = capitaine)',
                style: TextStyle(color: Colors.white70),
              ),
              for (final u in widget.utilisateurs) _ligneJoueur(u),
              if (_erreur != null)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(
                    _erreur!,
                    style: const TextStyle(color: Colors.redAccent),
                  ),
                ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Annuler', style: TextStyle(color: Colors.white70)),
        ),
        TextButton(
          onPressed: _valider,
          child: const Text('Valider', style: TextStyle(color: _jaune)),
        ),
      ],
    );
  }

  Widget _ligneJoueur(Utilisateur u) {
    final choisi = _membres.containsKey(u.id);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Ligne 1 : case + nom complet + étoile capitaine
        Row(
          children: [
            Checkbox(
              value: choisi,
              activeColor: _jaune,
              checkColor: Colors.black,
              side: const BorderSide(color: Colors.white54),
              onChanged: (v) => setState(() {
                if (v == true) {
                  _membres[u.id] = Poste.receptionneurAttaquant;
                } else {
                  _membres.remove(u.id);
                  if (_capitaineId == u.id) _capitaineId = null;
                }
              }),
            ),
            Expanded(
              child: Text(
                u.nomComplet,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Colors.white, fontSize: 16),
              ),
            ),
            if (choisi)
              IconButton(
                visualDensity: VisualDensity.compact,
                tooltip: 'Capitaine',
                icon: Icon(
                  _capitaineId == u.id ? Icons.star : Icons.star_border,
                  color: _capitaineId == u.id ? _jaune : Colors.white54,
                ),
                onPressed: () => setState(() => _capitaineId = u.id),
              ),
          ],
        ),
        // Ligne 2 : poste, pleine largeur, seulement si le joueur est coché
        if (choisi)
          Padding(
            padding: const EdgeInsets.only(left: 48, right: 8, bottom: 8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: Colors.white10,
                borderRadius: BorderRadius.circular(10),
              ),
              child: DropdownButton<Poste>(
                value: _membres[u.id],
                isExpanded: true,
                dropdownColor: const Color(0xFF2C2C2E),
                underline: const SizedBox(),
                style: const TextStyle(color: Colors.white, fontSize: 14),
                items: [
                  for (final p in Poste.values)
                    DropdownMenuItem(value: p, child: Text(p.label)),
                ],
                onChanged: (p) => setState(() => _membres[u.id] = p!),
              ),
            ),
          ),
        const Divider(color: Colors.white12, height: 1),
      ],
    );
  }
}
