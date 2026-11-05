// lib/ui/widgets/live_metric.dart
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import 'glass_card.dart';

class LiveMetric extends StatelessWidget {
  final String titulo, unidad; final double? valor; final IconData icono;
  final bool enRango; final String? rango; final int? timerMs; final int decimales;
  const LiveMetric({super.key, required this.titulo, required this.unidad, required this.valor, required this.icono,
      this.enRango = true, this.rango, this.timerMs, this.decimales = 1});

  @override
  Widget build(BuildContext context) {
    final color = enRango ? AppColors.green : (timerMs != null ? AppColors.warning : AppColors.danger);
    return GlassCard(
      borderColor: enRango ? null : color.withOpacity(.6),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
        Row(children: [
          Icon(icono, color: color, size: 18), const SizedBox(width: 6),
          Expanded(child: Text(titulo, style: const TextStyle(color: AppColors.muted, fontSize: 12))),
          _Pulse(color: color),
        ]),
        const SizedBox(height: 10),
        TweenAnimationBuilder<double>(
          tween: Tween(end: valor ?? 0), duration: const Duration(milliseconds: 600),
          builder: (_, v, __) => Text.rich(TextSpan(children: [
            TextSpan(text: valor == null ? '--' : v.toStringAsFixed(decimales),
                style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w700)),
            TextSpan(text: ' $unidad', style: const TextStyle(color: AppColors.muted, fontSize: 13)),
          ])),
        ),
        if (rango != null) Text('Ideal $rango', style: const TextStyle(color: AppColors.muted, fontSize: 11)),
        if (timerMs != null) Text('Fuera de rango · alerta en ${(timerMs! / 60000).ceil()} min',
            style: TextStyle(color: AppColors.warning, fontSize: 11)),
      ]),
    );
  }
}

class _Pulse extends StatefulWidget { final Color color; const _Pulse({required this.color}); @override State<_Pulse> createState() => _PulseState(); }
class _PulseState extends State<_Pulse> with SingleTickerProviderStateMixin {
  late final _c = AnimationController(vsync: this, duration: const Duration(seconds: 1))..repeat(reverse: true);
  @override void dispose() { _c.dispose(); super.dispose(); }
  @override Widget build(BuildContext context) => FadeTransition(opacity: _c,
      child: Container(width: 8, height: 8, decoration: BoxDecoration(color: widget.color, shape: BoxShape.circle,
          boxShadow: [BoxShadow(color: widget.color.withOpacity(.7), blurRadius: 8)])));
}
