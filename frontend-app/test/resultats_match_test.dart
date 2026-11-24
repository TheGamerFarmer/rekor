import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_app/widgets/resultat_match.dart';

void main() {
  group('ResultatMatch', () {
    test('calculates victory and sets for a home match', () {
      final match = ResultatMatch(
        equipeDomicile: 'Grenoble Volley',
        equipeExterieur: 'Lyon Volley',
        date: DateTime(2026, 9, 12),
        sets: const [SetScore(25, 20), SetScore(25, 22), SetScore(20, 25)],
      );

      expect(match.adversaire, 'Lyon Volley');
      expect(match.setsGagnes, 2);
      expect(match.setsPerdus, 1);
      expect(match.pointsMarques, 70);
      expect(match.pointsEncaisses, 67);
      expect(match.victoire, isTrue);
    });

    test('calculates defeat and reverses points for an away match', () {
      final match = ResultatMatch(
        equipeDomicile: 'Annecy',
        equipeExterieur: 'Grenoble Volley',
        date: DateTime(2026, 9, 26),
        sets: const [SetScore(25, 23), SetScore(20, 25), SetScore(25, 22)],
      );

      expect(match.adversaire, 'Annecy');
      expect(match.setsGagnes, 1);
      expect(match.setsPerdus, 2);
      expect(match.pointsMarques, 70);
      expect(match.pointsEncaisses, 70);
      expect(match.victoire, isFalse);
    });

    test('provides the static result dataset', () {
      expect(listeResultats, isNotEmpty);
      expect(listeResultats.first.actions, isNotEmpty);
    });
  });
}
