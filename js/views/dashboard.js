// ==========================================================================
// Dashboard — Child Main Hub
// Category Cards, Interactive 10-Level Learning Path, Mistake Review Banner,
// and Hero Progress Overview
// ==========================================================================

import AppState from '../state.js';
import { CATEGORIES, CATEGORY_META, getActiveProfile, updatePreferredDifficulty } from '../services/storageService.js';
import { getProfileBadges, getUnlockedBadgeCount } from '../services/badgeService.js';
import { soundService } from '../services/soundService.js';
import { navigateTo } from '../router.js';

let selectedPathCategory = 'patterns';

export function renderDashboard() {
  const el = document.getElementById('main-content');
  if (!el) return;

  const profile = AppState.currentProfile || getActiveProfile();
  const stars = profile?.stats?.totalStars || 0;
  const streak = profile?.stats?.currentStreak || 0;
  const ageGroup = profile?.ageGroup || '5-6';
  const playerName = profile?.name || 'Explorer';
  const avatar = profile?.avatar || '🦊';
  const mistakeCount = profile?.mistakeLog?.length || 0;
  const activeDifficulty = AppState.selectedDifficulty || profile?.preferredDifficulty || 1;

  // Determine smart resume target
  const resumeTarget = getSmartResumeTarget(profile);
  const badges = getProfileBadges(profile);
  const unlockedBadgesCount = getUnlockedBadgeCount(profile);

  el.innerHTML = `
    <!-- Hero Banner -->
    <div class="dashboard-hero">
      <div class="hero-content">
        <h1>Hi ${escapeHtml(playerName)}! ${avatar}</h1>
        <p>Ready for today's logic adventure? Complete puzzles and master all 6 brain skills!</p>
        <div class="hero-stats-row">
          <div class="hero-stat">⭐ ${stars} Stars</div>
          <div class="hero-stat">🔥 ${streak} Day Streak</div>
          <div class="hero-stat">🎂 Ages ${ageGroup}</div>
        </div>
      </div>
      <div class="hero-action">
        <button class="btn-hero" id="btn-continue">
          ▶ Continue Level ${resumeTarget.level}
        </button>
      </div>
    </div>

    <!-- Difficulty Control Card -->
    <div class="difficulty-control-card">
      <div class="diff-title-row">
        <div class="diff-icon-wrap">⚡</div>
        <div class="diff-title-text">
          <strong>Question Difficulty</strong>
          <p>Set your puzzle challenge level anytime</p>
        </div>
      </div>
      <div class="diff-pill-group" id="dashboard-diff-group">
        <button class="diff-pill-btn ${activeDifficulty === 1 ? 'active diff-easy-active' : ''}" data-diff="1" title="Gentle puzzles for beginners">
          <span class="diff-emoji">🌱</span>
          <span class="diff-name">Easy</span>
        </button>
        <button class="diff-pill-btn ${activeDifficulty === 2 ? 'active diff-medium-active' : ''}" data-diff="2" title="Standard logic puzzles">
          <span class="diff-emoji">⚡</span>
          <span class="diff-name">Medium</span>
        </button>
        <button class="diff-pill-btn ${activeDifficulty === 3 ? 'active diff-hard-active' : ''}" data-diff="3" title="Advanced challenge for masters">
          <span class="diff-emoji">🔥</span>
          <span class="diff-name">Hard</span>
        </button>
      </div>
    </div>

    <!-- Mistakes Review Quick Banner (if any pending) -->
    ${mistakeCount > 0 ? `
      <div class="mistake-alert-banner" id="banner-review-mistakes">
        <div class="mistake-banner-content">
          <span class="mistake-banner-icon">🎓</span>
          <div>
            <strong>Mistake Review Available!</strong>
            <p>You have ${mistakeCount} puzzle${mistakeCount > 1 ? 's' : ''} to practice and master!</p>
          </div>
        </div>
        <button class="btn-mistake-action" id="btn-quick-review">
          Practice Now 📝
        </button>
      </div>
    ` : ''}

    <!-- Categories Grid -->
    <div class="section-header-wrap">
      <h2 class="section-heading">📚 Choose a Category</h2>
      <span class="section-subheading">6 Logic Skill Areas</span>
    </div>

    <div class="categories-grid">
      ${CATEGORIES.map(catKey => {
        const meta = CATEGORY_META[catKey];
        const catStats = profile?.categoryStats?.[catKey] || { answered: 0, correct: 0, stars: 0, levelsCompleted: 0 };
        const progress = profile?.levelProgress?.[catKey] || { currentLevel: 1, levelStars: {} };
        const currentLvl = Math.min(progress.currentLevel, 10);
        const accuracy = catStats.answered > 0 ? Math.round((catStats.correct / catStats.answered) * 100) : 0;
        const earnedStars = Object.values(progress.levelStars || {}).reduce((a, b) => a + b, 0);

        return `
          <div class="category-card ${meta.bgClass}" data-category="${catKey}">
            <div class="cat-header">
              <div class="cat-icon" style="background: ${meta.color}18; color: ${meta.color};">${meta.icon}</div>
              <span class="cat-progress-badge">
                ${catStats.answered > 0 ? `${accuracy}% Acc` : '🌟 New'}
              </span>
            </div>
            <h3 class="cat-title">${meta.name}</h3>
            <p class="cat-desc">${getCategoryDesc(catKey)}</p>
            
            <div class="cat-level-row">
              <span class="cat-level-text">Level ${currentLvl} / 10</span>
              <span class="cat-star-count">⭐ ${earnedStars} / 30</span>
            </div>

            <div class="cat-footer">
              <div class="cat-stars">
                ${renderCategoryMiniStars(earnedStars)}
              </div>
              <button class="cat-play-btn" data-category="${catKey}" data-level="${currentLvl}">
                Play Lvl ${currentLvl} ▶
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Learning Path Section -->
    <div class="section-header-wrap" style="margin-top: 36px;">
      <h2 class="section-heading">🗺️ Interactive Learning Track</h2>
      <span class="section-subheading">Choose a skill and click any unlocked level to play!</span>
    </div>

    <div class="learning-path-section">
      <!-- Category Tabs for Learning Track -->
      <div class="path-category-tabs" id="path-category-tabs">
        ${CATEGORIES.map(catKey => {
          const meta = CATEGORY_META[catKey];
          const isSelected = (selectedPathCategory === catKey);
          return `
            <button
              class="path-tab ${isSelected ? 'active' : ''}"
              data-category="${catKey}"
              style="${isSelected ? `background: ${meta.color}; border-color: ${meta.color}; color: white;` : ''}"
            >
              <span class="path-tab-icon">${meta.icon}</span>
              <span class="path-tab-name">${meta.name.split(' ')[0]}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- 10-Node Path Track -->
      <div class="path-track-scroll">
        <div class="path-track" id="path-track-container">
          ${renderLearningPath(profile, selectedPathCategory)}
        </div>
      </div>
    </div>

    <!-- Trophy Cabinet & Achievements -->
    <div class="section-header-wrap" style="margin-top: 36px;">
      <h2 class="section-heading">🏆 Trophy Cabinet</h2>
      <span class="section-subheading">${unlockedBadgesCount} of ${badges.length} Badges Unlocked</span>
    </div>

    <div class="trophy-cabinet-section">
      <div class="trophy-grid">
        ${badges.map(b => `
          <div class="trophy-card ${b.unlocked ? 'unlocked' : 'locked'}" title="${escapeHtml(b.description)}">
            <div class="trophy-icon-wrap">
              <span class="trophy-icon">${b.icon}</span>
              ${b.unlocked ? '<span class="trophy-check">✓</span>' : '<span class="trophy-lock">🔒</span>'}
            </div>
            <strong class="trophy-name">${escapeHtml(b.name)}</strong>
            <p class="trophy-desc">${escapeHtml(b.description)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Attach event listeners
  attachDashboardEvents(profile, resumeTarget);
}

/**
 * Determine smart resume target based on profile history and progress
 */
function getSmartResumeTarget(profile) {
  const lastSession = profile?.sessionHistory?.[0];
  const cat = lastSession?.category && CATEGORIES.includes(lastSession.category)
    ? lastSession.category
    : 'patterns';

  const progress = profile?.levelProgress?.[cat] || { currentLevel: 1 };
  const level = Math.min(progress.currentLevel || 1, 10);

  return { category: cat, level };
}

/**
 * Render mini stars for category card footer
 */
function renderCategoryMiniStars(count) {
  if (count === 0) {
    return '<span style="color: #CBD5E1; font-size: 0.8rem;">Tap to start</span>';
  }
  const starsToShow = Math.min(Math.ceil(count / 3), 5);
  return Array.from({ length: starsToShow }, () => '⭐').join('');
}

/**
 * Category descriptions
 */
function getCategoryDesc(catKey) {
  const descs = {
    patterns: 'Complete visual patterns! What comes next in sequence?',
    oddOneOut: 'Spot differences and find what doesn\'t belong!',
    spatial: 'Match geometric shapes, rotations, and silhouettes!',
    math: 'Fun counting, quantity comparisons, and number logic!',
    sorting: 'Categorize objects, colors, sizes, and attributes!',
    memory: 'Train visual attention and remember clue placements!'
  };
  return descs[catKey] || 'Solve visual logic puzzles!';
}

/**
 * Render the 10-node learning path for the chosen category
 */
function renderLearningPath(profile, categoryKey) {
  const levels = 10;
  let html = '';
  const progress = profile?.levelProgress?.[categoryKey] || { currentLevel: 1, levelStars: {} };
  const meta = CATEGORY_META[categoryKey] || CATEGORY_META.patterns;

  for (let i = 1; i <= levels; i++) {
    const stars = progress.levelStars?.[String(i)] || 0;
    const isCompleted = stars > 0;
    const isActive = (i === progress.currentLevel && !isCompleted);
    const isUnlocked = (i <= progress.currentLevel);

    let stateClass = 'locked';
    if (isCompleted) stateClass = 'completed';
    else if (isActive) stateClass = 'active';

    html += `
      <div
        class="path-node ${isUnlocked ? 'unlocked' : 'locked'}"
        data-category="${categoryKey}"
        data-level="${i}"
        title="${isUnlocked ? `Play Level ${i}` : `Level ${i} (Locked)`}"
      >
        <div class="node-circle ${stateClass}" style="${isActive ? `border-color: ${meta.color};` : ''}">
          ${isCompleted ? '✓' : (isUnlocked ? i : '🔒')}
        </div>
        <span class="node-title">Lvl ${i}</span>
        <div class="node-stars">
          ${isCompleted ? renderStarIcons(stars) : (isUnlocked ? '<span class="empty">☆☆☆</span>' : '')}
        </div>
      </div>
    `;

    if (i < levels) {
      const isConnectorDone = (i < progress.currentLevel);
      html += `<div class="path-connector ${isConnectorDone ? 'completed' : ''}"></div>`;
    }
  }

  return html;
}

function renderStarIcons(count) {
  let html = '';
  for (let i = 0; i < 3; i++) {
    html += i < count ? '⭐' : '<span class="empty">☆</span>';
  }
  return html;
}

/**
 * Attach dashboard event handlers
 */
function attachDashboardEvents(profile, resumeTarget) {
  // Hero continue button
  document.getElementById('btn-continue')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo(`#/game/${resumeTarget.category}/${resumeTarget.level}`);
  });

  // Difficulty pill buttons
  document.querySelectorAll('#dashboard-diff-group .diff-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      soundService.playPop();
      const diff = parseInt(btn.dataset.diff, 10) || 1;
      AppState.selectedDifficulty = diff;
      updatePreferredDifficulty(diff);

      // Update UI active styles immediately
      document.querySelectorAll('#dashboard-diff-group .diff-pill-btn').forEach(b => {
        b.classList.remove('active', 'diff-easy-active', 'diff-medium-active', 'diff-hard-active');
      });
      const activeClass = diff === 1 ? 'diff-easy-active' : (diff === 2 ? 'diff-medium-active' : 'diff-hard-active');
      btn.classList.add('active', activeClass);
    });
  });

  // Mistake quick review banner
  document.getElementById('btn-quick-review')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/game/review');
  });

  // Category cards click
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't double trigger if play button itself was clicked
      if (e.target.closest('.cat-play-btn')) return;
      soundService.playPop();
      const cat = card.dataset.category;
      const progress = profile?.levelProgress?.[cat] || { currentLevel: 1 };
      navigateTo(`#/game/${cat}/${progress.currentLevel || 1}`);
    });
  });

  // Play button on category card
  document.querySelectorAll('.cat-play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundService.playPop();
      const cat = btn.dataset.category;
      const level = btn.dataset.level || 1;
      navigateTo(`#/game/${cat}/${level}`);
    });
  });

  // Learning Path category switch tabs
  document.querySelectorAll('.path-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      soundService.playPop();
      selectedPathCategory = tab.dataset.category;
      renderDashboard();
    });
  });

  // Learning Path node click (if unlocked)
  document.querySelectorAll('.path-node.unlocked').forEach(node => {
    node.addEventListener('click', () => {
      soundService.playPop();
      const cat = node.dataset.category;
      const level = parseInt(node.dataset.level, 10);
      navigateTo(`#/game/${cat}/${level}`);
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
