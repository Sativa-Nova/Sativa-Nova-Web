// lib/services/dosing_service.dart
// Espejo local del servicio del backend: permite calcular sin conexión.
import '../models/receta.dart';

enum BufferAgua { baja, media, alta }

class DosingPlan {
  final double ecActual, ecObjetivo, phObjetivo;
  final double? mlA, gA, mlB, gB, diluirL, mlPhDown;
  final List<String> pasos;
  final bool requiereCorreccion;
  const DosingPlan({required this.ecActual, required this.ecObjetivo, required this.phObjetivo, this.mlA, this.gA,
      this.mlB, this.gB, this.diluirL, this.mlPhDown, required this.pasos, required this.requiereCorreccion});
}

class DosingService {
  static const tdsFactor = 500.0;      // ppm por mS/cm (escala 500)
  static const ecPorMlPorL = 0.25;     // 1 mL/L de stock → +0.25 mS/cm
  static const densidadStock = 1.15;   // g/mL
  static const _buffer = {BufferAgua.baja: 0.10, BufferAgua.media: 0.25, BufferAgua.alta: 0.45}; // mL/L por unidad de pH

  static double tdsToEc(double tds) => tds / tdsFactor;
  static double _r(double v, [int d = 1]) => double.parse(v.toStringAsFixed(d));

  static DosingPlan calcular({required double volumenL, required double ph, required double tds,
      required Receta r, BufferAgua buffer = BufferAgua.media}) {
    if (volumenL <= 0) throw ArgumentError('El volumen debe ser mayor que 0 L');
    final ec = tdsToEc(tds);
    final ecObj = (r.ecMin + r.ecMax) / 2, phObj = (r.phMin + r.phMax) / 2;
    final pasos = <String>[];
    double? mlA, gA, mlB, gB, diluir, mlPh;

    if (ec < r.ecMin) {
      final mlTotal = (ecObj - ec) / ecPorMlPorL * volumenL;
      mlA = _r(mlTotal / 2); mlB = mlA; gA = _r(mlA * densidadStock); gB = gA;
      pasos.addAll([
        'Agregar $mlA mL ($gA g) de Solución A.',
        'Agitar / recircular durante 5 minutos.',
        'Agregar $mlB mL ($gB g) de Solución B. No mezclar A y B concentrados.',
        'Esperar 15 min y verificar la CE antes de ajustar pH.',
      ]);
    } else if (ec > r.ecMax) {
      diluir = _r(volumenL * (ec / ecObj - 1));
      pasos.add('CE alta: agregar $diluir L de agua limpia para llegar a ${_r(ecObj, 2)} mS/cm.');
    }

    if (ph > r.phMax) {
      mlPh = _r((ph - phObj) * _buffer[buffer]! * volumenL);
      pasos.add('Agregar $mlPh mL de pH Down (ácido fosfórico) en 2–3 fracciones, re-midiendo entre cada una.');
    } else if (ph < r.phMin) {
      pasos.add('pH bajo: agregar pH Up (KOH) en dosis pequeñas (≈0.1 mL/L) y re-medir.');
    }

    final corregir = pasos.isNotEmpty;
    if (!corregir) pasos.add('Todos los parámetros están dentro del rango de la receta activa.');
    return DosingPlan(ecActual: _r(ec, 2), ecObjetivo: _r(ecObj, 2), phObjetivo: _r(phObj, 2), mlA: mlA, gA: gA,
        mlB: mlB, gB: gB, diluirL: diluir, mlPhDown: mlPh, pasos: pasos, requiereCorreccion: corregir);
  }
}
