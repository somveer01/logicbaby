import 'package:flutter/services.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:audioplayers/audioplayers.dart';

class AudioService {
  static final AudioService _instance = AudioService._internal();
  factory AudioService() => _instance;
  AudioService._internal();

  final AudioPlayer _player = AudioPlayer();
  final FlutterTts _tts = FlutterTts();

  bool soundEnabled = true;
  bool voiceEnabled = true;

  Future<void> init() async {
    try {
      await _tts.setLanguage('en-US');
      await _tts.setPitch(1.2); // Child-friendly slightly higher pitch
      await _tts.setSpeechRate(0.45); // Gentle, clear speed for early learners
    } catch (_) {}
  }

  void playPop() {
    if (!soundEnabled) return;
    HapticFeedback.lightImpact();
    // Native haptic + sound
  }

  void playCorrect() {
    if (!soundEnabled) return;
    HapticFeedback.mediumImpact();
  }

  void playWrong() {
    if (!soundEnabled) return;
    HapticFeedback.vibrate();
  }

  void playFanfare() {
    if (!soundEnabled) return;
    HapticFeedback.heavyImpact();
  }

  Future<void> speak(String text) async {
    if (!voiceEnabled || text.isEmpty) return;
    try {
      await _tts.stop();
      await _tts.speak(text);
    } catch (_) {}
  }

  Future<void> stopSpeech() async {
    try {
      await _tts.stop();
    } catch (_) {}
  }
}
