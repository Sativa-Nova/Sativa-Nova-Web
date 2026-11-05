// lib/services/api_service.dart
import 'package:dio/dio.dart';
import '../core/env.dart';
import '../models/alerta.dart';
import '../models/lectura.dart';
import '../models/receta.dart';

class ApiException implements Exception {
  final String message; ApiException(this.message); @override String toString() => message;
}

class ApiService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: '${Env.apiBase}/api',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 20),
  ));

  ApiService() {
    // Reintento simple con backoff para errores de red
    _dio.interceptors.add(InterceptorsWrapper(onError: (e, h) async {
      final retries = (e.requestOptions.extra['retries'] ?? 0) as int;
      final esRed = e.type == DioExceptionType.connectionError || e.type == DioExceptionType.connectionTimeout;
      if (esRed && retries < 3) {
        await Future.delayed(Duration(milliseconds: 400 * (1 << retries)));
        e.requestOptions.extra['retries'] = retries + 1;
        try { return h.resolve(await _dio.fetch(e.requestOptions)); } catch (_) {}
      }
      h.next(e);
    }));
  }

  Future<T> _guard<T>(Future<T> Function() fn) async {
    try { return await fn(); }
    on DioException catch (e) {
      final msg = e.response?.data is Map ? (e.response!.data['error'] ?? e.message) : (e.message ?? 'Error de red');
      throw ApiException(msg.toString());
    }
  }

  Future<Lectura> ultimaLectura() => _guard(() async =>
      Lectura.fromJson((await _dio.get('/lecturas/ultima', queryParameters: {'device_id': Env.deviceId})).data));

  Future<Map<String, List<(DateTime, double)>>> historico(DateTime desde, DateTime hasta, {int puntos = 300}) =>
      _guard(() async {
        final r = await _dio.get('/lecturas/historico', queryParameters: {
          'device_id': Env.deviceId, 'desde': desde.toUtc().toIso8601String(), 'hasta': hasta.toUtc().toIso8601String(), 'puntos': puntos });
        final series = (r.data['series'] as Map).cast<String, dynamic>();
        return series.map((k, v) => MapEntry(k, (v as List)
            .map((p) => (DateTime.fromMillisecondsSinceEpoch((p['x'] as num).toInt()).toLocal(), (p['y'] as num).toDouble())).toList()));
      });

  Future<List<Receta>> recetas() => _guard(() async => ((await _dio.get('/recetas')).data as List).map((j) => Receta.fromJson(j)).toList());
  Future<Receta?> recetaActiva() => _guard(() async {
        try { return Receta.fromJson((await _dio.get('/recetas/activa', queryParameters: {'device_id': Env.deviceId})).data); }
        on DioException catch (e) { if (e.response?.statusCode == 404) return null; rethrow; }
      });
  Future<Receta> activarReceta(int id) => _guard(() async =>
      Receta.fromJson((await _dio.post('/recetas/activar', data: {'device_id': Env.deviceId, 'receta_id': id})).data));
  Future<Receta> crearReceta(Receta r) => _guard(() async => Receta.fromJson((await _dio.post('/recetas', data: r.toJson())).data));
  Future<Receta> editarReceta(Receta r) => _guard(() async => Receta.fromJson((await _dio.put('/recetas/${r.id}', data: r.toJson())).data));
  Future<void> eliminarReceta(int id) => _guard(() => _dio.delete('/recetas/$id'));

  Future<List<Alerta>> alertas() => _guard(() async =>
      ((await _dio.get('/alertas', queryParameters: {'device_id': Env.deviceId})).data as List).map((j) => Alerta.fromJson(j)).toList());
  Future<void> marcarLeida(int id) => _guard(() => _dio.patch('/alertas/$id/leida'));
  Future<void> registrarPushToken(String token, String plataforma) =>
      _guard(() => _dio.post('/push/token', data: {'token': token, 'device_id': Env.deviceId, 'plataforma': plataforma}));
}
