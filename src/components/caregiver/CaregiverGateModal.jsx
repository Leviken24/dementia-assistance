import React, { useState } from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { useFocusTrap } from '../common/useFocusTrap.js';
import { vaultApiClient } from '../../services/vaultApiClient.js';

export function CaregiverGateModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState('pin'); // 'pin' | 'password'
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('caregiver@gentlemind.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const modalRef = useFocusTrap(isOpen, onClose);

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
      className="modal-overlay"
    >
      <div
        ref={modalRef}
        className="modal-content"
        style={{ maxWidth: '460px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-color)'
            }}
            aria-hidden="true"
          >
            <AccessibleIcon name="lock" size={24} />
          </div>
          <div>
            <h2
              id="caregiver-gate-title"
              style={{
                fontSize: 'var(--font-h2)',
                margin: 0,
                color: 'var(--text-primary)',
                fontWeight: '700'
              }}
            >
              Caregiver Verification
            </h2>
            <p style={{ margin: 0, fontSize: 'calc(var(--font-base) * 0.85)', color: 'var(--text-secondary)' }}>
              Protected console for family and care partners
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FCA5A5',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              fontSize: 'calc(var(--font-base) * 0.9)',
              fontWeight: '500'
            }}
          >
            {error}
          </div>
        )}

        {/* Tab switch between 6-digit PIN and Email/Password */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', backgroundColor: 'var(--bg-canvas)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
          <button
            type="button"
            onClick={() => {
              setMode('pin');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: mode === 'pin' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'pin' ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: 'calc(var(--font-base) * 0.9)',
              boxShadow: mode === 'pin' ? 'var(--shadow-sm)' : 'none',
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
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: mode === 'password' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'password' ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: 'calc(var(--font-base) * 0.9)',
              boxShadow: mode === 'password' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer'
            }}
          >
            Email & Password
          </button>
        </div>

        {mode === 'pin' ? (
          <form onSubmit={handlePinSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="caregiver-pin"
                style={{
                  display: 'block',
                  fontSize: 'calc(var(--font-base) * 0.9)',
                  fontWeight: '600',
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
                  padding: '12px',
                  fontSize: 'calc(var(--font-h2) * 1.1)',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)'
                }}
              />
              <p
                style={{
                  marginTop: '6px',
                  fontSize: 'calc(var(--font-base) * 0.8)',
                  color: 'var(--text-secondary)'
                }}
              >
                Default setup PIN: <code>123456</code>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <BigButton variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
                Cancel
              </BigButton>
              <BigButton variant="primary" size="md" type="submit" disabled={isLoading || pin.length !== 6}>
                {isLoading ? 'Verifying...' : 'Unlock Console'}
              </BigButton>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label
                htmlFor="caregiver-email"
                style={{
                  display: 'block',
                  fontSize: 'calc(var(--font-base) * 0.9)',
                  fontWeight: '600',
                  marginBottom: '4px',
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
                  padding: '10px 12px',
                  fontSize: 'var(--font-base)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="caregiver-password"
                style={{
                  display: 'block',
                  fontSize: 'calc(var(--font-base) * 0.9)',
                  fontWeight: '600',
                  marginBottom: '4px',
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
                  padding: '10px 12px',
                  fontSize: 'var(--font-base)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)'
                }}
              />
              <p
                style={{
                  marginTop: '6px',
                  fontSize: 'calc(var(--font-base) * 0.8)',
                  color: 'var(--text-secondary)'
                }}
              >
                Default credentials: <code>caregiver@gentlemind.local</code> / <code>GentleCare2026!</code>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <BigButton variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
                Cancel
              </BigButton>
              <BigButton variant="primary" size="md" type="submit" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </BigButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
