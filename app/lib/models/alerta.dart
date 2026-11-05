// lib/models/alerta.dart
class Alerta {
  final int id; final String variable, mensaje, recomendacion, severidad;
  final double valor; final bool leida; final DateTime creadaEn;
  Alerta({required this.id, required this.variable, required this.mensaje, required this.recomendacion,
      required this.severidad, required this.valor, required this.leida, required this.creadaEn});
  factory Alerta.fromJson(Map<String, dynamic> j) => Alerta(
      id: j['id'] is int ? j['id'] : int.parse('${j['id']}'), variable: j['variable'], mensaje: j['mensaje'],
      recomendacion: j['recomendacion'], severidad: j['severidad'], valor: double.parse('${j['valor']}'),
      leida: j['leida'] ?? false, creadaEn: DateTime.parse(j['creada_en']).toLocal());
  Alerta copyWith({bool? leida}) => Alerta(id: id, variable: variable, mensaje: mensaje, recomendacion: recomendacion,
      severidad: severidad, valor: valor, leida: leida ?? this.leida, creadaEn: creadaEn);
}
