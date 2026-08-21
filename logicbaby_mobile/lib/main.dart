import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/services/audio_service.dart';
import 'core/services/iap_service.dart';
import 'core/services/storage_service.dart';
import 'core/theme/app_theme.dart';
import 'presentation/views/age_selection_view.dart';
import 'presentation/views/dashboard_view.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set portrait orientation for optimal child handling
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Initialize Storage, Audio & In-App Purchases
  await StorageService.init();
  await AudioService().init();
  await IAPService().init();

  final activeProfile = await StorageService.getActiveProfile();

  runApp(LogicBabyNativeApp(initialProfileExists: activeProfile != null));
}

class LogicBabyNativeApp extends StatelessWidget {
  final bool initialProfileExists;

  const LogicBabyNativeApp({
    super.key,
    required this.initialProfileExists,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LogicBaby',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      home: initialProfileExists ? const DashboardView() : const AgeSelectionView(),
    );
  }
}
