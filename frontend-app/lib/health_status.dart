import 'package:flutter/material.dart';

import 'api/api_client.dart';

/// Affiche l'état du back-end (appel GET / au premier affichage).
class HealthStatus extends StatefulWidget {
  const HealthStatus({super.key});

  @override
  State<HealthStatus> createState() => _HealthStatusState();
}

class _HealthStatusState extends State<HealthStatus> {
  late final Future<String> _status = ApiClient.instance.health();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<String>(
      future: _status,
      builder: (context, snapshot) {
        final text = snapshot.hasError
            ? 'Backend : indisponible'
            : snapshot.hasData
            ? 'Backend : ${snapshot.data}'
            : 'Backend : …';
        return Text(text, key: const Key('backend-status'));
      },
    );
  }
}
