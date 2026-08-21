import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/services/audio_service.dart';
import '../../core/services/storage_service.dart';
import '../../core/theme/app_theme.dart';
import '../widgets/gummy_button.dart';

class HomeworkItem {
  final String id;
  final String subject;
  final String title;
  final String icon;
  final List<Map<String, dynamic>> questions;

  const HomeworkItem({
    required this.id,
    required this.subject,
    required this.title,
    required this.icon,
    required this.questions,
  });
}

class HomeworkHubView extends StatefulWidget {
  const HomeworkHubView({super.key});

  @override
  State<HomeworkHubView> createState() => _HomeworkHubViewState();
}

class _HomeworkHubViewState extends State<HomeworkHubView> {
  final List<HomeworkItem> _tracks = [
    const HomeworkItem(
      id: 'eng_spelling',
      subject: 'English & Phonics 🔤',
      title: 'Spelling Bee & Missing Letters',
      icon: '🐝',
      questions: [
        {
          'q': 'Which letter completes: C _ T (Meow animal)?',
          'options': ['A', 'O', 'U', 'E'],
          'correct': 'A',
          'explain': 'C-A-T makes CAT! 🐱'
        },
        {
          'q': 'Which letter completes: S _ N (Bright in the sky)?',
          'options': ['U', 'A', 'I', 'O'],
          'correct': 'U',
          'explain': 'S-U-N makes SUN! ☀️'
        },
        {
          'q': 'Which word is spelled correctly?',
          'options': ['School', 'Skool', 'Schol', 'Scool'],
          'correct': 'School',
          'explain': 'S-C-H-O-O-L is the correct spelling! 🏫'
        },
      ],
    ),
    const HomeworkItem(
      id: 'math_tables',
      subject: 'School Maths 🔢',
      title: 'Multiplication Tables (2, 3, 5, 10)',
      icon: '✖️',
      questions: [
        {
          'q': 'What is 2 × 3 = ?',
          'options': ['6', '5', '8', '4'],
          'correct': '6',
          'explain': '2 multiplied by 3 is 6!'
        },
        {
          'q': 'What is 3 × 3 = ?',
          'options': ['9', '6', '12', '8'],
          'correct': '9',
          'explain': '3 multiplied by 3 is 9!'
        },
        {
          'q': 'What is 5 × 4 = ?',
          'options': ['20', '25', '15', '18'],
          'correct': '20',
          'explain': '5 multiplied by 4 is 20!'
        },
      ],
    ),
    const HomeworkItem(
      id: 'evs_body',
      subject: 'EVS & Science 🌍',
      title: 'Our Body & Senses',
      icon: '👀',
      questions: [
        {
          'q': 'Which sense organ helps us SEE colorful things?',
          'options': ['Eyes', 'Ears', 'Nose', 'Tongue'],
          'correct': 'Eyes',
          'explain': 'Our eyes help us see everything around us! 👀'
        },
        {
          'q': 'Which organ helps us SMELL flowers and food?',
          'options': ['Nose', 'Tongue', 'Hands', 'Eyes'],
          'correct': 'Nose',
          'explain': 'We breathe and smell with our nose! 👃'
        },
      ],
    ),
  ];

  void _startHomework(HomeworkItem item) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => HomeworkQuizView(item: item),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'School Homework Hub 🎒',
          style: GoogleFonts.fredoka(fontWeight: FontWeight.w700),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          children: [
            // Hero Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF10B981), Color(0xFF059669)],
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Row(
                children: [
                  const Text('🎒', style: TextStyle(fontSize: 44)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Daily School Revision',
                          style: GoogleFonts.fredoka(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Revise spelling bee, multiplication tables & EVS for school tests!',
                          style: GoogleFonts.nunito(
                            fontSize: 12,
                            color: Colors.white.withOpacity(0.9),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Text(
              'Revision Subjects 📚',
              style: GoogleFonts.fredoka(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppTheme.textMain,
              ),
            ),
            const SizedBox(height: 14),

            ..._tracks.map((track) {
              return Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.textMuted.withOpacity(0.2)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: AppTheme.background,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      alignment: Alignment.center,
                      child: Text(track.icon, style: const TextStyle(fontSize: 24)),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            track.subject,
                            style: GoogleFonts.nunito(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.primary,
                            ),
                          ),
                          Text(
                            track.title,
                            style: GoogleFonts.fredoka(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textMain,
                            ),
                          ),
                        ],
                      ),
                    ),
                    GummyButton(
                      height: 40,
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      color: AppTheme.green,
                      shadowColor: AppTheme.greenDark,
                      onPressed: () => _startHomework(track),
                      child: Text(
                        'Start ▶',
                        style: GoogleFonts.fredoka(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

class HomeworkQuizView extends StatefulWidget {
  final HomeworkItem item;
  const HomeworkQuizView({super.key, required this.item});

  @override
  State<HomeworkQuizView> createState() => _HomeworkQuizViewState();
}

class _HomeworkQuizViewState extends State<HomeworkQuizView> {
  int _currentIndex = 0;
  String? _selectedOption;
  bool? _isCorrect;

  @override
  void initState() {
    super.initState();
    _speak();
  }

  void _speak() {
    final q = widget.item.questions[_currentIndex];
    AudioService().speak(q['q'] as String);
  }

  void _select(String opt) {
    if (_isCorrect != null) return;
    final q = widget.item.questions[_currentIndex];
    final correct = (opt == q['correct']);

    setState(() {
      _selectedOption = opt;
      _isCorrect = correct;
    });

    if (correct) {
      AudioService().playCorrect();
    } else {
      AudioService().playWrong();
    }

    Future.delayed(const Duration(milliseconds: 1400), () {
      if (!mounted) return;
      if (_currentIndex + 1 < widget.item.questions.length) {
        setState(() {
          _currentIndex++;
          _selectedOption = null;
          _isCorrect = null;
        });
        _speak();
      } else {
        AudioService().playFanfare();
        Navigator.of(context).pop();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final q = widget.item.questions[_currentIndex];
    final options = (q['options'] as List<dynamic>).cast<String>();

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.item.title, style: GoogleFonts.fredoka(fontWeight: FontWeight.w700)),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppTheme.primaryLight.withOpacity(0.2)),
                ),
                child: Column(
                  children: [
                    const Text('📝', style: TextStyle(fontSize: 48)),
                    const SizedBox(height: 12),
                    Text(
                      q['q'] as String,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.fredoka(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textMain,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              Expanded(
                child: GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.6,
                  children: options.map((opt) {
                    final isSel = _selectedOption == opt;
                    Color bg = Colors.white;
                    if (isSel && _isCorrect == true) bg = AppTheme.correctBg;
                    if (isSel && _isCorrect == false) bg = AppTheme.wrongBg;

                    return GestureDetector(
                      onTap: () => _select(opt),
                      child: Container(
                        decoration: BoxDecoration(
                          color: bg,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSel ? (_isCorrect == true ? AppTheme.correctBorder : AppTheme.wrongBorder) : AppTheme.textMuted.withOpacity(0.2),
                            width: isSel ? 3 : 1.5,
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          opt,
                          style: GoogleFonts.fredoka(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textMain,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
