// ==========================================================================
// Game Arena — Core Puzzle Gameplay Screen
// Full interactive loop: question rendering, audio synthesis, speech narration,
// gentle retry logic, scoring, and level completion celebration.
// ==========================================================================

import AppState, { recordAnswer, calculateLevelStars, resetGameSession } from '../state.js';
import { navigateTo } from '../router.js';
import { soundService } from '../services/soundService.js';
import { speechService } from '../services/speechService.js';
import {
  CATEGORY_META,
  getActiveProfile,
  recordAnswerResult,
  saveLevelResult,
  clearMistake,
  markQuestionsAsSeen,
  updatePreferredDifficulty
} from '../services/storageService.js';
import { getQuestionsForLevel, getQuestionById } from '../data/questionBank.js';
import { showCelebrationModal } from './celebration.js';

let autoAdvanceTimer = null;
let currentQuestionAttempts = 0;
let currentQuestionStartTime = 0;
let isCurrentQuestionResolved = false;

const DIFFICULTY_LABELS = {
  1: { label: 'Easy', emoji: '🌱', className: 'diff-easy' },
  2: { label: 'Medium', emoji: '⚡', className: 'diff-medium' },
  3: { label: 'Hard', emoji: '🔥', className: 'diff-hard' }
};

const PRAISE_MESSAGES = [
  '🌟 Super! You got it!',
  '🎉 Brilliant work!',
  '✨ Awesome job!',
  '👏 Spot on!',
  '🧠 Logic Master!',
  '🚀 Fantastic thinking!',
  '⭐ You did it!'
];

/**
 * Start a game session for a category and level
 * @param {string} category - Category key or 'review'
 * @param {number} [level] - Optional level number (defaults to player's current level)
 * @param {number} [difficulty] - Optional difficulty (1 = Easy, 2 = Medium, 3 = Hard)
 */
export function startGame(category, level = null, difficulty = null) {
  // Clear any existing timers
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
  speechService.stop();

  // If category is 'review', route to review mode
  if (category === 'review') {
    return startReviewMode();
  }

  const profile = AppState.currentProfile || getActiveProfile();
  const ageGroup = profile?.ageGroup || '5-6';
  const meta = CATEGORY_META[category] || CATEGORY_META.patterns;
  const currentLevel = level || profile?.levelProgress?.[category]?.currentLevel || 1;
  const currentDifficulty = difficulty || AppState.selectedDifficulty || profile?.preferredDifficulty || 1;
  AppState.selectedDifficulty = currentDifficulty;

  // Load fresh, non-repeating questions for category, age group, level and difficulty
  const questions = getQuestionsForLevel(category, ageGroup, currentLevel, 5, currentDifficulty);

  if (!questions || questions.length === 0) {
    console.warn(`No questions found for ${category} (${ageGroup}, Level ${currentLevel}, Diff ${currentDifficulty})`);
    navigateTo('#/dashboard');
    return;
  }

  // Mark questions as seen to maintain cooldown history
  markQuestionsAsSeen(questions.map(q => q.id));

  // Initialize game session in state
  resetGameSession();
  AppState.gameSession = {
    category,
    questions,
    currentIndex: 0,
    answers: [],
    startedAt: Date.now(),
    isReviewMode: false,
    levelNumber: currentLevel,
    difficulty: currentDifficulty
  };

  renderQuestion();
}

/**
 * Start Mistake Review Mode
 */
export function startReviewMode() {
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
  speechService.stop();

  const profile = AppState.currentProfile || getActiveProfile();
  const mistakeLog = profile?.mistakeLog || [];

  if (mistakeLog.length === 0) {
    renderEmptyReview();
    return;
  }

  // Resolve question objects from question IDs in mistake log
  const questions = [];
  const seenIds = new Set();

  for (const m of mistakeLog) {
    if (!seenIds.has(m.questionId)) {
      seenIds.add(m.questionId);
      const q = getQuestionById(m.questionId);
      if (q) questions.push(q);
    }
  }

  if (questions.length === 0) {
    renderEmptyReview();
    return;
  }

  resetGameSession();
  AppState.gameSession = {
    category: 'review',
    questions,
    currentIndex: 0,
    answers: [],
    startedAt: Date.now(),
    isReviewMode: true,
    levelNumber: 1
  };

  renderQuestion();
}

/**
 * Render empty review state when there are no mistakes
 */
function renderEmptyReview() {
  const el = document.getElementById('main-content');
  if (!el) return;

  el.innerHTML = `
    <div class="game-arena">
      <div class="game-header">
        <button class="btn-back" id="btn-back-from-review">← Back</button>
        <div class="game-progress-info">
          <span style="font-size: 1.3rem;">📝</span>
          <strong>Mistake Review</strong>
        </div>
      </div>

      <div class="question-card" style="text-align: center; padding: 50px 24px;">
        <div style="font-size: 64px; margin-bottom: 16px;">🏆</div>
        <h2 style="font-size: 1.6rem; margin-bottom: 8px; color: var(--green);">No Mistakes to Review!</h2>
        <p style="color: var(--text-secondary); font-size: 1.05rem; margin-bottom: 24px; max-width: 420px; margin-left: auto; margin-right: auto;">
          You've solved all your puzzles with flying colors! Play more categories to keep sharpening your brain.
        </p>
        <button class="btn-continue" id="btn-review-to-dash">← Back to Dashboard</button>
      </div>
    </div>
  `;

  document.getElementById('btn-back-from-review')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/parent');
  });

  document.getElementById('btn-review-to-dash')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/dashboard');
  });
}

/**
 * Render the current question in the arena
 */
function renderQuestion() {
  const el = document.getElementById('main-content');
  if (!el) return;

  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }

  const { category, questions, currentIndex, isReviewMode, levelNumber, difficulty } = AppState.gameSession;
  const currentDifficulty = difficulty || AppState.selectedDifficulty || 1;
  const diffMeta = DIFFICULTY_LABELS[currentDifficulty] || DIFFICULTY_LABELS[1];

  if (currentIndex >= questions.length) {
    handleLevelComplete();
    return;
  }

  const q = questions[currentIndex];
  const meta = isReviewMode
    ? { name: 'Mistake Review', icon: '📝', color: '#F59E0B' }
    : (CATEGORY_META[category] || CATEGORY_META.patterns);

  currentQuestionAttempts = 0;
  currentQuestionStartTime = Date.now();
  isCurrentQuestionResolved = false;

  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

  el.innerHTML = `
    <div class="game-arena">
      <!-- Arena Header -->
      <div class="game-header">
        <button class="btn-back" id="btn-arena-back" title="Exit puzzle">← Back</button>
        <div class="game-progress-info">
          <span style="font-size: 1.3rem;">${meta.icon}</span>
          <strong>${meta.name}${isReviewMode ? '' : ` • Lvl ${levelNumber}`}</strong>
          ${!isReviewMode ? `
            <button class="btn-diff-badge ${diffMeta.className}" id="btn-toggle-difficulty" title="Change Difficulty (Click to cycle Easy / Medium / Hard)">
              ${diffMeta.emoji} ${diffMeta.label} ▾
            </button>
          ` : ''}
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="progress-count">${currentIndex + 1}/${questions.length}</span>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width: ${progressPct}%;"></div>
          </div>
        </div>
      </div>

      <!-- Question Card -->
      <div class="question-card" id="current-question-card">
        <!-- Question Prompt Row -->
        <div class="question-prompt">
          <button class="btn-speak" id="btn-speak-question" title="Listen to question">
            🔊
          </button>
          <div class="question-text" id="question-text-el">${escapeHtml(q.questionText)}</div>
        </div>

        <!-- Question Visual Diagram -->
        <div class="question-visual">
          ${q.questionSVG}
        </div>

        <!-- Answer Options -->
        <div class="options-grid" id="options-grid">
          ${q.options.map((opt, idx) => `
            <div
              class="option-tile"
              data-option-id="${opt.id}"
              data-index="${idx}"
              tabindex="0"
              role="button"
              aria-label="Option ${opt.id.toUpperCase()}: ${escapeHtml(opt.label)}"
            >
              <div class="option-visual">${opt.svg}</div>
              <span class="option-label">${escapeHtml(opt.label)}</span>
            </div>
          `).join('')}
        </div>

        <!-- Feedback Banner Area (populated on click) -->
        <div id="feedback-area"></div>
      </div>
    </div>
  `;

  // Back button event
  document.getElementById('btn-arena-back')?.addEventListener('click', () => {
    soundService.playPop();
    speechService.stop();
    if (isReviewMode) {
      navigateTo('#/parent');
    } else {
      navigateTo('#/dashboard');
    }
  });

  // Difficulty badge button click (cycle 1 -> 2 -> 3)
  document.getElementById('btn-toggle-difficulty')?.addEventListener('click', () => {
    soundService.playPop();
    const nextDiff = (currentDifficulty % 3) + 1;
    AppState.selectedDifficulty = nextDiff;
    updatePreferredDifficulty(nextDiff);
    startGame(category, levelNumber, nextDiff);
  });

  // Speak button event
  const speakBtn = document.getElementById('btn-speak-question');
  speakBtn?.addEventListener('click', () => {
    soundService.playPop();
    narrateQuestion(q.questionText);
  });

  // Automatic voice narration on question load (if enabled)
  if (AppState.voiceEnabled) {
    narrateQuestion(q.questionText);
  }

  // Option tiles click / keydown events
  const optionTiles = el.querySelectorAll('.option-tile');
  optionTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      handleOptionSelect(tile, q);
    });

    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOptionSelect(tile, q);
      }
    });
  });

  // Keyboard shortcut listener (1-4 or A-D)
  attachKeyboardShortcuts(q);
}

/**
 * Narrate question text with speech synthesis and button animation
 */
function narrateQuestion(text) {
  const speakBtn = document.getElementById('btn-speak-question');
  if (speakBtn) {
    speakBtn.classList.add('speaking');
  }

  speechService.speak(text, () => {
    const btn = document.getElementById('btn-speak-question');
    if (btn) {
      btn.classList.remove('speaking');
    }
  });
}

/**
 * Handle selection of an answer option
 */
function handleOptionSelect(tile, question) {
  if (isCurrentQuestionResolved) return;
  if (tile.classList.contains('disabled') || tile.classList.contains('wrong')) return;

  const optionId = tile.dataset.optionId;
  const isCorrect = (optionId === question.correctOptionId);
  currentQuestionAttempts++;

  const feedbackArea = document.getElementById('feedback-area');
  const allTiles = document.querySelectorAll('.option-tile');

  if (isCorrect) {
    // ── Correct Answer ──
    isCurrentQuestionResolved = true;
    speechService.stop();

    // Mark active tile as correct
    tile.classList.add('correct');

    // Dim other non-selected tiles
    allTiles.forEach(t => {
      if (t !== tile) {
        t.classList.add('dimmed');
      }
    });

    // Play cheerful audio
    soundService.playCorrect();

    // Time spent on this question
    const timeSpentMs = Date.now() - currentQuestionStartTime;

    // Record answer in AppState session
    recordAnswer(question.id, optionId, true, currentQuestionAttempts, timeSpentMs);

    // Save answer result to LocalStorage
    recordAnswerResult(question.category, question.id, true);

    // If review mode, clear this mistake from profile
    if (AppState.gameSession.isReviewMode) {
      clearMistake(question.id);
    }

    // Refresh profile in AppState & topbar stats
    AppState.currentProfile = getActiveProfile();
    import('../app.js').then(app => {
      app.refreshTopbar();
      app.refreshMascot();
    });

    // Praise feedback
    const praise = PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];
    const isLast = (AppState.gameSession.currentIndex + 1 >= AppState.gameSession.questions.length);

    if (feedbackArea) {
      feedbackArea.innerHTML = `
        <div class="feedback-banner correct">
          <div class="feedback-msg">
            <span>${praise}</span>
            ${question.explanation ? `
              <span class="feedback-explanation-text" style="font-weight: 600; font-size: 0.9rem; opacity: 0.95;">
                ${escapeHtml(question.explanation)}
              </span>
            ` : ''}
          </div>
          <button class="btn-next correct" id="btn-next-question">
            ${isLast ? 'Finish 🏆' : 'Next ➔'}
          </button>
        </div>
      `;

      document.getElementById('btn-next-question')?.addEventListener('click', () => {
        soundService.playPop();
        advanceToNextQuestion();
      });
    }

    // Auto-advance after 1.8s
    autoAdvanceTimer = setTimeout(() => {
      advanceToNextQuestion();
    }, 1800);

  } else {
    // ── Wrong Answer (Gentle Retry) ──
    tile.classList.add('wrong', 'disabled');
    soundService.playWrong();

    // Record mistake in LocalStorage (only on first mistake)
    recordAnswerResult(question.category, question.id, false, optionId);
    AppState.currentProfile = getActiveProfile();

    if (feedbackArea) {
      feedbackArea.innerHTML = `
        <div class="feedback-banner wrong">
          <div class="feedback-msg">
            <span>Almost! Try another one 💪</span>
            ${question.hint ? `
              <span class="feedback-hint-text" style="font-weight: 600; font-size: 0.9rem;">
                💡 ${escapeHtml(question.hint)}
              </span>
            ` : ''}
          </div>
        </div>
      `;
    }
  }
}

/**
 * Advance to next question in the session
 */
function advanceToNextQuestion() {
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }

  speechService.stop();
  AppState.gameSession.currentIndex++;

  if (AppState.gameSession.currentIndex < AppState.gameSession.questions.length) {
    renderQuestion();
  } else {
    handleLevelComplete();
  }
}

/**
 * Handle completion of all questions in the level
 */
function handleLevelComplete() {
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
  speechService.stop();

  const { category, levelNumber, questions, answers, startedAt, isReviewMode } = AppState.gameSession;

  const totalQuestions = questions.length;
  const correctCount = answers.filter(a => a.correct).length;
  const wrongCount = answers.filter(a => !a.correct || a.attempts > 1).length;
  const timeSec = Math.max(1, Math.round((Date.now() - (startedAt || Date.now())) / 1000));

  const stars = calculateLevelStars();

  // Save level result to storage if not in review mode
  if (!isReviewMode) {
    saveLevelResult(category, levelNumber, stars, correctCount, wrongCount, timeSec);
  }

  // Update AppState profile and refresh UI
  AppState.currentProfile = getActiveProfile();
  import('../app.js').then(app => {
    app.refreshTopbar();
    app.refreshMascot();
  });

  // Trigger celebration modal
  showCelebrationModal({
    stars: isReviewMode ? 3 : stars,
    correctCount,
    totalQuestions,
    timeSec,
    category,
    levelNumber,
    isReviewMode,
    onContinue: () => {
      if (isReviewMode) {
        navigateTo('#/parent');
      } else {
        navigateTo('#/dashboard');
      }
    },
    onReplay: () => {
      if (isReviewMode) {
        startReviewMode();
      } else {
        startGame(category, levelNumber);
      }
    }
  });
}

/**
 * Attach keyboard shortcuts for option selection (1-4 or A-D)
 */
function attachKeyboardShortcuts(question) {
  const handler = (e) => {
    if (isCurrentQuestionResolved) return;
    const key = e.key.toLowerCase();
    let index = -1;

    if (key === '1' || key === 'a') index = 0;
    else if (key === '2' || key === 'b') index = 1;
    else if (key === '3' || key === 'c') index = 2;
    else if (key === '4' || key === 'd') index = 3;

    if (index >= 0 && index < question.options.length) {
      const tile = document.querySelector(`.option-tile[data-index="${index}"]`);
      if (tile) {
        handleOptionSelect(tile, question);
      }
    }
  };

  // Attach listener with cleanup on next render
  window.addEventListener('keydown', handler, { once: true });
}

/**
 * Safe HTML escape
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
