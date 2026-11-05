import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../providers/lectura_provider.dart';
import '../../providers/receta_provider.dart';
import '../../services/dosing_service.dart';
import '../../services/socket_service.dart';
import '../widgets/live_metric.dart';
import '../widgets/vpd_gauge.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lectura = ref.watch(lecturaProvider);
    final recetaAsync = ref.watch(recetaActivaProvider);
    final receta = recetaAsync.value;
    final conexion = ref.watch(conexionProvider).value ?? ConexionEstado.conectando;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sativa Nova'), 
        actions: [_ConexionChip(conexion), const SizedBox(width: 12)]
      ),
      body: RefreshIndicator(
        color: AppColors.green,
        onRefresh: () => ref.read(lecturaProvider.notifier).refrescar(),
        child: lectura.when(
          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.green)),
          error: (e, _) => _ErrorView(mensaje: '$e', onRetry: () => ref.invalidate(lecturaProvider)),
          data: (l) {
            final ec = l.tds == null ? null : DosingService.tdsToEc(l.tds!);
            String? r(double a, double b) => receta == null ? null : '$a – $b';
            
            return ListView(
              padding: const EdgeInsets.all(16), 
              children: [
                Text('Cultivo activo: ${receta?.nombre ?? 'ninguno'}', style: const TextStyle(color: AppColors.muted)),
                Text('Última lectura: ${DateFormat('dd MMM HH:mm:ss').format(l.fecha)}', style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                const SizedBox(height: 12),
                VpdGauge(tAir: l.tempAmb, rh: l.humAmb),
                const SizedBox(height: 12),
                LayoutBuilder(builder: (_, c) {
                  final cols = c.maxWidth > 900 ? 3 : 2;
                  return GridView.count(
                    crossAxisCount: cols, 
                    shrinkWrap: true, 
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 12, 
                    crossAxisSpacing: 12, 
                    childAspectRatio: cols == 3 ? 1.6 : 1.15,
                    children: [
                      LiveMetric(
                        titulo: 'Temp. Agua', 
                        unidad: '°C', 
                        valor: l.tempAgua, 
                        icono: Icons.water_drop_outlined,
                        enRango: receta?.enRango('temperatura_agua', l.tempAgua) ?? true, 
                        rango: receta == null ? null : r(receta.tAguaMin, receta.tAguaMax)
                      ),
                      LiveMetric(
                        titulo: 'Temp. Ambiente', 
                        unidad: '°C', 
                        valor: l.tempAmb, 
                        icono: Icons.thermostat_outlined,
                        enRango: receta?.enRango('temperatura_ambiente', l.tempAmb) ?? true, 
                        rango: receta == null ? null : r(receta.tAmbMin, receta.tAmbMax)
                      ),
                      LiveMetric(
                        titulo: 'Humedad Ambiente', 
                        unidad: '%', 
                        valor: l.humAmb, 
                        icono: Icons.cloud_outlined,
                        enRango: receta?.enRango('humedad_ambiente', l.humAmb) ?? true, 
                        rango: receta == null ? null : r(receta.humMin, receta.humMax)
                      ),
                      LiveMetric(
                        titulo: 'Humedad Suelo', 
                        unidad: '%', 
                        valor: l.humSuelo, 
                        icono: Icons.grass_outlined
                      ),
                      LiveMetric(
                        titulo: 'pH', 
                        unidad: '', 
                        valor: l.ph, 
                        icono: Icons.science_outlined, 
                        decimales: 2,
                        enRango: receta?.enRango('ph', l.ph) ?? true, 
                        rango: receta == null ? null : r(receta.phMin, receta.phMax), 
                        timerMs: l.alertTimers['ph']
                      ),
                      LiveMetric(
                        titulo: 'CE / TDS', 
                        unidad: 'ppm', 
                        valor: l.tds, 
                        icono: Icons.bolt_outlined, 
                        decimales: 0,
                        enRango: receta?.enRango('ec', ec) ?? true,
                        rango: receta == null ? null : '${(receta.ecMin * DosingService.tdsFactor).round()} – ${(receta.ecMax * DosingService.tdsFactor).round()} ppm (${receta.ecMin}–${receta.ecMax} mS/cm)',
                        timerMs: l.alertTimers['ec']
                      ),
                    ],
                  );
                }),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _ConexionChip extends StatelessWidget {
  final ConexionEstado e; 
  const _ConexionChip(this.e);

  @override 
  Widget build(BuildContext context) {
    final (txt, color) = switch (e) { 
      ConexionEstado.conectado => ('En vivo', AppColors.green),
      ConexionEstado.conectando => ('Reconectando…', AppColors.warning), 
      ConexionEstado.desconectado => ('Sin conexión', AppColors.danger) 
    };
    return Chip(
      label: Text(txt, style: TextStyle(color: color, fontSize: 12)), 
      backgroundColor: color.withOpacity(.12), 
      side: BorderSide(color: color)
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String mensaje; 
  final VoidCallback onRetry; 
  const _ErrorView({required this.mensaje, required this.onRetry});

  @override 
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.error_outline, color: AppColors.danger, size: 48),
        const SizedBox(height: 16),
        Text(mensaje, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.text)),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: onRetry, 
          icon: const Icon(Icons.refresh), 
          label: const Text('Reintentar')
        ),
      ]),
    ),
  );
}