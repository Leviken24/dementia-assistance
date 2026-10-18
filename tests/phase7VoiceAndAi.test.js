import { describe, it, expect, beforeEach, vi } from 'vitest';
import { voiceService } from '../src/services/voiceService.js';
import { vaultApiClient } from '../src/services/vaultApiClient.js';

describe('Phase 7 Voice and AI Client Integration Tests', () => {
  describe('1. Voice Service (Speech Synthesis)', () => {
    let mockSpeechSynthesis;

    beforeEach(() => {
      mockSpeechSynthesis = {
        speak: vi.fn(),
        cancel: vi.fn(),
        paused: false,
        speaking: false
      };
      globalThis.window = {
        speechSynthesis: mockSpeechSynthesis,
        SpeechSynthesisUtterance: class {
          constructor(text) {
            this.text = text;
            this.rate = 1;
            this.pitch = 1;
            this.volume = 1;
          }
        }
      };
    });

    it('verifies speech synthesis is supported', () => {
      expect(voiceService.isSupported()).toBe(true);
    });

    it('speaks text with gentle, unhurried rate (0.85)', () => {
      const res = voiceService.speak('Take things one step at a time.');
      expect(res).toBe(true);
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });

    it('cancels speech immediately on stop()', () => {
      voiceService.stop();
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      expect(voiceService.isSpeaking).toBe(false);
    });

    it('notifies subscribers on speech start and end', () => {
      const subscriber = vi.fn();
      const unsubscribe = voiceService.subscribe(subscriber);

      voiceService.notifyState(true);
      expect(subscriber).toHaveBeenCalledWith(true);

      voiceService.notifyState(false);
      expect(subscriber).toHaveBeenCalledWith(false);

      unsubscribe();
    });
  });

  describe('2. Client-Side AI Integration & Fallback Handling', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('fetches simplified instructions or returns fallback on network failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Backend offline'));

      const res = await vaultApiClient.simplifyInstructions('memory-match', 'Original rule text');
      expect(res.source).toBe('offline_fallback');
      expect(res.text).toBe('Original rule text');
    });

    it('fetches fact explanation or returns fact fallback on error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Backend offline'));

      const res = await vaultApiClient.explainFact('Orchids bloom across the hills.', 'nature');
      expect(res.source).toBe('offline_fallback');
      expect(res.text).toBe('Orchids bloom across the hills.');
    });

    it('checks AI server status safely without throwing', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ available: true, models: ['llama3.2:latest'] })
      });

      const status = await vaultApiClient.getAiStatus();
      expect(status.available).toBe(true);
      expect(status.models).toContain('llama3.2:latest');
    });
  });
});
