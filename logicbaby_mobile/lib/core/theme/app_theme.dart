import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Colors
  static const Color primary = Color(0xFF6C3FB5);
  static const Color primaryLight = Color(0xFF9880FF);
  static const Color primaryLighter = Color(0xFFC7B8FF);
  static const Color primaryDark = Color(0xFF4A2D80);

  static const Color green = Color(0xFF40C9A0);
  static const Color greenDark = Color(0xFF2D9B7A);
  static const Color yellow = Color(0xFFFFB800);
  static const Color orange = Color(0xFFFF6B35);
  static const Color pink = Color(0xFFEC4899);
  static const Color blue = Color(0xFF06B6D4);
  static const Color red = Color(0xFFF43F5E);

  static const Color background = Color(0xFFF6F0FE);
  static const Color surface = Colors.white;
  static const Color textMain = Color(0xFF1E1B4B);
  static const Color textSecondary = Color(0xFF475569);
  static const Color textMuted = Color(0xFF94A3B8);

  static const Color correctBg = Color(0xFFECFDF5);
  static const Color correctBorder = Color(0xFF34D399);
  static const Color wrongBg = Color(0xFFFFF1F2);
  static const Color wrongBorder = Color(0xFFFB7185);

  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,
      primaryColor: primary,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        primary: primary,
        secondary: orange,
        surface: surface,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.fredoka(
          fontSize: 32,
          fontWeight: FontWeight.w700,
          color: textMain,
        ),
        displayMedium: GoogleFonts.fredoka(
          fontSize: 26,
          fontWeight: FontWeight.w700,
          color: textMain,
        ),
        headlineSmall: GoogleFonts.fredoka(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: textMain,
        ),
        titleMedium: GoogleFonts.fredoka(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: textMain,
        ),
        bodyLarge: GoogleFonts.nunito(
          fontSize: 16,
          fontWeight: FontWeight.w700,
          color: textMain,
        ),
        bodyMedium: GoogleFonts.nunito(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: textSecondary,
        ),
      ),
    );
  }
}
