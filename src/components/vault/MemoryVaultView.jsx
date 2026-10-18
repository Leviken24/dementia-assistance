import React, { useState, useEffect } from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { useFocusTrap } from '../common/useFocusTrap.js';
import { vaultApiClient } from '../../services/vaultApiClient.js';
import { voiceService } from '../../services/voiceService.js';

export function MemoryVaultView({ onExit }) {
  const [memories, setMemories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmSetAside, setConfirmSetAside] = useState(false);
  const [setAsideSuccess, setSetAsideSuccess] = useState(false);

  const confirmModalRef = useFocusTrap(confirmSetAside, () => setConfirmSetAside(false));

  useEffect(() => {
    let isMounted = true;

    async function loadMemories() {
      setIsLoading(true);
      setError(null);
      try {
        await vaultApiClient.initPatientSession();
        const data = await vaultApiClient.getPatientMemories();
        if (isMounted) {
          setMemories(data.memories || []);
          setCurrentIndex(0);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            'We could not load your memory vault right now. Please ensure the gentle server is connected.'
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMemories();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNext = () => {
    if (currentIndex < memories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back gently
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(memories.length - 1);
    }
  };

  const handleSetAside = async () => {
    const currentMemory = memories[currentIndex];
    if (!currentMemory) return;

    try {
      await vaultApiClient.setMemoryAside(currentMemory.id);
      // Remove from active list
      const updated = memories.filter(m => m.id !== currentMemory.id);
      setMemories(updated);
      setConfirmSetAside(false);
      setSetAsideSuccess(true);
      if (currentIndex >= updated.length) {
        setCurrentIndex(Math.max(0, updated.length - 1));
      }
      setTimeout(() => setSetAsideSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to set memory aside:', err);
      setConfirmSetAside(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = e => {
      if (confirmSetAside) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, memories, confirmSetAside]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '560px', margin: '0 auto' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent-color)',
            margin: '0 auto 20px auto',
            animation: 'spin 1s linear infinite'
          }}
          aria-hidden="true"
        />
        <h2 style={{ fontSize: 'var(--font-h2)', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Opening Your Memory Album
        </h2>
        <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)' }}>
          Bringing your fond family photographs into view.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          maxWidth: '540px',
          margin: '32px auto',
          padding: '28px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          textAlign: 'center'
        }}
      >
        <h2 style={{ fontSize: 'var(--font-h2)', color: 'var(--text-primary)', marginBottom: '12px' }}>
          Peaceful Memory Album
        </h2>
        <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          {error}
        </p>
        <BigButton variant="primary" onClick={onExit}>
          Return to Activity Room
        </BigButton>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div
        style={{
          maxWidth: '540px',
          margin: '32px auto',
          padding: '36px 28px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}
          aria-hidden="true"
        >
          <AccessibleIcon name="heart" size={32} />
        </div>
        <h2 style={{ fontSize: 'var(--font-h2)', color: 'var(--text-primary)', marginBottom: '12px' }}>
          A Blank Album Waiting for Memories
        </h2>
        <p
          style={{
            fontSize: 'var(--font-base)',
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            lineHeight: '1.5'
          }}
        >
          Your family album does not have any pictures added yet. A caregiver can easily add cherished
          family photographs and stories from the Caregiver Dashboard.
        </p>
        <BigButton variant="primary" onClick={onExit}>
          Return to Activity Room
        </BigButton>
      </div>
    );
  }

  const current = memories[currentIndex];
  const imageUrl = vaultApiClient.getPatientMemoryImageUrl(current.id);

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '8px 0 24px 0' }}>
      {/* Top Header & Return Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <div>
          <h1 style={{ fontSize: 'var(--font-h2)', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Personal Memory Album
          </h1>
          <p style={{ margin: 0, fontSize: 'calc(var(--font-base) * 0.9)', color: 'var(--text-secondary)' }}>
            Gentle photographs and cherished family stories
          </p>
        </div>
        <BigButton variant="secondary" size="sm" onClick={onExit}>
          Return to Room
        </BigButton>
      </div>

      {setAsideSuccess && (
        <div
          role="status"
          style={{
            backgroundColor: '#ECFDF5',
            color: '#065F46',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #A7F3D0',
            marginBottom: '16px',
            textAlign: 'center',
            fontSize: 'var(--font-base)',
            fontWeight: '600'
          }}
        >
          This picture has been gently set aside. You will not see it again.
        </div>
      )}

      {/* Main Memory Display Card */}
      <article
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '16px'
        }}
      >
        {/* Memory Photograph Container */}
        <div
          style={{
            backgroundColor: '#0F172A',
            textAlign: 'center',
            maxHeight: '440px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <img
            src={imageUrl}
            alt={current.title ? `Family photograph: ${current.title}` : 'Family photograph'}
            style={{
              maxWidth: '100%',
              maxHeight: '440px',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto'
            }}
          />
        </div>

        {/* Narrative & Context Details */}
        <div style={{ padding: '24px' }}>
          {current.title && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <h2
                style={{
                  fontSize: 'var(--font-h2)',
                  color: 'var(--text-primary)',
                  margin: 0,
                  fontWeight: '700'
                }}
              >
                {current.title}
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (voiceService.isSpeaking) {
                    voiceService.stop();
                  } else {
                    const speechText = `${current.title}. ${current.story || ''}`;
                    voiceService.speak(speechText);
                  }
                }}
                aria-label="Listen to memory caption read aloud"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: 'calc(var(--font-base) * 0.9)',
                  cursor: 'pointer'
                }}
              >
                <AccessibleIcon name="volume" size={18} />
                <span>Read Story</span>
              </button>
            </div>
          )}

          {current.story && (
            <p
              style={{
                fontSize: 'calc(var(--font-base) * 1.05)',
                color: 'var(--text-primary)',
                lineHeight: '1.6',
                marginBottom: '16px'
              }}
            >
              {current.story}
            </p>
          )}

          {/* People & Verified Relationships */}
          {current.people && current.people.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px'
              }}
            >
              {current.people.map((person, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent-color)',
                    fontSize: 'calc(var(--font-base) * 0.9)',
                    fontWeight: '600'
                  }}
                >
                  <AccessibleIcon name="user" size={16} />
                  <span>
                    {person.name}
                    {person.relationship ? ` (${person.relationship})` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Temporal & Spatial Context */}
          {(current.approximatePeriod || current.location) && (
            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                fontSize: 'calc(var(--font-base) * 0.9)',
                color: 'var(--text-secondary)'
              }}
            >
              {current.approximatePeriod && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <AccessibleIcon name="clock" size={18} />
                  {current.approximatePeriod}
                </span>
              )}
              {current.location && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <AccessibleIcon name="mountain" size={18} />
                  {current.location}
                </span>
              )}
            </div>
          )}
        </div>
      </article>

      {/* Navigation & Safety Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <BigButton
            variant="secondary"
            onClick={handlePrevious}
            ariaLabel="Look at previous photograph"
            disabled={memories.length <= 1}
          >
            ← Previous Photo
          </BigButton>
          <BigButton
            variant="primary"
            onClick={handleNext}
            ariaLabel="Look at next photograph"
            disabled={memories.length <= 1}
          >
            Next Photo →
          </BigButton>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span
            style={{
              fontSize: 'calc(var(--font-base) * 0.9)',
              color: 'var(--text-secondary)',
              fontWeight: '600'
            }}
          >
            Photo {currentIndex + 1} of {memories.length}
          </span>

          <button
            onClick={() => setConfirmSetAside(true)}
            aria-label="Set this picture aside so it does not appear again"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-secondary)',
              fontSize: 'calc(var(--font-base) * 0.9)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <AccessibleIcon name="eye-off" size={18} />
            <span>Set Aside</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for "Set Aside" */}
      {confirmSetAside && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="set-aside-title"
          className="modal-overlay"
        >
          <div
            ref={confirmModalRef}
            className="modal-content"
            style={{ maxWidth: '480px' }}
          >
            <h2
              id="set-aside-title"
              style={{
                fontSize: 'var(--font-h2)',
                color: 'var(--text-primary)',
                marginBottom: '12px'
              }}
            >
              Set This Picture Aside?
            </h2>
            <p
              style={{
                fontSize: 'var(--font-base)',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                marginBottom: '24px'
              }}
            >
              If this photograph brings uncomfortable thoughts or sadness, we can gently set it aside.
              It will not appear in your album again.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <BigButton variant="secondary" onClick={() => setConfirmSetAside(false)}>
                Keep in Album
              </BigButton>
              <BigButton variant="primary" onClick={handleSetAside}>
                Yes, Set Aside
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
