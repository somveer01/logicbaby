// ==========================================================================
// LogicBaby — App Entry Point
// Initializes services, loads profile, sets up routing
// ==========================================================================

import AppState from './state.js';
import { initRouter, registerRoute, navigateTo } from './router.js';
import { soundService } from './services/soundService.js';
import { speechService } from './services/speechService.js';
import {
  getActiveProfile,
  createProfile,
  isStorageAvailable
} from './services/storageService.js';

// ------------------------------------------------------------------
// Global references for view modules (lazy-loaded)
// ------------------------------------------------------------------
let topbarModule = null;
let dashboardModule = null;
let ageSelectorModule = null;
let gameArenaModule = null;
let parentDashboardModule = null;

// ------------------------------------------------------------------
// App Initialization
// ------------------------------------------------------------------

async function initApp() {
  console.log('🧠 LogicBaby initializing...');

  // Check storage availability
  if (!isStorageAvailable()) {
    console.warn('LocalStorage unavailable — progress will not be saved.');
  }

  // Register Service Worker for offline capability
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('🧠 LogicBaby: Offline ServiceWorker registered', reg.scope))
        .catch((err) => console.log('ServiceWorker registration error:', err));
    });
  }

  // Ensure audio context is ready on first user interaction
  document.addEventListener('click', () => soundService.init(), { once: true });
  document.addEventListener('touchstart', () => soundService.init(), { once: true });

  // Load or create profile
  const profile = getActiveProfile();
  if (profile) {
    AppState.currentProfile = profile;
  }

  // Register routes
  registerRoute('#/dashboard', handleDashboard);
  registerRoute('#/game/:category/:level', handleGameLevel);
  registerRoute('#/game/:category', handleGame);
  registerRoute('#/parent', handleParent);

  // Lazy-load the topbar and render it
  topbarModule = await import('./views/topbar.js');
  topbarModule.renderTopbar();

  // Lazy-load the mascot
  renderMascot();

  // If no profile exists, show age selector first
  if (!AppState.currentProfile) {
    await showAgeSelector();
  } else {
    // Initialize router — will process current hash
    initRouter();
    // Default to dashboard if no hash
    if (!window.location.hash || window.location.hash === '#/') {
      navigateTo('#/dashboard');
    }
  }

  console.log('✅ LogicBaby ready!');
}

// ------------------------------------------------------------------
// Route Handlers
// ------------------------------------------------------------------

async function handleDashboard() {
  AppState.currentView = 'dashboard';
  if (!dashboardModule) {
    dashboardModule = await import('./views/dashboard.js');
  }
  dashboardModule.renderDashboard();
  if (topbarModule) topbarModule.renderTopbar();
}

async function handleGameLevel({ params }) {
  AppState.currentView = 'game';
  if (!gameArenaModule) {
    gameArenaModule = await import('./views/gameArena.js');
  }
  const level = parseInt(params.level, 10) || 1;
  gameArenaModule.startGame(params.category, level);
  if (topbarModule) topbarModule.renderTopbar();
}

async function handleGame({ params }) {
  AppState.currentView = 'game';
  if (!gameArenaModule) {
    gameArenaModule = await import('./views/gameArena.js');
  }
  gameArenaModule.startGame(params.category);
  if (topbarModule) topbarModule.renderTopbar();
}

async function handleParent() {
  AppState.currentView = 'parent';
  if (!parentDashboardModule) {
    parentDashboardModule = await import('./views/parentDashboard.js');
  }
  parentDashboardModule.renderParentDashboard();
  if (topbarModule) topbarModule.renderTopbar();
}

// ------------------------------------------------------------------
// Age Selector (first-time flow)
// ------------------------------------------------------------------

export async function showAgeSelector(closable = false) {
  if (!ageSelectorModule) {
    ageSelectorModule = await import('./views/ageSelector.js');
  }
  ageSelectorModule.showAgeSelectorModal(closable, (ageGroup) => {
    // Create or update profile
    if (!AppState.currentProfile) {
      const avatarMap = { '3-4': '🐣', '5-6': '🦊', '7-8': '🦁', '9+': '🦅' };
      const profile = createProfile('Player', ageGroup, avatarMap[ageGroup] || '🦊');
      AppState.currentProfile = profile;
      // Start router after profile is created
      initRouter();
      navigateTo('#/dashboard');
    } else {
      // Just updating age group
      import('./services/storageService.js').then(mod => {
        mod.updateAgeGroup(ageGroup);
        AppState.currentProfile.ageGroup = ageGroup;
        // Refresh current view
        if (AppState.currentView === 'dashboard' && dashboardModule) {
          dashboardModule.renderDashboard();
        }
        if (topbarModule) topbarModule.renderTopbar();
      });
    }
  });
}

// ------------------------------------------------------------------
// Mascot Widget
// ------------------------------------------------------------------

const MASCOT_MESSAGES = [
  "Let's play! 🎮",
  "You're doing great! ⭐",
  "Think carefully... 🤔",
  "I believe in you! 💪",
  "Ready to learn? 📚",
  "So much fun! 🎉"
];

function renderMascot() {
  const widget = document.getElementById('mascot-widget');
  if (!widget) return;

  const avatar = AppState.currentProfile?.avatar || '🦊';
  const message = MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)];

  widget.innerHTML = `
    <div class="mascot-bubble" id="mascot-bubble">${message}</div>
    <div class="mascot-avatar" id="mascot-face">${avatar}</div>
  `;

  // Click mascot to get new message
  const face = document.getElementById('mascot-face');
  face?.addEventListener('click', () => {
    soundService.playPop();
    const bubble = document.getElementById('mascot-bubble');
    if (bubble) {
      const newMsg = MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)];
      bubble.textContent = newMsg;
      bubble.style.animation = 'none';
      bubble.offsetHeight; // trigger reflow
      bubble.style.animation = 'slideUp 0.4s ease';
    }
  });
}

// Expose for other modules to refresh mascot
export function refreshMascot() {
  renderMascot();
}

// Expose for other modules to refresh topbar
export async function refreshTopbar() {
  if (topbarModule) topbarModule.renderTopbar();
}

// ------------------------------------------------------------------
// Boot
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', initApp);
