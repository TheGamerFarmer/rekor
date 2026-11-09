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
      child: const Center(
        child: Text(
          'Bienvenue sur la page d’accueil',
          style: TextStyle(color: Colors.white),
        ),
      ),
    );
  }
}
