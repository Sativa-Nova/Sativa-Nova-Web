// lib/providers/history_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'lectura_provider.dart';

enum Rango { hora, dia, semana, mes, personalizado }

class RangoSeleccion {
  final Rango tipo; final DateTime desde, hasta;
  const RangoSeleccion(this.tipo, this.desde, this.hasta);
  factory RangoSeleccion.preset(Rango r) {
    final now = DateTime.now();
    final d = switch (r) { Rango.hora => const Duration(hours: 1), Rango.dia => const Duration(days: 1),
        Rango.semana => const Duration(days: 7), _ => const Duration(days: 30) };
    return RangoSeleccion(r, now.subtract(d), now);
  }
}

final rangoProvider = StateProvider<RangoSeleccion>((_) => RangoSeleccion.preset(Rango.dia));

final historicoProvider = FutureProvider.autoDispose<Map<String, List<(DateTime, double)>>>((ref) {
  final r = ref.watch(rangoProvider);
  return ref.read(apiProvider).historico(r.desde, r.hasta, puntos: 400);
});
