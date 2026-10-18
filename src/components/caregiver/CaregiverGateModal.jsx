import React, { useState } from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { vaultApiClient } from '../../services/vaultApiClient.js';

export function CaregiverGateModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState('pin'); // 'pin' | 'password'
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('caregiver@gentlemind.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePinSubmit = async e => {
    e?.preventDefault();
    if (pin.length !== 6) {
      setError('Please enter your 6-digit caregiver PIN.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await vaultApiClient.unlockCaregiverPin(pin);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Incorrect PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async e => {
    e?.preventDefault();
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await vaultApiClient.loginCaregiver(email, password);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="caregiver-gate-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 2000
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '3px solid var(--border-color)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-color)'
            }}
            aria-hidden="true"
          >
            <AccessibleIcon name="lock" size={28} />
          </div>
          <div>
            <h2
              id="caregiver-gate-title"
              style={{
                fontSize: 'var(--font-h2)',
                margin: 0,
                color: 'var(--text-primary)',
                fontWeight: 'bold'
              }}
            >
              Caregiver Verification
            </h2>
            <p style={{ margin: 0, fontSize: 'calc(var(--font-base) * 0.9)', color: 'var(--text-secondary)' }}>
              Protected area for family and caregivers
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: 'calc(var(--font-base) * 0.95)',
              fontWeight: '500'
            }}
          >
            {error}
          </div>
        )}

        {/* Tab switch between 6-digit PIN and Email/Password */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => {
              setMode('pin');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: mode === 'pin' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
              backgroundColor: mode === 'pin' ? 'var(--accent-soft)' : 'var(--bg-surface-elevated)',
              color: mode === 'pin' ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            6-Digit PIN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('password');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: mode === 'password' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
              backgroundColor: mode === 'password' ? 'var(--accent-soft)' : 'var(--bg-surface-elevated)',
              color: mode === 'password' ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Email & Password
          </button>
        </div>

        {mode === 'pin' ? (
          <form onSubmit={handlePinSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label
                htmlFor="caregiver-pin"
                style={{
                  display: 'block',
                  fontSize: 'var(--font-base)',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: 'var(--text-primary)'
                }}
              >
                Enter 6-Digit PIN
              </label>
              <input
                id="caregiver-pin"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: 'calc(var(--font-h2) * 1.2)',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  borderRadius: '12px',
                  border: '2px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)'
                }}
              />
              <p
                style={{
                  marginTop: '8px',
                  fontSize: 'calc(var(--font-base) * 0.85)',
                  color: 'var(--text-secondary)'
                }}
              >
                Default setup PIN is <code>123456</code>.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <BigButton variant="secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </BigButton>
              <BigButton variant="primary" type="submit" disabled={isLoading || pin.length !== 6}>
                {isLoading ? 'Verifying...' : 'Unlock Dashboard'}
              </BigButton>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="caregiver-email"
                style={{
                  display: 'block',
                  fontSize: 'calc(var(--font-base) * 0.95)',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  color: 'var(--text-primary)'
                }}
              >
                Caregiver Email
              </label>
              <input
                id="caregiver-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: 'var(--font-base)',
                  borderRadius: '10px',
                  border: '2px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label
                htmlFor="caregiver-password"
                style={{
                  display: 'block',
                  fontSize: 'calc(var(--font-base) * 0.95)',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  color: 'var(--text-primary)'
                }}
              >
                Password
              </label>
              <input
                id="caregiver-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: 'var(--font-base)',
                  borderRadius: '10px',
                  border: '2px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)'
                }}
              />
              <p
                style={{
                  marginTop: '8px',
                  fontSize: 'calc(var(--font-base) * 0.85)',
                  color: 'var(--text-secondary)'
                }}
              >
                Default credentials: <code>caregiver@gentlemind.local</code> / <code>GentleCare2026!</code>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <BigButton variant="secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </BigButton>
              <BigButton variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </BigButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
