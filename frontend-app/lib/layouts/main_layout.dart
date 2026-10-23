import 'dart:ui';

import 'package:flutter/material.dart';
import '../widgets/app_footer.dart';
import '../widgets/app_header.dart';
import '../widgets/app_menu.dart';

class MainLayout extends StatefulWidget {
  final Widget child;

  const MainLayout({
    super.key,
    required this.child,
  });

  @override
  State<MainLayout> createState() => _MyMainLayout();
}

class _MyMainLayout extends State<MainLayout> {

  bool menuOuvert = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(

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
          widget.child,

          Positioned(
            top: 50,
            left: 20,
            right: 20,
            child: AppHeader(
            ),
          ),

          Positioned(
            bottom: 80,
            left: 20,
            right: 20,
            child: AppFooter(
              onMenuTap: (){
                setState(() {
                  menuOuvert = !menuOuvert;
                });
              },
            ),
          ),
          Positioned.fill(
            child: IgnorePointer(
              ignoring: !menuOuvert,
              child: AnimatedOpacity(
                opacity: menuOuvert ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 300),
                child: AnimatedScale(
                  scale: menuOuvert ? 1.0 : 0.90,
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeOutBack,
                  child: Stack(
                    children: [
                      // Flou de la page derrière le menu
                      Positioned.fill(
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              menuOuvert = false;
                            });
                          },
                          child: ClipRect(
                            child: BackdropFilter(
                              filter: ImageFilter.blur(
                                sigmaX: 5,
                                sigmaY: 5,
                              ),
                              child: Container(
                                color: Colors.black.withValues(alpha: 0.3),
                              ),
                            ),
                          ),
                        ),
                      ),

                      // Le menu
                      AppMenu(
                        onClose: () {
                          setState(() {
                            menuOuvert = false;
                          });
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

}