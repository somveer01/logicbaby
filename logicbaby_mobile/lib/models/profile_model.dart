class CategoryStats {
  int answered;
  int correct;
  int stars;
  int levelsCompleted;

  CategoryStats({
    this.answered = 0,
    this.correct = 0,
    this.stars = 0,
    this.levelsCompleted = 0,
  });

  Map<String, dynamic> toJson() => {
    'answered': answered,
    'correct': correct,
    'stars': stars,
    'levelsCompleted': levelsCompleted,
  };

  factory CategoryStats.fromJson(Map<String, dynamic> json) => CategoryStats(
    answered: json['answered'] as int? ?? 0,
    correct: json['correct'] as int? ?? 0,
    stars: json['stars'] as int? ?? 0,
    levelsCompleted: json['levelsCompleted'] as int? ?? 0,
  );
}

class LevelProgress {
  int currentLevel;
  Map<String, int> levelStars;

  LevelProgress({
    this.currentLevel = 1,
    Map<String, int>? levelStars,
  }) : levelStars = levelStars ?? {};

  Map<String, dynamic> toJson() => {
    'currentLevel': currentLevel,
    'levelStars': levelStars,
  };

  factory LevelProgress.fromJson(Map<String, dynamic> json) => LevelProgress(
    currentLevel: json['currentLevel'] as int? ?? 1,
    levelStars: (json['levelStars'] as Map<String, dynamic>?)?.map(
      (k, v) => MapEntry(k, v as int),
    ) ?? {},
  );
}

class GlobalStats {
  int totalAnswered;
  int totalCorrect;
  int totalWrong;
  int totalStars;
  int currentStreak;
  String? lastPlayedDate;
  int totalTimeSec;

  GlobalStats({
    this.totalAnswered = 0,
    this.totalCorrect = 0,
    this.totalWrong = 0,
    this.totalStars = 0,
    this.currentStreak = 0,
    this.lastPlayedDate,
    this.totalTimeSec = 0,
  });

  Map<String, dynamic> toJson() => {
    'totalAnswered': totalAnswered,
    'totalCorrect': totalCorrect,
    'totalWrong': totalWrong,
    'totalStars': totalStars,
    'currentStreak': currentStreak,
    'lastPlayedDate': lastPlayedDate,
    'totalTimeSec': totalTimeSec,
  };

  factory GlobalStats.fromJson(Map<String, dynamic> json) => GlobalStats(
    totalAnswered: json['totalAnswered'] as int? ?? 0,
    totalCorrect: json['totalCorrect'] as int? ?? 0,
    totalWrong: json['totalWrong'] as int? ?? 0,
    totalStars: json['totalStars'] as int? ?? 0,
    currentStreak: json['currentStreak'] as int? ?? 0,
    lastPlayedDate: json['lastPlayedDate'] as String?,
    totalTimeSec: json['totalTimeSec'] as int? ?? 0,
  );
}

class MistakeLogItem {
  final String questionId;
  final String wrongOptionId;
  final String category;
  final String timestamp;

  MistakeLogItem({
    required this.questionId,
    required this.wrongOptionId,
    required this.category,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
    'questionId': questionId,
    'wrongOptionId': wrongOptionId,
    'category': category,
    'timestamp': timestamp,
  };

  factory MistakeLogItem.fromJson(Map<String, dynamic> json) => MistakeLogItem(
    questionId: json['questionId'] as String,
    wrongOptionId: json['wrongOptionId'] as String,
    category: json['category'] as String,
    timestamp: json['timestamp'] as String,
  );
}

class ChildProfile {
  final String id;
  String name;
  String ageGroup;
  String avatar;
  final String createdAt;
  GlobalStats stats;
  Map<String, CategoryStats> categoryStats;
  Map<String, LevelProgress> levelProgress;
  List<MistakeLogItem> mistakeLog;
  List<String> seenQuestionIds;
  List<String> seenQuestionSignatures;
  int preferredDifficulty;

  ChildProfile({
    required this.id,
    this.name = 'Player',
    this.ageGroup = '5-6',
    this.avatar = '🦊',
    required this.createdAt,
    GlobalStats? stats,
    Map<String, CategoryStats>? categoryStats,
    Map<String, LevelProgress>? levelProgress,
    List<MistakeLogItem>? mistakeLog,
    List<String>? seenQuestionIds,
    List<String>? seenQuestionSignatures,
    this.preferredDifficulty = 1,
  })  : stats = stats ?? GlobalStats(),
        categoryStats = categoryStats ?? {},
        levelProgress = levelProgress ?? {},
        mistakeLog = mistakeLog ?? [],
        seenQuestionIds = seenQuestionIds ?? [],
        seenQuestionSignatures = seenQuestionSignatures ?? [];

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'ageGroup': ageGroup,
    'avatar': avatar,
    'createdAt': createdAt,
    'stats': stats.toJson(),
    'categoryStats': categoryStats.map((k, v) => MapEntry(k, v.toJson())),
    'levelProgress': levelProgress.map((k, v) => MapEntry(k, v.toJson())),
    'mistakeLog': mistakeLog.map((m) => m.toJson()).toList(),
    'seenQuestionIds': seenQuestionIds,
    'seenQuestionSignatures': seenQuestionSignatures,
    'preferredDifficulty': preferredDifficulty,
  };

  factory ChildProfile.fromJson(Map<String, dynamic> json) {
    return ChildProfile(
      id: json['id'] as String,
      name: json['name'] as String? ?? 'Player',
      ageGroup: json['ageGroup'] as String? ?? '5-6',
      avatar: json['avatar'] as String? ?? '🦊',
      createdAt: json['createdAt'] as String? ?? DateTime.now().toIso8601String(),
      stats: json['stats'] != null ? GlobalStats.fromJson(json['stats'] as Map<String, dynamic>) : GlobalStats(),
      categoryStats: (json['categoryStats'] as Map<String, dynamic>?)?.map(
        (k, v) => MapEntry(k, CategoryStats.fromJson(v as Map<String, dynamic>)),
      ) ?? {},
      levelProgress: (json['levelProgress'] as Map<String, dynamic>?)?.map(
        (k, v) => MapEntry(k, LevelProgress.fromJson(v as Map<String, dynamic>)),
      ) ?? {},
      mistakeLog: (json['mistakeLog'] as List<dynamic>?)
          ?.map((m) => MistakeLogItem.fromJson(m as Map<String, dynamic>))
          .toList() ?? [],
      seenQuestionIds: (json['seenQuestionIds'] as List<dynamic>?)?.cast<String>() ?? [],
      seenQuestionSignatures: (json['seenQuestionSignatures'] as List<dynamic>?)?.cast<String>() ?? [],
      preferredDifficulty: json['preferredDifficulty'] as int? ?? 1,
    );
  }
}
