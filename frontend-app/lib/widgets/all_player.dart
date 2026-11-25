import 'package:flutter/material.dart';

class PlayerChip extends StatelessWidget {
  const PlayerChip({
    super.key,
    required this.name,
    required this.selected,
    required this.onTap,
    this.width = 90, // valeur par défaut, donc ton code actuel ne change pas
  });

  final String name;
  final bool selected;
  final VoidCallback onTap;
  final double? width;

  @override
  Widget build(BuildContext context) {
    final color = selected ? const Color(0xFFFFDA1A) : Colors.white;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: width,
        padding: EdgeInsets.symmetric(
          vertical: 10,
          horizontal: width == null ? 18 : 0,
        ),
        alignment: width != null ? Alignment.center : null,
        decoration: BoxDecoration(
          border: Border.all(color: color),
          borderRadius: BorderRadius.circular(30),
        ),
        child: Text(name, style: TextStyle(color: color, fontSize: 14)),
      ),
    );
  }
}
