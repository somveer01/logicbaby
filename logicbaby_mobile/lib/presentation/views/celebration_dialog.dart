import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:confetti/confetti.dart';
import '../../core/theme/app_theme.dart';
import '../widgets/gummy_button.dart';

class CelebrationDialog extends StatefulWidget {
  final int stars;
  final int correctCount;
  final int totalQuestions;
  final int timeSec;
  final VoidCallback onContinue;

  const CelebrationDialog({
    super.key,
    required this.stars,
    required this.correctCount,
    required this.totalQuestions,
    required this.timeSec,
    required this.onContinue,
  });

  @override
  State<CelebrationDialog> createState() => _CelebrationDialogState();
}

class _CelebrationDialogState extends State<CelebrationDialog> {
  late ConfettiController _confettiController;

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(duration: const Duration(seconds: 3));
    _confettiController.play();
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.topCenter,
      children: [
        Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('🏆', style: TextStyle(fontSize: 64)),
                const SizedBox(height: 12),
                Text(
                  'Superstar Solver!',
                  style: GoogleFonts.fredoka(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textMain,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'You solved the logic puzzles with flying colors!',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.nunito(
                    fontSize: 14,
                    color: AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 18),

                // Star Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(3, (i) {
                    final isFilled = (i + 1) <= widget.stars;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      child: Text(
                        isFilled ? '⭐' : '⚪',
                        style: TextStyle(
                          fontSize: 40,
                          color: isFilled ? const Color(0xFFF59E0B) : const Color(0xFFCBD5E1),
                        ),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 20),

                // Stats row
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  decoration: BoxDecoration(
                    color: AppTheme.background,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          Text(
                            '${widget.correctCount}/${widget.totalQuestions}',
                            style: GoogleFonts.fredoka(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.green,
                            ),
                          ),
                          Text(
                            'Correct',
                            style: GoogleFonts.nunito(fontSize: 11, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            '${widget.timeSec}s',
                            style: GoogleFonts.fredoka(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.primary,
                            ),
                          ),
                          Text(
                            'Time',
                            style: GoogleFonts.nunito(fontSize: 11, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                GummyButton(
                  height: 52,
                  onPressed: () {
                    Navigator.of(context).pop();
                    widget.onContinue();
                  },
                  child: Text(
                    'Continue ➔',
                    style: GoogleFonts.fredoka(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Confetti Cannons
        ConfettiWidget(
          confettiController: _confettiController,
          blastDirectionality: BlastDirectionality.explosive,
          shouldLoop: false,
          colors: const [
            AppTheme.yellow,
            AppTheme.pink,
            AppTheme.blue,
            AppTheme.green,
            AppTheme.orange,
          ],
        ),
      ],
    );
  }
}
