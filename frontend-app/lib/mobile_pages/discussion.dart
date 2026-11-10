import 'package:flutter/material.dart';

import '../models/groupe.dart';
import '../models/message.dart';
import '../models/utilisateur.dart';
import 'groupe_detail_page.dart';

// Page d'un groupe : photo, nom, liste des messages et barre de saisie
class DiscussionPage extends StatefulWidget {
  const DiscussionPage({
    super.key,
    required this.groupe,
    required this.onMessageEnvoye,
    required this.utilisateurs,
  });

  // Le groupe sur lequel on a cliqué dans la liste
  final Groupe groupe;

  // Toutes les personnes connues (pour retrouver les participants du groupe)
  final List<Utilisateur> utilisateurs;

  // Appelée à chaque message envoyé, pour que la page des groupes le garde
  final void Function(Message message) onMessageEnvoye;

  @override
  State<DiscussionPage> createState() => _DiscussionPageState();
}

class _DiscussionPageState extends State<DiscussionPage> {
  static const _jaune = Color(0xFFFFD60A);

  // Raccourci : dans le State, le groupe reçu s'écrit "widget.groupe".
  Groupe get _groupe => widget.groupe;

  // Copie modifiable des messages (on y ajoute ceux qu'on envoie)
  late final List<Message> _messages = List<Message>.from(
    _groupe.tousLesMessages,
  );

  // Texte tapé dans la barre de saisie
  final _saisieCtrl = TextEditingController();

  // Permet de faire défiler la liste jusqu'en bas
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    // À l'ouverture, on affiche directement les messages les plus récents
    WidgetsBinding.instance.addPostFrameCallback(
      (_) => _allerEnBas(animer: false),
    );
  }

  @override
  void dispose() {
    _saisieCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  // Fait défiler la liste jusqu'au dernier message
  void _allerEnBas({bool animer = true}) {
    if (!_scrollCtrl.hasClients) return;
    final bas = _scrollCtrl.position.maxScrollExtent;
    if (animer) {
      _scrollCtrl.animateTo(
        bas,
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
      );
    } else {
      _scrollCtrl.jumpTo(bas);
    }
  }

  // Ajoute le message tapé à la liste
  void _envoyer() {
    final texte = _saisieCtrl.text.trim();
    if (texte.isEmpty) return;

    final maintenant = DateTime.now();
    final message = Message(
      id: maintenant.millisecondsSinceEpoch,
      auteur: 'Moi', // TODO : utilisateur connecté
      corps: texte,
      date: maintenant,
    );
    setState(() => _messages.add(message));
    _saisieCtrl.clear();

    // On prévient la page des groupes pour qu'elle garde le message
    widget.onMessageEnvoye(message);

    // TODO : envoyer le message à l'API

    // On attend que le nouveau message soit affiché, puis on descend
    WidgetsBinding.instance.addPostFrameCallback((_) => _allerEnBas());
  }

  // Choisit d'où vient la photo : mémoire, internet ou fichier du projet
  ImageProvider? _imageGroupe() {
    if (_groupe.imageLocale != null) return MemoryImage(_groupe.imageLocale!);
    final image = _groupe.image;
    if (image == null) return null;
    if (image.startsWith('http')) return NetworkImage(image);
    return AssetImage(image);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            _flecheRetour(),
            _enTete(),
            // Les messages prennent toute la place restante et défilent
            Expanded(child: _listeMessages()),
            _barreSaisie(),
          ],
        ),
      ),
    );
  }

  // Flèche pour revenir à la liste des groupes
  Widget _flecheRetour() {
    return Align(
      alignment: Alignment.centerLeft,
      child: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () => Navigator.pop(context),
      ),
    );
  }

  // Ouvre la page d'informations du groupe
  void _ouvrirDetails() {
    // Les personnes dont l'id fait partie du groupe
    final participants = widget.utilisateurs
        .where((u) => _groupe.participantIds.contains(u.id))
        .toList();

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            GroupeDetailsPage(groupe: _groupe, participants: participants),
      ),
    );
  }

  // Photo ronde + nom du groupe (un clic ouvre les informations)
  Widget _enTete() {
    final sansPhoto = _groupe.image == null && _groupe.imageLocale == null;

    return InkWell(
      onTap: _ouvrirDetails,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
        child: Column(
          children: [
            CircleAvatar(
              radius: 32,
              backgroundColor: Colors.white24,
              backgroundImage: _imageGroupe(),
              // Icône affichée uniquement s'il n'y a pas de photo
              child: sansPhoto
                  ? const Icon(Icons.group, color: Colors.white)
                  : null,
            ),
            const SizedBox(height: 12),
            Text(
              _groupe.nom,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Liste défilante : une bulle par message
  Widget _listeMessages() {
    return ListView.builder(
      controller: _scrollCtrl,
      padding: const EdgeInsets.all(16),
      itemCount: _messages.length,
      itemBuilder: (context, i) => _bulle(_messages[i]),
    );
  }

  // Un message dans une bulle grise : l'auteur en petit, puis le texte
  Widget _bulle(Message message) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Container(
          // La bulle ne dépasse pas 75 % de la largeur de l'écran
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.75,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFF2C2C2E),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                message.auteur,
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 2),
              Text(message.corps, style: const TextStyle(color: Colors.white)),
            ],
          ),
        ),
      ),
    );
  }

  // Champ de texte + bouton d'envoi, collés en bas de la page
  Widget _barreSaisie() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _saisieCtrl,
              style: const TextStyle(color: Colors.white),
              cursorColor: Colors.white,
              minLines: 1,
              maxLines: 4,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _envoyer(),
              decoration: InputDecoration(
                hintText: 'Écrire un message...',
                hintStyle: const TextStyle(color: Colors.white54),
                filled: true,
                fillColor: Colors.white10,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 12,
                ),
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
          const SizedBox(width: 12),
          // Bouton d'envoi
          Container(
            width: 48,
            height: 48,
            decoration: const BoxDecoration(
              color: _jaune,
              shape: BoxShape.circle,
            ),
            child: IconButton(
              icon: const Icon(Icons.send, color: Colors.black, size: 20),
              onPressed: _envoyer,
            ),
          ),
        ],
      ),
    );
  }
}
