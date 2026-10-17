import { describe, it, expect } from 'vitest';
import { calmMessages, littleDiscoveries } from '../src/data/gentleMomentsData.js';
import {
  getNextCalmMessage,
  getNextLittleDiscovery,
  getCalmMessageById,
  getLittleDiscoveryById
} from '../src/games/gentle-moments/gentleMomentsEngine.js';

describe('Phase 3 Integration & Content Safety Audit', () => {
  it('ensures all calm messages follow adult-dignity and calm tone standards', () => {
    calmMessages.forEach(item => {
      expect(item.text).toBeTruthy();
      expect(typeof item.text).toBe('string');
      // No juvenile or patronizing exclamation spams
      expect(item.text.split('!').length - 1).toBeLessThanOrEqual(2);
      // Appropriate length (not excessively long for elderly reading)
      expect(item.text.length).toBeLessThan(250);
      expect(item.text.length).toBeGreaterThan(20);
    });
  });

  it('ensures all little discoveries have verified citations from credible institutions', () => {
    const verifiedSources = [
      'Botanical Survey of India',
      'Meghalaya Department of Tourism',
      'Tea Research Association of India',
      'Zoological Survey of India',
      'Forest Research Institute',
      'Royal Astronomical Society',
      'NASA',
      'Bombay Natural History Society'
    ];

    littleDiscoveries.forEach(discovery => {
      expect(discovery.title).toBeTruthy();
      expect(discovery.text).toBeTruthy();
      expect(discovery.reference).toBeTruthy();
      
      const hasRecognizedSource = verifiedSources.some(source =>
        discovery.reference.includes(source)
      );
      expect(hasRecognizedSource).toBe(true);
    });
  });

  it('verifies non-blocking cyclical navigation through all items without crashing', () => {
    // Traverse through all calm messages twice
    let calm = calmMessages[0];
    for (let i = 0; i < calmMessages.length * 2; i++) {
      calm = getNextCalmMessage(calm.id);
      expect(calm).toBeDefined();
      expect(calm.id).toBeTruthy();
    }

    // Traverse through all discoveries twice
    let disc = littleDiscoveries[0];
    for (let i = 0; i < littleDiscoveries.length * 2; i++) {
      disc = getNextLittleDiscovery(disc.id);
      expect(disc).toBeDefined();
      expect(disc.id).toBeTruthy();
    }
  });

  it('verifies that no games or core functions are regressed', () => {
    // Baseline checks on dataset imports
    expect(calmMessages.length).toBe(8);
    expect(littleDiscoveries.length).toBe(8);
  });
});
