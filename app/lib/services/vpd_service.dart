// lib/services/vpd_service.dart
import 'dart:math';

enum VpdZona { germinacion, vegetativo, floracion, peligro }

class VpdService {
  /// Presión de vapor de saturación (kPa) — fórmula de Buck (1981).
  static double es(double tC) => 0.61121 * exp((18.678 - tC / 234.5) * (tC / (257.14 + tC)));

  /// VPD en kPa. [leafOffset] en °C (hoja más fría que el aire).
  static double vpd(double tAir, double rh, {double leafOffset = 0}) {
    final ea = es(tAir) * (rh / 100);
    return max(0, es(tAir - leafOffset) - ea);
  }

  static VpdZona zona(double v) {
    if (v >= 0.4 && v < 0.8) return VpdZona.germinacion;
    if (v >= 0.8 && v < 1.2) return VpdZona.vegetativo;
    if (v >= 1.2 && v <= 1.6) return VpdZona.floracion;
    return VpdZona.peligro;
  }

  static String etiqueta(VpdZona z) => switch (z) {
        VpdZona.germinacion => 'Germinación',
        VpdZona.vegetativo => 'Vegetativo',
        VpdZona.floracion => 'Floración',
        VpdZona.peligro => 'Zona Peligrosa',
      };
}
