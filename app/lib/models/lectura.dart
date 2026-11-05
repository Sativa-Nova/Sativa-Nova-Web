// lib/models/lectura.dart
class Lectura {
  final int? id;
  final String deviceId;
  final double? tempAgua, tempAmb, humAmb, humSuelo, ph, tds;
  final DateTime fecha;
  final Map<String, int?> alertTimers; // ms restantes por variable (null = en rango)

  const Lectura({this.id, required this.deviceId, this.tempAgua, this.tempAmb, this.humAmb,
      this.humSuelo, this.ph, this.tds, required this.fecha, this.alertTimers = const {}});

  static double? _d(dynamic v) => v == null ? null : double.tryParse(v.toString());

  factory Lectura.fromJson(Map<String, dynamic> j) => Lectura(
        id: j['id'] is int ? j['id'] : int.tryParse('${j['id']}'),
        deviceId: j['device_id'],
        tempAgua: _d(j['temperatura_agua']), tempAmb: _d(j['temperatura_ambiente']),
        humAmb: _d(j['humedad_ambiente']), humSuelo: _d(j['humedad_suelo']),
        ph: _d(j['ph']), tds: _d(j['tds_ppm']),
        fecha: DateTime.parse(j['fecha']).toLocal(),
        alertTimers: (j['alert_timers'] as Map?)?.map((k, v) => MapEntry(k.toString(), v == null ? null : (v as num).toInt())) ?? const {},
      );
}
