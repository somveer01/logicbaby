// ==========================================================================
// School Homework Revision Hub — LogicBaby
// Interactive Subject Quizzes, Voice & Text Input, Balloon Pop & Auto-Hide Mastered Tasks
// ==========================================================================

import AppState from '../state.js';
import { navigateTo } from '../router.js';
import { soundService } from '../services/soundService.js';
import { speechService } from '../services/speechService.js';
import {
  getActiveProfile,
  getCustomHomework,
  addCustomHomework,
  deleteCustomHomework,
  recordHomeworkCompleted,
  markHomeworkItemCompleted,
  resetHomeworkItem,
  clearCompletedHomework
} from '../services/storageService.js';

// Pre-built subject curriculum for school revision
const HOMEWORK_CURRICULUM = {
  english: {
    name: 'English & Phonics',
    icon: '🔤',
    color: '#8B5CF6',
    topics: [
      {
        id: 'spelling_bee',
        title: 'Spelling Bee & Missing Letters',
        icon: '🐝',
        gameType: 'quiz',
        questions: [
          { q: 'Which letter completes: C _ T (Meow animal)?', options: ['A', 'O', 'U', 'E'], correct: 'A', explain: 'C-A-T makes CAT! 🐱' },
          { q: 'Which letter completes: S _ N (Bright in the sky)?', options: ['U', 'A', 'I', 'O'], correct: 'U', explain: 'S-U-N makes SUN! ☀️' },
          { q: 'Which letter completes: B _ G (School bag)?', options: ['A', 'E', 'O', 'U'], correct: 'A', explain: 'B-A-G makes BAG! 🎒' },
          { q: 'Which word is spelled correctly?', options: ['Apple', 'Aple', 'Appel', 'Appl'], correct: 'Apple', explain: 'A-P-P-L-E is the correct spelling! 🍎' },
          { q: 'Which word is spelled correctly?', options: ['School', 'Skool', 'Schol', 'Scool'], correct: 'School', explain: 'S-C-H-O-O-L is the correct spelling! 🏫' }
        ]
      },
      {
        id: 'rhyming_words',
        title: 'Rhyming Words',
        icon: '🎵',
        gameType: 'quiz',
        questions: [
          { q: 'Which word rhymes with "CAT"?', options: ['HAT', 'DOG', 'PIG', 'CUP'], correct: 'HAT', explain: 'CAT and HAT both end with the "AT" sound! 🎩' },
          { q: 'Which word rhymes with "SUN"?', options: ['RUN', 'SIT', 'BAG', 'BED'], correct: 'RUN', explain: 'SUN and RUN rhyme together! 🏃' },
          { q: 'Which word rhymes with "STAR"?', options: ['CAR', 'TREE', 'BOOK', 'FISH'], correct: 'CAR', explain: 'STAR and CAR have the same ending sound! 🚗' },
          { q: 'Which word rhymes with "BALL"?', options: ['TALL', 'BELL', 'BULL', 'BOAT'], correct: 'TALL', explain: 'BALL and TALL rhyme! 🏀' }
        ]
      },
      {
        id: 'balloon_spelling',
        title: '🎈 Balloon Pop Spelling Game',
        icon: '🎈',
        gameType: 'balloon',
        words: ['CAT', 'DOG', 'SUN', 'STAR', 'FISH', 'LION', 'APPLE', 'HOUSE']
      }
    ]
  },
  math: {
    name: 'School Maths & Tables',
    icon: '🔢',
    color: '#10B981',
    topics: [
      {
        id: 'tables_master',
        title: 'Multiplication Tables (2, 3, 5, 10)',
        icon: '✖️',
        gameType: 'quiz',
        questions: [
          { q: 'What is 2 × 3 = ?', options: ['6', '5', '8', '4'], correct: '6', explain: '2 multiplied by 3 is 6!' },
          { q: 'What is 2 × 5 = ?', options: ['10', '12', '8', '7'], correct: '10', explain: '2 multiplied by 5 is 10!' },
          { q: 'What is 3 × 3 = ?', options: ['9', '6', '12', '8'], correct: '9', explain: '3 multiplied by 3 is 9!' },
          { q: 'What is 5 × 4 = ?', options: ['20', '25', '15', '18'], correct: '20', explain: '5 multiplied by 4 is 20!' },
          { q: 'What is 10 × 3 = ?', options: ['30', '20', '40', '13'], correct: '30', explain: '10 multiplied by 3 is 30!' }
        ]
      },
      {
        id: 'fast_addition',
        title: 'Quick Add & Subtract',
        icon: '➕',
        gameType: 'quiz',
        questions: [
          { q: 'What is 7 + 5 = ?', options: ['12', '11', '13', '14'], correct: '12', explain: '7 plus 5 equals 12!' },
          { q: 'What is 9 + 6 = ?', options: ['15', '14', '16', '13'], correct: '15', explain: '9 plus 6 equals 15!' },
          { q: 'What is 10 - 4 = ?', options: ['6', '5', '7', '4'], correct: '6', explain: '10 minus 4 leaves 6!' },
          { q: 'What is 15 - 7 = ?', options: ['8', '7', '9', '6'], correct: '8', explain: '15 take away 7 leaves 8!' }
        ]
      }
    ]
  },
  evs: {
    name: 'EVS & General Science',
    icon: '🌍',
    color: '#06B6D4',
    topics: [
      {
        id: 'body_parts',
        title: 'Our Body & 5 Senses',
        icon: '👀',
        gameType: 'quiz',
        questions: [
          { q: 'Which sense organ helps us SEE colorful things?', options: ['Eyes', 'Ears', 'Nose', 'Tongue'], correct: 'Eyes', explain: 'Our eyes help us see everything around us! 👀' },
          { q: 'Which sense organ helps us HEAR music and bells?', options: ['Ears', 'Eyes', 'Skin', 'Nose'], correct: 'Ears', explain: 'Our ears catch sounds and music! 👂' },
          { q: 'Which organ helps us SMELL flowers and food?', options: ['Nose', 'Tongue', 'Hands', 'Eyes'], correct: 'Nose', explain: 'We breathe and smell with our nose! 👃' },
          { q: 'How many fingers do we have on both hands?', options: ['10', '5', '8', '12'], correct: '10', explain: '5 + 5 = 10 fingers in total! 🖐️' }
        ]
      },
      {
        id: 'animals_nature',
        title: 'Animals, Plants & Seasons',
        icon: '🦁',
        gameType: 'quiz',
        questions: [
          { q: 'Which animal is known as the King of the Jungle?', options: ['Lion', 'Elephant', 'Monkey', 'Rabbit'], correct: 'Lion', explain: 'The mighty Lion is the king of the jungle! 🦁' },
          { q: 'Which part of the plant stays under the soil?', options: ['Roots', 'Leaves', 'Flowers', 'Fruits'], correct: 'Roots', explain: 'Roots absorb water deep under the soil! 🌱' },
          { q: 'In which season do we wear warm woolen sweaters?', options: ['Winter', 'Summer', 'Rainy', 'Spring'], correct: 'Winter', explain: 'Winter is cold, so we wear cozy sweaters! ❄️' }
        ]
      }
    ]
  }
};

let activeSession = null;
let balloonGameState = null;
let currentHwTab = 'pending'; // 'pending' | 'completed'

export function renderHomeworkHub() {
  const el = document.getElementById('main-content');
  if (!el) return;

  const customHwList = getCustomHomework();
  const pendingTasks = customHwList.filter(h => !h.completed);
  const completedTasks = customHwList.filter(h => h.completed);

  el.innerHTML = `
    <div class="homework-hub">
      <!-- Hub Header Banner -->
      <div class="homework-hero">
        <div class="homework-hero-left">
          <div class="hw-hero-icon">🎒</div>
          <div>
            <h1>School Homework & Games Hub</h1>
            <p>Add your child's school homework & words to learn with animated games & balloon pop quizzes!</p>
          </div>
        </div>
        <div class="homework-hero-right">
          <button class="btn-add-custom-hw" id="btn-open-hw-modal">
            ✏️ Add Homework & Words
          </button>
          <button class="btn-hw-back" id="btn-hw-to-dashboard">
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <!-- Uploaded School Homework Tasks -->
      <div class="homework-section">
        <div class="hw-section-header" style="flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="hw-tab-pill ${currentHwTab === 'pending' ? 'active' : ''}" id="tab-hw-pending">
              🌟 To Practice (${pendingTasks.length})
            </button>
            <button class="hw-tab-pill ${currentHwTab === 'completed' ? 'active' : ''}" id="tab-hw-completed">
              🏆 Mastered & Done (${completedTasks.length})
            </button>
          </div>

          <div style="display: flex; gap: 8px;">
            ${completedTasks.length > 0 && currentHwTab === 'completed' ? `
              <button class="btn-clear-mastered" id="btn-clear-all-mastered" style="padding: 6px 12px; background: #FEE2E2; color: #DC2626; border-radius: var(--r-full); font-size: 0.8rem; font-weight: 800; border: none; cursor: pointer;">
                🧹 Clear Done Tasks
              </button>
            ` : ''}
            <button class="btn-quick-upload" id="btn-quick-upload-banner">
              ➕ Add Homework & Words
            </button>
          </div>
        </div>

        <!-- Tab 1: Pending Tasks (Only unfinished ones so baby doesn't repeat!) -->
        ${currentHwTab === 'pending' ? `
          ${pendingTasks.length === 0 ? `
            <div class="custom-hw-empty" style="background: #ECFDF5; border-color: #A7F3D0;">
              <span style="font-size: 48px; margin-bottom: 8px; display: block;">🎉</span>
              <strong style="font-size: 1.25rem; color: #065F46;">All Homework Completed & Mastered!</strong>
              <p style="margin-top: 6px; font-size: 0.95rem; color: #047857;">
                Great job! Your child has completed all homework tasks! Click <strong>"Add Homework & Words"</strong> for tomorrow's practice.
              </p>
            </div>
          ` : `
            <div class="custom-hw-grid">
              ${pendingTasks.map((hw) => `
                <div class="custom-hw-card" data-hw-id="${hw.id}">
                  <div class="custom-hw-top">
                    <span class="custom-hw-sub">${escapeHtml(hw.subject)}</span>
                    <button class="btn-del-hw" data-id="${hw.id}" title="Delete task">🗑️</button>
                  </div>
                  <div class="custom-hw-text">${escapeHtml(hw.questionText)}</div>
                  <div class="custom-hw-action">
                    <button class="btn-play-custom-hw" data-id="${hw.id}" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #8B5CF6, #6C3FB5); color: white; border-radius: var(--r-full); font-weight: 800; font-size: 0.92rem; box-shadow: 0 4px 10px rgba(108, 63, 181, 0.25);">
                      ▶ Play Quiz + 🎈 Pop Game
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        ` : `
          <!-- Tab 2: Mastered & Completed Drawer -->
          ${completedTasks.length === 0 ? `
            <div class="custom-hw-empty">
              <span style="font-size: 42px; margin-bottom: 8px; display: block;">⭐</span>
              <strong style="font-size: 1.1rem; color: var(--primary);">No Tasks Mastered Yet</strong>
              <p style="margin-top: 6px; font-size: 0.92rem;">
                When your child finishes practicing a word or puzzle, it will automatically move here!
              </p>
            </div>
          ` : `
            <div class="custom-hw-grid">
              ${completedTasks.map((hw) => `
                <div class="custom-hw-card mastered" data-hw-id="${hw.id}" style="background: #F0FDF4; border-color: #86EFAC;">
                  <div class="custom-hw-top">
                    <span class="custom-hw-sub" style="background: #DCFCE7; color: #15803D;">✅ Mastered ⭐⭐⭐</span>
                    <button class="btn-del-hw" data-id="${hw.id}" title="Delete task">🗑️</button>
                  </div>
                  <div class="custom-hw-text" style="color: #166534;">${escapeHtml(hw.questionText)}</div>
                  <div class="custom-hw-action" style="display: flex; gap: 8px;">
                    <button class="btn-reset-hw" data-id="${hw.id}" style="flex: 1; padding: 8px; background: #E2E8F0; color: var(--text-main); border-radius: var(--r-full); font-weight: 800; font-size: 0.82rem; border: none; cursor: pointer;">
                      ↺ Practice Again
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        `}
      </div>

      <!-- Core School Subject Revision -->
      <div class="homework-section">
        <div class="hw-section-header">
          <h2>📚 Interactive Subject Tracks</h2>
        </div>

        <div class="subject-tracks-grid">
          <!-- English -->
          <div class="subject-card cat-english">
            <div class="subject-header">
              <span class="subject-icon">🔤</span>
              <h3>English & Phonics</h3>
            </div>
            <p class="subject-sub">Spelling Bee, Balloon Pop & Rhymes</p>
            <div class="subject-topic-list">
              ${HOMEWORK_CURRICULUM.english.topics.map(t => `
                <div class="topic-item" data-subject="english" data-topic-id="${t.id}">
                  <span>${t.icon} ${t.title}</span>
                  <span class="topic-btn">Play ▶</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Maths -->
          <div class="subject-card cat-maths">
            <div class="subject-header">
              <span class="subject-icon">🔢</span>
              <h3>Maths & Tables</h3>
            </div>
            <p class="subject-sub">Multiplication tables & quick sums</p>
            <div class="subject-topic-list">
              ${HOMEWORK_CURRICULUM.math.topics.map(t => `
                <div class="topic-item" data-subject="math" data-topic-id="${t.id}">
                  <span>${t.icon} ${t.title}</span>
                  <span class="topic-btn">Play ▶</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- EVS -->
          <div class="subject-card cat-evs">
            <div class="subject-header">
              <span class="subject-icon">🌍</span>
              <h3>EVS & Science</h3>
            </div>
            <p class="subject-sub">Body parts, nature & living things</p>
            <div class="subject-topic-list">
              ${HOMEWORK_CURRICULUM.evs.topics.map(t => `
                <div class="topic-item" data-subject="evs" data-topic-id="${t.id}">
                  <span>${t.icon} ${t.title}</span>
                  <span class="topic-btn">Play ▶</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  document.getElementById('btn-hw-to-dashboard')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/dashboard');
  });

  document.getElementById('btn-open-hw-modal')?.addEventListener('click', () => {
    soundService.playPop();
    showUploadHomeworkModal();
  });

  document.getElementById('btn-quick-upload-banner')?.addEventListener('click', () => {
    soundService.playPop();
    showUploadHomeworkModal();
  });

  // Tab switching
  document.getElementById('tab-hw-pending')?.addEventListener('click', () => {
    soundService.playPop();
    currentHwTab = 'pending';
    renderHomeworkHub();
  });

  document.getElementById('tab-hw-completed')?.addEventListener('click', () => {
    soundService.playPop();
    currentHwTab = 'completed';
    renderHomeworkHub();
  });

  // Clear all mastered
  document.getElementById('btn-clear-all-mastered')?.addEventListener('click', () => {
    soundService.playPop();
    clearCompletedHomework();
    renderHomeworkHub();
  });

  // Reset item back to pending
  el.querySelectorAll('.btn-reset-hw').forEach(btn => {
    btn.addEventListener('click', () => {
      soundService.playPop();
      resetHomeworkItem(btn.dataset.id);
      renderHomeworkHub();
    });
  });

  // Topic Click Handlers
  el.querySelectorAll('.topic-item').forEach(item => {
    item.addEventListener('click', () => {
      soundService.playPop();
      const subjKey = item.dataset.subject;
      const topicId = item.dataset.topicId;
      const subject = HOMEWORK_CURRICULUM[subjKey];
      const topic = subject?.topics.find(t => t.id === topicId);
      if (topic) {
        if (topic.gameType === 'balloon') {
          startBalloonSpellingGame(topic.words);
        } else {
          startHomeworkSession(topic.title, topic.questions);
        }
      }
    });
  });

  // Custom HW Quiz Play
  el.querySelectorAll('.btn-play-custom-hw').forEach(btn => {
    btn.addEventListener('click', () => {
      const hwId = btn.dataset.id;
      const hw = customHwList.find(h => h.id === hwId);
      if (hw) {
        startHomeworkSession(`Homework: ${hw.subject}`, [{
          q: hw.questionText,
          options: hw.options,
          correct: hw.correctAnswer,
          explain: hw.hint || `Great job answering ${hw.correctAnswer}!`
        }], hw.id);
      }
    });
  });

  // Custom HW Balloon Pop Play
  el.querySelectorAll('.btn-play-balloon-hw').forEach(btn => {
    btn.addEventListener('click', () => {
      const hwId = btn.dataset.id;
      const hw = customHwList.find(h => h.id === hwId);
      if (hw) {
        startBalloonSpellingGame([hw.correctAnswer.toUpperCase()], hw.id);
      }
    });
  });

  // Custom HW Delete
  el.querySelectorAll('.btn-del-hw').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundService.playPop();
      deleteCustomHomework(btn.dataset.id);
      renderHomeworkHub();
    });
  });
}

function isWordItem(str) {
  if (!str) return false;
  return /^[a-zA-Z]{2,12}$/.test(str.trim());
}

// ------------------------------------------------------------------
// 🎈 GAME 1: Balloon Pop Spelling Game
// ------------------------------------------------------------------

function startBalloonSpellingGame(wordsList, hwId = null) {
  balloonGameState = {
    words: wordsList.map(w => w.toUpperCase().trim()),
    currentWordIndex: 0,
    currentLetterPos: 0,
    starsEarned: 0,
    startTime: Date.now(),
    hwId
  };

  renderBalloonRound();
}

function renderBalloonRound() {
  const el = document.getElementById('main-content');
  if (!el || !balloonGameState) return;

  const { words, currentWordIndex, currentLetterPos } = balloonGameState;

  if (currentWordIndex >= words.length) {
    handleBalloonGameComplete();
    return;
  }

  const targetWord = words[currentWordIndex];
  const targetLetter = targetWord[currentLetterPos];

  if (currentLetterPos === 0) {
    speechService.speak(`Spell the word: ${targetWord}`);
  }

  const balloonColors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
  const lettersInWord = targetWord.split('');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  const distractorLetters = [];
  while (distractorLetters.length < 3) {
    const l = alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!lettersInWord.includes(l) && !distractorLetters.includes(l)) {
      distractorLetters.push(l);
    }
  }

  const allBalloons = [...lettersInWord, ...distractorLetters].sort(() => Math.random() - 0.5);

  el.innerHTML = `
    <div class="game-arena">
      <div class="game-header">
        <button class="btn-back" id="btn-exit-balloon">← Exit Game</button>
        <div class="game-progress-info">
          <span style="font-size: 1.3rem;">🎈</span>
          <strong>Balloon Pop Spelling (${currentWordIndex + 1}/${words.length})</strong>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn-speak" id="btn-speak-word" title="Pronounce word clearly">🗣️ Hear Word</button>
          <button class="btn-speak" id="btn-spell-word" title="Spell letter sounds" style="background: #FEF3C7; border-color: #FCD34D; color: #92400E;">🔤 Phonics</button>
        </div>
      </div>

      <div class="question-card" style="text-align: center;">
        <h2 style="font-size: 1.6rem; color: var(--primary); margin-bottom: 6px;">
          Pop the balloons to spell: <span style="color: var(--orange);">${targetWord}</span>
        </h2>
        <p style="color: var(--text-secondary); margin-bottom: 18px; font-weight: 700;">
          Tap letter: <strong style="font-size: 1.5rem; color: var(--green); background: #ECFDF5; padding: 2px 10px; border-radius: 8px;">${targetLetter}</strong>
        </p>

        <!-- Word Spelling Progress Boxes -->
        <div class="spelling-progress-row">
          ${targetWord.split('').map((char, i) => {
            const isFilled = i < currentLetterPos;
            return `
              <div class="spelling-slot ${isFilled ? 'filled' : (i === currentLetterPos ? 'active-slot' : '')}">
                ${isFilled ? char : (i === currentLetterPos ? '?' : '_')}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Floating Balloons Container -->
        <div class="balloons-floating-arena">
          ${allBalloons.map((char, i) => {
            const color = balloonColors[i % balloonColors.length];
            return `
              <div class="floating-balloon-btn" data-char="${char}" style="--b-color: ${color}; animation-delay: ${i * 0.15}s;">
                <div class="balloon-body" style="background: ${color};">
                  <span>${char}</span>
                </div>
                <div class="balloon-string"></div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-exit-balloon')?.addEventListener('click', () => {
    speechService.stop();
    renderHomeworkHub();
  });

  document.getElementById('btn-speak-word')?.addEventListener('click', () => {
    speechService.speakWordSlowly(targetWord);
  });

  document.getElementById('btn-spell-word')?.addEventListener('click', () => {
    speechService.spellOutWord(targetWord);
  });

  el.querySelectorAll('.floating-balloon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      handleBalloonClick(btn, targetLetter, targetWord);
    });
  });
}

function handleBalloonClick(btn, targetLetter, targetWord) {
  if (btn.classList.contains('popped')) return;

  const clickedChar = btn.dataset.char;

  if (clickedChar === targetLetter) {
    btn.classList.add('popped');
    soundService.playPop();

    // Speak the character sound crisply and immediately!
    speechService.speakChar(clickedChar);

    balloonGameState.currentLetterPos++;

    if (balloonGameState.currentLetterPos >= targetWord.length) {
      balloonGameState.starsEarned++;

      // When word is completed, spell out char-by-char sound then pronounce the full word!
      setTimeout(() => {
        soundService.playCorrect();
        speechService.spellOutWordAndPronounce(targetWord);
      }, 300);

      setTimeout(() => {
        balloonGameState.currentWordIndex++;
        balloonGameState.currentLetterPos = 0;
        renderBalloonRound();
      }, 2600);
    } else {
      setTimeout(() => {
        renderBalloonRound();
      }, 400);
    }
  } else {
    btn.classList.add('shake-wrong');
    soundService.playWrong();
    speechService.speakChar(clickedChar);
    setTimeout(() => btn.classList.remove('shake-wrong'), 500);
  }
}

function handleBalloonGameComplete() {
  if (balloonGameState.hwId) {
    markHomeworkItemCompleted(balloonGameState.hwId, 3);
  } else {
    recordHomeworkCompleted(3);
  }
  soundService.playFanfare();

  import('./celebration.js').then(mod => {
    mod.showCelebrationModal({
      stars: 3,
      correctCount: balloonGameState.words.length,
      totalQuestions: balloonGameState.words.length,
      timeSec: Math.round((Date.now() - balloonGameState.startTime) / 1000),
      isReviewMode: true,
      onContinue: () => {
        renderHomeworkHub();
      }
    });
  });
}

// ------------------------------------------------------------------
// 🎯 GAME 2: Interactive Quiz Session
// ------------------------------------------------------------------

function startHomeworkSession(title, questions, hwId = null) {
  activeSession = {
    title,
    questions,
    currentIndex: 0,
    correctCount: 0,
    startTime: Date.now(),
    hwId
  };

  renderHomeworkQuestion();
}

function renderHomeworkQuestion() {
  const el = document.getElementById('main-content');
  if (!el || !activeSession) return;

  const { title, questions, currentIndex } = activeSession;

  if (currentIndex >= questions.length) {
    handleHomeworkComplete();
    return;
  }

  const q = questions[currentIndex];
  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

  speechService.speak(q.q);

  el.innerHTML = `
    <div class="game-arena">
      <div class="game-header">
        <button class="btn-back" id="btn-exit-hw">← Exit Revision</button>
        <div class="game-progress-info">
          <span style="font-size: 1.3rem;">🎒</span>
          <strong>${escapeHtml(title)}</strong>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="progress-count">${currentIndex + 1}/${questions.length}</span>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width: ${progressPct}%;"></div>
          </div>
        </div>
      </div>

      <div class="question-card" id="hw-question-card">
        <div class="question-prompt">
          <button class="btn-speak" id="btn-speak-hw-q" title="Listen to question">🔊</button>
          <div class="question-text">${escapeHtml(q.q)}</div>
        </div>

        <div class="hw-visual-box">
          <div class="hw-flash-card">
            <span style="font-size: 52px;">📝</span>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--primary); margin-top: 8px;">
              School Homework Card #${currentIndex + 1}
            </div>
          </div>
        </div>

        <div class="hw-options-grid">
          ${q.options.map((opt, idx) => `
            <div class="hw-option-card" data-opt="${escapeHtml(opt)}">
              <span class="hw-opt-index">${String.fromCharCode(65 + idx)}</span>
              <span class="hw-opt-label">${escapeHtml(opt)}</span>
            </div>
          `).join('')}
        </div>

        <div id="hw-feedback-area"></div>
      </div>
    </div>
  `;

  document.getElementById('btn-exit-hw')?.addEventListener('click', () => {
    speechService.stop();
    renderHomeworkHub();
  });

  document.getElementById('btn-speak-hw-q')?.addEventListener('click', () => {
    speechService.speak(q.q);
  });

  el.querySelectorAll('.hw-option-card').forEach(card => {
    card.addEventListener('click', () => {
      handleHomeworkOption(card, q);
    });
  });
}

function handleHomeworkOption(card, question) {
  if (card.classList.contains('disabled') || card.classList.contains('correct') || card.classList.contains('wrong')) return;

  const chosen = card.dataset.opt;
  const isCorrect = (chosen.toLowerCase().trim() === question.correct.toLowerCase().trim());
  const feedback = document.getElementById('hw-feedback-area');

  // Pronounce the word clearly for child audio learning
  speechService.speakWordSlowly(chosen);

  if (isCorrect) {
    card.classList.add('correct');
    soundService.playCorrect();
    activeSession.correctCount++;

    if (feedback) {
      feedback.innerHTML = `
        <div class="feedback-banner correct" style="margin-top: 16px;">
          <div class="feedback-msg">
            <span>🎉 Outstanding! That's correct!</span>
            <span style="font-size: 0.9rem; font-weight: 600; opacity: 0.95;">${escapeHtml(question.explain)}</span>
          </div>
          <button class="btn-next correct" id="btn-hw-next">Next ➔</button>
        </div>
      `;

      document.getElementById('btn-hw-next')?.addEventListener('click', () => {
        activeSession.currentIndex++;
        renderHomeworkQuestion();
      });
    }

    setTimeout(() => {
      const nextBtn = document.getElementById('btn-hw-next');
      if (nextBtn) nextBtn.click();
    }, 1800);

  } else {
    card.classList.add('wrong');
    soundService.playWrong();
    if (feedback) {
      feedback.innerHTML = `
        <div class="feedback-banner wrong" style="margin-top: 16px;">
          <div class="feedback-msg">
            <span>🤔 Almost! Try again!</span>
          </div>
        </div>
      `;
    }
  }
}

function handleHomeworkComplete() {
  soundService.playCorrect();

  // If question is a spelling word, seamlessly transition to Balloon Pop game!
  const firstQ = activeSession?.questions?.[0];
  const wordCandidate = firstQ?.correct?.replace(/[^a-zA-Z]/g, '');

  if (wordCandidate && isWordItem(wordCandidate)) {
    const el = document.getElementById('main-content');
    if (el) {
      speechService.speak(`Awesome! Now pop the balloons to spell ${wordCandidate}!`);
      el.innerHTML = `
        <div class="game-arena" style="text-align: center; padding: 40px 20px;">
          <div class="baby-bounce" style="font-size: 64px; margin-bottom: 12px;">🎉🎈</div>
          <h2 style="font-size: 1.8rem; color: var(--primary); font-family: var(--font-heading); margin-bottom: 8px;">
            Awesome Job! That's Correct!
          </h2>
          <p style="font-size: 1.1rem; color: #047857; font-weight: 800; margin-bottom: 24px;">
            Now let's Pop the Letter Balloons to Spell: <span style="color: var(--orange); font-size: 1.4rem;">${wordCandidate.toUpperCase()}</span>!
          </p>
          <div style="font-size: 1.8rem; animation: float 1.5s infinite;">🎈 🎈 🎈</div>
        </div>
      `;
    }

    setTimeout(() => {
      startBalloonSpellingGame([wordCandidate.toUpperCase()], activeSession.hwId);
    }, 1400);
    return;
  }

  // Otherwise (e.g. Math or multi-question sets), finalize and celebrate
  if (activeSession.hwId) {
    markHomeworkItemCompleted(activeSession.hwId, 3);
  } else {
    recordHomeworkCompleted(3);
  }
  soundService.playFanfare();

  import('./celebration.js').then(mod => {
    mod.showCelebrationModal({
      stars: 3,
      correctCount: activeSession.correctCount,
      totalQuestions: activeSession.questions.length,
      timeSec: Math.round((Date.now() - activeSession.startTime) / 1000),
      isReviewMode: true,
      onContinue: () => {
        renderHomeworkHub();
      }
    });
  });
}

// ------------------------------------------------------------------
// ✏️ Custom Homework, Voice Dictation & Word Converter Modal
// ------------------------------------------------------------------

export function showUploadHomeworkModal() {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.className = 'modal-container';
  modalContainer.innerHTML = `
    <div class="modal-card" style="max-width: 600px; text-align: left; position: relative;">
      <button class="modal-close" id="btn-hw-modal-close-x" title="Close">✕</button>

      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
        <span style="font-size: 32px;">🎙️</span>
        <h2 style="font-size: 1.55rem; color: var(--primary); font-family: var(--font-heading); margin: 0;">
          Speak or Add Words to Learn
        </h2>
      </div>
      <p style="font-size: 0.92rem; color: var(--text-secondary); margin-bottom: 16px; font-weight: 600;">
        Tell us the words or math sums! We'll turn them into interactive quiz games and balloon pop spelling!
      </p>

      <!-- 🎙️ Giant Mobile Voice Dictation Button -->
      <div style="margin-bottom: 16px;">
        <button class="btn-voice-dictate" id="btn-trigger-voice" style="width: 100%; min-height: 58px; padding: 14px 20px; background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; border-radius: 20px; font-weight: 800; font-size: 1.12rem; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35); cursor: pointer; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);">
          <span id="voice-btn-icon" style="font-size: 26px;">🎙️</span>
          <span id="voice-btn-text">Tap to Speak Words (Voice Dictation)</span>
        </button>
        <div id="hw-voice-status" style="margin-top: 8px; font-size: 0.9rem; font-weight: 800; color: #059669; text-align: center; min-height: 22px; padding: 4px 10px; border-radius: 12px; background: #ECFDF5; border: 1.5px solid #A7F3D0;">
          💡 Tap button above and speak words like: <em>"Lion, Tiger, Elephant"</em> or <em>"2 x 3 = 6"</em>
        </div>
      </div>

      <!-- Quick 1-Tap Topic Packs for Instant Testing -->
      <div style="margin-bottom: 16px; background: #F8FAFC; padding: 12px 14px; border-radius: 18px; border: 2px solid #E2E8F0;">
        <span style="font-size: 0.82rem; font-weight: 800; color: var(--text-secondary); display: block; margin-bottom: 8px;">
          ⚡ Or Choose a Quick 1-Tap Word Pack:
        </span>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <button class="quick-pack-btn" data-pack="Peacock\nParrot\nSparrow\nEagle\nDuck" style="padding: 8px 14px; background: white; border: 2px solid #DDD6FE; border-radius: 20px; font-size: 0.88rem; font-weight: 800; cursor: pointer; color: var(--text-main);">🦚 Birds</button>
          <button class="quick-pack-btn" data-pack="Lion\nTiger\nElephant\nGiraffe\nMonkey" style="padding: 8px 14px; background: white; border: 2px solid #DDD6FE; border-radius: 20px; font-size: 0.88rem; font-weight: 800; cursor: pointer; color: var(--text-main);">🦁 Animals</button>
          <button class="quick-pack-btn" data-pack="Apple\nBanana\nMango\nOrange\nGrapes" style="padding: 8px 14px; background: white; border: 2px solid #DDD6FE; border-radius: 20px; font-size: 0.88rem; font-weight: 800; cursor: pointer; color: var(--text-main);">🍎 Fruits</button>
          <button class="quick-pack-btn" data-pack="Red\nBlue\nGreen\nYellow\nPurple\nOrange" style="padding: 8px 14px; background: white; border: 2px solid #DDD6FE; border-radius: 20px; font-size: 0.88rem; font-weight: 800; cursor: pointer; color: var(--text-main);">🌈 Colors</button>
          <button class="quick-pack-btn" data-pack="School\nBook\nPencil\nEraser\nBag" style="padding: 8px 14px; background: white; border: 2px solid #DDD6FE; border-radius: 20px; font-size: 0.88rem; font-weight: 800; cursor: pointer; color: var(--text-main);">🎒 School</button>
          <button class="quick-pack-btn" data-pack="2 x 3 = 6\n3 x 4 = 12\n5 x 5 = 25\n10 x 2 = 20" style="padding: 8px 14px; background: white; border: 2px solid #DDD6FE; border-radius: 20px; font-size: 0.88rem; font-weight: 800; cursor: pointer; color: var(--text-main);">🔢 Math Tables</button>
        </div>
      </div>

      <!-- Detected/Added Word Chips Box -->
      <div id="hw-word-chips-box" style="display: none; margin-bottom: 14px; background: #F5F3FF; border: 2px solid #DDD6FE; border-radius: 18px; padding: 12px 14px;">
        <div style="font-size: 0.85rem; color: var(--primary); margin-bottom: 8px; font-weight: 800;">
          ✨ Words Ready for Game (Tap ✕ to remove):
        </div>
        <div id="hw-word-chips-container"></div>
      </div>

      <!-- Editable Words & Questions Box -->
      <div style="margin-bottom: 16px;">
        <label for="hw-bulk-input" style="font-weight: 800; font-size: 0.9rem; color: var(--text-main); display: block; margin-bottom: 6px;">
          Words / Questions to Practice (1 per line):
        </label>
        <textarea
          id="hw-bulk-input"
          rows="4"
          placeholder="Speak or type words here...&#10;e.g.&#10;Elephant&#10;Butterfly&#10;Sunflower&#10;4 x 5 = 20"
          style="width: 100%; min-height: 110px; padding: 12px 16px; border: 2.5px solid #CBD5E1; border-radius: 18px; font-family: var(--font-body); font-size: 1.05rem; font-weight: 700; color: #1E1B4B; line-height: 1.5; outline: none; transition: border-color 0.2s;"
        ></textarea>
      </div>

      <!-- Big Mobile Action Buttons -->
      <div style="display: flex; gap: 12px; align-items: center; margin-top: 10px;">
        <button class="btn-cancel" id="btn-hw-modal-cancel" style="min-height: 54px; padding: 0 24px; background: #F1F5F9; border-radius: var(--r-full); font-weight: 800; font-size: 1.05rem; color: #475569; border: none; cursor: pointer; transition: all 0.2s;">
          ❌ Cancel
        </button>
        <button class="btn-save-setting" id="btn-hw-auto-convert" style="flex: 1; min-height: 56px; padding: 0 24px; background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; border-radius: var(--r-full); font-weight: 800; font-size: 1.15rem; box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s;">
          <span>🎮 Turn into Game!</span>
        </button>
      </div>
    </div>
  `;

  // Close handlers
  const closeModal = () => {
    modalContainer.className = 'modal-container hidden';
    modalContainer.innerHTML = '';
  };

  document.getElementById('btn-hw-modal-cancel')?.addEventListener('click', closeModal);
  document.getElementById('btn-hw-modal-close-x')?.addEventListener('click', closeModal);

  const voiceStatus = document.getElementById('hw-voice-status');
  const voiceBtn = document.getElementById('btn-trigger-voice');
  const voiceBtnIcon = document.getElementById('voice-btn-icon');
  const voiceBtnText = document.getElementById('voice-btn-text');
  const textarea = document.getElementById('hw-bulk-input');

  // Update chips when user types or speaks
  const updateChipsFromInput = () => {
    if (!textarea) return;
    const lines = textarea.value.split('\n').map(l => l.trim()).filter(Boolean);
    const words = lines.map(w => w.split('=')[0].replace(/[^a-zA-Z]/g, '').trim()).filter(Boolean);
    renderScannedWordChips(words);
  };

  textarea?.addEventListener('input', updateChipsFromInput);

  // Quick Pack buttons
  document.querySelectorAll('.quick-pack-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      soundService.playPop();
      if (textarea) {
        textarea.value = btn.dataset.pack;
        updateChipsFromInput();
      }
      if (voiceStatus) {
        voiceStatus.innerHTML = `✅ Added <strong>${btn.innerText}</strong> pack! Tap <strong>"Turn into Game!"</strong> below.`;
      }
    });
  });

  // Mobile Voice Recognition (Speech-to-Text)
  let activeRecognition = null;
  let isListening = false;

  document.getElementById('btn-trigger-voice')?.addEventListener('click', () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Voice dictation is not supported in this browser. Please type words directly in the box below!');
      return;
    }

    if (isListening && activeRecognition) {
      activeRecognition.stop();
      return;
    }

    try {
      soundService.playPop();
      const recognition = new SpeechRec();
      activeRecognition = recognition;
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        isListening = true;
        if (voiceBtn) {
          voiceBtn.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
          voiceBtn.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.45)';
        }
        if (voiceBtnIcon) voiceBtnIcon.textContent = '🔴';
        if (voiceBtnText) voiceBtnText.textContent = 'Listening... Speak Words Now!';
        if (voiceStatus) {
          voiceStatus.style.background = '#FEF2F2';
          voiceStatus.style.borderColor = '#FCA5A5';
          voiceStatus.style.color = '#991B1B';
          voiceStatus.innerHTML = '🎙️ <strong>Listening... Say your words now!</strong> (Tap again when done)';
        }
      };

      recognition.onresult = (event) => {
        let finalTranscripts = [];
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscripts.push(event.results[i][0].transcript);
          }
        }

        if (finalTranscripts.length > 0) {
          const rawSpoken = finalTranscripts.join(' ');
          // Clean into clean individual words
          const wordsFound = rawSpoken
            .split(/[\s,]+/)
            .map(w => w.replace(/[^a-zA-Z0-9+\-*/=]/g, '').trim())
            .filter(w => w.length > 1);

          if (wordsFound.length > 0 && textarea) {
            const currentLines = textarea.value.split('\n').map(l => l.trim()).filter(Boolean);
            wordsFound.forEach(w => {
              const cap = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
              if (!currentLines.includes(cap)) {
                currentLines.push(cap);
              }
            });
            textarea.value = currentLines.join('\n');
            updateChipsFromInput();
            soundService.playCorrect();

            if (voiceStatus) {
              voiceStatus.innerHTML = `✨ Added: <strong>${wordsFound.join(', ')}</strong>! Keep speaking or tap button when done.`;
            }
          }
        }
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        if (voiceStatus) {
          voiceStatus.innerHTML = '💡 Voice listening finished. You can type words or tap "Turn into Game!"';
        }
      };

      recognition.onend = () => {
        isListening = false;
        activeRecognition = null;
        if (voiceBtn) {
          voiceBtn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
          voiceBtn.style.boxShadow = '0 6px 18px rgba(16, 185, 129, 0.35)';
        }
        if (voiceBtnIcon) voiceBtnIcon.textContent = '🎙️';
        if (voiceBtnText) voiceBtnText.textContent = 'Tap to Speak Words (Voice Dictation)';
      };

      recognition.start();
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
    }
  });

  // Auto Convert into Games
  document.getElementById('btn-hw-auto-convert')?.addEventListener('click', () => {
    const rawText = document.getElementById('hw-bulk-input')?.value;
    if (!rawText || !rawText.trim()) {
      alert('Please speak or enter at least one word or question!');
      return;
    }

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    let addedCount = 0;

    for (const line of lines) {
      if (line.includes('=')) {
        const parts = line.split('=');
        const expr = parts[0].trim();
        let ans = parts[1]?.trim();
        
        if (!ans) {
          try {
            const mathSafe = expr.replace(/x/gi, '*').replace(/[^0-9+\-*/]/g, '');
            ans = String(Function(`'use strict'; return (${mathSafe})`)());
          } catch (e) {
            ans = '10';
          }
        }

        const qText = `What is ${expr} = ?`;
        const num = parseInt(ans, 10) || 0;
        addCustomHomework({
          subject: 'School Maths',
          questionText: qText,
          correctAnswer: ans,
          options: [ans, String(num + 2), String(Math.max(1, num - 2)), String(num + 5)].sort(() => Math.random() - 0.5)
        });
        addedCount++;
      } else {
        const cleaned = sanitizeWord(line);
        if (cleaned && isMeaningfulWord(cleaned)) {
          const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
          const info = classifyEducationalWord(capitalized);
          const distractors = generateSpellingDistractors(capitalized);

          addCustomHomework({
            subject: info.subject,
            questionText: `${info.promptPrefix} ${capitalized.toUpperCase()} ${info.emoji}`,
            correctAnswer: capitalized,
            options: [capitalized, ...distractors].sort(() => Math.random() - 0.5),
            hint: `Look for the ${info.categoryName} with spelling: ${capitalized} ${info.emoji}`
          });
          addedCount++;
        }
      }
    }

    if (addedCount === 0) {
      alert('No meaningful words or math equations found! Please try typing or speaking words.');
      return;
    }

    closeModal();
    soundService.playFanfare();
    renderHomeworkHub();
  });
}

/**
 * Render Interactive Word Chips
 */
function renderScannedWordChips(words) {
  const container = document.getElementById('hw-word-chips-container');
  const box = document.getElementById('hw-word-chips-box');
  if (!container || !words.length) {
    if (box) box.style.display = 'none';
    return;
  }
  if (box) box.style.display = 'block';

  const chipsHtml = `
    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
      ${words.map(w => {
        const info = classifyEducationalWord(w);
        return `
          <span class="ocr-word-chip" data-word="${escapeHtml(w)}" style="display: inline-flex; align-items: center; gap: 4px; background: white; border: 1.5px solid #DDD6FE; padding: 4px 10px; border-radius: var(--r-full); font-size: 0.85rem; font-weight: 800; color: var(--text-main); box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            ${info.emoji} ${escapeHtml(w)}
            <button class="btn-remove-chip" data-word="${escapeHtml(w)}" style="background: none; border: none; font-size: 12px; color: #EF4444; cursor: pointer; font-weight: bold; margin-left: 2px;">✕</button>
          </span>
        `;
      }).join('')}
    </div>
  `;

  container.innerHTML = chipsHtml;

  container.querySelectorAll('.btn-remove-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wordToRemove = btn.dataset.word;
      const chip = btn.closest('.ocr-word-chip');
      if (chip) chip.remove();

      const textarea = document.getElementById('hw-bulk-input');
      if (textarea) {
        const remaining = textarea.value
          .split('\n')
          .filter(line => line.trim().toLowerCase() !== wordToRemove.toLowerCase())
          .join('\n');
        textarea.value = remaining;
      }
    });
  });
}

// ------------------------------------------------------------------
// 🛡️ Intelligent OCR Noise & Gibberish Filtering Pipeline
// ------------------------------------------------------------------

const NOISE_WORDS = new Set([
  'hw', 'homework', 'h.w', 'cw', 'c.w', 'classwork', 'date', 'day', 'page', 'pg',
  'name', 'class', 'std', 'sec', 'roll', 'no', 'signature', 'sign', 'teacher',
  'marks', 'grade', 'score', 'total', 'subject', 'lesson', 'chapter', 'unit',
  'test', 'exam', 'practice', 'exercise', 'revision', 'write', 'learn', 'read',
  'fill', 'blanks', 'match', 'following', 'ans', 'ques', 'q1', 'q2', 'q3', 'q4',
  'the', 'is', 'are', 'and', 'to', 'in', 'on', 'of', 'for', 'with', 'at', 'by'
]);

function filterAndCleanOcrText(rawText) {
  if (!rawText) return [];

  const rawLines = rawText.split(/[\n,;]+/);
  const validItems = [];
  const seen = new Set();

  for (let line of rawLines) {
    line = line.trim();
    if (!line) continue;

    if (/[\d]+\s*[\+\-\*xX\/]\s*[\d]+/.test(line)) {
      const cleanedEq = line.replace(/[^0-9+\-*xX\/= ]/g, '').trim();
      if (cleanedEq && !seen.has(cleanedEq)) {
        seen.add(cleanedEq);
        validItems.push(cleanedEq);
      }
      continue;
    }

    const wordsInLine = line.split(/\s+/);
    for (let token of wordsInLine) {
      const clean = sanitizeWord(token);
      if (!clean) continue;

      const lower = clean.toLowerCase();
      if (NOISE_WORDS.has(lower)) continue;

      const corrected = fuzzyCorrectWord(clean);
      if (corrected && !seen.has(corrected.toLowerCase())) {
        seen.add(corrected.toLowerCase());
        validItems.push(corrected);
      }
    }
  }

  return validItems;
}

function sanitizeWord(str) {
  if (!str) return '';
  return str.replace(/[^a-zA-Z]/g, '').trim();
}

function isMeaningfulWord(word) {
  if (!word || word.length < 2 || word.length > 15) return false;
  const lower = word.toLowerCase();
  if (NOISE_WORDS.has(lower)) return false;
  if (!/[aeiouyAEIOUY]/.test(lower)) return false;
  if (/[bcdfghjklmnpqrstvwxz]{4,}/i.test(lower)) return false;
  return true;
}

const KID_VOCABULARY = [
  'Peacock', 'Parrot', 'Sparrow', 'Pigeon', 'Eagle', 'Owl', 'Duck', 'Swan', 'Crow',
  'Flamingo', 'Penguin', 'Hen', 'Rooster', 'Robin', 'Kingfisher', 'Woodpecker', 'Dove',
  'Vulture', 'Ostrich', 'Crane', 'Hummingbird', 'Bird',
  'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Monkey', 'Zebra', 'Rabbit', 'Dog', 'Cat',
  'Cow', 'Horse', 'Bear', 'Deer', 'Fox', 'Wolf', 'Sheep', 'Goat', 'Kangaroo', 'Panda',
  'Camel', 'Donkey', 'Hippopotamus', 'Rhinoceros', 'Cheetah', 'Leopard', 'Koala',
  'Squirrel', 'Mouse', 'Rat', 'Frog', 'Toad', 'Snake', 'Crocodile', 'Alligator',
  'Turtle', 'Tortoise', 'Fish', 'Whale', 'Dolphin', 'Shark', 'Octopus', 'Crab',
  'Apple', 'Banana', 'Mango', 'Orange', 'Grapes', 'Watermelon', 'Strawberry', 'Pineapple',
  'Papaya', 'Guava', 'Cherry', 'Peach', 'Plum', 'Kiwi', 'Carrot', 'Potato', 'Tomato',
  'Onion', 'Cucumber', 'Peas', 'Corn', 'Brinjal', 'Cabbage', 'Cauliflower', 'Spinach',
  'Sun', 'Moon', 'Star', 'Cloud', 'Rain', 'Rainbow', 'Tree', 'Flower', 'Leaf', 'Plant',
  'River', 'Mountain', 'Forest', 'Sky', 'Grass', 'Rose', 'Sunflower', 'Lily', 'Lotus',
  'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'White', 'Black', 'Brown',
  'Summer', 'Winter', 'Spring', 'Autumn', 'Wind', 'Snow',
  'School', 'Book', 'Pencil', 'Eraser', 'Sharpener', 'Bag', 'Ruler', 'Desk', 'Chair',
  'Clock', 'Bottle', 'Table', 'House', 'Home', 'Door', 'Window', 'Mother', 'Father',
  'Sister', 'Brother', 'Baby', 'Grandmother', 'Grandfather', 'Friend', 'Teacher', 'Doctor',
  'Happy', 'Smile', 'Water', 'Milk', 'Bread', 'Ball', 'Toy', 'Train', 'Car', 'Bus', 'Aeroplane'
];

function fuzzyCorrectWord(inputWord) {
  const word = inputWord.trim();
  if (!isMeaningfulWord(word)) return null;

  const lower = word.toLowerCase();
  const exact = KID_VOCABULARY.find(v => v.toLowerCase() === lower);
  if (exact) return exact;

  if (word.length >= 4) {
    for (const vocab of KID_VOCABULARY) {
      if (Math.abs(vocab.length - word.length) <= 2) {
        if (levenshteinDistance(lower, vocab.toLowerCase()) <= (word.length <= 5 ? 1 : 2)) {
          return vocab;
        }
      }
    }
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function classifyEducationalWord(word) {
  const w = word.toLowerCase();
  
  const birds = {
    peacock: '🦚', parrot: '🦜', sparrow: '🐦', pigeon: '🕊️', eagle: '🦅',
    owl: '🦉', duck: '🦆', swan: '🦢', crow: '🐦‍⬛', flamingo: '🦩',
    penguin: '🐧', hen: '🐔', rooster: '🐓', bird: '🐦', robin: '🐦'
  };
  if (birds[w]) {
    return { subject: 'Birds & Nature 🦚', categoryName: 'bird', emoji: birds[w], promptPrefix: 'Spell the name of the bird:' };
  }

  const animals = {
    lion: '🦁', tiger: '🐯', elephant: '🐘', giraffe: '🦒', monkey: '🐒',
    zebra: '🦓', rabbit: '🐰', dog: '🐶', cat: '🐱', cow: '🐮', horse: '🐴',
    bear: '🐻', deer: '🦌', fox: '🦊', wolf: '🐺', sheep: '🐑', goat: '🐐',
    kangaroo: '🦘', panda: '🐼', camel: '🐪'
  };
  if (animals[w]) {
    return { subject: 'Animals & Wildlife 🦁', categoryName: 'animal', emoji: animals[w], promptPrefix: 'Spell the animal name:' };
  }

  const fruits = {
    apple: '🍎', banana: '🍌', mango: '🥭', orange: '🍊', grapes: '🍇',
    watermelon: '🍉', strawberry: '🍓', pineapple: '🍍', cherry: '🍒',
    carrot: '🥕', potato: '🥔', tomato: '🍅'
  };
  if (fruits[w]) {
    return { subject: 'Fruits & Food 🍎', categoryName: 'fruit/food', emoji: fruits[w], promptPrefix: 'Spell the word:' };
  }

  return { subject: 'English Spelling 🔤', categoryName: 'word', emoji: '✨', promptPrefix: 'Spell the word:' };
}

function generateSpellingDistractors(word) {
  const list = [];
  if (word.length >= 4) {
    const chars = word.split('');
    const temp = chars[chars.length - 2];
    chars[chars.length - 2] = chars[chars.length - 1];
    chars[chars.length - 1] = temp;
    list.push(chars.join(''));
  }
  const vowelReplaced = word.replace(/[aeiouAEIOU]/, 'e');
  if (vowelReplaced !== word && !list.includes(vowelReplaced)) {
    list.push(vowelReplaced);
  } else {
    list.push(word + 'e');
  }
  list.push(word.slice(0, -1));
  return list.slice(0, 3);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

