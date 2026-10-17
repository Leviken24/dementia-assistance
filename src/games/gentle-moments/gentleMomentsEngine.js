import { calmMessages, littleDiscoveries } from '../../data/gentleMomentsData.js';

/**
 * Fallback records if dataset is ever corrupted or empty.
 */
export const FALLBACK_CALM_MESSAGE = {
  id: 'fallback_calm',
  text: 'Take a deep, gentle breath. You are in a safe, peaceful space.',
  theme: 'comfort',
  tone: 'supportive',
  language: 'en'
};

export const FALLBACK_LITTLE_DISCOVERY = {
  id: 'fallback_discovery',
  title: 'Gentle Sunlight',
  text: 'Sunlight gently warms the earth, helping leaves unfurl and flowers open in the morning.',
  category: 'nature',
  icon: 'sun',
  reference: 'General Science and Botany',
  verifiedBy: 'Editorial Review',
  verifiedAt: '2026-10-17',
  language: 'en'
};

/**
 * Validates a calm message object structure.
 */
export function validateCalmMessage(msg) {
  if (!msg || typeof msg !== 'object') return false;
  return (
    typeof msg.id === 'string' &&
    msg.id.trim().length > 0 &&
    typeof msg.text === 'string' &&
    msg.text.trim().length > 0 &&
    typeof msg.theme === 'string' &&
    typeof msg.tone === 'string'
  );
}

/**
 * Validates a little discovery fact object structure.
 */
export function validateLittleDiscovery(disc) {
  if (!disc || typeof disc !== 'object') return false;
  return (
    typeof disc.id === 'string' &&
    disc.id.trim().length > 0 &&
    typeof disc.title === 'string' &&
    disc.title.trim().length > 0 &&
    typeof disc.text === 'string' &&
    disc.text.trim().length > 0 &&
    typeof disc.category === 'string' &&
    typeof disc.icon === 'string' &&
    typeof disc.reference === 'string' &&
    disc.reference.trim().length > 0
  );
}

/**
 * Returns all available calm messages.
 */
export function getCalmMessages() {
  return Array.isArray(calmMessages) ? [...calmMessages] : [];
}

/**
 * Returns all available little discoveries.
 */
export function getLittleDiscoveries() {
  return Array.isArray(littleDiscoveries) ? [...littleDiscoveries] : [];
}

/**
 * Retrieves a calm message by ID.
 */
export function getCalmMessageById(id, list = calmMessages) {
  if (!Array.isArray(list) || list.length === 0) return FALLBACK_CALM_MESSAGE;
  const found = list.find(m => m && m.id === id);
  return found || list[0] || FALLBACK_CALM_MESSAGE;
}

/**
 * Retrieves a little discovery by ID.
 */
export function getLittleDiscoveryById(id, list = littleDiscoveries) {
  if (!Array.isArray(list) || list.length === 0) return FALLBACK_LITTLE_DISCOVERY;
  const found = list.find(d => d && d.id === id);
  return found || list[0] || FALLBACK_LITTLE_DISCOVERY;
}

/**
 * Cycles sequentially to the next calm message.
 */
export function getNextCalmMessage(currentId, list = calmMessages) {
  if (!Array.isArray(list) || list.length === 0) return FALLBACK_CALM_MESSAGE;
  const currentIndex = list.findIndex(m => m && m.id === currentId);
  if (currentIndex === -1 || currentIndex >= list.length - 1) {
    return list[0] || FALLBACK_CALM_MESSAGE;
  }
  return list[currentIndex + 1];
}

/**
 * Cycles sequentially to the next little discovery.
 */
export function getNextLittleDiscovery(currentId, list = littleDiscoveries) {
  if (!Array.isArray(list) || list.length === 0) return FALLBACK_LITTLE_DISCOVERY;
  const currentIndex = list.findIndex(d => d && d.id === currentId);
  if (currentIndex === -1 || currentIndex >= list.length - 1) {
    return list[0] || FALLBACK_LITTLE_DISCOVERY;
  }
  return list[currentIndex + 1];
}

/**
 * Returns a random calm message, avoiding immediate repetition if list has multiple items.
 */
export function getRandomCalmMessage(excludeId = null, list = calmMessages) {
  if (!Array.isArray(list) || list.length === 0) return FALLBACK_CALM_MESSAGE;
  if (list.length === 1) return list[0];

  const pool = excludeId ? list.filter(m => m && m.id !== excludeId) : list;
  const targetPool = pool.length > 0 ? pool : list;
  const randomIndex = Math.floor(Math.random() * targetPool.length);
  return targetPool[randomIndex] || FALLBACK_CALM_MESSAGE;
}

/**
 * Returns a random little discovery, avoiding immediate repetition if list has multiple items.
 */
export function getRandomLittleDiscovery(excludeId = null, list = littleDiscoveries) {
  if (!Array.isArray(list) || list.length === 0) return FALLBACK_LITTLE_DISCOVERY;
  if (list.length === 1) return list[0];

  const pool = excludeId ? list.filter(d => d && d.id !== excludeId) : list;
  const targetPool = pool.length > 0 ? pool : list;
  const randomIndex = Math.floor(Math.random() * targetPool.length);
  return targetPool[randomIndex] || FALLBACK_LITTLE_DISCOVERY;
}
