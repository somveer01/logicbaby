import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_constants.dart';
import '../../core/services/storage_service.dart';
import '../../core/theme/app_theme.dart';
import '../widgets/gummy_button.dart';
import 'dashboard_view.dart';

class AgeSelectionView extends StatefulWidget {
  const AgeSelectionView({super.key});

  @override
  State<AgeSelectionView> createState() => _AgeSelectionViewState();
}

class _AgeSelectionViewState extends State<AgeSelectionView> {
  String _selectedAgeId = '5-6';

  final Map<String, String> _avatarMap = {
    '3-4': '🐣',
    '5-6': '🦊',
    '7-8': '🦁',
    '9+': '🦅',
  };

  void _handleContinue() async {
    final avatar = _avatarMap[_selectedAgeId] ?? '🦊';
    await StorageService.createProfile('Player', _selectedAgeId, avatar);

    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const DashboardView()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 20),
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [AppTheme.orange, AppTheme.yellow]),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 4),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.orange.withOpacity(0.3),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: const Text('🧠', style: TextStyle(fontSize: 40)),
              ),
              const SizedBox(height: 16),
              Text(
                'Welcome to LogicBaby!',
                textAlign: TextAlign.center,
                style: GoogleFonts.fredoka(fontSize: 26, fontWeight: FontWeight.w700, color: AppTheme.textMain),
              ),
              const SizedBox(height: 6),
              Text(
                'Select your child\'s age group for tailored logic puzzles:',
                textAlign: TextAlign.center,
                style: GoogleFonts.nunito(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 24),

              // Age Groups Grid
              Expanded(
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 14,
                    mainAxisSpacing: 14,
                    childAspectRatio: 1.1,
                  ),
                  itemCount: AppConstants.ageGroups.length,
                  itemBuilder: (context, index) {
                    final group = AppConstants.ageGroups[index];
                    final isSelected = _selectedAgeId == group.id;

                    return GestureDetector(
                      onTap: () => setState(() => _selectedAgeId = group.id),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isSelected ? AppTheme.primaryLight.withOpacity(0.12) : Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? AppTheme.primary : AppTheme.textMuted.withOpacity(0.2),
                            width: isSelected ? 3 : 1.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: isSelected ? AppTheme.primary.withOpacity(0.15) : Colors.black.withOpacity(0.04),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(group.emoji, style: const TextStyle(fontSize: 36)),
                            const SizedBox(height: 6),
                            Text(
                              group.label,
                              style: GoogleFonts.fredoka(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: isSelected ? AppTheme.primary : AppTheme.textMain,
                              ),
                            ),
                            Text(
                              group.description,
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.nunito(fontSize: 10, color: AppTheme.textMuted, fontWeight: FontWeight.w700),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              GummyButton(
                height: 56,
                color: AppTheme.yellow,
                shadowColor: const Color(0xFFB45309),
                onPressed: _handleContinue,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Let\'s Play! 🎮',
                      style: GoogleFonts.fredoka(fontSize: 18, fontWeight: FontWeight.w700, color: const Color(0xFF78350F)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}
