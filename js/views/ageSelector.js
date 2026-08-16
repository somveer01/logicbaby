// ==========================================================================
// Age Selector Modal
// ==========================================================================

import { AGE_GROUPS } from '../services/storageService.js';
import { soundService } from '../services/soundService.js';
import AppState from '../state.js';

/**
 * Show the age selector modal
 * @param {boolean} closable - If true, show a close button
 * @param {Function} onSelect - Callback with selected ageGroup string
 */
export function showAgeSelectorModal(closable, onSelect) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  container.classList.remove('hidden');

  const currentAge = AppState.currentProfile?.ageGroup || null;

  container.innerHTML = `
    <div class="modal-card" style="position: relative;">
      ${closable ? '<button class="modal-close" id="modal-close-btn">✕</button>' : ''}
      <div style="font-size: 48px; margin-bottom: 8px;">🧠</div>
      <h2 class="modal-title">How old is your child?</h2>
      <p class="modal-subtitle">We'll pick the right puzzles for their age!</p>
      <div class="age-grid">
        ${AGE_GROUPS.map(ag => `
          <div class="age-card ${currentAge === ag.id ? 'selected' : ''}" data-age="${ag.id}">
            <div class="age-emoji">${ag.emoji}</div>
            <div class="age-label">${ag.label}</div>
            <div class="age-desc">${ag.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Close button
  if (closable) {
    document.getElementById('modal-close-btn')?.addEventListener('click', () => {
      container.classList.add('hidden');
      container.innerHTML = '';
    });
  }

  // Age card selection
  container.querySelectorAll('.age-card').forEach(card => {
    card.addEventListener('click', () => {
      soundService.playPop();
      const ageGroup = card.dataset.age;

      // Visual feedback
      container.querySelectorAll('.age-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      // Small delay then close
      setTimeout(() => {
        container.classList.add('hidden');
        container.innerHTML = '';
        if (onSelect) onSelect(ageGroup);
      }, 300);
    });
  });
}
