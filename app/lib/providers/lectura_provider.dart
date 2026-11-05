// lib/providers/lectura_provider.dart
import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/lectura.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';

final apiProvider = Provider((_) => ApiService());
final socketProvider = Provider((ref) { final s = SocketService(); ref.onDispose(s.dispose); return s; });

final conexionProvider = StreamProvider<ConexionEstado>((ref) => ref.watch(socketProvider).estado);

/// Última lectura: carga inicial por REST y actualizaciones en vivo por WebSocket.
class LecturaNotifier extends AsyncNotifier<Lectura> {
  StreamSubscription? _sub;
  @override
  Future<Lectura> build() async {
    _sub?.cancel();
    _sub = ref.read(socketProvider).lecturas.listen((l) => state = AsyncData(l));
    ref.onDispose(() => _sub?.cancel());
    return ref.read(apiProvider).ultimaLectura();
  }
  Future<void> refrescar() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(apiProvider).ultimaLectura());
  }
}
final lecturaProvider = AsyncNotifierProvider<LecturaNotifier, Lectura>(LecturaNotifier.new);
