/**
 * pathMilestones.js
 * Definitions for the Number Path (Gentle Garden Path) board game.
 * 20 stepping stones with cheerful, peaceful nature milestones.
 */

export const GARDEN_PATH_MILESTONES = {
  1: { type: 'start', label: 'Garden Gate', icon: 'home', description: 'Start of your peaceful path walk' },
  4: { type: 'rest', label: 'Sunny Bench', icon: 'sun', description: 'A warm wooden bench bathed in gentle morning light' },
  8: { type: 'milestone', label: 'Lotus Pond', icon: 'flower', description: 'Serene pink water lilies floating on calm water' },
  12: { type: 'rest', label: 'Tea Pavilion', icon: 'cup', description: 'A shaded bamboo shelter with warm fragrant tea' },
  16: { type: 'milestone', label: 'Bamboo Arch', icon: 'bamboo', description: 'Tall green bamboo swaying gently in the breeze' },
  20: { type: 'goal', label: 'Rose Garden', icon: 'star', description: 'The beautiful fragrant rose pavilion at the end of the walk' }
};

export const TOTAL_PATH_STONES = 20;
