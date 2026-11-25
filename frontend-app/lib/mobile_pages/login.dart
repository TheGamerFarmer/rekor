import 'dart:async';

import 'package:flutter/material.dart';
import 'package:frontend_app/mobile_pages/home_page.dart';
import 'package:rekor_api/api.dart' as generated;

import '../api/api_client.dart';

class MyLoginPage extends StatefulWidget {
  const MyLoginPage({super.key});

  @override
  State<MyLoginPage> createState() => MyLoginPageState();
}

class MyLoginPageState extends State<MyLoginPage> {
  final formKey = GlobalKey<FormState>();

  final TextEditingController emailController = TextEditingController();

  final TextEditingController passwordController = TextEditingController();

  List<generated.Association> associations = [];
  generated.Association? selectedAssociation;
  bool associationsLoading = true;
  String? associationsError;

  bool passwordVisible = false;

  @override
  void initState() {
    super.initState();
    loadAssociations();
  }

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> loadAssociations() async {
    setState(() {
      associationsLoading = true;
      associationsError = null;
    });

    try {
      final result = await ApiClient.instance.getAssociations();
      if (!mounted) return;
      setState(() {
        associations = result;
        associationsLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        associationsLoading = false;
        associationsError = 'Impossible de charger les associations.';
      });
    }
  }

  Future<void> login() async {
    if (!formKey.currentState!.validate()) return;

    try {
      await ApiClient.instance.login(
        emailController.text.trim(),
        passwordController.text,
        selectedAssociation!.name,
      );
      // Le token est configuré dans ApiClient.

      // La connexion est réussie.
      if (!mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => const MyHomePage(title: 'Accueil'),
        ),
      );
    } on TimeoutException {
      // La connexion met trop de temps
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Le serveur met trop de temps à répondre.'),
        ),
      );
    } catch (e) {
      // La connexion renvoie une erreur
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Association, e-mail ou mot de passe incorrect'),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(25),
          child: Form(
            key: formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Titre
                const Icon(Icons.account_circle, size: 90, color: Colors.blue),
                const SizedBox(height: 20),
                const Text(
                  'Connexion',
                  style: TextStyle(fontSize: 30, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 35),

                // Email
                TextFormField(
                  controller: emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Adresse e-mail',
                    prefixIcon: Icon(Icons.email),
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Veuillez saisir votre e-mail';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Mot de passe
                TextFormField(
                  controller: passwordController,
                  obscureText: !passwordVisible,
                  decoration: InputDecoration(
                    labelText: 'Mot de passe',
                    prefixIcon: const Icon(Icons.lock),
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                      tooltip: passwordVisible
                          ? 'Masquer le mot de passe'
                          : 'Afficher le mot de passe',
                      icon: Icon(
                        passwordVisible
                            ? Icons.visibility
                            : Icons.visibility_off,
                      ),
                      onPressed: () {
                        setState(() {
                          passwordVisible = !passwordVisible;
                        });
                      },
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Veuillez saisir votre mot de passe';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 30),

                // Association
                DropdownButtonFormField<generated.Association>(
                  initialValue: selectedAssociation,
                  decoration: InputDecoration(
                    labelText: 'Association',
                    prefixIcon: const Icon(Icons.groups),
                    border: const OutlineInputBorder(),
                    suffixIcon: associationsLoading
                        ? const Padding(
                            padding: EdgeInsets.all(12),
                            child: SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                          )
                        : null,
                  ),
                  items: associations
                      .map(
                        (association) => DropdownMenuItem(
                          value: association,
                          child: Text(association.name),
                        ),
                      )
                      .toList(),
                  onChanged: associationsLoading || associationsError != null
                      ? null
                      : (association) {
                          setState(() {
                            selectedAssociation = association;
                          });
                        },
                  validator: (value) {
                    if (value == null) {
                      return 'Veuillez sélectionner votre association';
                    }
                    return null;
                  },
                ),
                if (associationsError != null) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          associationsError!,
                          style: const TextStyle(color: Colors.red),
                        ),
                      ),
                      TextButton(
                        onPressed: loadAssociations,
                        child: const Text('Réessayer'),
                      ),
                    ],
                  ),
                ],
                if (!associationsLoading &&
                    associationsError == null &&
                    associations.isEmpty)
                  const Padding(
                    padding: EdgeInsets.only(top: 8),
                    child: Text('Aucune association disponible.'),
                  ),
                const SizedBox(height: 20),

                // Connexion
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: login,
                    child: const Text(
                      'Se connecter',
                      style: TextStyle(fontSize: 18),
                    ),
                  ),
                ),
                const SizedBox(height: 15),

                // Mot de passe oublié
                TextButton(
                  onPressed: () {
                    // Appeler le back pour qu'il crée un nouveau mot de passe et l'envoie par mail à l'utilisateur.
                  },
                  child: const Text('Mot de passe oublié ?'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
