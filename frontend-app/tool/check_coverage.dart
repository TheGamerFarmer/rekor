// Vérifie la couverture de lignes de coverage/lcov.info (produit par `flutter test --coverage`).
// Usage : dart run tool/check_coverage.dart 70
import 'dart:io';

void main(List<String> args) {
  final minimum = double.parse(args.first);
  var found = 0;
  var hit = 0;
  final covered = <String>{};

  for (final line in File('coverage/lcov.info').readAsLinesSync()) {
    if (line.startsWith('SF:'))
      covered.add(line.substring(3).replaceAll('\\', '/'));
    if (line.startsWith('LF:')) found += int.parse(line.substring(3));
    if (line.startsWith('LH:')) hit += int.parse(line.substring(3));
  }

  // Un fichier de lib/ qu'aucun test n'importe n'apparaît pas dans lcov.info :
  // on le compte comme entièrement non couvert pour ne pas gonfler le résultat.
  for (final entity in Directory('lib').listSync(recursive: true)) {
    if (entity is! File || !entity.path.endsWith('.dart')) continue;
    final path = entity.path.replaceAll('\\', '/');
    if (covered.any((c) => c.endsWith(path))) continue;
    final lines = entity
        .readAsLinesSync()
        .where((l) => l.trim().isNotEmpty)
        .length;
    stdout.writeln(
      'Attention : $path n\'est importé par aucun test ($lines lignes non couvertes)',
    );
    found += lines;
  }

  final percent = found == 0 ? 0.0 : hit * 100 / found;
  stdout.writeln(
    'Couverture des lignes : ${percent.toStringAsFixed(2)} % ($hit/$found)',
  );
  if (percent < minimum) {
    stderr.writeln('ERREUR : couverture sous le seuil de $minimum %');
    exit(1);
  }
}
