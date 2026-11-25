import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:frontend_app/mobile_pages/login.dart';
import 'package:image_picker/image_picker.dart';
import 'package:rekor_api/api.dart' as generated;

import '../api/api_client.dart';
import '../layouts/main_layout.dart';

const _jaune = Color(0xFFFFD60A);
const _fondPopup = Color(0xFF1C1C1E);

// Page des paramètres : profil, notifications, compte
class ParametresPage extends StatefulWidget {
  const ParametresPage({super.key});

  @override
  State<ParametresPage> createState() => _ParametresPageState();
}

class _ParametresPageState extends State<ParametresPage> {
  generated.UserDetails? _profil;
  bool _chargementProfil = true;
  bool _enregistrementProfil = false;
  bool _changementMotDePasse = false;
  String? _erreurProfil;

  // Photo de profil choisie (null = initiales)
  Uint8List? _photo;

  // Notifications (plus tard : enregistrées sur l'API)
  bool _notifMessages = true;
  bool _notifEvenements = true;

  @override
  void initState() {
    super.initState();
    _chargerProfil();
  }

  Future<void> _chargerProfil() async {
    setState(() {
      _chargementProfil = true;
      _erreurProfil = null;
    });
    try {
      final profil = await ApiClient.instance.getMyProfile();
      if (!mounted) return;
      if (profil == null) {
        throw StateError('Le serveur a renvoyé un profil vide.');
      }
      setState(() {
        _profil = profil;
        _chargementProfil = false;
      });
    } catch (error) {
      debugPrint('Erreur lors du chargement du profil : $error');
      if (!mounted) return;
      setState(() {
        _erreurProfil = 'Impossible de charger le profil.';
        _chargementProfil = false;
      });
    }
  }

  // Ouvre la galerie et garde la photo choisie
  Future<void> _choisirPhoto() async {
    final fichier = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 512,
      imageQuality: 80,
    );
    if (fichier == null) return;

    final octets = await fichier.readAsBytes();
    if (!mounted) return;
    setState(() => _photo = octets);
    // TODO : envoyer la photo à l'API
  }

  // Popup avec un champ de texte : renvoie le texte, ou null si annulé
  Future<String?> _saisirTexte({
    required String titre,
    required String valeur,
    TextInputType? clavier,
  }) {
    return showDialog<String>(
      context: context,
      builder: (context) =>
          _ChampTexteDialog(titre: titre, valeur: valeur, clavier: clavier),
    );
  }

  Future<void> _modifierPrenom() async {
    final profil = _profil!;
    final valeur = await _saisirTexte(
      titre: 'Prénom',
      valeur: profil.firstName ?? '',
    );
    if (valeur == null || valeur.isEmpty || !mounted) return;
    await _enregistrerProfil(
      generated.UpdateProfileInput(firstName: valeur),
      (profil) => profil.firstName = valeur,
    );
  }

  Future<void> _modifierNom() async {
    final profil = _profil!;
    final valeur = await _saisirTexte(titre: 'Nom', valeur: profil.name);
    if (valeur == null || valeur.isEmpty || !mounted) return;
    await _enregistrerProfil(
      generated.UpdateProfileInput(name: valeur),
      (profil) => profil.name = valeur,
    );
  }

  Future<void> _modifierMail() async {
    final profil = _profil!;
    final valeur = await _saisirTexte(
      titre: 'Adresse mail',
      valeur: profil.email,
      clavier: TextInputType.emailAddress,
    );
    if (valeur == null || valeur.isEmpty || !mounted) return;
    await _enregistrerProfil(
      generated.UpdateProfileInput(email: valeur),
      (profil) => profil.email = valeur,
    );
  }

  Future<void> _modifierTel() async {
    final profil = _profil!;
    final valeur = await _saisirTexte(
      titre: 'Téléphone',
      valeur: profil.phoneNumber ?? '',
      clavier: TextInputType.phone,
    );
    if (valeur == null || !mounted) return;
    await _enregistrerProfil(
      generated.UpdateProfileInput(phoneNumber: valeur),
      (profil) => profil.phoneNumber = valeur,
    );
  }

  Future<void> _modifierPronom() async {
    final profil = _profil!;
    final choix = await showDialog<generated.UserDetailsPronounEnum>(
      context: context,
      builder: (context) => SimpleDialog(
        backgroundColor: _fondPopup,
        title: const Text('Pronom', style: TextStyle(color: Colors.white)),
        children: [
          for (final p in generated.UserDetailsPronounEnum.values)
            SimpleDialogOption(
              onPressed: () => Navigator.pop(context, p),
              child: Text(
                p.toString(),
                style: TextStyle(
                  color: p == profil.pronoun ? _jaune : Colors.white,
                ),
              ),
            ),
        ],
      ),
    );
    if (choix == null || !mounted) return;
    final pronom = generated.UpdateProfileInputPronounEnum.values.firstWhere(
      (pronom) => pronom.toString() == choix.toString(),
    );
    await _enregistrerProfil(
      generated.UpdateProfileInput(pronoun: pronom),
      (profil) => profil.pronoun = choix,
    );
  }

  Future<void> _modifierDateNaissance() async {
    final profil = _profil!;
    final date = await showDatePicker(
      context: context,
      initialDate: profil.birthday ?? DateTime(2000),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      builder: (context, child) => Theme(
        data: ThemeData.dark().copyWith(
          colorScheme: const ColorScheme.dark(
            primary: _jaune,
            onPrimary: Colors.black,
            surface: _fondPopup,
          ),
        ),
        child: child!,
      ),
    );
    if (date == null || !mounted) return;
    await _enregistrerProfil(
      generated.UpdateProfileInput(birthday: date),
      (profil) => profil.birthday = date,
    );
  }

  Future<void> _enregistrerProfil(
    generated.UpdateProfileInput modifications,
    void Function(generated.UserDetails profil) appliquer,
  ) async {
    final profil = _profil!;
    final requete = generated.UpdateProfileInput(
      email: modifications.email ?? profil.email,
      name: modifications.name ?? profil.name,
      firstName: modifications.firstName ?? profil.firstName,
      phoneNumber: modifications.phoneNumber ?? profil.phoneNumber,
      birthday: modifications.birthday ?? profil.birthday,
      pronoun:
          modifications.pronoun ??
          generated.UpdateProfileInputPronounEnum.values.firstWhere(
            (pronom) => pronom.toString() == profil.pronoun.toString(),
          ),
      medicalCertificate: profil.medicalCertificate,
      rightOfPublicity: profil.rightOfPublicity,
    );

    setState(() => _enregistrementProfil = true);
    try {
      await ApiClient.instance.updateMyProfile(requete);
      if (!mounted) return;
      setState(() {
        appliquer(profil);
        _enregistrementProfil = false;
      });
    } catch (error) {
      debugPrint('Erreur lors de la mise à jour du profil : $error');
      if (!mounted) return;
      setState(() => _enregistrementProfil = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Impossible d’enregistrer les modifications du profil.',
          ),
        ),
      );
    }
  }

  Future<void> _modifierMotDePasse() async {
    final informations = await showDialog<({String ancien, String nouveau})>(
      context: context,
      builder: (context) => const _ChangerMotDePasseDialog(),
    );
    if (informations == null || !mounted) return;

    setState(() => _changementMotDePasse = true);
    try {
      await ApiClient.instance.changeMyPassword(
        oldPassword: informations.ancien,
        newPassword: informations.nouveau,
      );
      if (!mounted) return;
      setState(() => _changementMotDePasse = false);
      await _afficherResultatMotDePasse(
        succes: true,
        message: 'Mot de passe modifié avec succès.',
      );
    } catch (error) {
      debugPrint('Erreur lors du changement de mot de passe : $error');
      if (!mounted) return;
      setState(() => _changementMotDePasse = false);
      await _afficherResultatMotDePasse(
        succes: false,
        message: 'Impossible de modifier le mot de passe.',
      );
    }
  }

  Future<void> _afficherResultatMotDePasse({
    required bool succes,
    required String message,
  }) {
    return showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: _fondPopup,
        icon: Icon(
          succes ? Icons.check_circle_outline : Icons.error_outline,
          color: succes ? _jaune : Colors.redAccent,
          size: 40,
        ),
        content: Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.white, fontSize: 16),
        ),
        actions: [
          FilledButton(
            onPressed: () => Navigator.pop(context),
            style: FilledButton.styleFrom(
              backgroundColor: _jaune,
              foregroundColor: Colors.black,
            ),
            child: const Text('Fermer'),
          ),
        ],
      ),
    );
  }

  // Popup de confirmation : renvoie true si l'utilisateur confirme
  Future<bool> _confirmer({
    required String titre,
    required String message,
    required String bouton,
  }) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: _fondPopup,
        title: Text(titre, style: const TextStyle(color: Colors.white)),
        content: Text(message, style: const TextStyle(color: Colors.white70)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            style: TextButton.styleFrom(foregroundColor: Colors.white70),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.redAccent),
            child: Text(bouton),
          ),
        ],
      ),
    );
    return ok == true;
  }

  Future<void> _seDeconnecter() async {
    await ApiClient.instance.logout();
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => const MyLoginPage()),
      (route) => false,
    );
  }

  Future<void> _supprimerCompte() async {
    final ok = await _confirmer(
      titre: 'Supprimer le compte ?',
      message:
          'Cette action est définitive : votre compte et vos données '
          'seront supprimés.',
      bouton: 'Supprimer',
    );
    if (!ok || !mounted) return;
    // TODO : prévenir l'API, puis revenir à la page de connexion
  }

  // ---------- Affichage ----------

  // 05/12/2026
  String _formaterDate(DateTime date) {
    final jour = date.day.toString().padLeft(2, '0');
    final mois = date.month.toString().padLeft(2, '0');
    return '$jour/$mois/${date.year}';
  }

  // "LL" pour Lucie Loury
  String _initiales() {
    final profil = _profil!;
    final prenom = profil.firstName ?? '';
    final nom = profil.name;
    return '${prenom.isEmpty ? '' : prenom[0]}${nom.isEmpty ? '' : nom[0]}'
        .toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return MainLayout(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 130, 16, 130),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'PARAMÈTRES',
              style: TextStyle(
                color: _jaune,
                fontSize: 32,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 24),
            if (_chargementProfil)
              const Center(child: CircularProgressIndicator())
            else if (_erreurProfil != null)
              Center(
                child: Column(
                  children: [
                    Text(
                      _erreurProfil!,
                      style: const TextStyle(color: Colors.white),
                    ),
                    TextButton(
                      onPressed: _chargerProfil,
                      child: const Text('Réessayer'),
                    ),
                  ],
                ),
              )
            else if (_profil != null) ...[
              _enTete(),
              const SizedBox(height: 32),
              _titreSection('PROFIL'),
              _carte([
                _ligne(
                  icone: Icons.person_outline,
                  titre: 'Prénom',
                  valeur: _profil!.firstName ?? 'Non renseigné',
                  onTap: _enregistrementProfil ? null : _modifierPrenom,
                ),
                _ligne(
                  icone: Icons.person_outline,
                  titre: 'Nom',
                  valeur: _profil!.name,
                  onTap: _enregistrementProfil ? null : _modifierNom,
                ),
                _ligne(
                  icone: Icons.mail_outline,
                  titre: 'Adresse mail',
                  valeur: _profil!.email,
                  onTap: _enregistrementProfil ? null : _modifierMail,
                ),
                _ligne(
                  icone: Icons.badge_outlined,
                  titre: 'Pronom',
                  valeur: _profil!.pronoun.toString(),
                  onTap: _enregistrementProfil ? null : _modifierPronom,
                ),
                _ligne(
                  icone: Icons.phone_outlined,
                  titre: 'Téléphone',
                  valeur: _profil!.phoneNumber?.isNotEmpty == true
                      ? _profil!.phoneNumber!
                      : 'Non renseigné',
                  onTap: _enregistrementProfil ? null : _modifierTel,
                ),
                _ligne(
                  icone: Icons.cake_outlined,
                  titre: 'Date de naissance',
                  valeur: _profil!.birthday == null
                      ? 'Non renseignée'
                      : _formaterDate(_profil!.birthday!),
                  onTap: _enregistrementProfil ? null : _modifierDateNaissance,
                ),
                _ligne(
                  icone: Icons.shield_outlined,
                  titre: 'Rôle',
                  valeur: _profil!.role.toString(),
                ),
              ]),
            ],
            const SizedBox(height: 32),

            _titreSection('NOTIFICATIONS'),
            _carte([
              _interrupteur(
                titre: 'Nouveaux messages',
                valeur: _notifMessages,
                onChanged: (v) => setState(() => _notifMessages = v),
              ),
              _interrupteur(
                titre: 'Rappels d\'évènements',
                valeur: _notifEvenements,
                onChanged: (v) => setState(() => _notifEvenements = v),
              ),
            ]),
            const SizedBox(height: 32),

            _titreSection('COMPTE'),
            _carte([
              ListTile(
                onTap: _seDeconnecter,
                leading: const Icon(Icons.logout, color: Colors.white),
                title: const Text(
                  'Se déconnecter',
                  style: TextStyle(color: Colors.white),
                ),
              ),
              ListTile(
                onTap: _changementMotDePasse ? null : _modifierMotDePasse,
                leading: const Icon(Icons.lock_reset, color: Colors.white),
                title: const Text(
                  'Changer mon mot de passe',
                  style: TextStyle(color: Colors.white),
                ),
              ),
              ListTile(
                onTap: _supprimerCompte,
                leading: const Icon(
                  Icons.delete_forever,
                  color: Colors.redAccent,
                ),
                title: const Text(
                  'Supprimer mon compte',
                  style: TextStyle(color: Colors.redAccent),
                ),
              ),
            ]),
          ],
        ),
      ),
    );
  }

  // Photo ronde (un clic change la photo) + nom complet
  Widget _enTete() {
    return Center(
      child: Column(
        children: [
          InkWell(
            customBorder: const CircleBorder(),
            onTap: _choisirPhoto,
            child: Stack(
              children: [
                CircleAvatar(
                  radius: 48,
                  backgroundColor: Colors.white24,
                  backgroundImage: _photo != null ? MemoryImage(_photo!) : null,
                  child: _photo == null
                      ? Text(
                          _initiales(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        )
                      : null,
                ),
                // Petit appareil photo en bas à droite
                const Positioned(
                  right: 0,
                  bottom: 0,
                  child: CircleAvatar(
                    radius: 16,
                    backgroundColor: _jaune,
                    child: Icon(
                      Icons.camera_alt,
                      size: 16,
                      color: Colors.black,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '${_profil!.firstName ?? ''} ${_profil!.name}'.trim(),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  // Titre jaune d'une section
  Widget _titreSection(String texte) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        texte,
        style: const TextStyle(
          color: _jaune,
          fontWeight: FontWeight.bold,
          fontSize: 13,
        ),
      ),
    );
  }

  // Carte arrondie qui regroupe des lignes, avec un trait entre chacune
  Widget _carte(List<Widget> lignes) {
    return Material(
      color: Colors.white10,
      borderRadius: BorderRadius.circular(16),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          for (int i = 0; i < lignes.length; i++) ...[
            if (i > 0) const Divider(height: 1, color: Colors.white12),
            lignes[i],
          ],
        ],
      ),
    );
  }

  // Une ligne d'information (modifiable si onTap est donné)
  Widget _ligne({
    required IconData icone,
    required String titre,
    required String valeur,
    VoidCallback? onTap,
  }) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icone, color: Colors.white54),
      title: Text(
        titre,
        style: const TextStyle(color: Colors.white54, fontSize: 12),
      ),
      subtitle: Text(
        valeur,
        style: const TextStyle(color: Colors.white, fontSize: 16),
      ),
      trailing: onTap == null
          ? null
          : const Icon(Icons.chevron_right, color: Colors.white38),
    );
  }

  // Une ligne avec un interrupteur
  Widget _interrupteur({
    required String titre,
    required bool valeur,
    required ValueChanged<bool> onChanged,
  }) {
    return SwitchListTile(
      value: valeur,
      onChanged: onChanged,
      activeThumbColor: _jaune,
      title: Text(titre, style: const TextStyle(color: Colors.white)),
    );
  }
}

// Popup avec un champ de texte (garde son propre controller)
class _ChampTexteDialog extends StatefulWidget {
  const _ChampTexteDialog({
    required this.titre,
    required this.valeur,
    this.clavier,
  });

  final String titre;
  final String valeur;
  final TextInputType? clavier;

  @override
  State<_ChampTexteDialog> createState() => _ChampTexteDialogState();
}

class _ChampTexteDialogState extends State<_ChampTexteDialog> {
  late final TextEditingController _ctrl = TextEditingController(
    text: widget.valeur,
  );

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: _fondPopup,
      title: Text(widget.titre, style: const TextStyle(color: Colors.white)),
      content: TextField(
        controller: _ctrl,
        autofocus: true,
        keyboardType: widget.clavier,
        style: const TextStyle(color: Colors.white),
        cursorColor: Colors.white,
        decoration: InputDecoration(
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
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          style: TextButton.styleFrom(foregroundColor: Colors.white70),
          child: const Text('Annuler'),
        ),
        FilledButton(
          onPressed: () => Navigator.pop(context, _ctrl.text.trim()),
          style: FilledButton.styleFrom(
            backgroundColor: _jaune,
            foregroundColor: Colors.black,
          ),
          child: const Text('Enregistrer'),
        ),
      ],
    );
  }
}

class _ChangerMotDePasseDialog extends StatefulWidget {
  const _ChangerMotDePasseDialog();

  @override
  State<_ChangerMotDePasseDialog> createState() =>
      _ChangerMotDePasseDialogState();
}

class _ChangerMotDePasseDialogState extends State<_ChangerMotDePasseDialog> {
  final _formKey = GlobalKey<FormState>();
  final _ancienMotDePasse = TextEditingController();
  final _nouveauMotDePasse = TextEditingController();
  final _confirmation = TextEditingController();

  @override
  void dispose() {
    _ancienMotDePasse.dispose();
    _nouveauMotDePasse.dispose();
    _confirmation.dispose();
    super.dispose();
  }

  void _soumettre() {
    if (!_formKey.currentState!.validate()) return;
    Navigator.pop(context, (
      ancien: _ancienMotDePasse.text,
      nouveau: _nouveauMotDePasse.text,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: _fondPopup,
      title: const Text(
        'Changer mon mot de passe',
        style: TextStyle(color: Colors.white),
      ),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _champMotDePasse(
              controller: _ancienMotDePasse,
              label: 'Ancien mot de passe',
            ),
            const SizedBox(height: 12),
            _champMotDePasse(
              controller: _nouveauMotDePasse,
              label: 'Nouveau mot de passe',
            ),
            const SizedBox(height: 12),
            _champMotDePasse(
              controller: _confirmation,
              label: 'Confirmer le nouveau mot de passe',
              validator: (valeur) {
                if (valeur == null || valeur.isEmpty) {
                  return 'Veuillez confirmer le nouveau mot de passe.';
                }
                if (valeur != _nouveauMotDePasse.text) {
                  return 'Les mots de passe ne correspondent pas.';
                }
                return null;
              },
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          style: TextButton.styleFrom(foregroundColor: Colors.white70),
          child: const Text('Annuler'),
        ),
        FilledButton(
          onPressed: _soumettre,
          style: FilledButton.styleFrom(
            backgroundColor: _jaune,
            foregroundColor: Colors.black,
          ),
          child: const Text('Enregistrer'),
        ),
      ],
    );
  }

  Widget _champMotDePasse({
    required TextEditingController controller,
    required String label,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: true,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white70),
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
      validator:
          validator ??
          (valeur) => valeur == null || valeur.isEmpty
              ? 'Ce champ est obligatoire.'
              : null,
    );
  }
}
