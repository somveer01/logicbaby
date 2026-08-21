// ==========================================================================
// Age & Baby Name Selector Modal — 2-Step Interactive Onboarding Flow
// ==========================================================================

import { AGE_GROUPS } from '../services/storageService.js';
import { soundService } from '../services/soundService.js';
import AppState from '../state.js';

const AVATAR_OPTIONS = ['🦊', '🐣', '🦁', '🦅', '🐼', '🦄', '🚀', '🤖', '🐶', '🐱', '🦖', '🌟'];
const DEFAULT_AVATARS = { '3-4': '🐣', '5-6': '🦊', '7-8': '🦁', '9+': '🦅' };

/**
 * Show the age & baby name selector modal
 * @param {boolean} closable - If true, show a close button
 * @param {Function} onSelect - Callback with selected { ageGroup, name, avatar }
 */
export function showAgeSelectorModal(closable, onSelect) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  container.classList.remove('hidden');

  let selectedAge = AppState.currentProfile?.ageGroup || null;
  let selectedAvatar = AppState.currentProfile?.avatar || '🦊';
  let babyName = AppState.currentProfile?.name || '';
  if (babyName === 'Player' || babyName === 'Explorer') babyName = '';

  // Render Step 1: Age Selection
  function renderStep1() {
    container.innerHTML = `
      <div class="modal-card" style="position: relative; max-width: 580px; text-align: center;">
        ${closable ? '<button class="modal-close" id="modal-close-btn">✕</button>' : ''}
        <div style="font-size: 48px; margin-bottom: 6px;">🧠</div>
        <h2 class="modal-title" style="font-size: 1.6rem; color: var(--primary); margin-bottom: 4px;">
          How old is your child?
        </h2>
        <p class="modal-subtitle" style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 18px;">
          We'll pick the right logic puzzles & learning tracks for their age!
        </p>
        <div class="age-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 12px;">
          ${AGE_GROUPS.map(ag => `
            <div class="age-card ${selectedAge === ag.id ? 'selected' : ''}" data-age="${ag.id}" style="cursor: pointer; padding: 16px 12px; border-radius: var(--r-md); transition: all 0.2s ease;">
              <div class="age-emoji" style="font-size: 36px; margin-bottom: 4px;">${ag.emoji}</div>
              <div class="age-label" style="font-weight: 800; font-size: 1.05rem; color: var(--text-main);">${ag.label}</div>
              <div class="age-desc" style="font-size: 0.82rem; color: var(--text-secondary); font-weight: 600;">${ag.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (closable) {
      document.getElementById('modal-close-btn')?.addEventListener('click', () => {
        container.classList.add('hidden');
        container.innerHTML = '';
      });
    }

    container.querySelectorAll('.age-card').forEach(card => {
      card.addEventListener('click', () => {
        soundService.playPop();
        selectedAge = card.dataset.age;
        selectedAvatar = AppState.currentProfile?.avatar || DEFAULT_AVATARS[selectedAge] || '🦊';

        container.querySelectorAll('.age-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        setTimeout(() => {
          renderStep2();
        }, 220);
      });
    });
  }

  // Render Step 2: Child Name & Avatar Selection
  function renderStep2() {
    const ageInfo = AGE_GROUPS.find(a => a.id === selectedAge) || AGE_GROUPS[1];

    container.innerHTML = `
      <div class="modal-card" style="position: relative; max-width: 540px; text-align: center; animation: babyBounceIn 0.35s ease;">
        ${closable ? '<button class="modal-close" id="modal-close-btn">✕</button>' : ''}
        
        <div style="font-size: 48px; margin-bottom: 6px;">👋</div>
        <h2 class="modal-title" style="font-size: 1.6rem; color: var(--primary); margin-bottom: 4px;">
          What is your child's name?
        </h2>
        
        <!-- Age Badge Tag with change button -->
        <div style="display: inline-flex; align-items: center; gap: 8px; background: #EDE9FE; border: 1.5px solid #DDD6FE; padding: 4px 14px; border-radius: var(--r-full); margin-bottom: 16px;">
          <span style="font-size: 0.85rem; font-weight: 800; color: var(--primary);">
            ${ageInfo.emoji} ${ageInfo.label} (${ageInfo.desc})
          </span>
          <button id="btn-change-age" style="background: none; border: none; font-size: 0.78rem; font-weight: 800; color: #7C3AED; cursor: pointer; text-decoration: underline; padding: 0;">
            Change
          </button>
        </div>

        <!-- Name Input -->
        <div style="margin-bottom: 18px; text-align: left;">
          <label for="baby-name-input" style="font-size: 0.88rem; font-weight: 800; color: var(--text-main); display: block; margin-bottom: 6px;">
            Child's First Name:
          </label>
          <input
            type="text"
            id="baby-name-input"
            value="${escapeHtml(babyName)}"
            placeholder="e.g. Leo, Maya, Aarav, Sophia..."
            maxlength="20"
            style="width: 100%; padding: 12px 16px; border: 2.5px solid #DDD6FE; border-radius: var(--r-md); font-family: var(--font-body); font-size: 1.1rem; font-weight: 800; color: var(--text-main); outline: none; transition: border-color 0.2s;"
          />
        </div>

        <!-- Avatar Selection -->
        <div style="margin-bottom: 22px; text-align: left;">
          <label style="font-size: 0.88rem; font-weight: 800; color: var(--text-main); display: block; margin-bottom: 8px;">
            Choose a Favorite Buddy Avatar:
          </label>
          <div id="avatar-grid" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
            ${AVATAR_OPTIONS.map(av => `
              <button
                type="button"
                class="avatar-select-btn ${selectedAvatar === av ? 'selected' : ''}"
                data-avatar="${av}"
                style="width: 44px; height: 44px; font-size: 24px; border-radius: 50%; border: 2.5px solid ${selectedAvatar === av ? 'var(--primary)' : '#E2E8F0'}; background: ${selectedAvatar === av ? '#EDE9FE' : 'white'}; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);"
              >
                ${av}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center;">
          <button class="btn-cancel" id="btn-back-step1" style="padding: 11px 20px; background: #F1F5F9; border-radius: var(--r-full); font-weight: 800; font-size: 0.92rem; color: var(--text-secondary); border: none; cursor: pointer;">
            ← Back
          </button>
          <button class="btn-save-setting" id="btn-submit-profile" style="flex: 1; padding: 12px 24px; background: linear-gradient(135deg, #8B5CF6, #6C3FB5); color: white; border: none; border-radius: var(--r-full); font-weight: 800; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 14px rgba(108, 63, 181, 0.35);">
            🚀 Let's Play & Learn!
          </button>
        </div>
      </div>
    `;

    // Focus input
    const input = document.getElementById('baby-name-input');
    if (input) {
      setTimeout(() => input.focus(), 50);
      input.addEventListener('input', (e) => {
        babyName = e.target.value;
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitProfile();
        }
      });
    }

    if (closable) {
      document.getElementById('modal-close-btn')?.addEventListener('click', () => {
        container.classList.add('hidden');
        container.innerHTML = '';
      });
    }

    document.getElementById('btn-change-age')?.addEventListener('click', () => {
      soundService.playPop();
      renderStep1();
    });

    document.getElementById('btn-back-step1')?.addEventListener('click', () => {
      soundService.playPop();
      renderStep1();
    });

    // Avatar clicks
    container.querySelectorAll('.avatar-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playPop();
        selectedAvatar = btn.dataset.avatar;
        container.querySelectorAll('.avatar-select-btn').forEach(b => {
          b.style.borderColor = '#E2E8F0';
          b.style.background = 'white';
        });
        btn.style.borderColor = 'var(--primary)';
        btn.style.background = '#EDE9FE';
      });
    });

    // Submit handler
    function submitProfile() {
      const finalName = (document.getElementById('baby-name-input')?.value || '').trim() || 'Explorer';
      soundService.playFanfare();

      container.classList.add('hidden');
      container.innerHTML = '';

      if (onSelect) {
        onSelect({
          ageGroup: selectedAge,
          name: finalName,
          avatar: selectedAvatar
        });
      }
    }

    document.getElementById('btn-submit-profile')?.addEventListener('click', () => {
      submitProfile();
    });
  }

  // Start with Step 1
  renderStep1();
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
