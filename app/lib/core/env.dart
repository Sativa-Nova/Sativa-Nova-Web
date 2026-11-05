// lib/core/env.dart
class Env {
  // Cambia por la URL pública del backend (p. ej. Render/Railway/Fly)
  static const apiBase = String.fromEnvironment('API_BASE', defaultValue: '[10.0.2.2](http://10.0.2.2:3000)');
  static const deviceId = String.fromEnvironment('DEVICE_ID', defaultValue: 'pico-01');
}
