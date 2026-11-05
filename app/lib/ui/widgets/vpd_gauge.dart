// lib/ui/widgets/vpd_gauge.dart
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/vpd_service.dart';
import 'glass_card.dart';

class VpdGauge extends StatelessWidget {
  final double? tAir, rh;
  const VpdGauge({super.key, required this.tAir, required this.rh});

  @override
  Widget build(BuildContext context) {
    if (tAir == null || rh == null) return const GlassCard(child: Text('VPD: sin datos'));
    final v = VpdService.vpd(tAir!, rh!);
    final z = VpdService.zona(v);
    final color = switch (z) { VpdZona.peligro => AppColors.danger, VpdZona.floracion => const Color(0xFFB36BFF),
        VpdZona.vegetativo => AppColors.green, VpdZona.germinacion => const Color(0xFF4DB8FF) };
    final pos = (v / 2.0).clamp(0.0, 1.0); // escala 0–2 kPa
    return GlassCard(
      borderColor: color.withOpacity(.5),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Text('VPD (Buck)', style: TextStyle(color: AppColors.muted, fontSize: 12)),
          const Spacer(),
          Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: color.withOpacity(.15), borderRadius: BorderRadius.circular(99), border: Border.all(color: color)),
              child: Text(VpdService.etiqueta(z), style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600))),
        ]),
        const SizedBox(height: 8),
        Text('${v.toStringAsFixed(2)} kPa', style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        LayoutBuilder(builder: (_, c) => Stack(children: [
          Container(height: 10, decoration: BoxDecoration(borderRadius: BorderRadius.circular(99),
              gradient: const LinearGradient(colors: [AppColors.danger, Color(0xFF4DB8FF), AppColors.green, Color(0xFFB36BFF), AppColors.danger],
                  stops: [0, .2, .5, .8, 1]))),
          AnimatedPositioned(duration: const Duration(milliseconds: 500), left: pos * (c.maxWidth - 14), top: -3,
              child: Container(width: 14, height: 16, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(4)))),
        ])),
        const SizedBox(height: 6),
        const Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('0', style: TextStyle(color: AppColors.muted, fontSize: 10)), Text('0.8', style: TextStyle(color: AppColors.muted, fontSize: 10)),
          Text('1.2', style: TextStyle(color: AppColors.muted, fontSize: 10)), Text('2.0 kPa', style: TextStyle(color: AppColors.muted, fontSize: 10)) ]),
      ]),
    );
  }
}
