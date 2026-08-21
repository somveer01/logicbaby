import '../models/question_model.dart';

class QuestionBank {
  static final List<QuestionModel> curatedQuestions = [
    // 🧩 PATTERNS (Ages 3-4)
    QuestionModel(
      id: 'pat-cur-1',
      category: 'patterns',
      ageGroup: '3-4',
      difficulty: 1,
      questionText: 'What comes next in the pattern?',
      questionSVG: '''<svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="60" r="30" fill="#EF4444"/>
        <rect x="110" y="30" width="60" height="60" rx="12" fill="#3B82F6"/>
        <circle cx="230" cy="60" r="30" fill="#EF4444"/>
        <rect x="290" y="30" width="60" height="60" rx="12" fill="#3B82F6"/>
        <text x="375" y="75" font-size="44" font-weight="bold" fill="#6C3FB5" text-anchor="middle">?</text>
      </svg>''',
      options: [
        QuestionOption(id: 'a', label: 'Red Circle', svg: '<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="28" fill="#EF4444"/></svg>'),
        QuestionOption(id: 'b', label: 'Blue Square', svg: '<svg viewBox="0 0 80 80"><rect x="12" y="12" width="56" height="56" rx="12" fill="#3B82F6"/></svg>'),
        QuestionOption(id: 'c', label: 'Green Star', svg: '<svg viewBox="0 0 80 80"><polygon points="40,10 50,30 72,32 55,48 60,70 40,58 20,70 25,48 8,32 30,30" fill="#10B981"/></svg>'),
      ],
      correctOptionId: 'a',
      explanation: 'The pattern alternates: Circle, Square, Circle, Square, so next is Red Circle!',
    ),

    // 🎯 ODD ONE OUT (Ages 5-6)
    QuestionModel(
      id: 'odd-cur-1',
      category: 'oddOneOut',
      ageGroup: '5-6',
      difficulty: 1,
      questionText: 'Which one does NOT belong?',
      questionSVG: '''<svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
        <text x="200" y="70" font-size="48" text-anchor="middle">🍎 🍌 🥕 🍓</text>
      </svg>''',
      options: [
        QuestionOption(id: 'a', label: 'Apple', svg: '<svg viewBox="0 0 80 80"><text x="40" y="55" font-size="44" text-anchor="middle">🍎</text></svg>'),
        QuestionOption(id: 'b', label: 'Banana', svg: '<svg viewBox="0 0 80 80"><text x="40" y="55" font-size="44" text-anchor="middle">🍌</text></svg>'),
        QuestionOption(id: 'c', label: 'Carrot', svg: '<svg viewBox="0 0 80 80"><text x="40" y="55" font-size="44" text-anchor="middle">🥕</text></svg>'),
        QuestionOption(id: 'd', label: 'Strawberry', svg: '<svg viewBox="0 0 80 80"><text x="40" y="55" font-size="44" text-anchor="middle">🍓</text></svg>'),
      ],
      correctOptionId: 'c',
      explanation: 'Carrot is a vegetable, while the rest are delicious fruits!',
    ),

    // 🔢 MATH & NUMBERS (Ages 5-6)
    QuestionModel(
      id: 'math-cur-1',
      category: 'math',
      ageGroup: '5-6',
      difficulty: 1,
      questionText: 'How many shiny stars are there?',
      questionSVG: '''<svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
        <text x="70" y="75" font-size="50">⭐</text>
        <text x="140" y="75" font-size="50">⭐</text>
        <text x="210" y="75" font-size="50">⭐</text>
        <text x="280" y="75" font-size="50">⭐</text>
        <text x="350" y="75" font-size="50">⭐</text>
      </svg>''',
      options: [
        QuestionOption(id: 'a', label: '4 Stars', svg: '<svg viewBox="0 0 80 80"><text x="40" y="55" font-size="36" font-weight="bold" fill="#6C3FB5" text-anchor="middle">4</text></svg>'),
        QuestionOption(id: 'b', label: '5 Stars', svg: '<svg viewBox="0 0 80 80"><text x="40" y="55" font-size="36" font-weight="bold" fill="#6C3FB5" text-anchor="middle">5</text></svg>'),
        QuestionOption(id: 'c', label: '6 Stars', svg: '<svg viewBox="0 0 80 80"><text x="40" y="55" font-size="36" font-weight="bold" fill="#6C3FB5" text-anchor="middle">6</text></svg>'),
      ],
      correctOptionId: 'b',
      explanation: 'Counting 1, 2, 3, 4, 5 stars!',
    ),
  ];

  static List<QuestionModel> getQuestions({
    required String category,
    required String ageGroup,
    int level = 1,
  }) {
    final filtered = curatedQuestions.where(
      (q) => q.category == category && q.ageGroup == ageGroup,
    ).toList();

    if (filtered.isNotEmpty) return filtered;
    return curatedQuestions.where((q) => q.category == category).toList();
  }
}
