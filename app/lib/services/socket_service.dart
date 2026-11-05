// lib/services/socket_service.dart
import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../core/env.dart';
import '../models/alerta.dart';
import '../models/lectura.dart';
import '../models/receta.dart';

enum ConexionEstado { conectando, conectado, desconectado }

class SocketService {
  late final io.Socket _socket;
  final _lecturas = StreamController<Lectura>.broadcast();
  final _alertas = StreamController<Alerta>.broadcast();
  final _recetas = StreamController<Receta>.broadcast();
  final _estado = StreamController<ConexionEstado>.broadcast();

  Stream<Lectura> get lecturas => _lecturas.stream;
  Stream<Alerta> get alertas => _alertas.stream;
  Stream<Receta> get recetaActivada => _recetas.stream;
  Stream<ConexionEstado> get estado => _estado.stream;

  SocketService() {
    _socket = io.io(Env.apiBase, io.OptionBuilder()
        .setTransports(['websocket'])
        .enableReconnection()                 // reconexión automática con backoff
        .setReconnectionDelay(1000)
        .setReconnectionDelayMax(15000)
        .build());

    _socket.onConnect((_) { _estado.add(ConexionEstado.conectado); _socket.emit('suscribir', Env.deviceId); });
    _socket.onDisconnect((_) => _estado.add(ConexionEstado.desconectado));
    _socket.onReconnectAttempt((_) => _estado.add(ConexionEstado.conectando));
    _socket.onConnectError((e) => _estado.add(ConexionEstado.desconectado));

    _socket.on('lectura:nueva', (d) { try { _lecturas.add(Lectura.fromJson(Map<String, dynamic>.from(d))); } catch (_) {} });
    _socket.on('alerta:nueva', (d) { try { _alertas.add(Alerta.fromJson(Map<String, dynamic>.from(d))); } catch (_) {} });
    _socket.on('receta:activada', (d) { try { _recetas.add(Receta.fromJson(Map<String, dynamic>.from(d))); } catch (_) {} });
  }

  void dispose() { _socket.dispose(); _lecturas.close(); _alertas.close(); _recetas.close(); _estado.close(); }
}
