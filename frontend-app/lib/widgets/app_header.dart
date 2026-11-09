import 'package:flutter/material.dart';
import 'package:frontend_app/mobile_pages/home_page.dart';

class AppHeader extends StatelessWidget {
  const AppHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Semantics(
            button: true,
            label: 'Accueil',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const MyHomePage(title: 'Accueil'),
                ),
              );
            },
            child: ExcludeSemantics(
              child: InkWell(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const MyHomePage(title: 'Accueil'),
                    ),
                  );
                },
                child: SizedBox(
                  width: 48,
                  height: 48,
                  child: Center(
                    child: ColorFiltered(
                      colorFilter: const ColorFilter.mode(
                        Colors.white,
                        BlendMode.srcIn,
                      ),
                      child: Image.asset(
                        'public/logo/logomark_noir.png',
                        width: 40,
                        height: 40,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),

          PopupMenuButton<String>(
            icon: const Icon(
              Icons.account_circle,
              color: Colors.white,
              size: 40,
            ),
            constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
            onSelected: (value) {
              if (value == 'profil') {
                // Lien vers profil détaillé.
              } else if (value == 'deconnexion') {
                // Déconnexion.
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'profil',
                child: Row(
                  children: [
                    Icon(Icons.person_outline),
                    SizedBox(width: 10),
                    Text('Mon profil'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'deconnexion',
                child: Row(
                  children: [
                    Icon(Icons.logout),
                    SizedBox(width: 10),
                    Text('Déconnexion'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
