import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/main.dart' as app;
import 'package:integration_test/integration_test.dart';
import 'package:http/http.dart' as http;

import 'support/backend.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  const profil = {
    'id': 'e2e-user',
    'name': 'Lovelace',
    'firstName': 'Ada',
    'email': 'ada@example.test',
    'role': 'Adhérent',
    'pronoun': 'Elle',
    'medicalCertificate': false,
    'rightOfPublicity': false,
  };

  Map<String, http.Response Function(http.Request)> mocks({
    required void Function(http.Request request) onProfileUpdate,
    required void Function(http.Request request) onPasswordChange,
    required void Function(http.Request request) onAccountDelete,
  }) => {
    'GET /users/me': (_) => jsonResponse(profil),
    'PATCH /users/me': (request) {
      onProfileUpdate(request);
      return http.Response('', 204);
    },
    'PUT /users/me/password': (request) {
      onPasswordChange(request);
      return http.Response('', 204);
    },
    'DELETE /users/me': (request) {
      onAccountDelete(request);
      return http.Response('', 204);
    },
    'GET /association': (_) => jsonResponse([]),
  };

  Future<void> ouvrirParametres(WidgetTester tester) async {
    FlutterSecureStorage.setMockInitialValues({});
    await tester.pumpWidget(app.MyApp(sessionFuture: Future.value(true)));
    await tester.pumpAndSettle();
    await tester.tap(find.bySemanticsLabel('Menu'));
    await tester.pumpAndSettle();
    for (var i = 0; i < 5 && find.text('Paramètres').evaluate().isEmpty; i++) {
      await tester.drag(find.byType(GridView), const Offset(0, -300));
      await tester.pumpAndSettle();
    }
    await tester.ensureVisible(find.text('Paramètres'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Paramètres'));
    await tester.pumpAndSettle();
    await pumpUntilFound(tester, find.text('ada@example.test'));
  }

  testWidgets('application : modifie le profil depuis les paramètres', (
    tester,
  ) async {
    var patchRecu = false;
    installBackend(
      'mock',
      mocks: mocks(
        onProfileUpdate: (request) {
          patchRecu = true;
          expect(request.method, 'PATCH');
          expect(request.url.path, '/users/me');
          expect(
            (jsonDecode(request.body) as Map<String, dynamic>)['firstName'],
            'Camille',
          );
        },
        onPasswordChange: (_) {},
        onAccountDelete: (_) {},
      ),
    );

    await ouvrirParametres(tester);
    await tester.tap(find.text('Prénom'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField).last, 'Camille');
    await tester.tap(find.text('Enregistrer'));
    await pumpUntilFound(tester, find.text('Camille'));

    expect(patchRecu, isTrue);
  });

  testWidgets('application : change le mot de passe depuis les paramètres', (
    tester,
  ) async {
    var putRecu = false;
    installBackend(
      'mock',
      mocks: mocks(
        onProfileUpdate: (_) {},
        onPasswordChange: (request) {
          putRecu = true;
          expect(request.method, 'PUT');
          expect(request.url.path, '/users/me/password');
          expect(jsonDecode(request.body), {
            'old_password': 'ancien-secret',
            'new_password': 'nouveau-secret',
          });
        },
        onAccountDelete: (_) {},
      ),
    );

    await ouvrirParametres(tester);
    await tester.ensureVisible(find.text('Changer mon mot de passe'));
    await tester.tap(find.text('Changer mon mot de passe'));
    await tester.pumpAndSettle();
    final champs = find.byType(TextFormField);
    await tester.enterText(champs.at(0), 'ancien-secret');
    await tester.enterText(champs.at(1), 'nouveau-secret');
    await tester.enterText(champs.at(2), 'nouveau-secret');
    await tester.tap(find.text('Enregistrer').last);
    await tester.pumpAndSettle();

    expect(putRecu, isTrue);
    expect(find.text('Mot de passe modifié avec succès.'), findsOneWidget);
  });

  testWidgets('application : supprime le compte et revient à la connexion', (
    tester,
  ) async {
    var deleteRecu = false;
    installBackend(
      'mock',
      mocks: mocks(
        onProfileUpdate: (_) {},
        onPasswordChange: (_) {},
        onAccountDelete: (request) {
          deleteRecu = true;
          expect(request.method, 'DELETE');
          expect(request.url.path, '/users/me');
        },
      ),
    );

    await ouvrirParametres(tester);
    await tester.ensureVisible(find.text('Supprimer mon compte'));
    await tester.tap(find.text('Supprimer mon compte'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Supprimer').last);
    await tester.pumpAndSettle();

    expect(deleteRecu, isTrue);
    expect(find.text('Connexion'), findsOneWidget);
  });
}
