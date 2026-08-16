// ==========================================================================
// LocalStorage Service — CRUD, Profile Management, Schema Versioning
// ==========================================================================

const STORAGE_KEY = 'logicbaby_data';
const SCHEMA_VERSION = 1;

// Category keys used throughout the app
export const CATEGORIES = ['patterns', 'oddOneOut', 'spatial', 'math', 'sorting', 'memory'];

// Category display metadata
export const CATEGORY_META = {
  patterns:  { name: 'Patterns & Sequences', icon: '🧩', color: '#8B5CF6', bgClass: 'cat-patterns' },
  oddOneOut: { name: 'Odd One Out',          icon: '🎯', color: '#EC4899', bgClass: 'cat-odd' },
  spatial:   { name: 'Spatial & Shapes',     icon: '📐', color: '#06B6D4', bgClass: 'cat-spatial' },
  math:      { name: 'Math & Numbers',       icon: '🔢', color: '#10B981', bgClass: 'cat-math' },
  sorting:   { name: 'Sorting & Grouping',   icon: '📋', color: '#F59E0B', bgClass: 'cat-sorting' },
  memory:    { name: 'Memory & Attention',   icon: '🧠', color: '#EF4444', bgClass: 'cat-memory' }
};

// Age group options
export const AGE_GROUPS = [
  { id: '3-4', label: 'Ages 3–4', emoji: '🐣', desc: 'Toddler / Early Preschool' },
  { id: '5-6', label: 'Ages 5–6', emoji: '🦊', desc: 'Preschool / Kindergarten' },
  { id: '7-8', label: 'Ages 7–8', emoji: '🦁', desc: 'Early Grade School' },
  { id: '9+',  label: 'Ages 9+',  emoji: '🦅', desc: 'Junior Logic Master' }
];

/**
 * Create a blank profile object
 */
function createBlankProfile(id, name, ageGroup, avatar) {
  const blankCategoryStats = {};
  const blankLevelProgress = {};

  CATEGORIES.forEach(cat => {
    blankCategoryStats[cat] = { answered: 0, correct: 0, stars: 0, levelsCompleted: 0 };
    blankLevelProgress[cat] = { currentLevel: 1, levelStars: {} };
  });

  return {
    id,
    name: name || 'Player',
    ageGroup: ageGroup || '5-6',
    avatar: avatar || '🦊',
    createdAt: new Date().toISOString().split('T')[0],
    stats: {
      totalAnswered: 0,
      totalCorrect: 0,
      totalWrong: 0,
      totalStars: 0,
      currentStreak: 0,
      lastPlayedDate: null,
      totalTimeSec: 0
    },
    categoryStats: blankCategoryStats,
    levelProgress: blankLevelProgress,
    mistakeLog: [],
    sessionHistory: [],
    seenQuestionIds: [],
    preferredDifficulty: 1
  };
}

/**
 * Create initial empty storage data
 */
function createEmptyData() {
  return {
    version: SCHEMA_VERSION,
    activeProfileId: null,
    profiles: {}
  };
}

/**
 * Load all data from LocalStorage. Returns parsed object or empty data.
 */
export function loadData() {
  try {
    if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') return createEmptyData();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyData();

    const data = JSON.parse(raw);

    // Schema version migration (for future use)
    if (data.version !== SCHEMA_VERSION) {
      return migrateData(data);
    }

    return data;
  } catch (e) {
    console.warn('LogicBaby: Failed to load data from LocalStorage', e);
    return createEmptyData();
  }
}

/**
 * Save data object to LocalStorage
 */
export function saveData(data) {
  try {
    if (typeof localStorage === 'undefined' || typeof localStorage.setItem !== 'function') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LogicBaby: Failed to save data to LocalStorage', e);
  }
}

/**
 * Check if LocalStorage is available
 */
export function isStorageAvailable() {
  try {
    const testKey = '__logicbaby_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Migrate data from older schema versions
 */
function migrateData(data) {
  // Currently no migrations needed — v1 is the first version
  // When we add v2, we'll handle the transform here
  console.log('LogicBaby: Migrating data from version', data.version, 'to', SCHEMA_VERSION);
  data.version = SCHEMA_VERSION;
  saveData(data);
  return data;
}

// ------------------------------------------------------------------
// Profile Management
// ------------------------------------------------------------------

/**
 * Get the active profile, or null if none exists
 */
export function getActiveProfile() {
  const data = loadData();
  if (!data.activeProfileId || !data.profiles[data.activeProfileId]) {
    return null;
  }
  return data.profiles[data.activeProfileId];
}

/**
 * Create a new profile and set it as active
 */
export function createProfile(name, ageGroup, avatar) {
  const data = loadData();
  const id = 'profile-' + Date.now();
  const profile = createBlankProfile(id, name, ageGroup, avatar);

  data.profiles[id] = profile;
  data.activeProfileId = id;
  saveData(data);

  return profile;
}

/**
 * Update the active profile's age group
 */
export function updateAgeGroup(ageGroup) {
  const data = loadData();
  const profile = data.profiles[data.activeProfileId];
  if (!profile) return;

  profile.ageGroup = ageGroup;
  saveData(data);
  return profile;
}

/**
 * Update the active profile's avatar
 */
export function updateAvatar(avatar) {
  const data = loadData();
  const profile = data.profiles[data.activeProfileId];
  if (!profile) return;

  profile.avatar = avatar;
  saveData(data);
  return profile;
}

/**
 * Update the active profile's preferred difficulty (1 = Easy, 2 = Medium, 3 = Hard)
 */
export function updatePreferredDifficulty(difficulty) {
  const data = loadData();
  const profile = data.profiles[data.activeProfileId];
  if (!profile) return;

  profile.preferredDifficulty = Number(difficulty) || 1;
  saveData(data);
  return profile;
}

/**
 * List all profiles
 */
export function listProfiles() {
  const data = loadData();
  return Object.values(data.profiles);
}

/**
 * Switch active profile
 */
export function switchProfile(profileId) {
  const data = loadData();
  if (data.profiles[profileId]) {
    data.activeProfileId = profileId;
    saveData(data);
    return data.profiles[profileId];
  }
  return null;
}

// ------------------------------------------------------------------
// Score & Progress Tracking
// ------------------------------------------------------------------

/**
 * Record a single answer result
 * @param {string} category - Category key
 * @param {string} questionId - Question ID
 * @param {boolean} correct - Was the answer correct?
 * @param {string} wrongOptionId - If wrong, which option was selected
 */
export function recordAnswerResult(category, questionId, correct, wrongOptionId) {
  const data = loadData();
  const profile = data.profiles[data.activeProfileId];
  if (!profile) return;

  // Update global stats
  profile.stats.totalAnswered++;
  if (correct) {
    profile.stats.totalCorrect++;
  } else {
    profile.stats.totalWrong++;
  }

  // Update category stats
  if (profile.categoryStats[category]) {
    profile.categoryStats[category].answered++;
    if (correct) {
      profile.categoryStats[category].correct++;
    }
  }

  // Log mistake for review mode
  if (!correct) {
    // Avoid duplicate entries for same question
    const alreadyLogged = profile.mistakeLog.some(m => m.questionId === questionId);
    if (!alreadyLogged) {
      profile.mistakeLog.push({
        questionId,
        wrongOptionId,
        category,
        timestamp: new Date().toISOString()
      });
    }
  } else {
    // If answered correctly, remove from mistake log
    profile.mistakeLog = profile.mistakeLog.filter(m => m.questionId !== questionId);
  }

  saveData(data);
}

/**
 * Save completed level result
 * @param {string} category - Category key
 * @param {number} levelNumber - Level number
 * @param {number} stars - Stars earned (1-3)
 * @param {number} correct - Number of correct answers
 * @param {number} wrong - Number of wrong answers
 * @param {number} timeSec - Time taken in seconds
 */
export function saveLevelResult(category, levelNumber, stars, correct, wrong, timeSec) {
  const data = loadData();
  const profile = data.profiles[data.activeProfileId];
  if (!profile) return;

  // Update level progress
  const progress = profile.levelProgress[category];
  if (progress) {
    // Save stars (keep best)
    const prevStars = progress.levelStars[String(levelNumber)] || 0;
    progress.levelStars[String(levelNumber)] = Math.max(prevStars, stars);

    // Unlock next level if not already
    if (levelNumber >= progress.currentLevel) {
      progress.currentLevel = levelNumber + 1;
    }

    // Count total completed levels
    profile.categoryStats[category].levelsCompleted = Object.keys(progress.levelStars).filter(
      k => progress.levelStars[k] > 0
    ).length;
  }

  // Add stars to totals
  profile.stats.totalStars += stars;
  profile.categoryStats[category].stars += stars;

  // Update streak
  const today = new Date().toISOString().split('T')[0];
  if (profile.stats.lastPlayedDate) {
    const lastDate = new Date(profile.stats.lastPlayedDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      profile.stats.currentStreak++;
    } else if (diffDays > 1) {
      profile.stats.currentStreak = 1;
    }
    // diffDays === 0: same day, don't change streak
  } else {
    profile.stats.currentStreak = 1;
  }
  profile.stats.lastPlayedDate = today;

  // Add time
  profile.stats.totalTimeSec += timeSec;

  // Add to session history (keep last 50)
  profile.sessionHistory.unshift({
    category,
    level: levelNumber,
    date: today,
    correct,
    wrong,
    stars,
    timeSec
  });
  if (profile.sessionHistory.length > 50) {
    profile.sessionHistory = profile.sessionHistory.slice(0, 50);
  }

  saveData(data);
}

/**
 * Get mistake log for the active profile
 */
export function getMistakeLog() {
  const profile = getActiveProfile();
  return profile ? profile.mistakeLog : [];
}

/**
 * Clear a mistake from the log (after successfully reviewing it)
 */
export function clearMistake(questionId) {
  const data = loadData();
  const profile = data.profiles[data.activeProfileId];
  if (!profile) return;

  profile.mistakeLog = profile.mistakeLog.filter(m => m.questionId !== questionId);
  saveData(data);
}

/**
 * Update the active profile's name
 */
export function updateProfileName(name) {
  const data = loadData();
  const profile = data.profiles[data.activeProfileId];
  if (!profile) return;

  profile.name = name.trim() || 'Player';
  saveData(data);
  return profile;
}

/**
 * Export all profile and progress data as a JSON string
 */
export function exportProfileData() {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

/**
 * Import profile and progress data from a JSON string
 */
export function importProfileData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object' || !parsed.profiles) {
      throw new Error('Invalid LogicBaby data format');
    }
    saveData(parsed);
    return true;
  } catch (e) {
    console.error('Failed to import data:', e);
    return false;
  }
}

/**
 * Reset all progress for the active profile
 */
export function resetProgress() {
  const data = loadData();
  const profile = data.profiles[data.activeProfileId];
  if (!profile) return;

  const fresh = createBlankProfile(profile.id, profile.name, profile.ageGroup, profile.avatar);
  data.profiles[data.activeProfileId] = fresh;
  saveData(data);
  return fresh;
}

/**
 * Delete a profile
 */
export function deleteProfile(profileId) {
  const data = loadData();
  delete data.profiles[profileId];
  
  if (data.activeProfileId === profileId) {
    const remaining = Object.keys(data.profiles);
    data.activeProfileId = remaining.length > 0 ? remaining[0] : null;
  }
  
  saveData(data);
}

/**
 * Mark question IDs as seen for the active profile (retains max 50 recent IDs)
 * @param {Array<string>} questionIds
 */
export function markQuestionsAsSeen(questionIds) {
  if (!questionIds || !questionIds.length) return;
  const data = loadData();
  const profile = data.profiles[data.activeProfileId];
  if (!profile) return;

  if (!Array.isArray(profile.seenQuestionIds)) {
    profile.seenQuestionIds = [];
  }

  questionIds.forEach(id => {
    if (!profile.seenQuestionIds.includes(id)) {
      profile.seenQuestionIds.push(id);
    }
  });

  // Keep a maximum buffer of 50 to allow cycling
  if (profile.seenQuestionIds.length > 50) {
    profile.seenQuestionIds = profile.seenQuestionIds.slice(profile.seenQuestionIds.length - 50);
  }

  saveData(data);
}

/**
 * Get list of seen question IDs for the active profile
 * @returns {Array<string>}
 */
export function getSeenQuestions() {
  const profile = getActiveProfile();
  return Array.isArray(profile?.seenQuestionIds) ? profile.seenQuestionIds : [];
}

/**
 * Clear seen questions history
 */
export function clearSeenQuestions() {
  const data = loadData();
  const profile = data.profiles[data.activeProfileId];
  if (!profile) return;

  profile.seenQuestionIds = [];
  saveData(data);
}

