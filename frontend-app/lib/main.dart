import 'package:flutter/material.dart';
import 'package:frontend_app/mobile_pages/login.dart';
import 'package:frontend_app/mobile_pages/home_page.dart';
import 'package:frontend_app/api/api_client.dart';

class MyApp extends StatefulWidget {
  final Future<bool>? sessionFuture;

  const MyApp({super.key, this.sessionFuture});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late final Future<bool> _sessionFuture;

  @override
  void initState() {
    super.initState();
    _sessionFuture =
        widget.sessionFuture ?? ApiClient.instance.restoreSession();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mon application',
      home: FutureBuilder<bool>(
        future: _sessionFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }

          if (snapshot.data == true) {
            return const MyHomePage(title: 'Accueil');
          }

          return const MyLoginPage();
        },
      ),
    );
  }
}

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}
