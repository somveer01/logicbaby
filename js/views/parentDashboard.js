// ==========================================================================
// Parent Dashboard — Comprehensive Analytics, Mistake Review Center,
// Profile Customization & Data Management
// ==========================================================================

import AppState from '../state.js';
import { navigateTo } from '../router.js';
import { soundService } from '../services/soundService.js';
import { speechService } from '../services/speechService.js';
import {
  getActiveProfile,
  CATEGORIES,
  CATEGORY_META,
  AGE_GROUPS,
  updateProfileName,
  updateAvatar,
  updateAgeGroup,
  updatePreferredDifficulty,
  clearMistake,
  resetProgress,
  exportProfileData,
  importProfileData
} from '../services/storageService.js';
import { getProfileBadges, getUnlockedBadgeCount } from '../services/badgeService.js';
import { getQuestionById, getQuestions } from '../data/questionBank.js';

const AVATAR_CHOICES = ['🦊', '🐣', '🦁', '🦅', '🐼', '🦄', '🚀', '🤖', '🐶', '🐱', '🦖', '🌟'];

export function renderParentDashboard() {
  const el = document.getElementById('main-content');
  if (!el) return;

  const profile = AppState.currentProfile || getActiveProfile();
  const stats = profile?.stats || {
    totalAnswered: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalStars: 0,
    currentStreak: 0,
    totalTimeSec: 0
  };

  const accuracy = stats.totalAnswered > 0
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
    : 0;

  const totalTimeFormatted = formatDuration(stats.totalTimeSec || 0);
  const mistakeLog = profile?.mistakeLog || [];
  const activeAvatar = profile?.avatar || '🦊';
  const activeAge = profile?.ageGroup || '5-6';
  const activeDifficulty = AppState.selectedDifficulty || profile?.preferredDifficulty || 1;

  el.innerHTML = `
    <div class="parent-dashboard">
      <!-- Header -->
      <div class="parent-header">
        <div>
          <h1 class="section-heading" style="margin-bottom: 4px;">📊 Parent Zone & Settings</h1>
          <p style="color: var(--text-secondary); font-size: 0.95rem;">
            Track ${escapeHtml(profile?.name || 'child')}'s cognitive development, configure difficulty, and manage learning milestones.
          </p>
        </div>
        <button class="btn-back" id="btn-back-dash">← Back to Dashboard</button>
      </div>

      <!-- Top KPI Metrics -->
      <div class="parent-metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">🧩</div>
          <div class="metric-value">${stats.totalAnswered}</div>
          <div class="metric-label">Puzzles Attempted</div>
        </div>
        <div class="metric-card correct">
          <div class="metric-icon">✅</div>
          <div class="metric-value">${stats.totalCorrect}</div>
          <div class="metric-label">Correct Answers</div>
        </div>
        <div class="metric-card accuracy">
          <div class="metric-icon">🎯</div>
          <div class="metric-value">${accuracy}%</div>
          <div class="metric-label">Overall Accuracy</div>
        </div>
        <div class="metric-card stars">
          <div class="metric-icon">⭐</div>
          <div class="metric-value">${stats.totalStars}</div>
          <div class="metric-label">Total Stars Earned</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">🔥</div>
          <div class="metric-value">${stats.currentStreak}</div>
          <div class="metric-label">Day Streak</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">⏱️</div>
          <div class="metric-value">${totalTimeFormatted}</div>
          <div class="metric-label">Learning Time</div>
        </div>
      </div>

      <!-- Category Mastery Breakdown -->
      <div class="parent-card-section">
        <h2 class="parent-section-title">📈 Category Mastery Breakdown</h2>
        <div class="breakdown-list">
          ${CATEGORIES.map(catKey => {
            const meta = CATEGORY_META[catKey];
            const cs = profile?.categoryStats?.[catKey] || { answered: 0, correct: 0, stars: 0, levelsCompleted: 0 };
            const progress = profile?.levelProgress?.[catKey] || { currentLevel: 1, levelStars: {} };
            const pct = cs.answered > 0 ? Math.round((cs.correct / cs.answered) * 100) : 0;
            const completedLevels = Object.values(progress.levelStars || {}).filter(s => s > 0).length;
            const totalStars = Object.values(progress.levelStars || {}).reduce((a, b) => a + b, 0);

            return `
              <div class="breakdown-row-enhanced">
                <div class="breakdown-info-col">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="breakdown-icon">${meta.icon}</span>
                    <strong class="breakdown-name">${meta.name}</strong>
                  </div>
                  <div class="breakdown-subtext">
                    ${completedLevels}/10 Levels Done • ⭐ ${totalStars}/30 Stars • ${cs.answered} Solved
                  </div>
                </div>
                
                <div class="breakdown-bar-wrap">
                  <div class="breakdown-bar" style="width: ${pct}%; background: linear-gradient(90deg, ${meta.color}, ${meta.color}99);"></div>
                </div>

                <span class="breakdown-pct" style="color: ${meta.color};">${pct}%</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Mistake Review Center -->
      <div class="parent-card-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h2 class="parent-section-title" style="margin-bottom: 2px;">📝 Mistake Review Center</h2>
            <p style="color: var(--text-secondary); font-size: 0.88rem;">
              Targeted practice questions where guidance is needed.
            </p>
          </div>
          ${mistakeLog.length > 0 ? `
            <button class="btn-start-review-all" id="btn-start-review-all">
              🚀 Start Full Review (${mistakeLog.length})
            </button>
          ` : ''}
        </div>

        ${mistakeLog.length === 0 ? `
          <div class="mistake-empty-state">
            <span style="font-size: 40px;">🎉</span>
            <strong>Zero Pending Mistakes!</strong>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">
              Your child has solved all attempted puzzles cleanly. Outstanding work!
            </p>
          </div>
        ` : `
          <div class="mistake-items-list">
            ${mistakeLog.map(m => {
              const q = getQuestionById(m.questionId);
              const meta = CATEGORY_META[m.category] || CATEGORY_META.patterns;
              const dateStr = m.timestamp ? new Date(m.timestamp).toLocaleDateString() : '';

              return `
                <div class="mistake-item-card" data-qid="${m.questionId}">
                  <div class="mistake-item-main">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                      <span class="mistake-cat-pill" style="background: ${meta.color}20; color: ${meta.color};">
                        ${meta.icon} ${meta.name}
                      </span>
                      <span style="font-size: 0.78rem; color: var(--text-muted);">${dateStr}</span>
                    </div>
                    <div class="mistake-question-text">
                      ${escapeHtml(q ? q.questionText : `Question #${m.questionId}`)}
                    </div>
                    ${q?.hint ? `
                      <div class="mistake-hint-text">
                        💡 <strong>Hint:</strong> ${escapeHtml(q.hint)}
                      </div>
                    ` : ''}
                  </div>
                  <div class="mistake-item-actions">
                    <button class="btn-clear-mistake" data-qid="${m.questionId}" title="Remove from mistake list">
                      Dismiss ✓
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Child Profile & Preferences -->
      <div class="parent-card-section">
        <h2 class="parent-section-title">⚙️ Child Profile & Settings</h2>
        
        <!-- Name & Age Form -->
        <div class="profile-settings-grid">
          <div class="setting-group">
            <label class="setting-label" for="input-child-name">Child's Name</label>
            <div style="display: flex; gap: 8px;">
              <input
                type="text"
                id="input-child-name"
                class="parent-text-input"
                value="${escapeHtml(profile?.name || 'Player')}"
                maxlength="20"
              />
              <button class="btn-save-setting" id="btn-save-name">Save</button>
            </div>
          </div>

          <div class="setting-group">
            <label class="setting-label">Age Group Tier</label>
            <div class="age-tier-pills">
              ${AGE_GROUPS.map(ag => `
                <button
                  class="age-pill-btn ${activeAge === ag.id ? 'active' : ''}"
                  data-age="${ag.id}"
                >
                  ${ag.emoji} ${ag.label}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="setting-group">
            <label class="setting-label">Puzzle Difficulty Level</label>
            <div class="age-tier-pills">
              <button class="age-pill-btn ${activeDifficulty === 1 ? 'active' : ''}" data-pref-diff="1" title="Gentle intro for beginners">
                🌱 Easy
              </button>
              <button class="age-pill-btn ${activeDifficulty === 2 ? 'active' : ''}" data-pref-diff="2" title="Standard logic puzzles">
                ⚡ Medium
              </button>
              <button class="age-pill-btn ${activeDifficulty === 3 ? 'active' : ''}" data-pref-diff="3" title="Advanced brain masters">
                🔥 Hard
              </button>
            </div>
          </div>
        </div>

        <!-- Avatar Selection -->
        <div style="margin-top: 20px;">
          <label class="setting-label">Choose Avatar Mascot</label>
          <div class="avatar-picker-grid">
            ${AVATAR_CHOICES.map(av => `
              <button class="avatar-option-btn ${activeAvatar === av ? 'selected' : ''}" data-avatar="${av}">
                ${av}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Audio & Narration Preferences -->
        <div class="setting-switches-row" style="margin-top: 24px;">
          <label class="setting-switch-label">
            <input type="checkbox" id="chk-sound-enabled" ${AppState.soundEnabled ? 'checked' : ''} />
            <span>Sound Effects (Chimes & Fanfares)</span>
          </label>
          <label class="setting-switch-label">
            <input type="checkbox" id="chk-voice-enabled" ${AppState.voiceEnabled ? 'checked' : ''} />
            <span>Automatic Voice Narration (Read questions aloud)</span>
          </label>
        </div>
      </div>

      <!-- Trophy Cabinet Section -->
      <div class="parent-card-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h2 class="parent-section-title" style="margin-bottom: 2px;">🏆 Trophy Cabinet & Milestones</h2>
            <p style="color: var(--text-secondary); font-size: 0.88rem;">
              ${getUnlockedBadgeCount(profile)} of ${getProfileBadges(profile).length} achievements unlocked.
            </p>
          </div>
        </div>
        <div class="trophy-grid">
          ${getProfileBadges(profile).map(b => `
            <div class="trophy-card ${b.unlocked ? 'unlocked' : 'locked'}">
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

      <!-- Printable Worksheets & Certificates -->
      <div class="parent-card-section">
        <h2 class="parent-section-title">🖨️ Printable Worksheets & Certificates</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px;">
          Engage in screen-free logic practice or award your child a personalized completion diploma.
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn-backup" id="btn-print-cert">
            🎓 Print Certificate of Achievement
          </button>
          <button class="btn-backup" id="btn-print-worksheets">
            📝 Print Offline Logic Worksheets
          </button>
        </div>
      </div>

      <!-- Data Backup, Sync & Reset -->
      <div class="parent-card-section">
        <h2 class="parent-section-title">💾 Backup, Sync & Reset</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px;">
          Transfer your child's progress across devices or create a safety backup.
        </p>

        <div class="backup-actions-row">
          <button class="btn-backup" id="btn-export-data">
            📥 Download Backup (JSON)
          </button>
          
          <label class="btn-backup" style="cursor: pointer;">
            📤 Restore from File (JSON)
            <input type="file" id="file-import-data" accept=".json" style="display: none;" />
          </label>

          <button class="btn-danger-reset" id="btn-reset-data">
            ⚠️ Reset All Progress
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach event handlers
  attachParentEvents();
}

/**
 * Format total seconds into friendly string
 */
function formatDuration(totalSec) {
  if (totalSec < 60) return `${totalSec}s`;
  const mins = Math.floor(totalSec / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
}

/**
 * Event Handlers for Parent Dashboard
 */
function attachParentEvents() {
  // Back to dashboard
  document.getElementById('btn-back-dash')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/dashboard');
  });

  // Start review all mistakes
  document.getElementById('btn-start-review-all')?.addEventListener('click', () => {
    soundService.playPop();
    navigateTo('#/game/review');
  });

  // Clear individual mistake
  document.querySelectorAll('.btn-clear-mistake').forEach(btn => {
    btn.addEventListener('click', () => {
      soundService.playPop();
      const qid = btn.dataset.qid;
      clearMistake(qid);
      AppState.currentProfile = getActiveProfile();
      renderParentDashboard();
    });
  });

  // Save child name
  document.getElementById('btn-save-name')?.addEventListener('click', () => {
    const input = document.getElementById('input-child-name');
    if (!input) return;
    const newName = input.value.trim() || 'Player';
    soundService.playPop();
    updateProfileName(newName);
    AppState.currentProfile = getActiveProfile();
    import('../app.js').then(app => {
      app.refreshTopbar();
      app.refreshMascot();
    });
    alert('Name updated to ' + newName + '!');
  });

  // Age group pill click
  document.querySelectorAll('.age-pill-btn[data-age]').forEach(btn => {
    btn.addEventListener('click', () => {
      soundService.playPop();
      const ageGroup = btn.dataset.age;
      updateAgeGroup(ageGroup);
      AppState.currentProfile = getActiveProfile();
      renderParentDashboard();
      import('../app.js').then(app => app.refreshTopbar());
    });
  });

  // Difficulty pill click
  document.querySelectorAll('.age-pill-btn[data-pref-diff]').forEach(btn => {
    btn.addEventListener('click', () => {
      soundService.playPop();
      const diff = parseInt(btn.dataset.prefDiff, 10) || 1;
      AppState.selectedDifficulty = diff;
      updatePreferredDifficulty(diff);
      AppState.currentProfile = getActiveProfile();
      renderParentDashboard();
    });
  });

  // Avatar picker click
  document.querySelectorAll('.avatar-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      soundService.playPop();
      const avatar = btn.dataset.avatar;
      updateAvatar(avatar);
      AppState.currentProfile = getActiveProfile();
      renderParentDashboard();
      import('../app.js').then(app => {
        app.refreshTopbar();
        app.refreshMascot();
      });
    });
  });

  // Sound switch
  document.getElementById('chk-sound-enabled')?.addEventListener('change', (e) => {
    AppState.soundEnabled = e.target.checked;
    soundService.setEnabled(AppState.soundEnabled);
    soundService.playPop();
    import('../app.js').then(app => app.refreshTopbar());
  });

  // Voice narration switch
  document.getElementById('chk-voice-enabled')?.addEventListener('change', (e) => {
    AppState.voiceEnabled = e.target.checked;
    speechService.setEnabled(AppState.voiceEnabled);
    soundService.playPop();
  });

  // Export JSON backup
  document.getElementById('btn-export-data')?.addEventListener('click', () => {
    soundService.playPop();
    const json = exportProfileData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logicbaby_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Print Certificate Modal
  document.getElementById('btn-print-cert')?.addEventListener('click', () => {
    soundService.playPop();
    const profile = AppState.currentProfile || getActiveProfile();
    showCertificateModal(profile);
  });

  // Print Logic Worksheets Modal
  document.getElementById('btn-print-worksheets')?.addEventListener('click', () => {
    soundService.playPop();
    const profile = AppState.currentProfile || getActiveProfile();
    showWorksheetsModal(profile);
  });

  // Import JSON backup
  document.getElementById('file-import-data')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content && importProfileData(content)) {
        soundService.playCorrect();
        AppState.currentProfile = getActiveProfile();
        alert('Data successfully imported!');
        renderParentDashboard();
        import('../app.js').then(app => {
          app.refreshTopbar();
          app.refreshMascot();
        });
      } else {
        soundService.playWrong();
        alert('Failed to import backup file. Please verify format.');
      }
    };
    reader.readAsText(file);
  });

  // Reset Progress with Math Challenge Security Gate
  document.getElementById('btn-reset-data')?.addEventListener('click', () => {
    soundService.playPop();
    showParentalMathGate(() => {
      const fresh = resetProgress();
      AppState.currentProfile = fresh;
      renderParentDashboard();
      import('../app.js').then(app => {
        app.refreshTopbar();
        app.refreshMascot();
      });
      alert('All progress has been reset.');
    });
  });
}

/**
 * Parental Math Gate Modal to verify grown-up access before destructive actions
 */
function showParentalMathGate(onSuccess) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  const n1 = Math.floor(Math.random() * 8) + 7;
  const n2 = Math.floor(Math.random() * 8) + 6;
  const answer = n1 + n2;

  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="modal-card" style="max-width: 440px; position: relative;">
      <button class="modal-close" id="gate-close-btn">✕</button>
      <div style="font-size: 40px; margin-bottom: 12px;">🔒</div>
      <h2 class="modal-title" style="font-size: 1.5rem;">Parental Security Check</h2>
      <p class="modal-subtitle" style="margin-bottom: 20px;">
        To confirm you are a parent, please solve:
      </p>
      
      <div style="font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-bottom: 16px;">
        ${n1} + ${n2} = ?
      </div>

      <input
        type="number"
        id="gate-answer-input"
        class="parent-text-input"
        style="width: 120px; text-align: center; font-size: 1.4rem; margin: 0 auto 20px; display: block;"
        autofocus
      />

      <div style="display: flex; gap: 10px; justify-content: center;">
        <button class="btn-danger-reset" id="gate-submit-btn" style="padding: 10px 24px;">
          Confirm Reset
        </button>
        <button class="btn-back" id="gate-cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  `;

  document.getElementById('gate-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('gate-cancel-btn')?.addEventListener('click', closeModal);

  document.getElementById('gate-submit-btn')?.addEventListener('click', () => {
    const input = document.getElementById('gate-answer-input');
    const val = parseInt(input?.value, 10);
    if (val === answer) {
      closeModal();
      onSuccess();
    } else {
      soundService.playWrong();
      alert('Incorrect answer. Action cancelled.');
      closeModal();
    }
  });

  function closeModal() {
    container.classList.add('hidden');
    container.innerHTML = '';
  }
}

/**
 * Show printable completion certificate modal
 */
function showCertificateModal(profile) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  const name = profile?.name || 'Explorer';
  const avatar = profile?.avatar || '🦊';
  const stars = profile?.stats?.totalStars || 0;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="modal-card print-modal-card" style="max-width: 650px; position: relative;">
      <button class="modal-close no-print" id="cert-close-btn">✕</button>

      <div class="certificate-frame" id="printable-certificate">
        <div class="certificate-inner">
          <div class="cert-header">
            <span style="font-size: 40px;">🧠</span>
            <h1 class="cert-title">CERTIFICATE OF LOGIC MASTERY</h1>
            <p class="cert-subtitle">Presented to our brilliant young thinker</p>
          </div>

          <div class="cert-recipient">
            <div class="cert-avatar">${avatar}</div>
            <div class="cert-name">${escapeHtml(name)}</div>
          </div>

          <p class="cert-body">
            For outstanding critical thinking, visual problem solving, and collecting
            <strong>⭐ ${stars} Stars</strong> across LogicBaby Brain Quests!
          </p>

          <div class="cert-footer">
            <div class="cert-seal">
              <span>🏆</span>
              <small>LogicBaby Official</small>
            </div>
            <div class="cert-date">
              <strong>${dateStr}</strong>
              <small>Date Awarded</small>
            </div>
          </div>
        </div>
      </div>

      <div class="no-print" style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
        <button class="btn-hero" id="btn-do-print-cert" style="padding: 10px 24px;">
          🖨️ Print Certificate
        </button>
        <button class="btn-back" id="btn-cert-cancel">
          Close
        </button>
      </div>
    </div>
  `;

  document.getElementById('cert-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('btn-cert-cancel')?.addEventListener('click', closeModal);
  document.getElementById('btn-do-print-cert')?.addEventListener('click', () => {
    window.print();
  });

  function closeModal() {
    container.classList.add('hidden');
    container.innerHTML = '';
  }
}

/**
 * Show printable logic worksheets modal
 */
function showWorksheetsModal(profile) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  const ageGroup = profile?.ageGroup || '5-6';
  const name = profile?.name || 'Player';
  
  // Pick sample questions from patterns, oddOneOut, spatial, math
  const q1 = getQuestions('patterns', ageGroup)[0] || getQuestions('patterns', '5-6')[0];
  const q2 = getQuestions('oddOneOut', ageGroup)[0] || getQuestions('oddOneOut', '5-6')[0];
  const q3 = getQuestions('spatial', ageGroup)[0] || getQuestions('spatial', '5-6')[0];
  const q4 = getQuestions('math', ageGroup)[0] || getQuestions('math', '5-6')[0];
  const worksheetQs = [q1, q2, q3, q4].filter(Boolean);

  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="modal-card print-modal-card" style="max-width: 780px; position: relative; max-height: 90vh; overflow-y: auto;">
      <button class="modal-close no-print" id="ws-close-btn">✕</button>

      <div class="worksheet-container" id="printable-worksheet">
        <div class="worksheet-header">
          <div>
            <h1 style="font-size: 1.5rem; color: var(--primary); margin-bottom: 2px;">🧠 LogicBaby Printable Worksheet</h1>
            <p style="font-size: 0.85rem; color: #64748B;">Ages ${ageGroup} • Offline Logic Quest</p>
          </div>
          <div class="worksheet-student-meta">
            <div>Name: ______________________</div>
            <div style="margin-top: 4px;">Date: ______________________</div>
          </div>
        </div>

        <div class="worksheet-questions-grid">
          ${worksheetQs.map((q, idx) => `
            <div class="worksheet-q-item">
              <div class="worksheet-q-title">
                <strong>Q${idx + 1}:</strong> ${escapeHtml(q.questionText)}
              </div>
              <div class="worksheet-visual-box">
                ${q.questionSVG}
              </div>
              <div class="worksheet-options-row">
                ${q.options.map(opt => `
                  <div class="worksheet-opt-box">
                    <span class="worksheet-opt-letter">${opt.id.toUpperCase()}</span>
                    <div style="transform: scale(0.75); transform-origin: top center;">${opt.svg}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="no-print" style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
        <button class="btn-hero" id="btn-do-print-ws" style="padding: 10px 24px;">
          🖨️ Print Worksheet
        </button>
        <button class="btn-back" id="btn-ws-cancel">
          Close
        </button>
      </div>
    </div>
  `;

  document.getElementById('ws-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('btn-ws-cancel')?.addEventListener('click', closeModal);
  document.getElementById('btn-do-print-ws')?.addEventListener('click', () => {
    window.print();
  });

  function closeModal() {
    container.classList.add('hidden');
    container.innerHTML = '';
  }
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

