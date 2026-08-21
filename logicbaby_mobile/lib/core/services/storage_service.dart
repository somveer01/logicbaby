import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/profile_model.dart';
import '../constants/app_constants.dart';

class StorageService {
  static const String _storageKey = 'logicbaby_mobile_data';
  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  static ChildProfile createBlankProfile(String id, String name, String ageGroup, String avatar) {
    final Map<String, CategoryStats> blankCategoryStats = {};
    final Map<String, LevelProgress> blankLevelProgress = {};

    for (final cat in AppConstants.categories) {
      blankCategoryStats[cat.id] = CategoryStats();
      blankLevelProgress[cat.id] = LevelProgress();
    }

    return ChildProfile(
      id: id,
      name: name.isEmpty ? 'Player' : name,
      ageGroup: ageGroup,
      avatar: avatar,
      createdAt: DateTime.now().toIso8601String().split('T')[0],
      categoryStats: blankCategoryStats,
      levelProgress: blankLevelProgress,
    );
  }

  static Future<Map<String, dynamic>> _loadRawData() async {
    await init();
    final String? raw = _prefs?.getString(_storageKey);
    if (raw == null || raw.isEmpty) {
      return {
        'version': 1,
        'activeProfileId': null,
        'profiles': <String, dynamic>{},
      };
    }
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return {
        'version': 1,
        'activeProfileId': null,
        'profiles': <String, dynamic>{},
      };
    }
  }

  static Future<void> _saveRawData(Map<String, dynamic> data) async {
    await init();
    await _prefs?.setString(_storageKey, jsonEncode(data));
  }

  static Future<ChildProfile?> getActiveProfile() async {
    final data = await _loadRawData();
    final String? activeId = data['activeProfileId'] as String?;
    final profiles = data['profiles'] as Map<String, dynamic>?;

    if (activeId == null || profiles == null || !profiles.containsKey(activeId)) {
      return null;
    }
    return ChildProfile.fromJson(profiles[activeId] as Map<String, dynamic>);
  }

  static Future<ChildProfile> createProfile(String name, String ageGroup, String avatar) async {
    final data = await _loadRawData();
    final String id = 'profile-${DateTime.now().millisecondsSinceEpoch}';
    final profile = createBlankProfile(id, name, ageGroup, avatar);

    final profiles = (data['profiles'] as Map<String, dynamic>?) ?? {};
    profiles[id] = profile.toJson();
    data['profiles'] = profiles;
    data['activeProfileId'] = id;

    await _saveRawData(data);
    return profile;
  }

  static Future<void> saveProfile(ChildProfile profile) async {
    final data = await _loadRawData();
    final profiles = (data['profiles'] as Map<String, dynamic>?) ?? {};
    profiles[profile.id] = profile.toJson();
    data['profiles'] = profiles;
    await _saveRawData(data);
  }

  static Future<void> saveLevelResult({
    required String category,
    required int levelNumber,
    required int stars,
    required int correct,
    required int wrong,
    required int timeSec,
  }) async {
    final profile = await getActiveProfile();
    if (profile == null) return;

    // Update level progress
    final progress = profile.levelProgress[category] ?? LevelProgress();
    final prevStars = progress.levelStars['$levelNumber'] ?? 0;
    if (stars > prevStars) {
      progress.levelStars['$levelNumber'] = stars;
    }
    if (levelNumber >= progress.currentLevel) {
      progress.currentLevel = levelNumber + 1;
    }
    profile.levelProgress[category] = progress;

    // Update stats
    profile.stats.totalStars += stars;
    profile.stats.totalAnswered += (correct + wrong);
    profile.stats.totalCorrect += correct;
    profile.stats.totalWrong += wrong;
    profile.stats.totalTimeSec += timeSec;

    final catStats = profile.categoryStats[category] ?? CategoryStats();
    catStats.stars += stars;
    catStats.answered += (correct + wrong);
    catStats.correct += correct;
    catStats.levelsCompleted = progress.levelStars.values.where((s) => s > 0).length;
    profile.categoryStats[category] = catStats;

    // Daily Streak calculation
    final today = DateTime.now().toIso8601String().split('T')[0];
    if (profile.stats.lastPlayedDate != null) {
      final last = DateTime.parse(profile.stats.lastPlayedDate!);
      final curr = DateTime.parse(today);
      final diff = curr.difference(last).inDays;
      if (diff == 1) {
        profile.stats.currentStreak++;
      } else if (diff > 1) {
        profile.stats.currentStreak = 1;
      }
    } else {
      profile.stats.currentStreak = 1;
    }
    profile.stats.lastPlayedDate = today;

    await saveProfile(profile);
  }

  static Future<void> markQuestionsAsSeen(List<String> ids, [List<String> signatures = const []]) async {
    final profile = await getActiveProfile();
    if (profile == null) return;

    for (final id in ids) {
      if (!profile.seenQuestionIds.contains(id)) {
        profile.seenQuestionIds.add(id);
      }
    }
    for (final sig in signatures) {
      if (!profile.seenQuestionSignatures.contains(sig)) {
        profile.seenQuestionSignatures.add(sig);
      }
    }

    await saveProfile(profile);
  }
}
