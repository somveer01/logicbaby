// ==========================================================================
// Badge & Achievement System
// Evaluates unlocked achievements based on child profile stats & progression
// ==========================================================================

export const BADGE_DEFINITIONS = [
  {
    id: 'first_step',
    name: 'First Step',
    icon: '🌟',
    description: 'Solved your very first logic puzzle!',
    check: (profile) => (profile?.stats?.totalAnswered || 0) >= 1
  },
  {
    id: 'star_collector',
    name: 'Star Collector',
    icon: '⭐',
    description: 'Collected 10 shiny stars!',
    check: (profile) => (profile?.stats?.totalStars || 0) >= 10
  },
  {
    id: 'superstar',
    name: 'Superstar Master',
    icon: '🏆',
    description: 'Collected 30 stars across all categories!',
    check: (profile) => (profile?.stats?.totalStars || 0) >= 30
  },
  {
    id: 'streak_fire',
    name: 'Daily Spark',
    icon: '🔥',
    description: 'Played 2 days in a row!',
    check: (profile) => (profile?.stats?.currentStreak || 0) >= 2
  },
  {
    id: 'streak_champion',
    name: 'Streak Champion',
    icon: '⚡',
    description: 'Kept a 5-day daily learning streak!',
    check: (profile) => (profile?.stats?.currentStreak || 0) >= 5
  },
  {
    id: 'pattern_pro',
    name: 'Pattern Prodigy',
    icon: '🧩',
    description: 'Completed 3 levels of Patterns & Sequences!',
    check: (profile) => getCompletedLevels(profile, 'patterns') >= 3
  },
  {
    id: 'odd_spotter',
    name: 'Eagle Eye',
    icon: '🎯',
    description: 'Completed 3 levels of Odd One Out!',
    check: (profile) => getCompletedLevels(profile, 'oddOneOut') >= 3
  },
  {
    id: 'shape_wizard',
    name: 'Shape Wizard',
    icon: '📐',
    description: 'Completed 3 levels of Spatial & Shapes!',
    check: (profile) => getCompletedLevels(profile, 'spatial') >= 3
  },
  {
    id: 'math_genius',
    name: 'Math Whiz',
    icon: '🔢',
    description: 'Completed 3 levels of Math & Numbers!',
    check: (profile) => getCompletedLevels(profile, 'math') >= 3
  },
  {
    id: 'sorter_pro',
    name: 'Master Sorter',
    icon: '📋',
    description: 'Completed 3 levels of Sorting & Grouping!',
    check: (profile) => getCompletedLevels(profile, 'sorting') >= 3
  },
  {
    id: 'memory_champ',
    name: 'Memory Marvel',
    icon: '🧠',
    description: 'Completed 3 levels of Memory & Attention!',
    check: (profile) => getCompletedLevels(profile, 'memory') >= 3
  },
  {
    id: 'logic_legend',
    name: 'Logic Legend',
    icon: '👑',
    description: 'Answered over 25 puzzles with high accuracy!',
    check: (profile) => (profile?.stats?.totalAnswered || 0) >= 25
  }
];

function getCompletedLevels(profile, category) {
  const starsObj = profile?.levelProgress?.[category]?.levelStars || {};
  return Object.values(starsObj).filter(s => s > 0).length;
}

/**
 * Get all badges with their unlocked status for a given profile
 * @param {Object} profile
 * @returns {Array<{ id, name, icon, description, unlocked: boolean }>}
 */
export function getProfileBadges(profile) {
  return BADGE_DEFINITIONS.map(badge => ({
    ...badge,
    unlocked: Boolean(badge.check(profile))
  }));
}

/**
 * Get count of unlocked badges
 */
export function getUnlockedBadgeCount(profile) {
  return getProfileBadges(profile).filter(b => b.unlocked).length;
}
