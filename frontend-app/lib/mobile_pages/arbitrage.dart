import 'package:flutter/material.dart';

import '../layouts/main_layout.dart';

import 'dart:async';
import 'dart:math';

import '../models/stat_event.dart';
import '../widgets/all_player.dart';
import '../widgets/team_score.dart';

class ArbitragePage extends StatefulWidget {
  const ArbitragePage({super.key});

  @override
  State<ArbitragePage> createState() => _ArbitragePageState();
}

class _ArbitragePageState extends State<ArbitragePage> {
  //Les variables

  //Liste des matchs
  final List<String> _matchs = [
    'Match amical : Grenoble Volley/Lyon Volley-Club du 3/10/26',
    'Match amical : Grenoble Volley/Annecy du 10/10/26',
  ];

  //Liste des sets (maximum 5)
  final List<String> _sets = [
    'SET N°1',
    'SET N°2',
    'SET N°3',
    'SET N°4',
    'SET N°5',
  ];

  //Liste des joueurs présent au match
  final List<String> _allPlayers = [
    'LUCIE',
    'CAMILLE',
    'LEO',
    'MARC',
    'LOLA',
    'CARL',
    'EMMA',
    'HUGO',
  ];

  //Liste des joueurs jouant au set
  List<String> _setPlayers = [
    'LUCIE',
    'CAMILLE',
    'LEO',
    'MARC',
    'LOLA',
    'CARL',
  ];

  //Joueur séléctionné par l'arbitre
  String? _selectedPlayer = 'LUCIE';

  //Les types d'action
  final List<String> _actions = [
    'SERVICE REUSSI',
    'SERVICE RATER',
    'SERVICE ACE',
    'ATTAQUE REUSSITE',
    'ATTAQUE RATER',
  ];

  //Action séléctionné par l'arbitre
  String? _selectedAction;

  //Les événements représentant le résumé
  final List<StatEvent> _events = [];

  //Match et set séléctionné
  String? _selectedMatch;
  String? _selectedSet;

  //Gestion du temps
  Timer? _timer;
  int _seconds = 0;
  bool _isRunning = false;

  //Score total du match
  int _scoreHome = 0;
  int _scoreAway = 0;

  //Score du set
  int _setsHome = 0;
  int _setsAway = 0;

  //Numéro du set-1
  int _nbrSet = 0;

  //Les fonctions
  @override
  void initState() {
    super.initState();
    _selectedSet = _sets[_nbrSet];
  }

  //Gestion du temps
  void _startTimer() {
    //évite le double temps
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _seconds++);
    });
  }

  //Gestion du bouton pause ou marche
  void _togglePause() {
    setState(() {
      if (_isRunning) {
        _timer?.cancel();
      } else {
        _startTimer();
      }
      _isRunning = !_isRunning;
    });
  }

  //Format du temps
  String _format(int totalSeconds) {
    final m = (totalSeconds ~/ 60).toString().padLeft(2, '0');
    final s = (totalSeconds % 60).toString().padLeft(2, '0');
    return "$m'$s";
  }

  String get _formattedTime => _format(_seconds);

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  //Calcul du Set courrant
  int get _currentSetNumber => _setsHome + _setsAway + 1;
  //Verification de qui gagne (pour la base)
  int get _pointsToWin => _currentSetNumber == 5 ? 15 : 25;

  //Avec les règles plus complexe
  bool get _isSetOver {
    final best = max(_scoreHome, _scoreAway);
    final diff = (_scoreHome - _scoreAway).abs();
    return best >= _pointsToWin && diff >= 2;
  }

  bool get _isMatchOver => _setsHome == 3 || _setsAway == 3;

  void _finishSet() {
    _timer?.cancel();
    setState(() {
      if (_scoreHome > _scoreAway) {
        _setsHome++;
      } else {
        _setsAway++;
      }
      _scoreHome = 0;
      _scoreAway = 0;
      _seconds = 0;
      _isRunning = false;
      _nbrSet++;
      _selectedSet = _sets[_nbrSet];
    });
  }

  void _validateAction() {
    if (_selectedPlayer == null || _selectedAction == null) return;
    setState(() {
      _events.add(
        StatEvent(
          player: _selectedPlayer!,
          action: _selectedAction!,
          seconds: _seconds,
          setNumber: _currentSetNumber,
        ),
      );
      _selectedAction = null;
    });
  }

  Future<void> _pickSetPlayers() async {
    final tmp = Set<String>.from(_setPlayers);

    final result = await showDialog<Set<String>>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: Colors.black87,
          title: Text(
            "Joueurs du set N°$_currentSetNumber",
            style: const TextStyle(color: Color(0xFFFFDA1A)),
          ),
          content: SizedBox(
            width: double.maxFinite,
            child: ListView(
              shrinkWrap: true,
              children: _allPlayers.map((p) {
                final isChecked = tmp.contains(p);
                final limitReached = tmp.length >= 6 && !isChecked;

                return CheckboxListTile(
                  value: isChecked,
                  title: Text(
                    p,
                    style: TextStyle(
                      color: limitReached ? Colors.white38 : Colors.white,
                    ),
                  ),
                  activeColor: const Color(0xFFFFDA1A),
                  checkColor: Colors.black,
                  onChanged: limitReached
                      ? null // null = case désactivée
                      : (checked) => setDialogState(() {
                          if (checked == true) {
                            tmp.add(p);
                          } else {
                            tmp.remove(p);
                          }
                        }),
                );
              }).toList(),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Annuler'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, tmp),
              child: const Text('Valider'),
            ),
          ],
        ),
      ),
    );

    if (result != null) {
      setState(() {
        // where() garde l'ordre de _allPlayers
        _setPlayers = _allPlayers.where(result.contains).toList();
        // si le joueur sélectionné n'est plus dans le set, on change
        if (!_setPlayers.contains(_selectedPlayer)) {
          _selectedPlayer = _setPlayers.isEmpty ? null : _setPlayers.first;
        }
      });
    }
  }

  List<Widget> _buildSummary() {
    final widgets = <Widget>[];

    for (final action in _actions) {
      final list = _events
          .where((e) => e.action == action && e.setNumber == _currentSetNumber)
          .toList();
      if (list.isEmpty) continue; // on n'affiche pas les types sans événement

      widgets.add(
        Padding(
          padding: const EdgeInsets.only(top: 16, bottom: 4),
          child: Text(
            action.toLowerCase(),
            style: const TextStyle(fontSize: 16, color: Colors.white),
          ),
        ),
      );

      for (final e in list) {
        widgets.add(
          Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  children: [
                    const Text('• ', style: TextStyle(color: Colors.white)),
                    Expanded(
                      child: Text(
                        e.player,
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),
                    Text(
                      _format(e.seconds),
                      style: const TextStyle(color: Colors.white),
                    ),
                  ],
                ),
              ),
              const Divider(color: Colors.white24, height: 1),
            ],
          ),
        );
      }
    }
    return widgets;
  }

  @override
  Widget build(BuildContext context) {
    return MainLayout(
      //rend scrollable la page
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 130),
              //Le titre
              const Text(
                'ARBITRAGE',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFFFDA1A),
                ),
              ),
              //Espace entre le titre et le prochain évenement
              const SizedBox(height: 24),

              //Le container de la selection du match
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white),
                  borderRadius: BorderRadius.circular(30),
                ),
                height: 40,
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedMatch,
                    isExpanded: true,
                    hint: const Text(
                      'Sélectionner un match',
                      style: TextStyle(color: Colors.white),
                    ),
                    dropdownColor: Colors.black87,
                    icon: const Icon(
                      Icons.keyboard_arrow_down,
                      color: Colors.white,
                    ),
                    style: const TextStyle(color: Colors.white),
                    items: _matchs
                        .map(
                          (match) => DropdownMenuItem(
                            value: match,
                            child: Text(match, overflow: TextOverflow.ellipsis),
                          ),
                        )
                        .toList(),
                    onChanged: (value) =>
                        setState(() => _selectedMatch = value),
                  ),
                ),
              ),

              //espace entre les elements
              const SizedBox(height: 20),

              //Le conteneur de la selection du set
              Container(
                width: null,
                padding: const EdgeInsets.symmetric(horizontal: 10),
                height: 30,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white),
                  borderRadius: BorderRadius.circular(30),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedSet,
                    isExpanded: false,
                    dropdownColor: Colors.black87,
                    icon: const Icon(
                      Icons.keyboard_arrow_down,
                      color: Colors.white,
                    ),
                    style: const TextStyle(color: Colors.white),
                    items: _sets
                        .map(
                          (set) => DropdownMenuItem(
                            value: set,
                            child: Text(set, overflow: TextOverflow.ellipsis),
                          ),
                        )
                        .toList(),
                    onChanged: (value) => setState(() => _selectedSet = value),
                  ),
                ),
              ),

              //espace entre les elements
              const SizedBox(height: 20),

              //partie du temps
              Container(
                width: null,
                padding: const EdgeInsets.symmetric(horizontal: 10),
                height: 80,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Le temps
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(
                          0x33FFDA1A,
                        ), // jaune à ~20 % d'opacité
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        _formattedTime,
                        style: const TextStyle(
                          fontSize: 40,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFFFDA1A),
                        ),
                      ),
                    ),
                    const SizedBox(width: 24),
                    // Le bouton pause / lecture
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white12,
                        border: Border.all(color: Colors.white54),
                      ),
                      child: IconButton(
                        onPressed: _togglePause,
                        icon: Icon(
                          _isRunning ? Icons.pause : Icons.play_arrow,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              //partie du set
              const Text(
                'Score du set',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFFFDA1A),
                ),
              ),

              const Divider(color: Colors.white24, height: 16),

              Row(
                children: [
                  Expanded(
                    child: TeamScore(
                      name: 'Grenoble Volley',
                      score: _scoreHome,
                      onIncrement: () => setState(() => _scoreHome++),
                      onDecrement: () => setState(() {
                        if (_scoreHome > 0) _scoreHome--;
                      }),
                    ),
                  ),
                  Expanded(
                    child: TeamScore(
                      name: 'Lyon Volley-Club',
                      score: _scoreAway,
                      onIncrement: () => setState(() => _scoreAway++),
                      onDecrement: () => setState(() {
                        if (_scoreAway > 0) _scoreAway--;
                      }),
                    ),
                  ),
                ],
              ),
              ElevatedButton(
                onPressed: _isSetOver && !_isMatchOver ? _finishSet : null,
                child: const Text(
                  'Terminer le set',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFFFDA1A),
                  ),
                ),
              ),
              const Text(
                'Score total',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFFFDA1A),
                ),
              ),
              const Divider(color: Colors.white24, height: 16),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      children: [
                        const Text(
                          'Grenoble Volley',
                          style: TextStyle(fontSize: 12, color: Colors.white),
                        ),
                        Text(
                          '$_setsHome',
                          style: const TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Column(
                      children: [
                        const Text(
                          'Lyon Volley-Club',
                          style: TextStyle(fontSize: 12, color: Colors.white),
                        ),
                        Text(
                          '$_setsAway',
                          style: const TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              //partie du set
              const Text(
                'Statistique Grenoble Volley',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFFFDA1A),
                ),
              ),

              const Divider(color: Colors.white24, height: 16),

              Wrap(
                spacing: 16,
                runSpacing: 12,
                children: [
                  ..._setPlayers.map(
                    (player) => PlayerChip(
                      name: player,
                      selected: player == _selectedPlayer,
                      onTap: () => setState(() => _selectedPlayer = player),
                    ),
                  ),
                  GestureDetector(
                    onTap: _pickSetPlayers,
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white),
                      ),
                      child: const Icon(Icons.add, color: Colors.white),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              const Text(
                'AJOUTER :',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: _actions
                    .map(
                      (action) => PlayerChip(
                        name: action,
                        width: null,
                        selected: action == _selectedAction,
                        onTap: () => setState(() => _selectedAction = action),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  OutlinedButton(
                    onPressed: _selectedAction == null
                        ? null
                        : () => setState(() => _selectedAction = null),
                    child: const Text(
                      'ANNULER',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  OutlinedButton(
                    onPressed:
                        _selectedPlayer != null && _selectedAction != null
                        ? _validateAction
                        : null,
                    child: const Text(
                      'VALIDER',
                      style: TextStyle(color: Color(0xFFFFDA1A)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              const Text(
                'RESUME :',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              ..._buildSummary(),

              const SizedBox(height: 250),
            ],
          ),
        ),
      ),
    );
  }
}
