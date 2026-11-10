import 'package:flutter/material.dart';

import '../layouts/main_layout.dart';

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => MyHomePageState();
}

class MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    return MainLayout(
      child: Center(
        child: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.65),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Text(
            'Bienvenue sur la page d’accueil',
            style: TextStyle(color: Colors.white),
          ),
        ),
      ),
    );
  }
}
