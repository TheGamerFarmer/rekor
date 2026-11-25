import 'package:flutter/material.dart';
import 'package:frontend_app/mobile_pages/discussion.dart';

import '../layouts/main_layout.dart';
import '../models/groupe.dart';
import '../models/message.dart';
import '../models/nouveau_groupe.dart';
import '../models/utilisateur.dart';
import '../widgets/creer_groupe_dialog.dart';
import '../widgets/groupe_tile.dart';

//Page de discussion
class GroupesPage extends StatefulWidget {
  const GroupesPage({super.key});

  @override
  State<GroupesPage> createState() => _GroupesPageState();
}

class _GroupesPageState extends State<GroupesPage> {
  static const _jaune = Color(0xFFFFD60A);

  // Personnes que l'on peut ajouter à un groupe (plus tard : table User)
  final List<Utilisateur> _utilisateurs = const [
    Utilisateur(id: 1, prenom: 'Lucie', nom: 'Loury'),
    Utilisateur(id: 2, prenom: 'Guillaume', nom: 'Morel'),
    Utilisateur(id: 3, prenom: 'Camille', nom: 'Chapuis'),
    Utilisateur(id: 4, prenom: 'Thibault', nom: 'Verron'),
    Utilisateur(id: 5, prenom: 'Sarah', nom: 'Bernard'),
    Utilisateur(id: 6, prenom: 'Hugo', nom: 'Martin'),
    Utilisateur(id: 7, prenom: 'Emma', nom: 'Petit'),
  ];

  // Liste des groupes (plus tard : chargée depuis la BDD)
  final List<Groupe> _groupes = [
    Groupe(
      id: 1,
      nom: 'Equipe Groupe 3',
      dateCreation: DateTime(2026, 9, 1),
      image: 'public/img/volley_ball1.jpg',
      dernierMessage: Message(
        id: 1,
        auteur: 'Lucie Loury',
        corps: 'Le dernier cours c\'est bien passé? Désolé j\'ai pas pu être là, grosse grippe de dernière min 😅',
        date: DateTime.now().subtract(const Duration(minutes: 1)),
      ),
      participantIds: {1, 2, 3, 4, 5},
    ),
    Groupe(
      id: 2,
      nom: 'Club',
      dateCreation: DateTime(2026, 9, 1),
      dernierMessage: Message(
        id: 2,
        auteur: 'Guillaume Morel',
        corps: 'Rappel, samedi prochain on organise un gros after pour célébrer la victoire du match de dimanche dernier.',
        date: DateTime.now().subtract(const Duration(hours: 10)),
      ),
      participantIds: {1, 2, 3},
    ),
    Groupe(
      id: 3,
      nom: 'Match 13 Janvier',
      dateCreation: DateTime(2026, 10, 12),
      dernierMessage: Message(
        id: 3,
        auteur: 'Guillaume Morel',
        corps: 'Les qualifications auront lieu ce week end. Il nous manque encore 3 joueurs, donc si y\'en a qui veulent...',
        date: DateTime.now().subtract(const Duration(hours: 10)),
      ),
      participantIds: {1, 5, 4, 3},
      derniereLecture: DateTime.now(),
    ),
    Groupe(
      id: 4,
      nom: 'Camille',
      dateCreation: DateTime(2026, 10, 20),
      image: 'public/img/pdp_camille.png',
      dernierMessage: Message(
        id: 4,
        auteur: 'Camille Chapuis',
        corps: 'C\'était trop bien l\'entraînement, et je dit pas ça parce qu\'il n\'y avais pas lucie 😁',
        date: DateTime.now().subtract(const Duration(days: 3)),
      ),
      participantIds: {3},
      derniereLecture: DateTime.now(),
    ),
    // Groupe sans message
    Groupe(
      id: 5,
      nom: 'Match 12 Août',
      dateCreation: DateTime(2026, 8, 1),
      participantIds: {1, 2, 5},
    ),
  ];

  String _recherche = '';

  // Un groupe avec exactement ces personnes existe-t-il déjà ?
  bool _groupeExiste(Set<int> ids) {
    return _groupes.any(
      (g) =>
          g.participantIds.length == ids.length &&
          g.participantIds.containsAll(ids),
    );
  }

  // Remplace un groupe de la liste par sa version modifiée
  void _remplacerGroupe(
    Groupe groupe,
    Groupe Function(Groupe ancien) modifier,
  ) {
    final index = _groupes.indexWhere((g) => g.id == groupe.id);
    if (index == -1) return;
    setState(() => _groupes[index] = modifier(_groupes[index]));
  }

  // Garde un message envoyé depuis la page de discussion
  void _ajouterMessage(Groupe groupe, Message message) {
    _remplacerGroupe(
      groupe,
      (ancien) => ancien.copyWith(
        messages: [...ancien.tousLesMessages, message],
        dernierMessage: message,
        derniereLecture:
            DateTime.now(), // c'est nous qui écrivons : tout est lu
      ),
    );
  }

  // Ajoute des personnes à un groupe
  void _ajouterParticipants(Groupe groupe, Set<int> ids) {
    // TODO : prévenir l'API (association "fait-partie")
    _remplacerGroupe(
      groupe,
      (ancien) =>
          ancien.copyWith(participantIds: {...ancien.participantIds, ...ids}),
    );
  }

  // Enlève la pastille bleue d'un groupe
  void _marquerCommeLu(Groupe groupe) {
    // TODO : prévenir l'API (dernière lecture de l'utilisateur connecté)
    _remplacerGroupe(
      groupe,
      (ancien) => ancien.copyWith(derniereLecture: DateTime.now()),
    );
  }

  // Retire le groupe de la liste quand on le quitte
  void _quitterGroupe(Groupe groupe) {
    // TODO : prévenir l'API (supprimer l'association "fait-partie" de l'utilisateur connecté)
    setState(() => _groupes.removeWhere((g) => g.id == groupe.id));
  }

  // ouvre le popup, puis ajoute le groupe créé en haut de la liste
  Future<void> _creerGroupe() async {
    final resultat = await showDialog<NouveauGroupe>(
      context: context,
      builder: (context) => CreerGroupeDialog(
        utilisateurs: _utilisateurs,
        groupeExiste: _groupeExiste,
      ),
    );

    // null = popup fermé sans valider
    if (resultat == null || !mounted) return;

    // TODO : envoyer à l'API (groupe + participants + premier message)
    final maintenant = DateTime.now();
    setState(() {
      _groupes.insert(
        0,
        Groupe(
          id: maintenant.millisecondsSinceEpoch,
          nom: resultat.nom,
          dateCreation: maintenant,
          imageLocale: resultat.image,
          participantIds: resultat.participants.map((u) => u.id).toSet(),
          dernierMessage: resultat.premierMessage == null
              ? null
              : Message(
                  id: maintenant.millisecondsSinceEpoch,
                  auteur: 'Moi', // TODO : utilisateur connecté
                  corps: resultat.premierMessage!,
                  date: maintenant,
                ),
        ),
      );
    });
  }

  // Ouvre la discussion d'un groupe
  void _ouvrirGroupe(Groupe groupe) {
    // On ouvre le groupe : les messages sont considérés comme lus
    _marquerCommeLu(groupe);

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DiscussionPage(
          groupe: groupe,
          utilisateurs: _utilisateurs,
          onMessageEnvoye: (message) => _ajouterMessage(groupe, message),
          onQuitter: () => _quitterGroupe(groupe),
          onParticipantsAjoutes: (ids) => _ajouterParticipants(groupe, ids),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Groupes dont le nom contient le texte recherché, le plus récent en premier
    final liste =
        _groupes
            .where(
              (g) => g.nom.toLowerCase().contains(_recherche.toLowerCase()),
            )
            .toList()
          ..sort((a, b) => b.derniereActivite.compareTo(a.derniereActivite));

    return MainLayout(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 130, 16, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'DISCUSSIONS',
              style: TextStyle(
                color: _jaune,
                fontSize: 32,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                // Barre de recherche
                Expanded(
                  child: SizedBox(
                    height: 48,
                    child: TextField(
                      style: const TextStyle(color: Colors.white),
                      cursorColor: Colors.white,
                      onChanged: (texte) => setState(() => _recherche = texte),
                      decoration: InputDecoration(
                        hintText: 'Chercher un groupe...',
                        hintStyle: const TextStyle(color: Colors.white70),
                        prefixIcon: const Icon(
                          Icons.search,
                          color: Colors.white70,
                        ),
                        filled: true,
                        fillColor: Colors.white10,
                        contentPadding: const EdgeInsets.symmetric(vertical: 0),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(30),
                          borderSide: const BorderSide(color: Colors.white24),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(30),
                          borderSide: const BorderSide(color: Colors.white54),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Bouton + : ouvre le formulaire de création
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
                    onPressed: _creerGroupe,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Liste des groupes, avec un trait entre chaque
            for (int i = 0; i < liste.length; i++) ...[
              if (i > 0) const Divider(color: Colors.white12, height: 1),
              GroupeTile(
                groupe: liste[i],
                onTap: () => _ouvrirGroupe(liste[i]),
              ),
            ],
            const SizedBox(height: 130),
          ],
        ),
      ),
    );
  }
}
