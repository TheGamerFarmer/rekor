// À placer dans lib/mobile_pages/fiche_presence_page.dart
import 'package:flutter/material.dart';

import '../models/equipe.dart';
import '../models/fiche_presence.dart';
import '../models/utilisateur.dart';

String _deux(int n) => n.toString().padLeft(2, '0');
String _formatDate(DateTime d) => '${_deux(d.day)}/${_deux(d.month)}/${d.year}';

/// Historique des fiches de présence d'une équipe.
/// Le bouton + crée une nouvelle fiche (date du jour, joueurs à cocher).
class FichePresencePage extends StatefulWidget {
  final Equipe equipe;
  final List<Utilisateur> utilisateurs;
  final List<FichePresence> fiches; // celles de cette équipe
  final void Function(FichePresence) onFicheAjoutee;
  final void Function(FichePresence) onFicheModifiee;

  const FichePresencePage({
    super.key,
    required this.equipe,
    required this.utilisateurs,
    required this.fiches,
    required this.onFicheAjoutee,
    required this.onFicheModifiee,
  });

  @override
  State<FichePresencePage> createState() => _FichePresencePageState();
}

class _FichePresencePageState extends State<FichePresencePage> {
  static const _jaune = Color(0xFFFFD60A);

  late List<FichePresence> _fiches;

  @override
  void initState() {
    super.initState();
    _fiches = List.of(widget.fiches);
  }

  List<Utilisateur> get _membres => widget.utilisateurs
      .where((u) => widget.equipe.membres.containsKey(u.id))
      .toList();

  void _basculerPresence(FichePresence f, int userId, bool present) {
    final modifiee = f.copyWith(presences: {...f.presences, userId: present});
    setState(() {
      _fiches[_fiches.indexWhere((x) => x.id == f.id)] = modifiee;
    });
    widget.onFicheModifiee(modifiee);
  }

  Future<void> _nouvelleFiche() async {
    final fiche = await showDialog<FichePresence>(
      context: context,
      builder: (_) =>
          _NouvelleFicheDialog(equipe: widget.equipe, membres: _membres),
    );
    if (fiche == null) return;
    setState(() => _fiches.add(fiche));
    widget.onFicheAjoutee(fiche);
  }

  @override
  Widget build(BuildContext context) {
    final membres = _membres;
    final liste = [..._fiches]..sort((a, b) => b.date.compareTo(a.date));

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(
          widget.equipe.nom.toUpperCase(),
          style: const TextStyle(color: _jaune, fontWeight: FontWeight.w900),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: _jaune,
        foregroundColor: Colors.black,
        onPressed: _nouvelleFiche,
        child: const Icon(Icons.add),
      ),
      body: liste.isEmpty
          ? const Center(
              child: Text(
                'Aucune fiche de présence pour le moment',
                style: TextStyle(color: Colors.white70),
              ),
            )
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 90),
              children: [
                for (final f in liste)
                  Theme(
                    data: Theme.of(context)
                        .copyWith(dividerColor: Colors.transparent),
                    child: ExpansionTile(
                      iconColor: Colors.white,
                      collapsedIconColor: Colors.white70,
                      title: Text(
                        'Fiche du ${_formatDate(f.date)}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      subtitle: Text(
                        '${membres.where((u) => f.presences[u.id] == true).length}'
                        '/${membres.length} présents',
                        style: const TextStyle(color: Colors.white70),
                      ),
                      children: [
                        for (final u in membres)
                          CheckboxListTile(
                            dense: true,
                            activeColor: _jaune,
                            checkColor: Colors.black,
                            side: const BorderSide(color: Colors.white54),
                            title: Text(
                              u.nomComplet,
                              style: const TextStyle(color: Colors.white),
                            ),
                            subtitle: Text(
                              widget.equipe.membres[u.id]!.label,
                              style: const TextStyle(color: Colors.white54),
                            ),
                            value: f.presences[u.id] ?? false,
                            onChanged: (v) =>
                                _basculerPresence(f, u.id, v ?? false),
                          ),
                      ],
                    ),
                  ),
              ],
            ),
    );
  }
}

/// Popup : date du jour (modifiable) + liste des joueurs à cocher.
class _NouvelleFicheDialog extends StatefulWidget {
  final Equipe equipe;
  final List<Utilisateur> membres;

  const _NouvelleFicheDialog({required this.equipe, required this.membres});

  @override
  State<_NouvelleFicheDialog> createState() => _NouvelleFicheDialogState();
}

class _NouvelleFicheDialogState extends State<_NouvelleFicheDialog> {
  static const _jaune = Color(0xFFFFD60A);

  DateTime _date = DateTime.now();
  final Set<int> _presents = {};

  Future<void> _choisirDate() async {
    final jour = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (jour != null) setState(() => _date = jour);
  }

  @override
  Widget build(BuildContext context) {
    final tousCoches = _presents.length == widget.membres.length;

    return AlertDialog(
      backgroundColor: const Color(0xFF1C1C1E),
      title: const Text(
        'Nouvelle fiche',
        style: TextStyle(color: _jaune, fontWeight: FontWeight.w900),
      ),
      content: SizedBox(
        width: double.maxFinite,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            OutlinedButton.icon(
              onPressed: _choisirDate,
              icon: const Icon(Icons.event, color: _jaune),
              label: Text(
                _formatDate(_date),
                style: const TextStyle(color: Colors.white),
              ),
            ),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () => setState(() {
                  if (tousCoches) {
                    _presents.clear();
                  } else {
                    _presents.addAll(widget.membres.map((u) => u.id));
                  }
                }),
                child: Text(
                  tousCoches ? 'Tout décocher' : 'Tout cocher',
                  style: const TextStyle(color: Colors.white70),
                ),
              ),
            ),
            Flexible(
              child: ListView(
                shrinkWrap: true,
                children: [
                  for (final u in widget.membres)
                    CheckboxListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      activeColor: _jaune,
                      checkColor: Colors.black,
                      side: const BorderSide(color: Colors.white54),
                      title: Text(
                        u.nomComplet,
                        style: const TextStyle(color: Colors.white),
                      ),
                      subtitle: Text(
                        widget.equipe.membres[u.id]!.label,
                        style: const TextStyle(color: Colors.white54),
                      ),
                      value: _presents.contains(u.id),
                      onChanged: (v) => setState(() {
                        if (v == true) {
                          _presents.add(u.id);
                        } else {
                          _presents.remove(u.id);
                        }
                      }),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Annuler', style: TextStyle(color: Colors.white70)),
        ),
        TextButton(
          onPressed: () => Navigator.pop(
            context,
            FichePresence(
              id: DateTime.now().millisecondsSinceEpoch,
              equipeId: widget.equipe.id,
              date: _date,
              presences: {
                for (final u in widget.membres) u.id: _presents.contains(u.id),
              },
            ),
          ),
          child: const Text('Valider', style: TextStyle(color: _jaune)),
        ),
      ],
    );
  }
}
