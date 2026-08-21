import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_constants.dart';
import '../../core/services/audio_service.dart';
import '../../core/services/storage_service.dart';
import '../../core/theme/app_theme.dart';
import '../../data/question_bank.dart';
import '../../models/question_model.dart';
import 'celebration_dialog.dart';

class GameArenaView extends StatefulWidget {
  final String category;
  final int level;
  final String ageGroup;

  const GameArenaView({
    super.key,
    required this.category,
    required this.level,
    required this.ageGroup,
  });

  @override
  State<GameArenaView> createState() => _GameArenaViewState();
}

class _GameArenaViewState extends State<GameArenaView> {
  List<QuestionModel> _questions = [];
  int _currentIndex = 0;
  int _correctCount = 0;
  int _wrongCount = 0;
  late int _startTime;

  String? _selectedOptionId;
  bool? _isCorrect;
  bool _isAnswered = false;

  @override
  void initState() {
    super.initState();
    _startTime = DateTime.now().millisecondsSinceEpoch;
    _loadQuestions();
  }

  void _loadQuestions() {
    final qs = QuestionBank.getQuestions(
      category: widget.category,
      ageGroup: widget.ageGroup,
      level: widget.level,
    );
    setState(() {
      _questions = qs;
      _currentIndex = 0;
    });
    _speakPrompt();
  }

  void _speakPrompt() {
    if (_questions.isNotEmpty && _currentIndex < _questions.length) {
      AudioService().speak(_questions[_currentIndex].questionText);
    }
  }

  void _handleOptionSelect(QuestionOption option) {
    if (_isAnswered) return;

    final currentQ = _questions[_currentIndex];
    final correct = (option.id == currentQ.correctOptionId);

    setState(() {
      _selectedOptionId = option.id;
      _isCorrect = correct;
      _isAnswered = true;
    });

    if (correct) {
      _correctCount++;
      AudioService().playCorrect();
    } else {
      _wrongCount++;
      AudioService().playWrong();
    }

    // Auto advance after short joyful delay
    Future.delayed(const Duration(milliseconds: 1400), () {
      if (!mounted) return;
      if (_currentIndex + 1 < _questions.length) {
        setState(() {
          _currentIndex++;
          _selectedOptionId = null;
          _isCorrect = null;
          _isAnswered = false;
        });
        _speakPrompt();
      } else {
        _finishLevel();
      }
    });
  }

  void _finishLevel() async {
    final totalTimeSec = ((DateTime.now().millisecondsSinceEpoch - _startTime) / 1000).round();
    final stars = _correctCount >= (_questions.length * 0.8) ? 3 : (_correctCount >= (_questions.length * 0.5) ? 2 : 1);

    await StorageService.saveLevelResult(
      category: widget.category,
      levelNumber: widget.level,
      stars: stars,
      correct: _correctCount,
      wrong: _wrongCount,
      timeSec: totalTimeSec,
    );

    AudioService().playFanfare();

    if (mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => CelebrationDialog(
          stars: stars,
          correctCount: _correctCount,
          totalQuestions: _questions.length,
          timeSec: totalTimeSec,
          onContinue: () => Navigator.of(context).pop(),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_questions.isEmpty) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final q = _questions[_currentIndex];
    final meta = AppConstants.getCategoryMeta(widget.category);
    final progress = (_currentIndex + 1) / _questions.length;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Column(
            children: [
              // Header Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios_new_rounded),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  Row(
                    children: [
                      Text(meta.icon, style: const TextStyle(fontSize: 22)),
                      const SizedBox(width: 6),
                      Text(
                        '${meta.name} • Lvl ${widget.level}',
                        style: GoogleFonts.fredoka(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textMain,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    '${_currentIndex + 1}/${_questions.length}',
                    style: GoogleFonts.fredoka(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textMuted,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),

              // Progress Bar
              ClipRRect(
                borderRadius: BorderRadius.circular(999),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 8,
                  backgroundColor: Colors.black.withOpacity(0.06),
                  valueColor: AlwaysStoppedAnimation<Color>(meta.color),
                ),
              ),
              const SizedBox(height: 16),

              // Question Prompt Card
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: meta.lightColor.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: meta.lightColor),
                ),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.volume_up_rounded, color: AppTheme.primary),
                      onPressed: _speakPrompt,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        q.questionText,
                        style: GoogleFonts.fredoka(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textMain,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Puzzle Diagram (SVG)
              Expanded(
                flex: 3,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppTheme.textMuted.withOpacity(0.2)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.03),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  alignment: Alignment.center,
                  child: SvgPicture.string(
                    q.questionSVG,
                    fit: BoxFit.contain,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Options 2x2 or 1x3 Grid
              Expanded(
                flex: 2,
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.8,
                  ),
                  itemCount: q.options.length,
                  itemBuilder: (context, index) {
                    final opt = q.options[index];
                    final isSelected = _selectedOptionId == opt.id;

                    Color tileBg = Colors.white;
                    Color tileBorder = AppTheme.textMuted.withOpacity(0.2);

                    if (isSelected && _isCorrect == true) {
                      tileBg = AppTheme.correctBg;
                      tileBorder = AppTheme.correctBorder;
                    } else if (isSelected && _isCorrect == false) {
                      tileBg = AppTheme.wrongBg;
                      tileBorder = AppTheme.wrongBorder;
                    }

                    return GestureDetector(
                      onTap: () => _handleOptionSelect(opt),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        curve: Curves.easeOutBack,
                        decoration: BoxDecoration(
                          color: tileBg,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: tileBorder, width: isSelected ? 3 : 1.5),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.04),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.all(8),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 44,
                              height: 44,
                              child: SvgPicture.string(opt.svg, fit: BoxFit.contain),
                            ),
                            const SizedBox(width: 8),
                            Flexible(
                              child: Text(
                                opt.label,
                                style: GoogleFonts.fredoka(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.textMain,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
