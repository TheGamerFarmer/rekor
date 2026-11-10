import 'package:flutter/material.dart';

import '../models/groupe.dart';
import '../models/utilisateur.dart';

// Page d'informations d'un groupe : photo, nom, date de création, participants
class GroupeDetailsPage extends StatelessWidget {
  const GroupeDetailsPage({
    super.key,
    required this.groupe,
    required this.participants,
  });

  final Groupe groupe;

  // Les personnes qui font partie du groupe
  final List<Utilisateur> participants;

  static const _jaune = Color(0xFFFFD60A);

  // Choisit d'où vient la photo : mémoire, internet ou fichier du projet
  ImageProvider? _imageGroupe() {
    if (groupe.imageLocale != null) return MemoryImage(groupe.imageLocale!);
    final image = groupe.image;
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

  @override
  Widget build(BuildContext context) {
    final sansPhoto = groupe.image == null && groupe.imageLocale == null;

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
                      groupe.nom,
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
                      'Créé le ${_formaterDate(groupe.dateCreation)}',
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
                  if (participants.isEmpty)
                    const Text(
                      'Aucun participant renseigné',
                      style: TextStyle(color: Colors.white54),
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
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
