import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme.dart';
import 'providers/lectura_provider.dart';
import 'services/push_service.dart';
import 'ui/screens/dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Contenedor global para inicializar servicios antes de arrancar la UI
  final container = ProviderContainer();
  try {
    await PushService.init(container.read(apiProvider));
  } catch (e) {
    debugPrint('[Init] Error al inicializar notificaciones push: $e');
  }

  runApp(
    UncontrolledProviderScope(
      container: container,
      child: const SativaNovaApp(),
    ),
  );
}

class SativaNovaApp extends StatelessWidget {
  const SativaNovaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sativa Nova',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      home: const DashboardScreen(),
    );
  }
}