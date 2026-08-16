// ==========================================================================
// Celebration Modal — Level-Complete Overlay with Confetti & Star Tally
// ==========================================================================

import { soundService } from '../services/soundService.js';

let modalContainer = null;
let starSoundTimeouts = [];

/**
 * Show the celebration overlay modal
 * @param {Object} opts
 * @param {number} opts.stars - Stars earned (1-3)
 * @param {number} opts.correctCount - Questions answered correctly
 * @param {number} opts.totalQuestions - Total questions in session
 * @param {number} opts.timeSec - Total time spent in seconds
 * @param {string} [opts.category] - Category key
 * @param {number} [opts.levelNumber] - Completed level number
 * @param {boolean} [opts.isReviewMode] - Is this review mode completion?
 * @param {Function} opts.onContinue - Callback when user clicks Continue
 * @param {Function} [opts.onReplay] - Callback when user clicks Replay
 */
export function showCelebrationModal({
  stars = 3,
  correctCount = 10,
  totalQuestions = 10,
  timeSec = 60,
  category = 'patterns',
  levelNumber = 1,
  isReviewMode = false,
  onContinue,
  onReplay
}) {
  modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  // Clear any existing timeouts
  starSoundTimeouts.forEach(t => clearTimeout(t));
  starSoundTimeouts = [];

  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
  const timeFormatted = formatTime(timeSec);

  let emoji = '🏆';
  let title = 'Superstar Logic Master!';
  let subtitle = 'Incredible! You solved almost everything on the first try!';

  if (isReviewMode) {
    emoji = '🎓';
    title = 'Mistakes Mastered!';
    subtitle = `You fixed ${correctCount} mistake${correctCount > 1 ? 's' : ''}! Great perseverance!`;
  } else if (stars === 3) {
    emoji = '🏆';
    title = 'Superstar Logic Master!';
    subtitle = 'Incredible! You solved almost everything on the first try!';
  } else if (stars === 2) {
    emoji = '⭐';
    title = 'Great Job!';
    subtitle = "You're getting so smart! Keep up the good work!";
  } else {
    emoji = '🌟';
    title = 'Good Effort!';
    subtitle = 'Practice makes perfect! You can replay anytime for 3 stars!';
  }

  modalContainer.className = 'modal-container';
  modalContainer.innerHTML = `
    <div class="celebration-card">
      <div class="celebration-emoji">${emoji}</div>
      <h2 class="celebration-title">${title}</h2>
      <p class="celebration-subtitle">${subtitle}</p>

      <!-- Star Rating -->
      <div class="celebration-stars" id="celeb-stars-row">
        ${[1, 2, 3].map(i => {
          const isEarned = isReviewMode ? true : i <= stars;
          return `
            <span class="celeb-star ${isEarned ? 'star-filled' : 'star-empty'}" style="animation-delay: ${i * 0.25}s">
              ⭐
            </span>
          `;
        }).join('')}
      </div>

      <!-- Stats Summary -->
      <div class="celebration-stats">
        <div class="celeb-stat">
          <div class="celeb-stat-value" style="color: var(--green);">${correctCount}/${totalQuestions}</div>
          <div class="celeb-stat-label">Correct</div>
        </div>
        <div class="celeb-stat">
          <div class="celeb-stat-value" style="color: var(--primary);">${accuracy}%</div>
          <div class="celeb-stat-label">Accuracy</div>
        </div>
        <div class="celeb-stat">
          <div class="celeb-stat-value" style="color: var(--yellow);">${timeFormatted}</div>
          <div class="celeb-stat-label">Time</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="celebration-actions">
        <button class="btn-continue" id="btn-celeb-continue">
          Continue 🚀
        </button>
        ${onReplay ? `
          <button class="btn-secondary-celeb" id="btn-celeb-replay">
            Play Again 🔄
          </button>
        ` : ''}
      </div>
    </div>
  `;

  // Sound fanfare
  soundService.playFanfare();

  // Play star sound for each star earned with staggered timing
  const starCount = isReviewMode ? 3 : stars;
  for (let i = 0; i < starCount; i++) {
    const t = setTimeout(() => {
      soundService.playStar();
    }, 400 + i * 350);
    starSoundTimeouts.push(t);
  }

  // Trigger confetti bursts
  triggerConfetti();

  // Event handlers
  document.getElementById('btn-celeb-continue')?.addEventListener('click', () => {
    soundService.playPop();
    hideCelebrationModal();
    if (onContinue) onContinue();
  });

  document.getElementById('btn-celeb-replay')?.addEventListener('click', () => {
    soundService.playPop();
    hideCelebrationModal();
    if (onReplay) onReplay();
  });
}

/**
 * Hide celebration modal
 */
export function hideCelebrationModal() {
  starSoundTimeouts.forEach(t => clearTimeout(t));
  starSoundTimeouts = [];

  if (modalContainer) {
    modalContainer.className = 'modal-container hidden';
    modalContainer.innerHTML = '';
  }
}

/**
 * Launch celebratory confetti particles
 */
function triggerConfetti() {
  if (typeof window.confetti !== 'function') return;

  try {
    // Initial center burst
    window.confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 }
    });

    // Side cannons after slight delay
    setTimeout(() => {
      window.confetti({
        particleCount: 45,
        angle: 60,
        spread: 55,
        origin: { x: 0.05, y: 0.7 }
      });
      window.confetti({
        particleCount: 45,
        angle: 120,
        spread: 55,
        origin: { x: 0.95, y: 0.7 }
      });
    }, 300);
  } catch (e) {
    console.log('Confetti failed to trigger:', e);
  }
}

/**
 * Format seconds to m s
 */
function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}
