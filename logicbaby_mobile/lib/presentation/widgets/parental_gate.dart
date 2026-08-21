import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import 'gummy_button.dart';

class ParentalGate {
  static Future<bool> verify(BuildContext context) async {
    final rand = Random();
    final a = rand.nextInt(8) + 3; // 3 to 10
    final b = rand.nextInt(8) + 2; // 2 to 9
    final correctAnswer = a + b;

    final controller = TextEditingController();
    bool isError = false;

    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              title: Row(
                children: [
                  const Text('🛡️', style: TextStyle(fontSize: 28)),
                  const SizedBox(width: 8),
                  Text(
                    'Parents Only',
                    style: GoogleFonts.fredoka(fontWeight: FontWeight.w700, color: AppTheme.textMain),
                  ),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Please solve this math question to continue:',
                    style: GoogleFonts.nunito(fontSize: 14, color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryLight.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.primaryLight.withOpacity(0.3)),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      'What is $a + $b = ?',
                      style: GoogleFonts.fredoka(fontSize: 24, fontWeight: FontWeight.w700, color: AppTheme.primary),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: controller,
                    keyboardType: TextInputType.number,
                    autofocus: true,
                    decoration: InputDecoration(
                      hintText: 'Enter answer',
                      errorText: isError ? 'Incorrect answer, please try again' : null,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(ctx).pop(false),
                  child: Text('Cancel', style: GoogleFonts.nunito(fontWeight: FontWeight.w700, color: AppTheme.textMuted)),
                ),
                GummyButton(
                  height: 44,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  onPressed: () {
                    final entered = int.tryParse(controller.text.trim());
                    if (entered == correctAnswer) {
                      Navigator.of(ctx).pop(true);
                    } else {
                      setState(() {
                        isError = true;
                        controller.clear();
                      });
                    }
                  },
                  child: Text(
                    'Continue',
                    style: GoogleFonts.fredoka(color: Colors.white, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            );
          },
        );
      },
    );

    return result ?? false;
  }
}
