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

  document.getElementById('btn-sound-toggle')?.addEventListener('click', () => {
    AppState.soundEnabled = soundService.toggleSound();
    speechService.setEnabled(AppState.soundEnabled);
    soundService.playPop();
    renderTopbar(); // Re-render to update icon
  });

  document.getElementById('btn-parent-zone')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/parent');
  });
}

function getAgeEmoji(ageGroup) {
  const map = { '3-4': '🐣', '5-6': '🦊', '7-8': '🦁', '9+': '🦅' };
  return map[ageGroup] || '🦊';
}
