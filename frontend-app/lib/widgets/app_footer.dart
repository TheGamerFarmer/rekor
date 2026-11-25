import 'package:flutter/material.dart';
import 'package:frontend_app/mobile_pages/home_page.dart';
import 'package:frontend_app/mobile_pages/groupe.dart';

// Footer de l'application mobile avec lien vers Accueil, Menu et Discussions
class AppFooter extends StatelessWidget {
  final VoidCallback onMenuTap;
  const AppFooter({super.key, required this.onMenuTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.black,
        border: Border.all(color: Colors.white, width: 2),
        borderRadius: BorderRadius.circular(15),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        // Les 3 boutons (Accueil, Menu, Discussions)
        children: [
          //Accueil
          _buildFooterButton(
            label: 'Accueil',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const MyHomePage(title: 'Accueil'),
                ),
              );
            },
          ),
          // Bouton Menu
          _buildFooterButton(label: 'Menu', onTap: onMenuTap),
          // Bouton Discussions
          _buildFooterButton(
            label: 'Discussions',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const GroupesPage()),
              );
            },
          ),
        ],
      ),
    );
  }
}

Widget _buildFooterButton({
  required String label,
  required VoidCallback onTap,
}) {
  return Semantics(
    button: true,
    label: label,
    child: ExcludeSemantics(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: ConstrainedBox(
            constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
            child: Center(
              child: Text(label, style: const TextStyle(color: Colors.white)),
            ),
          ),
        ),
      ),
    ),
  );
}
