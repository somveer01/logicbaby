import 'package:flutter/foundation.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class IAPService extends ChangeNotifier {
  static final IAPService _instance = IAPService._internal();
  factory IAPService() => _instance;
  IAPService._internal();

  static const String _premiumPrefKey = 'logicbaby_is_premium';
  
  // Public RevenueCat API Keys (Configure in dashboard.revenuecat.com)
  static const String _revenueCatApiKeyApple = 'appl_api_key_placeholder';
  static const String _revenueCatApiKeyGoogle = 'goog_api_key_placeholder';

  bool _isPremium = false;
  bool get isPremium => _isPremium;

  CustomerInfo? _customerInfo;
  CustomerInfo? get customerInfo => _customerInfo;

  Offerings? _offerings;
  Offerings? get offerings => _offerings;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _isPremium = prefs.getBool(_premiumPrefKey) ?? false;
    notifyListeners();

    try {
      if (defaultTargetPlatform == TargetPlatform.iOS) {
        await Purchases.configure(PurchasesConfiguration(_revenueCatApiKeyApple));
      } else if (defaultTargetPlatform == TargetPlatform.android) {
        await Purchases.configure(PurchasesConfiguration(_revenueCatApiKeyGoogle));
      }

      _customerInfo = await Purchases.getCustomerInfo();
      _checkEntitlements(_customerInfo);
      _offerings = await Purchases.getOfferings();
    } catch (e) {
      debugPrint('RevenueCat init skipped (offline or dev mode): $e');
    }
  }

  void _checkEntitlements(CustomerInfo? info) async {
    if (info == null) return;
    final isPro = info.entitlements.all['premium_pass']?.isActive ?? false;
    _isPremium = isPro;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_premiumPrefKey, isPro);
    notifyListeners();
  }

  Future<bool> purchasePackage(Package package) async {
    try {
      final customerInfo = await Purchases.purchasePackage(package);
      _checkEntitlements(customerInfo);
      return _isPremium;
    } catch (e) {
      debugPrint('Purchase error: $e');
      return false;
    }
  }

  Future<bool> restorePurchases() async {
    try {
      final customerInfo = await Purchases.restorePurchases();
      _checkEntitlements(customerInfo);
      return _isPremium;
    } catch (e) {
      debugPrint('Restore error: $e');
      return false;
    }
  }

  /// Developer / Sandbox mock unlock for local testing
  Future<void> setDebugPremium(bool value) async {
    _isPremium = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_premiumPrefKey, value);
    notifyListeners();
  }
}
