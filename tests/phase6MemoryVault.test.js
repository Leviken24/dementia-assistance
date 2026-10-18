import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vaultApiClient, authState } from '../src/services/vaultApiClient.js';

describe('Phase 6 Client-Side Integration & Memory Vault Tests', () => {
  const store = {};

  beforeEach(() => {
    globalThis.localStorage = {
      getItem: key => store[key] || null,
      setItem: (key, val) => {
        store[key] = String(val);
      },
      removeItem: key => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach(k => delete store[k]);
      }
    };
    globalThis.localStorage.clear();
    authState.clearToken();
    vi.restoreAllMocks();
  });

  describe('1. Auth State & Session Client', () => {
    it('sets, stores, and clears auth token', () => {
      expect(authState.getToken()).toBeNull();
      authState.setToken('test_token_abc');
      expect(authState.getToken()).toBe('test_token_abc');
      expect(localStorage.getItem('cog_auth_token')).toBe('test_token_abc');

      authState.clearToken();
      expect(authState.getToken()).toBeNull();
      expect(localStorage.getItem('cog_auth_token')).toBeNull();
    });

    it('generates correct authenticated image streaming URL', () => {
      authState.setToken('session_sample_123');
      const url = vaultApiClient.getPatientMemoryImageUrl('mem_456');
      expect(url).toContain('/patient/memories/mem_456/image');
      expect(url).toContain('token=session_sample_123');
    });
  });

  describe('2. Patient Memory Retrieval & Emotional Safety Mock API Flow', () => {
    it('initializes patient session and retrieves approved memories', async () => {
      // Mock fetch
      const mockMemories = [
        {
          id: 'mem_1',
          title: 'Morning Walk',
          story: 'Walking peacefully in the garden.',
          people: [{ name: 'Ajoy', relationship: 'Brother' }],
          approximatePeriod: 'Spring 1990',
          location: 'Tezpur',
          approvalStatus: 'approved'
        }
      ];

      global.fetch = vi.fn().mockImplementation((url, options) => {
        if (url.includes('/auth/patient/session')) {
          return Promise.resolve({
            ok: true,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: () => Promise.resolve({ success: true, token: 'pat_tok_mock' })
          });
        }
        if (url.includes('/patient/memories')) {
          return Promise.resolve({
            ok: true,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: () => Promise.resolve({ memories: mockMemories })
          });
        }
        return Promise.reject(new Error('Unknown url'));
      });

      const session = await vaultApiClient.initPatientSession();
      expect(session.token).toBe('pat_tok_mock');

      const data = await vaultApiClient.getPatientMemories();
      expect(data.memories).toHaveLength(1);
      expect(data.memories[0].title).toBe('Morning Walk');
    });

    it('invokes set-aside endpoint for emotional safety', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () =>
          Promise.resolve({
            success: true,
            message: 'Memory has been gently set aside.'
          })
      });

      const res = await vaultApiClient.setMemoryAside('mem_1');
      expect(res.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/patient/memories/mem_1/set-aside'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('3. Caregiver Dashboard Operations', () => {
    it('submits valid memory upload with multipart/form-data', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () =>
          Promise.resolve({
            success: true,
            memory: { id: 'mem_new_1', title: 'Lake View' }
          })
      });

      const fd = new FormData();
      fd.append('title', 'Lake View');
      const res = await vaultApiClient.uploadMemory(fd);

      expect(res.success).toBe(true);
      expect(res.memory.id).toBe('mem_new_1');
    });

    it('updates memory approval status and deletes memory', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ success: true, memory: { approvalStatus: 'approved' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ success: true })
        });

      const updateRes = await vaultApiClient.updateMemory('mem_1', { approvalStatus: 'approved' });
      expect(updateRes.memory.approvalStatus).toBe('approved');

      const delRes = await vaultApiClient.deleteMemory('mem_1');
      expect(delRes.success).toBe(true);
    });
  });
});
