import 'package:flutter/material.dart';

import '../layouts/main_layout.dart';
import '../../convoiturage.dart';

class CreationCovoituragePage extends StatefulWidget {
  const CreationCovoituragePage({super.key});

  @override
  State<CreationCovoituragePage> createState() =>
      _CreationCovoituragePageState();
}

class _CreationCovoituragePageState extends State<CreationCovoituragePage> {
  final Color jaune = const Color(0xFFFFDA1A);

  // Contrôleurs des champs texte
  final TextEditingController _lieuDepartCtrl = TextEditingController();
  final TextEditingController _lieuArriveeCtrl = TextEditingController();
  final TextEditingController _heureDepartCtrl = TextEditingController();
  final TextEditingController _heureArriveeCtrl = TextEditingController();

  // Valeurs des listes déroulantes
  String? _evenement;
  String _carburant = 'ESSENCE SP95';
  int _places = 1;

  // Case d'assurance
  bool _assuranceCochee = false;

  // Listes de choix (à remplacer par tes vraies données)
  final List<String> _evenements = ['Match1', 'Match2'];
  final List<String> _carburants = [
    'ESSENCE SP95',
    'ESSENCE SP98',
    'DIESEL',
    'GPL',
    'ÉLECTRIQUE',
  ];
  final List<int> _nombresPlaces = [1, 2, 3, 4, 5, 6];

  @override
  void dispose() {
    _lieuDepartCtrl.dispose();
    _lieuArriveeCtrl.dispose();
    _heureDepartCtrl.dispose();
    _heureArriveeCtrl.dispose();
    super.dispose();
  }

  void _valider() {
    if (!_assuranceCochee) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Merci de certifier l’assurance du véhicule.'),
        ),
      );
      return;
    }

    // Vérifie que les champs importants sont remplis
    if (_lieuDepartCtrl.text.trim().isEmpty ||
        _lieuArriveeCtrl.text.trim().isEmpty ||
        _heureDepartCtrl.text.isEmpty ||
        _heureArriveeCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Merci de remplir tous les champs.')),
      );
      return;
    }

    final nouveau = Covoiturage(
      evenement: _evenement,
      lieuDepart: _lieuDepartCtrl.text.trim(),
      lieuArrivee: _lieuArriveeCtrl.text.trim(),
      heureDepart: _heureDepartCtrl.text,
      heureArrivee: _heureArriveeCtrl.text,
      carburant: _carburant,
      placesDisponibles: _places,
      conducteur: 'Moi',
      date: DateTime.now(),
    );

    // On renvoie le covoiturage à la page précédente
    Navigator.pop(context, nouveau);
  }

  // Ouvre le sélecteur d'heure et écrit le résultat dans le champ
  Future<void> _choisirHeure(TextEditingController controller) async {
    final TimeOfDay? heure = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
      initialEntryMode: TimePickerEntryMode.input,
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: ColorScheme.dark(
              primary: jaune,
              onPrimary: Colors.black,
              surface: const Color(0xFF1E1E1E),
              onSurface: Colors.white,
            ),
          ),
          child: MediaQuery(
            data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
            child: child!,
          ),
        );
      },
    );

    if (heure != null) {
      controller.text =
          '${heure.hour.toString().padLeft(2, '0')}:${heure.minute.toString().padLeft(2, '0')}';
    }
  }

  void _annuler() {
    Navigator.maybePop(context);
  }

  @override
  Widget build(BuildContext context) {
    return MainLayout(
      child: SingleChildScrollView(
        child: Padding(
          // gauche, haut, droite, bas
          padding: const EdgeInsets.fromLTRB(20, 40, 20, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // TITRE
              SizedBox(height: 130),
              Text(
                'COVOITURAGE',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: jaune,
                ),
              ),

              const SizedBox(height: 25),

              // BOUTONS DE NAVIGATION (identiques à la page covoiturage)
              Wrap(
                spacing: 10,
                runSpacing: 10,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  _boutonNavigation('TOUT'),
                  _boutonNavigation('MES COVOITURAGES'),
                  OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      backgroundColor: const Color(0xFF333333),
                      foregroundColor: Colors.white,
                      side: BorderSide(color: jaune, width: 1),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(40),
                      ),
                      padding: const EdgeInsets.all(10),
                      minimumSize: const Size(45, 45),
                    ),
                    child: Icon(Icons.add, color: jaune, size: 24),
                  ),
                ],
              ),

              const SizedBox(height: 25),

              // TITRE DU FORMULAIRE
              Text(
                'Créer un covoiturage',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: jaune,
                ),
              ),
              const Divider(color: Color(0xFF444444), height: 12),

              const SizedBox(height: 10),

              // CHAMPS DU FORMULAIRE
              _ligne(
                'Évènement correspondant :',
                _listeDeroulante<String>(
                  valeur: _evenement,
                  items: _evenements,
                  indice: 'choisir un évènement',
                  onChanged: (v) => setState(() => _evenement = v),
                ),
              ),

              _ligne(
                'Lieu de départ :',
                _champTexte(_lieuDepartCtrl, 'insérer un texte'),
              ),

              _ligne(
                'Lieu d’arriver :',
                _champTexte(_lieuArriveeCtrl, 'insérer un texte'),
              ),

              _ligne(
                'Heure de départ :',
                _champTexte(
                  _heureDepartCtrl,
                  'HH:MM',
                  lectureSeule: true,
                  onTap: () => _choisirHeure(_heureDepartCtrl),
                ),
              ),

              _ligne(
                'Heure d’arriver :',
                _champTexte(
                  _heureArriveeCtrl,
                  'HH:MM',
                  lectureSeule: true,
                  onTap: () => _choisirHeure(_heureArriveeCtrl),
                ),
              ),

              const SizedBox(height: 6),

              _ligne(
                'Type de carburant :',
                _listeDeroulante<String>(
                  valeur: _carburant,
                  items: _carburants,
                  rempli: true,
                  onChanged: (v) => setState(() => _carburant = v!),
                ),
              ),

              _ligne(
                'Nombre de place(s) disponible(s) :',
                _listeDeroulante<int>(
                  valeur: _places,
                  items: _nombresPlaces,
                  rempli: true,
                  onChanged: (v) => setState(() => _places = v!),
                ),
                flexLabel: 6,
                flexChamp: 3,
              ),

              const SizedBox(height: 8),

              // CASE D'ASSURANCE
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: Checkbox(
                      value: _assuranceCochee,
                      onChanged: (v) =>
                          setState(() => _assuranceCochee = v ?? false),
                      activeColor: jaune,
                      checkColor: Colors.black,
                      side: const BorderSide(color: Colors.white, width: 1),
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Expanded(
                    child: Text(
                      'En cochant cette case, je certifie que le véhicule '
                      'utilisé pour le covoiturage est couvert par une '
                      'assurance valide et que mes passagers sont assurés en '
                      'cas d’accident, conformément aux garanties de mon '
                      'contrat d’assurance.',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 9,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 25),

              // BOUTONS ANNULER / VALIDER
              Align(
                alignment: Alignment.centerRight,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _boutonAction('ANNULER', _annuler),
                    const SizedBox(width: 8),
                    _boutonAction('VALIDER', _valider),
                  ],
                ),
              ),

              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  // ---------- WIDGETS RÉUTILISABLES ----------

  // Bouton arrondi du haut (TOUT, MES COVOITURAGES)
  Widget _boutonNavigation(String texte) {
    return OutlinedButton(
      onPressed: () {},
      style: OutlinedButton.styleFrom(
        foregroundColor: Colors.white,
        side: const BorderSide(color: Colors.white, width: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(40)),
      ),
      child: Text(texte, style: const TextStyle(fontFamily: 'Poppins')),
    );
  }

  // Une ligne du formulaire : texte à gauche, champ à droite
  Widget _ligne(
    String label,
    Widget champ, {
    int flexLabel = 5,
    int flexChamp = 6,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        children: [
          Expanded(
            flex: flexLabel,
            child: Text(
              label,
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 13,
                color: Colors.white,
              ),
            ),
          ),
          Expanded(flex: flexChamp, child: champ),
        ],
      ),
    );
  }

  // Champ texte arrondi
  Widget _champTexte(
    TextEditingController controller,
    String indice, {
    bool lectureSeule = false,
    VoidCallback? onTap,
  }) {
    final bordure = OutlineInputBorder(
      borderRadius: BorderRadius.circular(20),
      borderSide: const BorderSide(color: Colors.white, width: 1),
    );

    return SizedBox(
      height: 34,
      child: TextField(
        controller: controller,
        readOnly: lectureSeule,
        onTap: onTap,
        style: const TextStyle(
          fontFamily: 'Poppins',
          fontSize: 12,
          color: Colors.white,
        ),
        decoration: InputDecoration(
          hintText: indice,
          hintStyle: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 12,
            color: Color(0xFF999999),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 12),
          enabledBorder: bordure,
          focusedBorder: bordure.copyWith(
            borderSide: BorderSide(color: jaune, width: 1),
          ),
        ),
      ),
    );
  }

  // Liste déroulante arrondie
  // rempli = true -> fond noir + texte en gras (carburant, places)
  Widget _listeDeroulante<T>({
    required T? valeur,
    required List<T> items,
    required ValueChanged<T?> onChanged,
    String? indice,
    bool rempli = false,
  }) {
    return Container(
      height: 34,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: rempli ? Colors.black : Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white, width: 1),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          value: valeur,
          isExpanded: true,
          dropdownColor: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(20),
          elevation: 8,
          menuMaxHeight: 260,
          icon: const Icon(
            Icons.keyboard_arrow_down,
            color: Colors.white,
            size: 20,
          ),
          hint: indice == null
              ? null
              : Text(
                  indice,
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 12,
                    color: Color(0xFF999999),
                  ),
                ),
          style: TextStyle(
            fontFamily: 'Poppins',
            fontSize: 11,
            fontWeight: rempli ? FontWeight.bold : FontWeight.normal,
            color: Colors.white,
          ),
          // Ce qui s'affiche dans le champ fermé
          selectedItemBuilder: (context) => items
              .map(
                (e) => Align(
                  alignment: rempli ? Alignment.center : Alignment.centerLeft,
                  child: Text(
                    e.toString(),
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
              )
              .toList(),
          // Ce qui s'affiche dans la liste ouverte
          items: items.map((e) {
            final bool selectionne = e == valeur;
            return DropdownMenuItem<T>(
              value: e,
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      e.toString(),
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 12,
                        fontWeight: selectionne
                            ? FontWeight.bold
                            : FontWeight.normal,
                        color: selectionne ? jaune : Colors.white,
                      ),
                    ),
                  ),
                  if (selectionne) Icon(Icons.check, color: jaune, size: 16),
                ],
              ),
            );
          }).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }

  // Petit bouton ANNULER / VALIDER
  Widget _boutonAction(String texte, VoidCallback onPressed) {
    return SizedBox(
      height: 30,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: Colors.white,
          side: const BorderSide(color: Colors.white, width: 1),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 14),
        ),
        child: Text(
          texte,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 9,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
