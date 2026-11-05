// lib/models/receta.dart
class Receta {
  final int? id;
  final String nombre;
  final bool esPredefinida;
  final double phMin, phMax, ecMin, ecMax, tAguaMin, tAguaMax, tAmbMin, tAmbMax, humMin, humMax;

  const Receta({this.id, required this.nombre, this.esPredefinida = false,
      required this.phMin, required this.phMax, required this.ecMin, required this.ecMax,
      required this.tAguaMin, required this.tAguaMax, required this.tAmbMin, required this.tAmbMax,
      required this.humMin, required this.humMax});

  static double _d(dynamic v) => double.parse(v.toString());
  factory Receta.fromJson(Map<String, dynamic> j) => Receta(
        id: j['id'], nombre: j['nombre'], esPredefinida: j['es_predefinida'] ?? false,
        phMin: _d(j['ph_min']), phMax: _d(j['ph_max']), ecMin: _d(j['ec_min']), ecMax: _d(j['ec_max']),
        tAguaMin: _d(j['temp_agua_min']), tAguaMax: _d(j['temp_agua_max']),
        tAmbMin: _d(j['temp_amb_min']), tAmbMax: _d(j['temp_amb_max']),
        humMin: _d(j['hum_min']), humMax: _d(j['hum_max']));

  Map<String, dynamic> toJson() => {
        'nombre': nombre, 'ph_min': phMin, 'ph_max': phMax, 'ec_min': ecMin, 'ec_max': ecMax,
        'temp_agua_min': tAguaMin, 'temp_agua_max': tAguaMax, 'temp_amb_min': tAmbMin, 'temp_amb_max': tAmbMax,
        'hum_min': humMin, 'hum_max': humMax };

  /// Estado de una variable respecto a la receta: true = dentro de rango.
  bool enRango(String variable, double? v) {
    if (v == null) return true;
    switch (variable) {
      case 'ph': return v >= phMin && v <= phMax;
      case 'ec': return v >= ecMin && v <= ecMax;
      case 'temperatura_agua': return v >= tAguaMin && v <= tAguaMax;
      case 'temperatura_ambiente': return v >= tAmbMin && v <= tAmbMax;
      case 'humedad_ambiente': return v >= humMin && v <= humMax;
      default: return true;
    }
  }
}
