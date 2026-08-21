class QuestionOption {
  final String id;
  final String label;
  final String svg;

  const QuestionOption({
    required this.id,
    required this.label,
    required this.svg,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'label': label,
    'svg': svg,
  };

  factory QuestionOption.fromJson(Map<String, dynamic> json) => QuestionOption(
    id: json['id'] as String,
    label: json['label'] as String,
    svg: json['svg'] as String,
  );
}

class QuestionModel {
  final String id;
  final String category;
  final String ageGroup;
  final int difficulty;
  final String questionText;
  final String questionSVG;
  final List<QuestionOption> options;
  final String correctOptionId;
  final String? explanation;
  final String? signature;

  const QuestionModel({
    required this.id,
    required this.category,
    required this.ageGroup,
    required this.difficulty,
    required this.questionText,
    required this.questionSVG,
    required this.options,
    required this.correctOptionId,
    this.explanation,
    this.signature,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'category': category,
    'ageGroup': ageGroup,
    'difficulty': difficulty,
    'questionText': questionText,
    'questionSVG': questionSVG,
    'options': options.map((o) => o.toJson()).toList(),
    'correctOptionId': correctOptionId,
    'explanation': explanation,
    'signature': signature,
  };

  factory QuestionModel.fromJson(Map<String, dynamic> json) => QuestionModel(
    id: json['id'] as String,
    category: json['category'] as String,
    ageGroup: json['ageGroup'] as String,
    difficulty: json['difficulty'] as int? ?? 1,
    questionText: json['questionText'] as String,
    questionSVG: json['questionSVG'] as String,
    options: (json['options'] as List<dynamic>)
        .map((o) => QuestionOption.fromJson(o as Map<String, dynamic>))
        .toList(),
    correctOptionId: json['correctOptionId'] as String,
    explanation: json['explanation'] as String?,
    signature: json['signature'] as String?,
  );
}
