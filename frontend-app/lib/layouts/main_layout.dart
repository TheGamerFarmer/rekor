import 'dart:ui';

import 'package:flutter/material.dart';
import '../widgets/app_footer.dart';

class MainLayout extends StatelessWidget {
  final Widget child;

  const MainLayout({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      //backgroundColor: Colors.white,

      appBar: AppBar(
        title: const Text('Mon application'),
        backgroundColor: const Color(0xFF303030),
      ),

      drawer: Drawer(
        child: ListView(
          children: const [
            DrawerHeader(
              child: Text('Menu'),
            ),
            ListTile(
              title: Text('Accueil'),
            ),
            ListTile(
              title: Text('Profil'),
            ),
          ],
        ),
      ),

      body: Stack(
        fit: StackFit.expand,
        children: [
      ImageFiltered(
        imageFilter: ImageFilter.blur(
        sigmaX: 5,
          sigmaY: 5,
        ),
        // Image de fond en noir et blanc
        child: ColorFiltered(
        colorFilter: const ColorFilter.matrix([
            0.2126, 0.7152, 0.0722, 0, 0,
            0.2126, 0.7152, 0.0722, 0, 0,
            0.2126, 0.7152, 0.0722, 0, 0,
            0,      0,      0,      1, 0,
            ]),
            // Image de fond
            child: Image.asset(
              'public/img/volley_ball1.jpg',
              fit: BoxFit.cover,
            ),
        ),
      ),

          // Voile sombre pour améliorer la lisibilité
          Container(
            color: Colors.black.withValues(alpha: 0.45),
          ),

          // Contenu de la page
          child,
          
          Positioned(
            bottom: 80,
            left: 20,
            right: 20,
            child: const AppFooter(),
          )
        ],
      ),
    );
  }
}