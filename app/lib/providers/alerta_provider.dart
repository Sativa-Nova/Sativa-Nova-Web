// lib/providers/alerta_provider.dart
import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/alerta.dart';
import 'lectura_provider.dart';

class AlertasNotifier extends AsyncNotifier<List<Alerta>> {
  StreamSubscription? _sub;
  @override Future<List<Alerta>> build() async {
    _sub?.cancel();
    _sub = ref.read(socketProvider).alertas.listen((a) => state = AsyncData([a, ...(state.value ?? [])]));
    ref.onDispose(() => _sub?.cancel());
    return ref.read(apiProvider).alertas();
  }
  Future<void> marcarLeida(int id) async {
    state = AsyncData([for (final a in state.value ?? []) a.id == id ? a.copyWith(leida: true) : a]);
    try { await ref.read(apiProvider).marcarLeida(id); } catch (_) { ref.invalidateSelf(); }
  }
}
final alertasProvider = AsyncNotifierProvider<AlertasNotifier, List<Alerta>>(AlertasNotifier.new);
final noLeidasProvider = Provider<int>((ref) => ref.watch(alertasProvider).value?.where((a) => !a.leida).length ?? 0);
