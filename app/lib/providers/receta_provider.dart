import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/receta.dart';
import 'lectura_provider.dart';

final recetasProvider = AsyncNotifierProvider<RecetasNotifier, List<Receta>>(RecetasNotifier.new);

class RecetasNotifier extends AsyncNotifier<List<Receta>> {
  @override 
  Future<List<Receta>> build() async {
    return await ref.read(apiProvider).recetas();
  }

  Future<void> crear(Receta r) async { 
    await ref.read(apiProvider).crearReceta(r); 
    ref.invalidateSelf(); 
  }

  Future<void> editar(Receta r) async { 
    await ref.read(apiProvider).editarReceta(r); 
    ref.invalidateSelf(); 
  }

  Future<void> eliminar(int id) async { 
    await ref.read(apiProvider).eliminarReceta(id); 
    ref.invalidateSelf(); 
  }
}

final recetaActivaProvider = AsyncNotifierProvider<RecetaActivaNotifier, Receta?>(RecetaActivaNotifier.new);

class RecetaActivaNotifier extends AsyncNotifier<Receta?> {
  @override 
  Future<Receta?> build() async {
    try {
      return await ref.read(apiProvider).recetaActiva();
    } catch (_) {
      return null;
    }
  }

  Future<void> activar(Receta r) async {
    state = AsyncData(r);
    try { 
      final actualizada = await ref.read(apiProvider).activarReceta(r.id!);
      state = AsyncData(actualizada); 
    } catch (e, st) { 
      state = AsyncError(e, st); 
      rethrow; 
    }
  }
}