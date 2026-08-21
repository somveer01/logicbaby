import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_constants.dart';
import '../../core/services/iap_service.dart';
import '../../core/services/storage_service.dart';
import '../../core/theme/app_theme.dart';
import '../../models/profile_model.dart';
import 'paywall_view.dart';

class ParentDashboardView extends StatefulWidget {
  const ParentDashboardView({super.key});

  @override
  State<ParentDashboardView> createState() => _ParentDashboardViewState();
}

class _ParentDashboardViewState extends State<ParentDashboardView> {
  ChildProfile? _profile;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  void _loadProfile() async {
    final p = await StorageService.getActiveProfile();
    setState(() => _profile = p);
  }

  @override
  Widget build(BuildContext context) {
    final stats = _profile?.stats ?? GlobalStats();
    final isPremium = IAPService().isPremium;
    final accuracy = stats.totalAnswered > 0
        ? ((stats.totalCorrect / stats.totalAnswered) * 100).round()
        : 100;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Parent & Educator Zone 🛡️',
          style: GoogleFonts.fredoka(fontWeight: FontWeight.w700),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Premium Status Banner
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: isPremium
                        ? [AppTheme.green, AppTheme.greenDark]
                        : [AppTheme.orange, AppTheme.yellow],
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isPremium ? '👑 Premium Pass Active' : '🔓 Free Version',
                          style: GoogleFonts.fredoka(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          isPremium
                              ? 'All 6 categories & levels unlocked'
                              : 'Upgrade to unlock all levels forever',
                          style: GoogleFonts.nunito(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.white.withOpacity(0.9),
                          ),
                        ),
                      ],
                    ),
                    if (!isPremium)
                      ElevatedButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const PaywallView()),
                          ).then((_) => setState(() {}));
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppTheme.textMain,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                        ),
                        child: Text('Unlock', style: GoogleFonts.fredoka(fontWeight: FontWeight.w700)),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              Text(
                'Learning Stats & Analytics',
                style: GoogleFonts.fredoka(fontSize: 20, fontWeight: FontWeight.w700, color: AppTheme.textMain),
              ),
              const SizedBox(height: 12),

              // Metrics 2x2
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.6,
                children: [
                  _buildMetricCard('⭐ Total Stars', '${stats.totalStars}', const Color(0xFFD97706), const Color(0xFFFFFBEB)),
                  _buildMetricCard('🎯 Accuracy', '$accuracy%', AppTheme.green, AppTheme.correctBg),
                  _buildMetricCard('🔥 Daily Streak', '${stats.currentStreak} Days', AppTheme.orange, const Color(0xFFFFF7ED)),
                  _buildMetricCard('⏱️ Total Time', '${(stats.totalTimeSec / 60).round()} mins', AppTheme.primary, AppTheme.background),
                ],
              ),
              const SizedBox(height: 24),

              Text(
                'Category Progress Breakdown',
                style: GoogleFonts.fredoka(fontSize: 20, fontWeight: FontWeight.w700, color: AppTheme.textMain),
              ),
              const SizedBox(height: 12),

              ...AppConstants.categories.map((cat) {
                final catStat = _profile?.categoryStats[cat.id] ?? CategoryStats();
                final catAccuracy = catStat.answered > 0
                    ? ((catStat.correct / catStat.answered) * 100).round()
                    : 100;

                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: cat.lightColor),
                  ),
                  child: Row(
                    children: [
                      Text(cat.icon, style: const TextStyle(fontSize: 24)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              cat.name,
                              style: GoogleFonts.fredoka(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.textMain),
                            ),
                            Text(
                              '${catStat.answered} puzzles solved • $catAccuracy% accuracy',
                              style: GoogleFonts.nunito(fontSize: 12, color: AppTheme.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '⭐ ${catStat.stars}',
                        style: GoogleFonts.fredoka(fontSize: 14, fontWeight: FontWeight.w700, color: const Color(0xFFD97706)),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, Color textColor, Color bgColor) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: textColor.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.textMuted)),
          const SizedBox(height: 4),
          Text(value, style: GoogleFonts.fredoka(fontSize: 22, fontWeight: FontWeight.w700, color: textColor)),
        ],
      ),
    );
  }
}
