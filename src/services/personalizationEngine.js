/**
 * personalizationEngine.js
 * 
 * Transparent, deterministic JavaScript rules engine for Phase 4 personalization.
 * Completely free of machine learning, opaque statistical scoring, or clinical labeling.
 * Respects user autonomy and dignity at all times.
 */

/**
 * Rule 1: Prioritize Favorite Activities
 * Places explicitly favorited games at the top of the activity list,
 * preserving the original relative order among non-favorites.
 * 
 * @param {Array} activities - List of activity objects with an 'id' property
 * @param {Array} favoriteGameIds - List of favorited game IDs
 * @returns {Array} Sorted activities array
 */
export function sortActivitiesByFavorites(activities = [], favoriteGameIds = []) {
  if (!Array.isArray(activities)) return [];
  if (!Array.isArray(favoriteGameIds) || favoriteGameIds.length === 0) {
    return [...activities];
  }

  const favoritesSet = new Set(favoriteGameIds);
  const favorites = [];
  const nonFavorites = [];

  for (const item of activities) {
    if (item && item.id && favoritesSet.has(item.id)) {
      favorites.push({ ...item, isFavorite: true });
    } else {
      nonFavorites.push({ ...item, isFavorite: false });
    }
  }

  return [...favorites, ...nonFavorites];
}

/**
 * Rule 2: Recent Activity Shortcut
 * Derives a simple, non-intrusive "Continue where you left off" shortcut
 * based on the latest recorded session.
 * 
 * @param {Array} history - Array of game session records
 * @param {number} maxAgeDays - Maximum age in days for the shortcut (default: 7)
 * @returns {Object|null} Shortcut descriptor { gameId, timestamp, turnsTaken, pairsMatched } or null
 */
export function getRecentActivityShortcut(history = [], maxAgeDays = 7) {
  if (!Array.isArray(history) || history.length === 0) return null;

  const latest = history[0];
  if (!latest || !latest.gameId || !latest.timestamp) return null;

  const sessionTime = new Date(latest.timestamp).getTime();
  if (isNaN(sessionTime)) return null;

  const now = Date.now();
  const ageMs = now - sessionTime;
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

  // If session is within acceptable age, return shortcut
  if (ageMs >= 0 && ageMs <= maxAgeMs) {
    return {
      gameId: latest.gameId,
      timestamp: latest.timestamp,
      durationSeconds: latest.durationSeconds || 0,
      turnsTaken: latest.turnsTaken || 0,
      pairsMatched: latest.pairsMatched || 0
    };
  }

  return null;
}

/**
 * Rule 3: Memory Match Bounded Difficulty Suggestion
 * Evaluates whether to gently offer a 12-card (6 pairs) variant based on
 * 3 consecutive comfortable sessions with zero hints.
 * 
 * SAFETY GUARANTEES:
 * - A single poor or slow session NEVER triggers an automatic downgrade.
 * - This engine NEVER automatically changes the difficulty without user confirmation.
 * - Difficulty is strictly bounded between 4 and 6 pairs.
 * 
 * @param {Array} history - Array of game session records
 * @returns {Object} { shouldSuggest: boolean, suggestedPairCount: number, reason: string|null }
 */
export function evaluateMemoryMatchDifficultySuggestion(history = []) {
  if (!Array.isArray(history)) {
    return { shouldSuggest: false, suggestedPairCount: 4, reason: null };
  }

  // Filter to memory-match completed sessions
  const mmSessions = history.filter(
    s => s && s.gameId === 'memory-match' && s.completed
  );

  // We need at least 3 completed sessions to detect consistent comfort
  if (mmSessions.length < 3) {
    return { shouldSuggest: false, suggestedPairCount: 4, reason: null };
  }

  const recentThree = mmSessions.slice(0, 3);

  // Check if all 3 recent games were 4 pairs (pairsMatched === 4) and used 0 hints
  const allFourPairsComfortable = recentThree.every(
    s => Number(s.pairsMatched) === 4 && Number(s.hintsUsed || 0) === 0
  );

  if (allFourPairsComfortable) {
    return {
      shouldSuggest: true,
      suggestedPairCount: 6,
      reason: 'comfort'
    };
  }

  return { shouldSuggest: false, suggestedPairCount: 4, reason: null };
}

/**
 * Rule 4: Gentle Pacing and Rest Recommendation
 * Evaluates whether the user has been playing continuously across multiple
 * games without a rest, offering a dignified break reminder.
 * 
 * @param {Array} history - Array of game session records
 * @param {number} windowMinutes - Time window to consider for consecutive activity (default 45 min)
 * @returns {Object} { recommendRest: boolean, sessionCount: number, message: string|null }
 */
export function evaluatePacingRecommendation(history = [], windowMinutes = 45) {
  if (!Array.isArray(history) || history.length === 0) {
    return { recommendRest: false, sessionCount: 0, message: null };
  }

  const latestTime = new Date(history[0].timestamp).getTime();
  if (isNaN(latestTime)) {
    return { recommendRest: false, sessionCount: 0, message: null };
  }

  const windowMs = windowMinutes * 60 * 1000;
  let countInWindow = 0;

  for (const session of history) {
    if (!session || !session.timestamp) continue;
    const t = new Date(session.timestamp).getTime();
    if (!isNaN(t) && latestTime - t <= windowMs && latestTime - t >= 0) {
      countInWindow++;
    } else {
      break; // History is sorted newest-first
    }
  }

  if (countInWindow >= 3) {
    return {
      recommendRest: true,
      sessionCount: countInWindow,
      message: 'You have enjoyed several peaceful activities today. Would you like to take a restful break with a gentle moment?'
    };
  }

  return {
    recommendRest: false,
    sessionCount: countInWindow,
    message: null
  };
}

/**
 * Rule 5: Gentle Moments Rotation Continuity
 * Returns the next item IDs based on stored preference state.
 * 
 * @param {Object} contentState - { lastCalmId, lastDiscoveryId }
 * @param {Array} calmList - List of calm messages
 * @param {Array} discoveryList - List of discovery facts
 * @returns {Object} { nextCalmId, nextDiscoveryId }
 */
export function getNextRotatedContent(contentState = {}, calmList = [], discoveryList = []) {
  let nextCalmId = null;
  let nextDiscoveryId = null;

  if (Array.isArray(calmList) && calmList.length > 0) {
    const currentIndex = calmList.findIndex(m => m && m.id === contentState.lastCalmId);
    if (currentIndex === -1 || currentIndex >= calmList.length - 1) {
      nextCalmId = calmList[0].id;
    } else {
      nextCalmId = calmList[currentIndex + 1].id;
    }
  }

  if (Array.isArray(discoveryList) && discoveryList.length > 0) {
    const currentIndex = discoveryList.findIndex(d => d && d.id === contentState.lastDiscoveryId);
    if (currentIndex === -1 || currentIndex >= discoveryList.length - 1) {
      nextDiscoveryId = discoveryList[0].id;
    } else {
      nextDiscoveryId = discoveryList[currentIndex + 1].id;
    }
  }

  return { nextCalmId, nextDiscoveryId };
}
