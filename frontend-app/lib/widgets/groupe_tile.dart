import 'package:flutter/material.dart';

import '../models/groupe.dart';

class GroupeTile extends StatelessWidget {
  const GroupeTile({super.key, required this.groupe, this.onTap});

  final Groupe groupe;
  final VoidCallback? onTap;

  static const _jours = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche',
  ];

  // gestion du temps du derniere message
  String _formaterDate(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'À l\'instant';
    if (diff.inMinutes < 60) return 'Il y a ${diff.inMinutes} min';
    if (diff.inHours < 24) return 'Il y a ${diff.inHours}h';
    if (diff.inDays < 7) return _jours[date.weekday - 1];
    final jour = date.day.toString().padLeft(2, '0');
    final mois = date.month.toString().padLeft(2, '0');
    return '$jour/$mois/${date.year}';
  }

  ImageProvider? _imageGroupe() {
    if (groupe.imageLocale != null) return MemoryImage(groupe.imageLocale!);
    final image = groupe.image;
    if (image == null) return null;
    if (image.startsWith('http')) return NetworkImage(image);
    return AssetImage(image);
  }

  @override
  Widget build(BuildContext context) {
    final message = groupe.dernierMessage;

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              radius: 32,
              backgroundColor: Colors.white24,
              backgroundImage: _imageGroupe(),
              child: groupe.image == null && groupe.imageLocale == null
                  ? const Icon(Icons.group, color: Colors.white)
                  : null,
            ),

            //espace
            const SizedBox(width: 16),

            // Tout le reste à droite
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Nom du groupe + heure du dernier message
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          groupe.nom,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      if (message != null) ...[
                        const SizedBox(width: 8),
                        Text(
                          _formaterDate(message.date),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                          ),
                        ),
                      ],
                      if (groupe.nonLu) ...[
                        const SizedBox(width: 8),
                        Container(
                          width: 10,
                          height: 10,
                          margin: const EdgeInsets.only(top: 4),
                          decoration: const BoxDecoration(
                            color: Colors.blueAccent,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),

                  // Dernier message : "Auteur : corps" (2 lignes max)
                  if (message == null)
                    const Text(
                      'Aucun message',
                      style: TextStyle(
                        color: Colors.white54,
                        fontSize: 12,
                        fontStyle: FontStyle.italic,
                      ),
                    )
                  else
                    Text.rich(
                      TextSpan(
                        children: [
                          TextSpan(
                            text: '${message.auteur} : ',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextSpan(text: message.corps),
                        ],
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
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
