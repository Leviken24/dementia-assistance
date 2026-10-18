/**
 * API client service for communicating with the Phase 6 backend.
 * Provides authenticated session management, memory retrieval,
 * emotional safety ("Set Aside"), and caregiver management calls.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

const safeGetToken = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('cog_auth_token') || null;
    }
  } catch (e) {
    // ignore
  }
  return null;
};

// In-memory token storage for bearer fallback if cookies are restricted
let activeToken = safeGetToken();

export const authState = {
  getToken: () => activeToken,
  setToken: token => {
    activeToken = token;
    try {
      if (typeof localStorage !== 'undefined') {
        if (token) {
          localStorage.setItem('cog_auth_token', token);
        } else {
          localStorage.removeItem('cog_auth_token');
        }
      }
    } catch (e) {
      // In-memory fallback
    }
  },
  clearToken: () => {
    activeToken = null;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('cog_auth_token');
      }
    } catch (e) {
      // In-memory fallback
    }
  }
};

async function apiRequest(endpoint, options = {}) {
  const headers = { ...options.headers };
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }

  // Set default JSON Content-Type if body is not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const vaultApiClient = {
  // Session & Auth
  async initPatientSession() {
    try {
      const data = await apiRequest('/auth/patient/session', { method: 'POST' });
      if (data?.token) authState.setToken(data.token);
      return data;
    } catch (err) {
      console.warn('Backend unavailable, patient session running in offline mode:', err.message);
      return { offline: true };
    }
  },

  async loginCaregiver(email, password) {
    const data = await apiRequest('/auth/caregiver/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data?.token) authState.setToken(data.token);
    return data;
  },

  async unlockCaregiverPin(caregiverPin) {
    const data = await apiRequest('/auth/patient/unlock', {
      method: 'POST',
      body: JSON.stringify({ caregiverPin })
    });
    if (data?.token) authState.setToken(data.token);
    return data;
  },

  async checkAuthStatus() {
    try {
      return await apiRequest('/auth/status');
    } catch (err) {
      return { authenticated: false, offline: true };
    }
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      authState.clearToken();
    }
  },

  // Patient Memory Vault
  async getPatientMemories() {
    return await apiRequest('/patient/memories');
  },

  getPatientMemoryImageUrl(memoryId) {
    const tokenParam = activeToken ? `?token=${encodeURIComponent(activeToken)}` : '';
    return `${BASE_URL}/patient/memories/${memoryId}/image${tokenParam}`;
  },

  async setMemoryAside(memoryId) {
    return await apiRequest(`/patient/memories/${memoryId}/set-aside`, {
      method: 'POST'
    });
  },

  // Caregiver Dashboard
  async getCaregiverMemories() {
    return await apiRequest('/caregiver/memories');
  },

  async uploadMemory(formData) {
    return await apiRequest('/caregiver/memories', {
      method: 'POST',
      body: formData
    });
  },

  async updateMemory(memoryId, updates) {
    return await apiRequest(`/caregiver/memories/${memoryId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteMemory(memoryId) {
    return await apiRequest(`/caregiver/memories/${memoryId}`, {
      method: 'DELETE'
    });
  }
};
