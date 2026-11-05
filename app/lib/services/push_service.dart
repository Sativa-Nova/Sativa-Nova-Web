// lib/services/push_service.dart
import 'dart:io' show Platform;
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'api_service.dart';

@pragma('vm:entry-point')
Future<void> _onBackground(RemoteMessage m) async {}

class PushService {
  static final _local = FlutterLocalNotificationsPlugin();

  /// FCM solo en móvil; en escritorio la app depende del centro de notificaciones interno + Socket.io.
  static Future<void> init(ApiService api) async {
    if (kIsWeb || !(Platform.isAndroid || Platform.isIOS)) return;
    try {
      await Firebase.initializeApp();
      FirebaseMessaging.onBackgroundMessage(_onBackground);
      final fm = FirebaseMessaging.instance;
      await fm.requestPermission(alert: true, badge: true, sound: true);

      const canal = AndroidNotificationChannel('alertas_criticas', 'Alertas críticas',
          description: 'Desvíos químicos del cultivo', importance: Importance.max);
      await _local.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()?.createNotificationChannel(canal);
      await _local.initialize(const InitializationSettings(
          android: AndroidInitializationSettings('@mipmap/ic_launcher'), iOS: DarwinInitializationSettings()));

      // Mostrar en primer plano
      FirebaseMessaging.onMessage.listen((m) {
        final n = m.notification; if (n == null) return;
        _local.show(m.hashCode, n.title, n.body, const NotificationDetails(
            android: AndroidNotificationDetails('alertas_criticas', 'Alertas críticas', importance: Importance.max, priority: Priority.high)));
      });

      final token = await fm.getToken();
      if (token != null) await api.registrarPushToken(token, Platform.isAndroid ? 'android' : 'ios');
      fm.onTokenRefresh.listen((t) => api.registrarPushToken(t, Platform.isAndroid ? 'android' : 'ios'));
    } catch (e) { debugPrint('[Push] No disponible: $e'); }
  }
}
