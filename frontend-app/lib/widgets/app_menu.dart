import 'package:flutter/material.dart';

import '../mobile_pages/home_page.dart';

class AppMenu extends StatelessWidget {
  final VoidCallback onClose;

  const AppMenu({super.key, required this.onClose,});

  @override
  Widget build(BuildContext context) {
    // Lien entre icons et nom de page
    final elements = [
      (Icons.home, 'Accueil'),
      (Icons.chat, 'Discussions'),
      (Icons.directions_car, 'Covoiturage'),
      (Icons.calendar_month, 'Évènements'),
      (Icons.emoji_events, 'Compétition'),
      (Icons.sports, 'Arbitrage'),
      (Icons.bar_chart, 'Statistiques'),
      (Icons.campaign, 'News'),
      (Icons.settings, 'Paramètres'),
    ];

    // Menu
    return Container(
      color: Colors.black.withValues(alpha: 0.8),
      child: SafeArea(
        child: Column(
          children: [
            // En-tête du menu
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Padding(
                  padding: EdgeInsets.all(20),
                  child: Text(
                    'Mon menu',
                    style: TextStyle(
                      fontSize: 28,
                      color: Colors.white,
                    ),
                  ),
                ),

                IconButton(
                  onPressed: onClose,
                  icon: const Icon(
                    Icons.close,
                    color: Colors.white,
                  ),
                ),
              ],
            ),

            // Grille 3 x 3
            Expanded(
              child: GridView.count(
                crossAxisCount: 3,
                crossAxisSpacing: 15,
                mainAxisSpacing: 45,
                padding: const EdgeInsets.all(20),
                children: [
                  for (final element in elements)
                    InkWell(
                      onTap: () {
                        // Lien à définir pour chaque élément
                        if (element.$2 == 'Accueil') {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const MyHomePage(
                                title: 'Accueil',
                              ),
                            ),
                          );
                        }
                      },
                      child: Container(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              element.$1,
                              color: Colors.white,
                              size: 35,
                            ),
                            const SizedBox(height: 10),
                            Text(
                              element.$2,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}