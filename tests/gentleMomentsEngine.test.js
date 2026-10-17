import { describe, it, expect } from 'vitest';
import {
  validateCalmMessage,
  validateLittleDiscovery,
  getCalmMessages,
  getLittleDiscoveries,
  getCalmMessageById,
  getLittleDiscoveryById,
  getNextCalmMessage,
  getNextLittleDiscovery,
  getRandomCalmMessage,
  getRandomLittleDiscovery,
  FALLBACK_CALM_MESSAGE,
  FALLBACK_LITTLE_DISCOVERY
} from '../src/games/gentle-moments/gentleMomentsEngine.js';
import { calmMessages, littleDiscoveries } from '../src/data/gentleMomentsData.js';

describe('Gentle Moments Dataset & Engine Tests', () => {
  it('should have at least 8 curated calm messages with complete schema', () => {
    expect(calmMessages.length).toBeGreaterThanOrEqual(8);
    const ids = new Set();

    calmMessages.forEach(msg => {
      expect(validateCalmMessage(msg)).toBe(true);
      expect(ids.has(msg.id)).toBe(false);
      ids.add(msg.id);

      // Verify tone and language
      expect(msg.language).toBe('en');
      expect(['pacing', 'rest', 'comfort', 'nature']).toContain(msg.theme);

      // Verify absence of patronizing or medical claims
      const lower = msg.text.toLowerCase();
      expect(lower).not.toMatch(/clever boy|good girl|smart boy|patient|disease|cure|treat|dementia|alzheimer/);
    });
  });

  it('should have at least 8 verified discoveries with valid citations and categories', () => {
    expect(littleDiscoveries.length).toBeGreaterThanOrEqual(8);
    const ids = new Set();

    littleDiscoveries.forEach(discovery => {
      expect(validateLittleDiscovery(discovery)).toBe(true);
      expect(ids.has(discovery.id)).toBe(false);
      ids.add(discovery.id);

      expect(discovery.reference.trim().length).toBeGreaterThan(5);
      expect(discovery.verifiedBy).toBeTruthy();
      expect(discovery.verifiedAt).toBeTruthy();
      expect(['nature', 'astronomy', 'science', 'animals']).toContain(discovery.category);
    });
  });

  it('should retrieve calm message and little discovery by ID', () => {
    const firstCalm = calmMessages[0];
    const retrievedCalm = getCalmMessageById(firstCalm.id);
    expect(retrievedCalm.id).toBe(firstCalm.id);
    expect(retrievedCalm.text).toBe(firstCalm.text);

    const firstDiscovery = littleDiscoveries[0];
    const retrievedDiscovery = getLittleDiscoveryById(firstDiscovery.id);
    expect(retrievedDiscovery.id).toBe(firstDiscovery.id);
    expect(retrievedDiscovery.title).toBe(firstDiscovery.title);
  });

  it('should cycle sequentially and loop back smoothly', () => {
    const totalCalm = calmMessages.length;
    let currentCalm = calmMessages[0];

    for (let i = 1; i < totalCalm; i++) {
      currentCalm = getNextCalmMessage(currentCalm.id);
      expect(currentCalm.id).toBe(calmMessages[i].id);
    }
    // Next should loop to index 0
    const loopedCalm = getNextCalmMessage(currentCalm.id);
    expect(loopedCalm.id).toBe(calmMessages[0].id);

    const totalDisc = littleDiscoveries.length;
    let currentDisc = littleDiscoveries[0];

    for (let i = 1; i < totalDisc; i++) {
      currentDisc = getNextLittleDiscovery(currentDisc.id);
      expect(currentDisc.id).toBe(littleDiscoveries[i].id);
    }
    // Next should loop to index 0
    const loopedDisc = getNextLittleDiscovery(currentDisc.id);
    expect(loopedDisc.id).toBe(littleDiscoveries[0].id);
  });

  it('should pick random items without immediate repetition when multiple options exist', () => {
    const initialCalm = calmMessages[0];
    for (let i = 0; i < 10; i++) {
      const nextCalm = getRandomCalmMessage(initialCalm.id);
      expect(nextCalm.id).not.toBe(initialCalm.id);
    }

    const initialDisc = littleDiscoveries[0];
    for (let i = 0; i < 10; i++) {
      const nextDisc = getRandomLittleDiscovery(initialDisc.id);
      expect(nextDisc.id).not.toBe(initialDisc.id);
    }
  });

  it('should handle fallbacks gracefully for empty or invalid input', () => {
    expect(getCalmMessageById('non_existent_id', [])).toEqual(FALLBACK_CALM_MESSAGE);
    expect(getLittleDiscoveryById('non_existent_id', [])).toEqual(FALLBACK_LITTLE_DISCOVERY);
    expect(getNextCalmMessage('any', [])).toEqual(FALLBACK_CALM_MESSAGE);
    expect(getNextLittleDiscovery('any', [])).toEqual(FALLBACK_LITTLE_DISCOVERY);
    expect(getRandomCalmMessage(null, [])).toEqual(FALLBACK_CALM_MESSAGE);
    expect(getRandomLittleDiscovery(null, [])).toEqual(FALLBACK_LITTLE_DISCOVERY);
  });
});
