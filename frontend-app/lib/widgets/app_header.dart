import 'package:flutter/material.dart';
import 'package:frontend_app/mobile_pages/home_page.dart';

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
            child: const Text(
              'Profil',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

}