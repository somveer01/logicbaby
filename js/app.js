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
let homeworkModule = null;

// ------------------------------------------------------------------
// App Initialization
// ------------------------------------------------------------------

async function initApp() {
  console.log('🧠 LogicBaby initializing...');

  // Check storage availability
  if (!isStorageAvailable()) {
    console.warn('LocalStorage unavailable — progress will not be saved.');
  }

  // Handle Service Worker / Cache invalidation for instant updates
  if ('serviceWorker' in navigator) {
    const isLocalDev = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.startsWith('192.168.');
    if (isLocalDev) {
      // Unregister any active service worker and purge cache storage so edits reflect instantly
      navigator.serviceWorker.getRegistrations().then(regs => {
        for (const reg of regs) reg.unregister();
      });
      if ('caches' in window) {
        caches.keys().then(keys => {
          for (const k of keys) caches.delete(k);
        });
      }
    } else {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => console.log('🧠 LogicBaby: Offline ServiceWorker registered', reg.scope))
          .catch((err) => console.log('ServiceWorker registration error:', err));
      });
    }
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
  registerRoute('#/homework', handleHomework);
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

async function handleHomework() {
  AppState.currentView = 'homework';
  if (!homeworkModule) {
    homeworkModule = await import('./views/homeworkHub.js');
  }
  homeworkModule.renderHomeworkHub();
  if (topbarModule) topbarModule.renderTopbar();
}

// ------------------------------------------------------------------
// Age Selector (first-time flow)
// ------------------------------------------------------------------

export async function showAgeSelector(closable = false) {
  if (!ageSelectorModule) {
    ageSelectorModule = await import('./views/ageSelector.js');
  }
  ageSelectorModule.showAgeSelectorModal(closable, (result) => {
    const ageGroup = (typeof result === 'object' && result.ageGroup) ? result.ageGroup : (typeof result === 'string' ? result : '5-6');
    const childName = (typeof result === 'object' && result.name) ? result.name.trim() : 'Explorer';
    const avatarMap = { '3-4': '🐣', '5-6': '🦊', '7-8': '🦁', '9+': '🦅' };
    const chosenAvatar = (typeof result === 'object' && result.avatar) ? result.avatar : (avatarMap[ageGroup] || '🦊');

    // Create or update profile
    if (!AppState.currentProfile) {
      const profile = createProfile(childName, ageGroup, chosenAvatar);
      AppState.currentProfile = profile;
      // Start router after profile is created
      initRouter();
      navigateTo('#/dashboard');
    } else {
      // Updating profile details
      import('./services/storageService.js').then(mod => {
        mod.updateAgeGroup(ageGroup);
        if (childName && childName !== 'Explorer') {
          mod.updateProfileName(childName);
          AppState.currentProfile.name = childName;
        }
        if (chosenAvatar) {
          mod.updateAvatar(chosenAvatar);
          AppState.currentProfile.avatar = chosenAvatar;
        }
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

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
