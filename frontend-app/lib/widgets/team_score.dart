import 'package:flutter/material.dart';

class TeamScore extends StatelessWidget {
  const TeamScore({
    super.key,
    required this.name,
    required this.score,
    required this.onIncrement,
    required this.onDecrement,
  });

  final String name;
  final int score;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(name, style: const TextStyle(fontSize: 12, color: Colors.white)),
        IconButton(
          onPressed: onIncrement,
          icon: const Icon(Icons.keyboard_arrow_up, color: Colors.white),
          visualDensity: VisualDensity.compact,
        ),
        Text(
          '$score',
          style: const TextStyle(
            fontSize: 36,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        IconButton(
          onPressed: onDecrement,
          icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white),
          visualDensity: VisualDensity.compact,
        ),
      ],
    );
  }
}
