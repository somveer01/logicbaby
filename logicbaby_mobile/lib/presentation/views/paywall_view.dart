import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/iap_service.dart';
import '../widgets/gummy_button.dart';

class PaywallView extends StatefulWidget {
  const PaywallView({super.key});

  @override
  State<PaywallView> createState() => _PaywallViewState();
}

class _PaywallViewState extends State<PaywallView> {
  int _selectedPlanIndex = 0; // 0 = Monthly ($3.99), 1 = Lifetime ($9.99)
  bool _isLoading = false;

  final List<Map<String, dynamic>> _plans = [
    {
      'title': 'Monthly Pass',
      'price': '\$3.99 / month',
      'desc': 'Billed monthly. Cancel anytime.',
      'badge': null,
    },
    {
      'title': 'Lifetime Master',
      'price': '\$9.99 one-time',
      'desc': 'Pay once, unlock forever for all kids.',
      'badge': '⭐ BEST VALUE (SAVE 70%)',
    },
  ];

  void _handlePurchase() async {
    setState(() => _isLoading = true);
    // In production with live RevenueCat offerings:
    // final offering = IAPService().offerings?.current;
    // await IAPService().purchasePackage(selectedPkg);

    // Mock local success for testing & dev:
    await IAPService().setDebugPremium(true);
    setState(() => _isLoading = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎉 Premium Pass Unlocked! Enjoy all levels & puzzles!'),
          backgroundColor: AppTheme.green,
        ),
      );
      Navigator.of(context).pop(true);
    }
  }

  void _handleRestore() async {
    setState(() => _isLoading = true);
    final restored = await IAPService().restorePurchases();
    setState(() => _isLoading = false);

    if (mounted) {
      if (restored) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Purchases successfully restored!'),
            backgroundColor: AppTheme.green,
          ),
        );
        Navigator.of(context).pop(true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No previous active subscription found.'),
            backgroundColor: AppTheme.orange,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Top Close button
              Align(
                alignment: Alignment.topRight,
                child: IconButton(
                  icon: const Icon(Icons.close_rounded, size: 28, color: AppTheme.textMuted),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ),

              // Header Mascot & Crown
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.orange, AppTheme.yellow],
                  ),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 4),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.orange.withOpacity(0.35),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: const Text('👑', style: TextStyle(fontSize: 44)),
              ),
              const SizedBox(height: 16),

              Text(
                'Unlock LogicBaby Pass',
                textAlign: TextAlign.center,
                style: GoogleFonts.fredoka(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textMain,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Give your child unlimited cognitive growth & visual reasoning skills!',
                textAlign: TextAlign.center,
                style: GoogleFonts.nunito(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 24),

              // Value Propositions
              _buildFeatureRow('🧩', 'Unlimited Levels in all 6 Logic Categories'),
              _buildFeatureRow('🧠', 'Infinite Procedural Puzzles — Never Repeats!'),
              _buildFeatureRow('📊', 'Parent Cognitive Analytics & Mistake Review Hub'),
              _buildFeatureRow('🛡️', '100% Ad-Free, Child-Safe & Offline Play'),
              const SizedBox(height: 24),

              // Plan Cards
              ...List.generate(_plans.length, (index) {
                final plan = _plans[index];
                final isSelected = _selectedPlanIndex == index;

                return GestureDetector(
                  onTap: () => setState(() => _selectedPlanIndex = index),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isSelected ? AppTheme.primaryLight.withOpacity(0.08) : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected ? AppTheme.primary : AppTheme.textMuted.withOpacity(0.25),
                        width: isSelected ? 3 : 1.5,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: AppTheme.primary.withOpacity(0.15),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ]
                          : [],
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isSelected ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                          color: isSelected ? AppTheme.primary : AppTheme.textMuted,
                          size: 26,
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (plan['badge'] != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  margin: const EdgeInsets.only(bottom: 4),
                                  decoration: BoxDecoration(
                                    color: AppTheme.orange,
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                  child: Text(
                                    plan['badge'],
                                    style: GoogleFonts.nunito(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              Text(
                                plan['title'],
                                style: GoogleFonts.fredoka(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.textMain,
                                ),
                              ),
                              Text(
                                plan['desc'],
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          plan['price'],
                          style: GoogleFonts.fredoka(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: isSelected ? AppTheme.primary : AppTheme.textMain,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 20),

              // Action CTA Button
              GummyButton(
                height: 56,
                color: AppTheme.green,
                shadowColor: AppTheme.greenDark,
                onPressed: _isLoading ? null : _handlePurchase,
                child: _isLoading
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Start Learning Now 🚀',
                            style: GoogleFonts.fredoka(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
              ),
              const SizedBox(height: 14),

              // Restore & Terms
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton(
                    onPressed: _handleRestore,
                    child: Text(
                      'Restore Purchases',
                      style: GoogleFonts.nunito(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ),
                  const Text('•', style: TextStyle(color: AppTheme.textMuted)),
                  TextButton(
                    onPressed: () {},
                    child: Text(
                      'Privacy & Terms',
                      style: GoogleFonts.nunito(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureRow(String emoji, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            alignment: Alignment.center,
            child: Text(emoji, style: const TextStyle(fontSize: 20)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.nunito(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppTheme.textMain,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
