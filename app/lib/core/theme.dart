// lib/core/theme.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const green = Color(0xFF28D34D);
  static const bg = Color(0xFF0B0F0D);
  static const surface = Color(0xFF131A16);
  static const glass = Color(0x1AFFFFFF);
  static const glassBorder = Color(0x33FFFFFF);
  static const danger = Color(0xFFFF4D5E);
  static const warning = Color(0xFFFFB547);
  static const text = Color(0xFFEAF2EC);
  static const muted = Color(0xFF8FA396);
}

ThemeData buildTheme() {
  final base = ThemeData.dark(useMaterial3: true);
  return base.copyWith(
    scaffoldBackgroundColor: AppColors.bg,
    colorScheme: base.colorScheme.copyWith(primary: AppColors.green, surface: AppColors.surface, error: AppColors.danger),
    textTheme: GoogleFonts.interTextTheme(base.textTheme).apply(bodyColor: AppColors.text, displayColor: AppColors.text),
    appBarTheme: const AppBarTheme(backgroundColor: Colors.transparent, elevation: 0),
    filledButtonTheme: FilledButtonThemeData(style: FilledButton.styleFrom(
      backgroundColor: AppColors.green, foregroundColor: Colors.black,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)))),
    inputDecorationTheme: InputDecorationTheme(
      filled: true, fillColor: AppColors.glass,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.glassBorder))),
  );
}
