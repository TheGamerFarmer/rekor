import 'package:flutter/material.dart';
import 'package:frontend_app/mobile_pages/home_page.dart';

class AppFooter extends StatelessWidget{
  final VoidCallback onMenuTap;
  const AppFooter({super.key, required this.onMenuTap});


  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(
          color: Colors.white,
          width: 2,
        ),
        borderRadius: BorderRadius.circular(15),
      ),
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
            child: const Text(
              'Accueil',
              style: TextStyle(color: Colors.white),
            ),
          ),
          InkWell(
            onTap: onMenuTap,
            child: const Text(
              'Menu',
              style: TextStyle(color: Colors.white),
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
              'Discussions',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

}