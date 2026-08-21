import 'package:flutter/material.dart';

class CategoryMeta {
  final String id;
  final String name;
  final String icon;
  final Color color;
  final Color lightColor;
  final String description;

  const CategoryMeta({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
    required this.lightColor,
    required this.description,
  });
}

class AgeGroupMeta {
  final String id;
  final String label;
  final String emoji;
  final String description;

  const AgeGroupMeta({
    required this.id,
    required this.label,
    required this.emoji,
    required this.description,
  });
}

class AppConstants {
  static const String appName = 'LogicBaby';
  static const String appVersion = '1.0.0';

  // Free Tier limit: first 3 levels are free; 4+ require Premium Pass
  static const int freeLevelLimit = 3;

  // Categories
  static const List<CategoryMeta> categories = [
    CategoryMeta(
      id: 'patterns',
      name: 'Patterns & Sequences',
      icon: '🧩',
      color: Color(0xFF8B5CF6),
      lightColor: Color(0xFFEDE9FE),
      description: 'Find what comes next in the sequence',
    ),
    CategoryMeta(
      id: 'oddOneOut',
      name: 'Odd One Out',
      icon: '🎯',
      color: Color(0xFFEC4899),
      lightColor: Color(0xFFFCE7F3),
      description: 'Spot the picture that doesn\'t belong',
    ),
    CategoryMeta(
      id: 'spatial',
      name: 'Spatial & Shapes',
      icon: '📐',
      color: Color(0xFF06B6D4),
      lightColor: Color(0xFFE0F2FE),
      description: 'Match silhouettes, rotations and geometry',
    ),
    CategoryMeta(
      id: 'math',
      name: 'Math & Numbers',
      icon: '🔢',
      color: Color(0xFF10B981),
      lightColor: Color(0xFFD1FAE5),
      description: 'Count cubes, balance scales and simple sums',
    ),
    CategoryMeta(
      id: 'sorting',
      name: 'Sorting & Grouping',
      icon: '📋',
      color: Color(0xFFF59E0B),
      lightColor: Color(0xFFFEF3C7),
      description: 'Group items by color, size and type',
    ),
    CategoryMeta(
      id: 'memory',
      name: 'Memory & Attention',
      icon: '🧠',
      color: Color(0xFFEF4444),
      lightColor: Color(0xFFFEE2E2),
      description: 'Recall positions and find hidden objects',
    ),
  ];

  // Age Groups
  static const List<AgeGroupMeta> ageGroups = [
    AgeGroupMeta(
      id: '3-4',
      label: 'Ages 3–4',
      emoji: '🐣',
      description: 'Toddler & Early Preschool',
    ),
    AgeGroupMeta(
      id: '5-6',
      label: 'Ages 5–6',
      emoji: '🦊',
      description: 'Preschool & Kindergarten',
    ),
    AgeGroupMeta(
      id: '7-8',
      label: 'Ages 7–8',
      emoji: '🦁',
      description: 'Early Primary School',
    ),
    AgeGroupMeta(
      id: '9+',
      label: 'Ages 9+',
      emoji: '🦅',
      description: 'Junior Logic Master',
    ),
  ];

  static CategoryMeta getCategoryMeta(String id) {
    return categories.firstWhere(
      (c) => c.id == id,
      orElse: () => categories.first,
    );
  }
}
