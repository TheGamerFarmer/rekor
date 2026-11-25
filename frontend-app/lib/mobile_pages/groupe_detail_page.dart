import 'package:flutter/material.dart';

import '../models/groupe.dart';
import '../models/utilisateur.dart';
import '../widgets/ajouter_personnes_dialog.dart';

// Page d'informations d'un groupe : photo, nom, date de création, participants
class GroupeDetailsPage extends StatefulWidget {
  const GroupeDetailsPage({
    super.key,
    required this.groupe,
    required this.utilisateurs,
    required this.participantIds,
    required this.onAjouter,
  });

  final Groupe groupe;

  // Toutes les personnes connues (pour retrouver les noms)
  final List<Utilisateur> utilisateurs;

  // ids des personnes qui sont déjà dans le groupe
  final Set<int> participantIds;

  // Appelée quand on ajoute des personnes, pour que les autres pages le gardent
  final void Function(Set<int> ids) onAjouter;

  @override
  State<GroupeDetailsPage> createState() => _GroupeDetailsPageState();
}

class _GroupeDetailsPageState extends State<GroupeDetailsPage> {
  static const _jaune = Color(0xFFFFD60A);

  Groupe get _groupe => widget.groupe;

  // Copie modifiable des participants (on y ajoute les nouveaux)
  late final Set<int> _ids = {...widget.participantIds};

  // Les personnes dont l'id fait partie du groupe
  List<Utilisateur> get _participants =>
      widget.utilisateurs.where((u) => _ids.contains(u.id)).toList();

  // Choisit d'où vient la photo : mémoire, internet ou fichier du projet
  ImageProvider? _imageGroupe() {
    if (_groupe.imageLocale != null) return MemoryImage(_groupe.imageLocale!);
    final image = _groupe.image;
    if (image == null) return null;
    if (image.startsWith('http')) return NetworkImage(image);
    return AssetImage(image);
  }

  // 05/12/2026
  String _formaterDate(DateTime date) {
    final jour = date.day.toString().padLeft(2, '0');
    final mois = date.month.toString().padLeft(2, '0');
    return '$jour/$mois/${date.year}';
  }

  // Ouvre le popup de choix, puis ajoute les personnes cochées
  Future<void> _ajouterPersonnes() async {
    // Seulement les personnes qui ne sont pas déjà dans le groupe
    final candidats = widget.utilisateurs
        .where((u) => !_ids.contains(u.id))
        .toList();

    final choisis = await showDialog<Set<int>>(
      context: context,
      builder: (context) => AjouterPersonnesDialog(candidats: candidats),
    );

    // null = popup fermé sans valider
    if (choisis == null || choisis.isEmpty || !mounted) return;

    setState(() => _ids.addAll(choisis));
    widget.onAjouter(choisis);
  }

  // Demande confirmation, puis renvoie "true" à la page de discussion
  Future<void> _confirmerDepart() async {
    final confirme = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1C1C1E),
        title: const Text(
          'Quitter le groupe ?',
          style: TextStyle(color: Colors.white),
        ),
        content: Text(
          'Vous ne recevrez plus les messages de « ${_groupe.nom} ».',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            style: TextButton.styleFrom(foregroundColor: Colors.white70),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.redAccent),
            child: const Text('Quitter'),
          ),
        ],
      ),
    );

    // On ferme la page d'informations en renvoyant "true"
    if (confirme == true && mounted) {
      Navigator.pop(context, true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final sansPhoto = _groupe.image == null && _groupe.imageLocale == null;
    final participants = _participants;

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            // Flèche pour revenir à la discussion
            Align(
              alignment: Alignment.centerLeft,
              child: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
            ),
            // Tout le reste défile
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                children: [
                  // Grande photo
                  Center(
                    child: CircleAvatar(
                      radius: 56,
                      backgroundColor: Colors.white24,
                      backgroundImage: _imageGroupe(),
                      child: sansPhoto
                          ? const Icon(
                              Icons.group,
                              color: Colors.white,
                              size: 48,
                            )
                          : null,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Nom du groupe
                  Center(
                    child: Text(
                      _groupe.nom,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Date de création
                  Center(
                    child: Text(
                      'Créé le ${_formaterDate(_groupe.dateCreation)}',
                      style: const TextStyle(color: Colors.white54),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Participants
                  Text(
                    'Participants (${participants.length})',
                    style: const TextStyle(
                      color: _jaune,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Ligne "Ajouter des personnes"
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const CircleAvatar(
                      backgroundColor: _jaune,
                      child: Icon(Icons.person_add, color: Colors.black),
                    ),
                    title: const Text(
                      'Ajouter des personnes',
                      style: TextStyle(color: Colors.white),
                    ),
                    onTap: _ajouterPersonnes,
                  ),

                  if (participants.isEmpty)
                    const Padding(
                      padding: EdgeInsets.only(top: 8),
                      child: Text(
                        'Aucun participant renseigné',
                        style: TextStyle(color: Colors.white54),
                      ),
                    )
                  else
                    for (final u in participants)
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundColor: Colors.white24,
                          child: Text(
                            u.prenom.isEmpty ? '?' : u.prenom[0].toUpperCase(),
                            style: const TextStyle(color: Colors.white),
                          ),
                        ),
                        title: Text(
                          u.nomComplet,
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),

                  // Quitter le groupe
                  const SizedBox(height: 32),
                  OutlinedButton.icon(
                    onPressed: _confirmerDepart,
                    icon: const Icon(Icons.logout),
                    label: const Text('Quitter le groupe'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.redAccent,
                      side: const BorderSide(color: Colors.redAccent),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
