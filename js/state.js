// ==========================================================================
// AppState — Centralized State Singleton
// ==========================================================================

const AppState = {
  // Current user profile
  currentProfile: null,

  // UI state
  currentView: 'dashboard',
  soundEnabled: true,
  voiceEnabled: true,
  selectedDifficulty: 1, // 1 = Easy, 2 = Medium, 3 = Hard

  // Live game session (not persisted until answer is submitted)
  gameSession: {
    category: null,
    questions: [],
    currentIndex: 0,
    answers: [],        // { questionId, selectedOptionId, correct, attempts, timeMs }
    startedAt: null,
    isReviewMode: false,
    levelNumber: 1,
    difficulty: 1
  }
};

/**
 * Reset game session to defaults
 */
export function resetGameSession() {
  AppState.gameSession = {
    category: null,
    questions: [],
    currentIndex: 0,
    answers: [],
    startedAt: null,
    isReviewMode: false,
    levelNumber: 1,
    difficulty: AppState.selectedDifficulty || 1
  };
}

/**
 * Record an answer for the current question
 */
export function recordAnswer(questionId, selectedOptionId, correct, attempts, timeMs) {
  AppState.gameSession.answers.push({
    questionId,
    selectedOptionId,
    correct,
    attempts,
    timeMs
  });
}

/**
 * Calculate stars for the completed level
 * ⭐⭐⭐ = 8+ correct on first try
 * ⭐⭐ = 5-7 correct on first try
 * ⭐ = completed (any score)
 */
export function calculateLevelStars() {
  const firstTryCorrect = AppState.gameSession.answers.filter(
    a => a.correct && a.attempts === 1
  ).length;
  
  if (firstTryCorrect >= 8) return 3;
  if (firstTryCorrect >= 5) return 2;
  return 1;
}

/**
 * Get current question from the game session
 */
export function getCurrentQuestion() {
  const { questions, currentIndex } = AppState.gameSession;
  if (currentIndex < questions.length) {
    return questions[currentIndex];
  }
  return null;
}

/**
 * Check if the game session is complete (all questions answered)
 */
export function isSessionComplete() {
  return AppState.gameSession.currentIndex >= AppState.gameSession.questions.length;
}

export default AppState;
