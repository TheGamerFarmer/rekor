import 'package:flutter/material.dart';

import '../layouts/main_layout.dart';
import '../../listevenement.dart';
import '../../evenement_liste_card.dart';
import 'evenement_detail_page.dart';

class Evenementpage extends StatefulWidget {
  const Evenementpage({super.key});

  @override
  State<Evenementpage> createState() => _EvenementpageState();
}

class _EvenementpageState extends State<Evenementpage> {
  final Color jaune = const Color(0xFFFFDA1A);

  static const _mois = [
    'janv.',
    'févr.',
    'mars',
    'avr.',
    'mai',
    'juin',
    'juil.',
    'août',
    'sept.',
    'oct.',
    'nov.',
    'déc.',
  ];

  // Types d'évènements du carrousel
  static const _types = [
    'Entraînement',
    'Match amical',
    'Match compétition',
    'Réunion',
    'Autres',
  ];

  static const _optionsTri = ['Type', 'Date croissante', 'Date décroissante'];

  String _tri = 'Date croissante';
  bool _afficherTermines = false; // false = À venir, true = Terminés

  final List<Evenement> _evenements = [
    Evenement(
      nom: 'Match amical',
      type: 'Match amical',
      dateTime: DateTime(2026, 10, 20, 20, 0), // passé → Terminés
      date: '20 oct.',
      heureDebut: '18:00',
      heureFin: '20:00',
      lieu: 'Gymnase Jean Moulin',
      ville: 'Grenoble',
      equipe1: 'Les Aigles',
      equipe2: 'Les Lions',
      arbitre: 'Paul Martin',
      presents: ['Alice', 'Bob', 'Chloé'],
      absents: ['David'],
    ),
    Evenement(
      nom: 'Match amical',
      type: 'Match amical',
      dateTime: DateTime(2026, 12, 15, 20, 0), // futur → À venir
      date: '15 déc.',
      heureDebut: '18:00',
      heureFin: '20:00',
      lieu: 'Gymnase Jean Moulin',
      ville: 'Grenoble',
      equipe1: 'Les Aigles',
      equipe2: 'Les Tigres',
      arbitre: 'Sophie Durand',
      presents: ['Alice', 'Bob'],
      absents: ['Chloé', 'David'],
    ),
    Evenement(
      nom: 'Réunion',
      type: 'Réunion',
      description: 'Bilan de la saison et préparation du prochain tournoi.',
      dateTime: DateTime(2026, 11, 5, 19, 0), // passé → Terminés
      date: '5 nov.',
      heureDebut: '18:00',
      heureFin: '19:00',
      lieu: 'Salle des fêtes',
      ville: 'Grenoble',
      equipe1: '',
      equipe2: '',
      arbitre: '',
      presents: ['Alice', 'Bob', 'Chloé'],
      absents: ['David'],
    ),
  ];

  // ---------- TRI ----------

  List<Evenement> _trier(List<Evenement> liste) {
    switch (_tri) {
      case 'Date décroissante':
        liste.sort((a, b) => b.dateTime.compareTo(a.dateTime));
        break;
      case 'Type':
        liste.sort((a, b) {
          final c = a.type.compareTo(b.type);
          return c != 0 ? c : a.dateTime.compareTo(b.dateTime);
        });
        break;
      default: // Date croissante
        liste.sort((a, b) => a.dateTime.compareTo(b.dateTime));
    }
    return liste;
  }

  // ---------- PAGE ----------

  @override
  Widget build(BuildContext context) {
    final liste = _trier(
      _evenements.where((e) => e.estTermine == _afficherTermines).toList(),
    );

    return MainLayout(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 40, 20, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 130),

              // TITRE
              Text(
                'ÉVÈNEMENTS',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: jaune,
                ),
              ),

              const SizedBox(height: 20),

              // ONGLETS
              Row(
                children: [
                  _onglet(
                    'À venir',
                    !_afficherTermines,
                    () => setState(() => _afficherTermines = false),
                  ),
                  const SizedBox(width: 10),
                  _onglet(
                    'Terminés',
                    _afficherTermines,
                    () => setState(() => _afficherTermines = true),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // TRI + BOUTON +
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  PopupMenuButton<String>(
                    color: const Color(0xFF1E1E1E),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    onSelected: (valeur) => setState(() => _tri = valeur),
                    itemBuilder: (_) => _optionsTri.map((option) {
                      final selectionne = option == _tri;
                      return PopupMenuItem<String>(
                        value: option,
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                option,
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
                            if (selectionne)
                              Icon(Icons.check, color: jaune, size: 16),
                          ],
                        ),
                      );
                    }).toList(),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white),
                      ),
                      child: Icon(Icons.sort, color: jaune, size: 24),
                    ),
                  ),
                  OutlinedButton(
                    onPressed: _ajouterEvenement,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white),
                      shape: const CircleBorder(),
                      padding: const EdgeInsets.all(12),
                    ),
                    child: const Icon(Icons.add),
                  ),
                ],
              ),

              const SizedBox(height: 15),

              // LISTE DE L'ONGLET CHOISI
              if (liste.isEmpty)
                Text(
                  _afficherTermines
                      ? 'Aucun événement terminé.'
                      : 'Aucun événement à venir.',
                  style: const TextStyle(color: Colors.white70),
                )
              else
                ...liste.map(_carte),
            ],
          ),
        ),
      ),
    );
  }

  // ---------- LISTE ----------

  Widget _carte(Evenement evenement) {
    return EvenementListeCard(
      evenement: evenement,
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => EvenementDetailPage(
              evenement: evenement,
              onModifier: _modifierEvenement,
            ),
          ),
        );
      },
    );
  }

  // ONGLET (jaune quand il est actif)
  Widget _onglet(String titre, bool actif, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        decoration: BoxDecoration(
          color: actif ? jaune : Colors.transparent,
          border: Border.all(color: actif ? jaune : Colors.white70),
          borderRadius: BorderRadius.circular(30),
        ),
        child: Text(
          titre,
          style: TextStyle(
            fontFamily: 'Poppins',
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: actif ? Colors.black : Colors.white,
          ),
        ),
      ),
    );
  }

  // ---------- AJOUT / MODIFICATION ----------

  String _formatHeure(TimeOfDay t) =>
      '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';

  // Calendrier et horloge en jaune / noir
  Widget _themeSombre(BuildContext context, Widget? child) {
    return Theme(
      data: ThemeData.dark().copyWith(
        colorScheme: ColorScheme.dark(
          primary: jaune,
          onPrimary: Colors.black,
          surface: const Color(0xFF1E1E1E),
          onSurface: Colors.white,
        ),
        datePickerTheme: DatePickerThemeData(
          backgroundColor: const Color(0xFF1E1E1E),
          headerBackgroundColor: jaune,
          headerForegroundColor: Colors.black,
          todayForegroundColor: WidgetStatePropertyAll(jaune),
          todayBorder: BorderSide(color: jaune),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(foregroundColor: jaune),
        ),
      ),
      child: MediaQuery(
        data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
        child: child!,
      ),
    );
  }

  // Bouton +
  Future<void> _ajouterEvenement() async {
    final nouveau = await _formulaire();
    if (nouveau != null) {
      setState(() => _evenements.add(nouveau));
    }
  }

  // Bouton MODIFIER (page détails)
  Future<Evenement?> _modifierEvenement(Evenement ancien) async {
    final modifie = await _formulaire(existant: ancien);
    if (modifie == null) return null;

    setState(() {
      final i = _evenements.indexOf(ancien);
      if (i != -1) _evenements[i] = modifie;
    });
    return modifie;
  }

  // Formulaire commun : création (existant == null) ou modification
  Future<Evenement?> _formulaire({Evenement? existant}) async {
    final modif = existant != null;

    TimeOfDay? lireHeure(String h) {
      final p = h.split(':');
      if (p.length != 2) return null;
      final heure = int.tryParse(p[0]);
      final minute = int.tryParse(p[1]);
      if (heure == null || minute == null) return null;
      return TimeOfDay(hour: heure, minute: minute);
    }

    final nomCtrl = TextEditingController(
      text: (existant != null && existant.type == 'Autres') ? existant.nom : '',
    );
    final descriptionCtrl = TextEditingController(
      text: existant?.description ?? '',
    );
    final equipe1Ctrl = TextEditingController(text: existant?.equipe1 ?? '');
    final equipe2Ctrl = TextEditingController(text: existant?.equipe2 ?? '');
    final lieuCtrl = TextEditingController(text: existant?.lieu ?? '');
    final villeCtrl = TextEditingController(text: existant?.ville ?? '');
    final arbitreCtrl = TextEditingController(text: existant?.arbitre ?? '');
    final dateCtrl = TextEditingController();
    final debutCtrl = TextEditingController(text: existant?.heureDebut ?? '');
    final finCtrl = TextEditingController(text: existant?.heureFin ?? '');

    int typeIndex = existant != null ? _types.indexOf(existant.type) : 0;
    if (typeIndex < 0) typeIndex = 0;

    final pageCtrl = PageController(
      viewportFraction: 0.55,
      initialPage: typeIndex,
    );

    DateTime? date;
    TimeOfDay? debut;
    TimeOfDay? fin;

    if (existant != null) {
      final dt = existant.dateTime;
      date = DateTime(dt.year, dt.month, dt.day);
      dateCtrl.text = '${dt.day} ${_mois[dt.month - 1]} ${dt.year}';
      debut = lireHeure(existant.heureDebut);
      fin = lireHeure(existant.heureFin);
    }

    return showModalBottomSheet<Evenement>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF303030),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModal) {
            final type = _types[typeIndex];
            final estMatch =
                type == 'Match amical' || type == 'Match compétition';
            final aDescription = type == 'Réunion' || type == 'Autres';
            final aNom = type == 'Autres';

            return Padding(
              padding: EdgeInsets.fromLTRB(
                20,
                20,
                20,
                MediaQuery.of(ctx).viewInsets.bottom + 20,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      modif ? 'Modifier l’évènement' : 'Créer un évènement',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: jaune,
                      ),
                    ),
                    const Divider(color: Color(0xFF444444), height: 12),
                    const SizedBox(height: 10),

                    // CARROUSEL DES TYPES
                    const Text(
                      'Type d’évènement :',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 13,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        IconButton(
                          visualDensity: VisualDensity.compact,
                          icon: Icon(Icons.chevron_left, color: jaune),
                          onPressed: typeIndex == 0
                              ? null
                              : () => pageCtrl.previousPage(
                                  duration: const Duration(milliseconds: 250),
                                  curve: Curves.easeInOut,
                                ),
                        ),
                        Expanded(
                          child: SizedBox(
                            height: 36,
                            child: PageView.builder(
                              controller: pageCtrl,
                              itemCount: _types.length,
                              onPageChanged: (i) =>
                                  setModal(() => typeIndex = i),
                              itemBuilder: (_, i) {
                                final selectionne = i == typeIndex;
                                return GestureDetector(
                                  onTap: () => pageCtrl.animateToPage(
                                    i,
                                    duration: const Duration(milliseconds: 250),
                                    curve: Curves.easeInOut,
                                  ),
                                  child: Container(
                                    margin: const EdgeInsets.symmetric(
                                      horizontal: 4,
                                    ),
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      color: selectionne
                                          ? jaune
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(
                                        color: selectionne
                                            ? jaune
                                            : Colors.white54,
                                      ),
                                    ),
                                    child: Text(
                                      _types[i],
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontFamily: 'Poppins',
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: selectionne
                                            ? Colors.black
                                            : Colors.white70,
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                        IconButton(
                          visualDensity: VisualDensity.compact,
                          icon: Icon(Icons.chevron_right, color: jaune),
                          onPressed: typeIndex == _types.length - 1
                              ? null
                              : () => pageCtrl.nextPage(
                                  duration: const Duration(milliseconds: 250),
                                  curve: Curves.easeInOut,
                                ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 8),

                    // NOM (uniquement pour "Autres")
                    if (aNom)
                      _ligne('Nom :', _champTexte(nomCtrl, 'insérer un texte')),

                    // ÉQUIPES (matchs uniquement)
                    if (estMatch) ...[
                      _ligne(
                        'Équipe 1 :',
                        _champTexte(equipe1Ctrl, 'insérer un texte'),
                      ),
                      _ligne(
                        'Équipe 2 :',
                        _champTexte(equipe2Ctrl, 'insérer un texte'),
                      ),
                    ],

                    _ligne('Lieu :', _champTexte(lieuCtrl, 'insérer un texte')),
                    _ligne(
                      'Ville :',
                      _champTexte(villeCtrl, 'insérer un texte'),
                    ),

                    // ARBITRE (matchs uniquement)
                    if (estMatch)
                      _ligne(
                        'Arbitre :',
                        _champTexte(arbitreCtrl, 'insérer un texte'),
                      ),

                    _ligne(
                      'Date :',
                      _champTexte(
                        dateCtrl,
                        'JJ/MM/AAAA',
                        lectureSeule: true,
                        onTap: () async {
                          final choix = await showDatePicker(
                            context: ctx,
                            initialDate: date ?? DateTime.now(),
                            firstDate: DateTime(2020),
                            lastDate: DateTime(2100),
                            builder: _themeSombre,
                          );
                          if (choix != null) {
                            date = choix;
                            dateCtrl.text =
                                '${choix.day} ${_mois[choix.month - 1]} ${choix.year}';
                          }
                        },
                      ),
                    ),

                    _ligne(
                      'Heure de début :',
                      _champTexte(
                        debutCtrl,
                        'HH:MM',
                        lectureSeule: true,
                        onTap: () async {
                          final choix = await showTimePicker(
                            context: ctx,
                            initialTime: debut ?? TimeOfDay.now(),
                            initialEntryMode: TimePickerEntryMode.input,
                            builder: _themeSombre,
                          );
                          if (choix != null) {
                            debut = choix;
                            debutCtrl.text = _formatHeure(choix);
                          }
                        },
                      ),
                    ),

                    _ligne(
                      'Heure de fin :',
                      _champTexte(
                        finCtrl,
                        'HH:MM',
                        lectureSeule: true,
                        onTap: () async {
                          final choix = await showTimePicker(
                            context: ctx,
                            initialTime: fin ?? TimeOfDay.now(),
                            initialEntryMode: TimePickerEntryMode.input,
                            builder: _themeSombre,
                          );
                          if (choix != null) {
                            fin = choix;
                            finCtrl.text = _formatHeure(choix);
                          }
                        },
                      ),
                    ),

                    // DESCRIPTION (Réunion et Autres)
                    if (aDescription) ...[
                      const SizedBox(height: 7),
                      const Text(
                        'Description :',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 13,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      _champDescription(descriptionCtrl),
                    ],

                    const SizedBox(height: 20),

                    Align(
                      alignment: Alignment.centerRight,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _boutonAction('ANNULER', () => Navigator.pop(ctx)),
                          const SizedBox(width: 8),
                          _boutonAction(modif ? 'ENREGISTRER' : 'VALIDER', () {
                            final manque =
                                (aNom && nomCtrl.text.trim().isEmpty) ||
                                (estMatch &&
                                    (equipe1Ctrl.text.trim().isEmpty ||
                                        equipe2Ctrl.text.trim().isEmpty)) ||
                                (aDescription &&
                                    descriptionCtrl.text.trim().isEmpty) ||
                                lieuCtrl.text.trim().isEmpty ||
                                date == null ||
                                debut == null ||
                                fin == null;

                            if (manque) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                    'Merci de remplir tous les champs.',
                                  ),
                                ),
                              );
                              return;
                            }

                            final d = date!;
                            Navigator.pop(
                              ctx,
                              Evenement(
                                // "Autres" : nom libre, sinon le nom du type
                                nom: aNom ? nomCtrl.text.trim() : type,
                                type: type,
                                description: aDescription
                                    ? descriptionCtrl.text.trim()
                                    : '',
                                // l'heure de fin sert à savoir si c'est terminé
                                dateTime: DateTime(
                                  d.year,
                                  d.month,
                                  d.day,
                                  fin!.hour,
                                  fin!.minute,
                                ),
                                date: '${d.day} ${_mois[d.month - 1]}',
                                heureDebut: _formatHeure(debut!),
                                heureFin: _formatHeure(fin!),
                                lieu: lieuCtrl.text.trim(),
                                ville: villeCtrl.text.trim(),
                                equipe1: estMatch
                                    ? equipe1Ctrl.text.trim()
                                    : '',
                                equipe2: estMatch
                                    ? equipe2Ctrl.text.trim()
                                    : '',
                                arbitre: estMatch
                                    ? arbitreCtrl.text.trim()
                                    : '',
                                // on garde les réponses existantes
                                presents: List.of(existant?.presents ?? []),
                                absents: List.of(existant?.absents ?? []),
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  // ---------- WIDGETS RÉUTILISABLES (style covoiturage) ----------

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

  // Grand champ pour la description
  Widget _champDescription(TextEditingController controller) {
    final bordure = OutlineInputBorder(
      borderRadius: BorderRadius.circular(20),
      borderSide: const BorderSide(color: Colors.white, width: 1),
    );

    return TextField(
      controller: controller,
      maxLines: 4,
      style: const TextStyle(
        fontFamily: 'Poppins',
        fontSize: 12,
        color: Colors.white,
      ),
      decoration: InputDecoration(
        hintText: 'décrire l’évènement',
        hintStyle: const TextStyle(
          fontFamily: 'Poppins',
          fontSize: 12,
          color: Color(0xFF999999),
        ),
        contentPadding: const EdgeInsets.all(14),
        enabledBorder: bordure,
        focusedBorder: bordure.copyWith(
          borderSide: BorderSide(color: jaune, width: 1),
        ),
      ),
    );
  }

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
