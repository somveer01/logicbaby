// ==========================================================================
// Topbar — Header Navigation Bar
// ==========================================================================

import AppState from '../state.js';
import { soundService } from '../services/soundService.js';
import { speechService } from '../services/speechService.js';
import { navigateTo } from '../router.js';

export function renderTopbar() {
  const el = document.getElementById('topbar');
  if (!el) return;

  const profile = AppState.currentProfile;
  const stars = profile?.stats?.totalStars || 0;
  const streak = profile?.stats?.currentStreak || 0;
  const ageGroup = profile?.ageGroup || '5-6';
  const soundOn = AppState.soundEnabled;

  el.innerHTML = `
    <div class="topbar-left">
      <div class="logo-badge" id="logo-home">
        <div class="logo-icon">🧠</div>
        <span class="logo-text">LogicBaby</span>
      </div>
    </div>
    <div class="topbar-right">
      <button class="topbar-btn pwa-install-btn" id="btn-pwa-install" style="display: ${deferredPrompt ? 'inline-flex' : 'none'}; background: linear-gradient(135deg, #EC4899, #DB2777); color: white; box-shadow: 0 3px 10px rgba(236, 72, 153, 0.3); font-weight: 800; font-size: 0.82rem; align-items: center; gap: 4px;">
        📲 Install App
      </button>
      <button class="topbar-btn hw-nav-btn" id="btn-homework-nav" style="background: linear-gradient(135deg, #10B981, #059669); color: white; box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3);">
        🎒 Homework
      </button>
      <div class="stat-pill stars">⭐ ${stars}</div>
      <div class="stat-pill streak">🔥 ${streak}</div>
      <button class="topbar-btn age-badge-btn" id="btn-age-switch">
        ${getAgeEmoji(ageGroup)} ${ageGroup}
      </button>
      <button class="icon-btn ${soundOn ? 'active' : ''}" id="btn-sound-toggle" title="Toggle sounds">
        ${soundOn ? '🔊' : '🔇'}
      </button>
      <button class="topbar-btn parent-btn" id="btn-parent-zone" title="Settings, Difficulty & Parent Analytics">
        ⚙️ Settings
      </button>
    </div>
  `;

  // Event listeners
  document.getElementById('btn-homework-nav')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/homework');
  });
  document.getElementById('logo-home')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/dashboard');
  });

  document.getElementById('btn-age-switch')?.addEventListener('click', async () => {
    soundService.playPop();
    const { showAgeSelector } = await import('../app.js');
    showAgeSelector(true);
  });

  // PWA Install click handler
  document.getElementById('btn-pwa-install')?.addEventListener('click', async () => {
    soundService.playPop();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPrompt = null;
        renderTopbar();
      }
    }
  });

  document.getElementById('btn-sound-toggle')?.addEventListener('click', () => {
    AppState.soundEnabled = soundService.toggleSound();
    speechService.setEnabled(AppState.soundEnabled);
    soundService.playPop();
    renderTopbar(); // Re-render to update icon
  });

  // Render native mobile bottom dock
  renderMobileBottomNav();
}

function renderMobileBottomNav() {
  const nav = document.getElementById('mobile-bottom-nav');
  if (!nav) return;

  const currentHash = window.location.hash || '#/dashboard';
  const isHome = currentHash === '#/dashboard' || currentHash === '' || currentHash.startsWith('#/game');
  const isHw = currentHash.startsWith('#/homework');
  const isParent = currentHash.startsWith('#/parent');

  nav.innerHTML = `
    <div class="mobile-nav-item ${isHome ? 'active' : ''}" id="mob-nav-home">
      <div class="mobile-nav-icon">🏠</div>
      <span class="mobile-nav-label">Home</span>
    </div>
    <div class="mobile-nav-item ${isHw ? 'active' : ''}" id="mob-nav-hw">
      <div class="mobile-nav-icon">🎒</div>
      <span class="mobile-nav-label">Homework</span>
    </div>
    <div class="mobile-nav-item" id="mob-nav-games">
      <div class="mobile-nav-icon">🏝️</div>
      <span class="mobile-nav-label">Worlds</span>
    </div>
    <div class="mobile-nav-item" id="mob-nav-trophies">
      <div class="mobile-nav-icon">🏆</div>
      <span class="mobile-nav-label">Trophies</span>
    </div>
    <div class="mobile-nav-item ${isParent ? 'active' : ''}" id="mob-nav-parent">
      <div class="mobile-nav-icon">⚙️</div>
      <span class="mobile-nav-label">Settings</span>
    </div>
  `;

  // Attach mobile nav events
  document.getElementById('mob-nav-home')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('mob-nav-hw')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/homework');
  });

  document.getElementById('mob-nav-games')?.addEventListener('click', () => {
    soundService.playPop();
    if (window.location.hash !== '#/dashboard') {
      navigateTo('#/dashboard');
    }
    setTimeout(() => {
      document.querySelector('.world-game-grid')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  });

  document.getElementById('mob-nav-trophies')?.addEventListener('click', () => {
    soundService.playPop();
    if (window.location.hash !== '#/dashboard') {
      navigateTo('#/dashboard');
    }
    setTimeout(() => {
      document.querySelector('.trophy-cabinet-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  });

  document.getElementById('mob-nav-parent')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/parent');
  });
}

// Global PWA install prompt handler
let deferredPrompt = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('btn-pwa-install');
    if (btn) btn.style.display = 'inline-flex';
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const btn = document.getElementById('btn-pwa-install');
    if (btn) btn.style.display = 'none';
  });
}

function getAgeEmoji(ageGroup) {
  const map = { '3-4': '🐣', '5-6': '🦊', '7-8': '🦁', '9+': '🦅' };
  return map[ageGroup] || '🦊';
}
