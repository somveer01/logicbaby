// ==========================================================================
// Dashboard — Child Main Hub
// Category Cards, Interactive 10-Level Learning Path, Mistake Review Banner,
// and Hero Progress Overview
// ==========================================================================

import AppState from '../state.js';
import { CATEGORIES, CATEGORY_META, getActiveProfile, getCustomHomework, updatePreferredDifficulty, saveLevelResult } from '../services/storageService.js';
import { getProfileBadges, getUnlockedBadgeCount } from '../services/badgeService.js';
import { soundService } from '../services/soundService.js';
import { speechService } from '../services/speechService.js';
import { navigateTo } from '../router.js';
import { showUploadHomeworkModal } from './homeworkHub.js';

let selectedPathCategory = 'patterns';
let mysteryGiftOpened = false;

export function renderDashboard() {
  const el = document.getElementById('main-content');
  if (!el) return;

  const profile = AppState.currentProfile || getActiveProfile();
  const stars = profile?.stats?.totalStars || 0;
  const streak = profile?.stats?.currentStreak || 0;
  const ageGroup = profile?.ageGroup || '5-6';
  const playerName = profile?.name || 'Little Genius';
  const avatar = profile?.avatar || '🦊';
  const mistakeCount = profile?.mistakeLog?.length || 0;
  const activeDifficulty = AppState.selectedDifficulty || profile?.preferredDifficulty || 1;
  const customHwList = getCustomHomework();
  const pendingHw = customHwList.filter(h => !h.completed);

  // Determine smart resume target
  const resumeTarget = getSmartResumeTarget(profile);
  const badges = getProfileBadges(profile);
  const unlockedBadgesCount = getUnlockedBadgeCount(profile);

  el.innerHTML = `
    <!-- Interactive Animated Buddy Hero -->
    <div class="dashboard-hero" style="position: relative; overflow: hidden;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 18px;">
          <!-- Clickable Mascot Avatar with bounce and speech -->
          <div class="interactive-buddy-wrap" id="btn-buddy-chat" title="Click to talk with your buddy!">
            <span class="buddy-avatar-large" id="dash-buddy-face">${avatar}</span>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h1 style="margin: 0; font-size: 1.6rem; color: var(--text-main);">Hi ${escapeHtml(playerName)}!</h1>
                <span style="background: #FEF08A; color: #854D0E; font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: var(--r-full); border: 1px solid #FDE047;">👋 Tap Buddy!</span>
              </div>
              <p style="margin: 4px 0 0; font-size: 0.92rem; color: var(--text-muted);" id="buddy-status-text">
                "Let's play and unlock bright brain stars today!" ✨
              </p>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div class="hero-stats-row" style="margin: 0;">
            <div class="hero-stat" id="dash-stars-badge">⭐ ${stars} Stars</div>
            <div class="hero-stat">🔥 ${streak} Day Streak</div>
            <div class="hero-stat">🎂 Ages ${ageGroup}</div>
          </div>
          <button class="btn-hero" id="btn-continue" style="animation: pulseGlow 2.5s infinite;">
            ▶ Play Level ${resumeTarget.level}
          </button>
        </div>
      </div>
    </div>

    <!-- Daily Mystery Reward Gift Chest -->
    <div class="mystery-gift-card" id="btn-open-mystery-gift">
      <div style="display: flex; align-items: center; gap: 14px;">
        <span class="gift-box-icon" id="gift-icon-el">🎁</span>
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <strong style="font-size: 1.12rem; color: #92400E; font-family: var(--font-heading);" id="gift-title-el">
              ${mysteryGiftOpened ? '🎉 Mystery Reward Claimed!' : 'Daily Surprise Gift Chest! ✨'}
            </strong>
            <span style="background: #F59E0B; color: white; padding: 2px 8px; border-radius: var(--r-full); font-size: 0.72rem; font-weight: 800;">
              ${mysteryGiftOpened ? 'Done ⭐' : '1-Tap Open!'}
            </span>
          </div>
          <p style="font-size: 0.85rem; color: #B45309; margin-top: 2px;" id="gift-desc-el">
            ${mysteryGiftOpened ? 'You collected your bonus stars! Come back for more surprises.' : 'Tap the bouncing gift box to uncover surprise bonus stars and cheer!'}
          </p>
        </div>
      </div>
      <button style="padding: 8px 16px; background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; border-radius: var(--r-full); font-weight: 800; font-size: 0.85rem; cursor: pointer; box-shadow: 0 4px 10px rgba(217, 119, 6, 0.3);">
        ${mysteryGiftOpened ? '⭐ +5 Stars Added' : '🎁 Open Gift!'}
      </button>
    </div>

    <!-- Baby Fun Arcade / Interactive Soundboard Bar -->
    <div class="baby-arcade-section">
      <div class="baby-arcade-header">
        <h3><span>🎮</span> Baby Fun Arcade & Soundboard</h3>
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">Tap animals to hear sounds! 🔊</span>
      </div>
      <div class="baby-arcade-chips">
        <div class="arcade-chip" data-sound="cat" title="Cat Meow!">
          <span class="arcade-chip-emoji">🐱</span>
          <span class="arcade-chip-label">Kitty</span>
        </div>
        <div class="arcade-chip" data-sound="dog" title="Puppy Woof!">
          <span class="arcade-chip-emoji">🐶</span>
          <span class="arcade-chip-label">Puppy</span>
        </div>
        <div class="arcade-chip" data-sound="lion" title="Lion Roar!">
          <span class="arcade-chip-emoji">🦁</span>
          <span class="arcade-chip-label">Lion</span>
        </div>
        <div class="arcade-chip" data-sound="frog" title="Frog Ribbit!">
          <span class="arcade-chip-emoji">🐸</span>
          <span class="arcade-chip-label">Froggy</span>
        </div>
        <div class="arcade-chip" data-sound="duck" title="Duck Quack!">
          <span class="arcade-chip-emoji">🦆</span>
          <span class="arcade-chip-label">Ducky</span>
        </div>
        <div class="arcade-chip" data-sound="rocket" title="Rocket Blastoff!">
          <span class="arcade-chip-emoji">🚀</span>
          <span class="arcade-chip-label">Rocket</span>
        </div>
        <div class="arcade-chip" data-sound="star" title="Star Magic Twinkle!">
          <span class="arcade-chip-emoji">⭐</span>
          <span class="arcade-chip-label">Twinkle</span>
        </div>
        <div class="arcade-chip" id="btn-quick-balloon-hub" style="background: #FDF2F8; border-color: #F472B6;" title="Play Word Balloon Pop!">
          <span class="arcade-chip-emoji">🎈</span>
          <span class="arcade-chip-label" style="color: #BE185D;">Pop Game</span>
        </div>
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

    <!-- School Homework & Practice Section -->
    <div class="dashboard-hw-card" style="background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border: 2px solid #6EE7B7; border-radius: var(--r-lg); padding: 18px 22px; margin-bottom: 24px; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.12);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: ${pendingHw.length > 0 ? '14px' : '0'};">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 32px; animation: float 2.5s ease-in-out infinite;">🎒</span>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <strong style="font-size: 1.18rem; color: #065F46; font-family: var(--font-heading);">School Homework & Spellings</strong>
              ${pendingHw.length > 0 ? `<span style="background: #10B981; color: white; padding: 2px 10px; border-radius: var(--r-full); font-size: 0.78rem; font-weight: 800;">${pendingHw.length} To Practice</span>` : ''}
            </div>
            <p style="font-size: 0.88rem; color: #047857; font-weight: 600; margin-top: 2px;">
              ${pendingHw.length > 0 ? 'Play your school spelling list & math tables quizzes directly!' : 'Practice English spelling bee, multiplication tables & custom homework!'}
            </p>
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn-dash-add-hw" id="btn-dash-add-hw" style="padding: 9px 18px; background: white; color: #065F46; border: 2px solid #A7F3D0; border-radius: var(--r-full); font-weight: 800; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
            ✏️ Add Homework
          </button>
          <button class="btn-hw-action" id="btn-dashboard-homework">
            Open Homework Hub ➔
          </button>
        </div>
      </div>

      ${pendingHw.length > 0 ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; margin-top: 12px;">
          ${pendingHw.slice(0, 4).map(hw => `
            <div style="background: white; border: 1.5px solid #A7F3D0; border-radius: var(--r-md); padding: 12px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.08);">
              <div>
                <span style="font-size: 0.72rem; font-weight: 800; color: #059669; background: #ECFDF5; padding: 2px 8px; border-radius: 6px; display: inline-block; margin-bottom: 6px;">
                  ${escapeHtml(hw.subject)}
                </span>
                <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); margin-bottom: 8px; line-height: 1.3;">
                  ${escapeHtml(hw.questionText)}
                </div>
              </div>
              <button class="btn-play-dash-hw" data-id="${hw.id}" style="width: 100%; padding: 8px 12px; background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; border-radius: var(--r-full); font-weight: 800; font-size: 0.85rem; cursor: pointer; box-shadow: 0 3px 8px rgba(16, 185, 129, 0.25);">
                ▶ Play Game
              </button>
            </div>
          `).join('')}
        </div>
        ${pendingHw.length > 4 ? `
          <div style="text-align: center; margin-top: 10px;">
            <button id="btn-view-more-hw" style="background: none; border: none; font-size: 0.85rem; font-weight: 800; color: #047857; cursor: pointer; text-decoration: underline;">
              + ${pendingHw.length - 4} more homework tasks (View all in Hub)
            </button>
          </div>
        ` : ''}
      ` : ''}
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

    <!-- 6 Adventure Worlds Grid with Illustrated Graphics & Progress -->
    <div class="section-header-wrap">
      <h2 class="section-heading">🏝️ Logic Adventure Worlds</h2>
      <span class="section-subheading">Explore 6 exciting puzzle game islands!</span>
    </div>

    <div class="world-game-grid">
      ${CATEGORIES.map(catKey => {
        const meta = CATEGORY_META[catKey];
        const catStats = profile?.categoryStats?.[catKey] || { answered: 0, correct: 0, stars: 0, levelsCompleted: 0 };
        const progress = profile?.levelProgress?.[catKey] || { currentLevel: 1, levelStars: {} };
        const currentLvl = Math.min(progress.currentLevel || 1, 10);
        const accuracy = catStats.answered > 0 ? Math.round((catStats.correct / catStats.answered) * 100) : 0;
        const earnedStars = Object.values(progress.levelStars || {}).reduce((a, b) => a + b, 0);
        const progressPct = Math.round(((currentLvl - 1) / 10) * 100);

        return `
          <div class="world-game-card" data-category="${catKey}">
            <div class="world-card-scene" style="background: ${getCategorySceneGradient(catKey)};">
              ${getCategorySvgScene(catKey)}
              <div class="world-card-floating-icon">
                ${meta.icon}
              </div>
            </div>
            <div class="world-card-body">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <h3 class="world-card-title">${meta.name}</h3>
                <span style="font-size: 0.75rem; font-weight: 800; color: ${meta.color}; background: ${meta.color}15; padding: 2px 8px; border-radius: var(--r-full);">
                  Lvl ${currentLvl}/10
                </span>
              </div>
              <p class="world-card-sub">${getCategoryDesc(catKey)}</p>

              <!-- Progress bar with stars -->
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 4px;">
                <span>Progress: ${progressPct}%</span>
                <span>⭐ ${earnedStars} / 30</span>
              </div>
              <div class="world-card-progress-bar">
                <div class="world-card-progress-fill" style="width: ${Math.max(progressPct, 10)}%; background: ${meta.color};"></div>
              </div>

              <div class="world-card-footer">
                <button class="world-card-play-btn" data-category="${catKey}" data-level="${currentLvl}" style="background: linear-gradient(135deg, ${meta.color}, ${getDarkerShade(meta.color)});">
                  <span>▶</span> Play Game (Lvl ${currentLvl})
                </button>
              </div>
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
 * Get category scene background gradient
 */
function getCategorySceneGradient(catKey) {
  const grads = {
    patterns: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)',
    oddOneOut: 'linear-gradient(135deg, #312E81 0%, #4F46E5 100%)',
    spatial: 'linear-gradient(135deg, #0C4A6E 0%, #0284C7 100%)',
    math: 'linear-gradient(135deg, #78350F 0%, #D97706 100%)',
    sorting: 'linear-gradient(135deg, #831843 0%, #DB2777 100%)',
    memory: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)'
  };
  return grads[catKey] || 'linear-gradient(135deg, #6C3FB5, #8B5CF6)';
}

/**
 * Illustrated SVG scene for each Adventure Island
 */
function getCategorySvgScene(catKey) {
  switch (catKey) {
    case 'patterns':
      return `
        <svg viewBox="0 0 400 160" preserveAspectRatio="none" style="width:100%; height:100%; opacity: 0.85;">
          <defs>
            <linearGradient id="pLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#34D399" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#059669" stop-opacity="0.4"/>
            </linearGradient>
          </defs>
          <circle cx="340" cy="30" r="45" fill="#FDE047" opacity="0.25"/>
          <path d="M0,160 Q80,90 180,120 T360,95 L400,160 Z" fill="#047857" opacity="0.6"/>
          <path d="M0,160 Q120,110 240,140 T400,110 L400,160 Z" fill="#065F46" opacity="0.9"/>
          <!-- Floating geometric pattern gems -->
          <circle cx="70" cy="50" r="16" fill="#FBBF24" opacity="0.9"/>
          <rect x="130" y="35" width="28" height="28" rx="6" fill="#60A5FA" opacity="0.9" transform="rotate(15 144 49)"/>
          <circle cx="210" cy="50" r="16" fill="#FBBF24" opacity="0.9"/>
          <rect x="270" y="35" width="28" height="28" rx="6" fill="#60A5FA" opacity="0.9" transform="rotate(15 284 49)"/>
          <!-- Sparkles -->
          <polygon points="50,20 54,28 62,32 54,36 50,44 46,36 38,32 46,28" fill="#FEF08A"/>
          <polygon points="320,70 323,76 329,79 323,82 320,88 317,82 311,79 317,76" fill="#FEF08A"/>
        </svg>
      `;
    case 'oddOneOut':
      return `
        <svg viewBox="0 0 400 160" preserveAspectRatio="none" style="width:100%; height:100%; opacity: 0.85;">
          <circle cx="80" cy="40" r="30" fill="#818CF8" opacity="0.2"/>
          <circle cx="320" cy="50" r="50" fill="#C084FC" opacity="0.2"/>
          <!-- Stars & Detective Magnifying Ring -->
          <circle cx="160" cy="65" r="32" stroke="#FDE047" stroke-width="6" fill="none" opacity="0.8"/>
          <line x1="184" y1="89" x2="215" y2="120" stroke="#FDE047" stroke-width="8" stroke-linecap="round"/>
          <!-- Target Icons inside lens -->
          <circle cx="160" cy="65" r="14" fill="#EF4444" opacity="0.9"/>
          <circle cx="70" cy="70" r="12" fill="#60A5FA" opacity="0.8"/>
          <circle cx="260" cy="60" r="12" fill="#60A5FA" opacity="0.8"/>
          <!-- Sparkles -->
          <polygon points="280,25 283,31 289,34 283,37 280,43 277,37 271,34 277,31" fill="#FEF08A"/>
          <polygon points="100,100 102,105 107,107 102,109 100,114 98,109 93,107 98,105" fill="#FEF08A"/>
        </svg>
      `;
    case 'spatial':
      return `
        <svg viewBox="0 0 400 160" preserveAspectRatio="none" style="width:100%; height:100%; opacity: 0.85;">
          <!-- Saturn ring planet -->
          <circle cx="310" cy="60" r="28" fill="#F472B6" opacity="0.9"/>
          <ellipse cx="310" cy="60" rx="46" ry="10" stroke="#FDE047" stroke-width="4" fill="none" transform="rotate(-20 310 60)"/>
          <!-- 3D Cube & Prism -->
          <polygon points="110,40 140,25 170,40 140,55" fill="#38BDF8"/>
          <polygon points="110,40 140,55 140,85 110,70" fill="#0284C7"/>
          <polygon points="170,40 140,55 140,85 170,70" fill="#0369A1"/>
          <!-- Rocket silhouette -->
          <path d="M210,95 L225,50 L240,95 L230,90 L220,90 Z" fill="#F87171" transform="rotate(35 225 70)"/>
          <circle cx="60" cy="90" r="15" fill="#FCD34D" opacity="0.7"/>
          <!-- Sparkles -->
          <polygon points="50,30 53,36 59,39 53,42 50,48 47,42 41,39 47,36" fill="#FFFFFF"/>
        </svg>
      `;
    case 'math':
      return `
        <svg viewBox="0 0 400 160" preserveAspectRatio="none" style="width:100%; height:100%; opacity: 0.85;">
          <!-- Hills & sun -->
          <circle cx="80" cy="35" r="30" fill="#FDE047" opacity="0.9"/>
          <path d="M0,160 Q120,90 260,130 T400,100 L400,160 Z" fill="#B45309" opacity="0.6"/>
          <!-- Counting Dice / Number Blocks -->
          <rect x="150" y="45" width="34" height="34" rx="8" fill="#FEF3C7" stroke="#F59E0B" stroke-width="3"/>
          <circle cx="167" cy="62" r="4" fill="#D97706"/>
          <rect x="210" y="35" width="34" height="34" rx="8" fill="#FEF3C7" stroke="#F59E0B" stroke-width="3" transform="rotate(10 227 52)"/>
          <circle cx="220" cy="45" r="3.5" fill="#D97706"/>
          <circle cx="234" cy="59" r="3.5" fill="#D97706"/>
          <!-- Math Stars -->
          <polygon points="310,40 314,48 322,52 314,56 310,64 306,56 298,52 306,48" fill="#FDE047"/>
          <polygon points="120,95 123,101 129,104 123,107 120,113 117,107 111,104 117,101" fill="#FDE047"/>
        </svg>
      `;
    case 'sorting':
      return `
        <svg viewBox="0 0 400 160" preserveAspectRatio="none" style="width:100%; height:100%; opacity: 0.85;">
          <!-- Safari Savanna Sun -->
          <circle cx="330" cy="40" r="36" fill="#FDE047" opacity="0.3"/>
          <path d="M0,160 Q90,110 200,130 T400,115 L400,160 Z" fill="#9D174D" opacity="0.7"/>
          <!-- Sorting Rainbow Baskets & Balloons -->
          <circle cx="90" cy="60" r="18" fill="#F43F5E" opacity="0.9"/>
          <circle cx="140" cy="45" r="18" fill="#3B82F6" opacity="0.9"/>
          <circle cx="190" cy="60" r="18" fill="#10B981" opacity="0.9"/>
          <circle cx="240" cy="45" r="18" fill="#F59E0B" opacity="0.9"/>
          <!-- Animal Paw prints -->
          <ellipse cx="285" cy="95" rx="5" ry="7" fill="#FBCFE8" opacity="0.6"/>
          <circle cx="278" cy="84" r="2.5" fill="#FBCFE8" opacity="0.6"/>
          <circle cx="285" cy="81" r="2.5" fill="#FBCFE8" opacity="0.6"/>
          <circle cx="292" cy="84" r="2.5" fill="#FBCFE8" opacity="0.6"/>
        </svg>
      `;
    case 'memory':
    default:
      return `
        <svg viewBox="0 0 400 160" preserveAspectRatio="none" style="width:100%; height:100%; opacity: 0.85;">
          <!-- Magic Crystal Cave Nebula -->
          <circle cx="200" cy="80" r="60" fill="#A855F7" opacity="0.25"/>
          <!-- Glowing Magic Cards -->
          <rect x="100" y="40" width="30" height="42" rx="6" fill="#EDE9FE" stroke="#C084FC" stroke-width="3" transform="rotate(-12 115 61)"/>
          <polygon points="115,50 118,57 125,60 118,63 115,70 112,63 105,60 112,57" fill="#7C3AED"/>
          <rect x="150" y="35" width="30" height="42" rx="6" fill="#EDE9FE" stroke="#C084FC" stroke-width="3" transform="rotate(8 165 56)"/>
          <polygon points="165,45 168,52 175,55 168,58 165,65 162,58 155,55 162,52" fill="#7C3AED"/>
          <!-- Magic Lightbulb spark -->
          <circle cx="260" cy="55" r="18" fill="#FEF08A" opacity="0.9"/>
          <polygon points="320,30 324,38 332,42 324,46 320,54 316,46 308,42 316,38" fill="#FFFFFF"/>
        </svg>
      `;
  }
}

/**
 * Get darker hex shade for button gradients
 */
function getDarkerShade(hex) {
  const shades = {
    '#059669': '#047857',
    '#4F46E5': '#4338CA',
    '#0284C7': '#0369A1',
    '#D97706': '#B45309',
    '#DB2777': '#BE185D',
    '#7C3AED': '#6D28D9'
  };
  return shades[hex] || '#4C1D95';
}

/**
 * Trigger confetti celebration particles on the page
 */
function triggerConfettiBurst() {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '99999';
  document.body.appendChild(container);

  const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FDE047'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.style.position = 'absolute';
    p.style.left = `${Math.random() * 80 + 10}vw`;
    p.style.top = `${Math.random() * 30 + 10}vh`;
    p.style.width = `${Math.random() * 12 + 8}px`;
    p.style.height = `${Math.random() * 12 + 8}px`;
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
    p.style.opacity = '1';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    p.style.transition = 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
    container.appendChild(p);

    setTimeout(() => {
      p.style.transform = `translate(${(Math.random() - 0.5) * 200}px, ${Math.random() * 300 + 150}px) rotate(${Math.random() * 720}deg)`;
      p.style.opacity = '0';
    }, 20);
  }

  setTimeout(() => {
    container.remove();
  }, 1400);
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
 * Category descriptions
 */
function getCategoryDesc(catKey) {
  const descs = {
    patterns: 'Complete visual patterns! What comes next in sequence? 🧩',
    oddOneOut: 'Spot differences and find what doesn\'t belong! 🔍',
    spatial: 'Match geometric shapes, rotations, and galaxy silhouettes! 🚀',
    math: 'Fun counting, dino number logic, and quantity comparisons! 🦖',
    sorting: 'Categorize animal friends, rainbow colors, and sizes! 🦁',
    memory: 'Train memory attention and remember magical crystal clues! 🧠'
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
  const buddyAvatar = document.getElementById('dash-buddy-face');
  const buddyStatus = document.getElementById('buddy-status-text');

  // Interactive Buddy click: speak cheerful phrase & happy spin
  document.getElementById('btn-buddy-chat')?.addEventListener('click', () => {
    soundService.playCorrect();
    if (buddyAvatar) {
      buddyAvatar.classList.remove('spin-happy');
      void buddyAvatar.offsetWidth; // trigger reflow
      buddyAvatar.classList.add('spin-happy');
    }

    const playerName = profile?.name || 'Explorer';
    const lines = [
      `Yay ${playerName}! I love playing brain games with you! Let's choose an island!`,
      `You are so smart and curious! You can solve any puzzle! ⭐`,
      `High five ${playerName}! Let's collect all 30 stars today!`,
      `Puzzles make our brains super strong and happy! Let's play! 🚀`
    ];
    const phrase = lines[Math.floor(Math.random() * lines.length)];
    if (buddyStatus) {
      buddyStatus.textContent = `"${phrase}" ✨`;
    }
    speechService.speak(phrase);
  });

  // Daily Mystery Gift Box Unboxing
  document.getElementById('btn-open-mystery-gift')?.addEventListener('click', () => {
    if (mysteryGiftOpened) {
      soundService.playStar();
      speechService.speak('You already collected your mystery surprise today! Keep playing to win more stars!');
      return;
    }

    mysteryGiftOpened = true;
    soundService.playFanfare();
    triggerConfettiBurst();

    // Award +5 bonus stars to profile
    saveLevelResult('patterns', 1, 3, 5, 0, 10);

    const starBadge = document.getElementById('dash-stars-badge');
    const updatedStars = (profile?.stats?.totalStars || 0) + 5;
    if (starBadge) starBadge.textContent = `⭐ ${updatedStars} Stars`;

    const giftTitle = document.getElementById('gift-title-el');
    const giftDesc = document.getElementById('gift-desc-el');
    const giftIcon = document.getElementById('gift-icon-el');

    if (giftTitle) giftTitle.textContent = '🎉 +5 Bonus Stars Unlocked!';
    if (giftDesc) giftDesc.textContent = 'Hooray! You opened today\'s Mystery Chest and received 5 shiny stars!';
    if (giftIcon) giftIcon.textContent = '🏆';

    speechService.speak('Hooray! You opened the Mystery Chest and won five bonus stars! Great job!');
  });

  // Baby Soundboard Chips
  document.querySelectorAll('.baby-arcade-chips .arcade-chip[data-sound]').forEach(chip => {
    chip.addEventListener('click', () => {
      const s = chip.dataset.sound;
      soundService.playPop();
      
      const soundMap = {
        cat: { phrase: 'Meow! Cute kitty says hello! 🐾', soundFn: () => soundService.playCorrect() },
        dog: { phrase: 'Woof woof! Friendly puppy is ready to play! 🦴', soundFn: () => soundService.playPop() },
        lion: { phrase: 'Roaaar! King lion says be brave and smart! 🦁', soundFn: () => soundService.playFanfare() },
        frog: { phrase: 'Ribbit ribbit! Hop hop into the pond! 🌿', soundFn: () => soundService.playWrong() },
        duck: { phrase: 'Quack quack! Yellow ducky loves sunshine! 🌊', soundFn: () => soundService.playCorrect() },
        rocket: { phrase: 'Three, two, one... Blast off into space! 🚀', soundFn: () => soundService.playFanfare() },
        star: { phrase: 'Twinkle twinkle bright logic star! ⭐', soundFn: () => soundService.playStar() }
      };

      const item = soundMap[s];
      if (item) {
        item.soundFn();
        speechService.speak(item.phrase);
      }
    });
  });

  // Quick Balloon Pop button in Arcade bar
  document.getElementById('btn-quick-balloon-hub')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/homework');
  });

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

  // Homework Hub click
  document.getElementById('btn-dashboard-homework')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/homework');
  });

  // Direct add homework from Dashboard (Navigates directly to in-page creator)
  document.getElementById('btn-dash-add-hw')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/homework');
  });

  // View more homework tasks
  document.getElementById('btn-view-more-hw')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/homework');
  });

  // Play task directly from Dashboard
  document.querySelectorAll('.btn-play-dash-hw').forEach(btn => {
    btn.addEventListener('click', () => {
      soundService.playPop();
      navigateTo('#/homework');
    });
  });

  // Mistake quick review banner
  document.getElementById('btn-quick-review')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/game/review');
  });

  // Adventure World cards click
  document.querySelectorAll('.world-game-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.world-card-play-btn')) return;
      soundService.playPop();
      const cat = card.dataset.category;
      const progress = profile?.levelProgress?.[cat] || { currentLevel: 1 };
      navigateTo(`#/game/${cat}/${progress.currentLevel || 1}`);
    });
  });

  // Play button on Adventure World card
  document.querySelectorAll('.world-card-play-btn').forEach(btn => {
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

