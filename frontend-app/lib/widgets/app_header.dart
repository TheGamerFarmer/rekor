import 'package:flutter/material.dart';
import 'package:frontend_app/mobile_pages/home_page.dart';

// Header de l'application mobile avec logo et profil
class AppHeader extends StatelessWidget{
  const AppHeader({super.key});


  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        // Les 3 boutons (Accueil, Menu, Discussions)
        children: [
          InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const MyHomePage(title: 'Accueil'),
                ),
              );
            },
            child : ColorFiltered(colorFilter: const ColorFilter.mode(
                Colors.white,
                BlendMode.srcIn
              ),
              child: Image.asset(
                'public/logo/logomark_noir.png',
                width: 40,
                height: 40,
              ),
            ),
          ),
          InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const MyHomePage(title: 'Accueil'),
                ),
              );
            },
            child: PopupMenuButton<String>(
              icon: const Icon(
                Icons.account_circle,
                color: Colors.white,
                size: 40,
              ),
              onSelected: (value) {
                if (value == 'profil') {
                  // Lien vers profil détaillé
                } else if (value == 'deconnexion') {
                  // Déconnexion et lien vers la page de connexion
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
                      Text('Deconnexion'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

}