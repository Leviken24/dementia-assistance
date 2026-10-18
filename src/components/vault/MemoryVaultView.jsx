import React, { useState, useEffect } from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { vaultApiClient } from '../../services/vaultApiClient.js';

export function MemoryVaultView({ onExit }) {
  const [memories, setMemories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmSetAside, setConfirmSetAside] = useState(false);
  const [setAsideSuccess, setSetAsideSuccess] = useState(false);

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
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ fontSize: 'var(--font-h1)', color: 'var(--text-primary)', marginBottom: '16px' }}>
          Opening Your Memory Album...
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
          maxWidth: '600px',
          margin: '40px auto',
          padding: '32px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '2px solid var(--border-color)',
          textAlign: 'center'
        }}
      >
        <h2 style={{ fontSize: 'var(--font-h2)', color: 'var(--text-primary)', marginBottom: '16px' }}>
          Peaceful Memory Album
        </h2>
        <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)', marginBottom: '24px' }}>
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
          maxWidth: '650px',
          margin: '40px auto',
          padding: '40px 24px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '20px',
          border: '2px solid var(--border-color)',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}
          aria-hidden="true"
        >
          <AccessibleIcon name="heart" size={44} />
        </div>
        <h2 style={{ fontSize: 'var(--font-h1)', color: 'var(--text-primary)', marginBottom: '16px' }}>
          A Blank Album Waiting for Memories
        </h2>
        <p
          style={{
            fontSize: 'var(--font-base)',
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            lineHeight: '1.6'
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
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '16px 0' }}>
      {setAsideSuccess && (
        <div
          role="status"
          style={{
            backgroundColor: '#ECFDF5',
            color: '#065F46',
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: 'var(--font-base)',
            fontWeight: 'bold'
          }}
        >
          This picture has been gently set aside. You will not see it again.
        </div>
      )}

      {/* Main Memory Display Card */}
      <article
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '2px solid var(--border-color)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          marginBottom: '24px'
        }}
      >
        {/* Memory Photograph Container */}
        <div
          style={{
            backgroundColor: '#000',
            textAlign: 'center',
            maxHeight: '480px',
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
              maxHeight: '480px',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto'
            }}
          />
        </div>

        {/* Narrative & Context Details */}
        <div style={{ padding: '32px' }}>
          {current.title && (
            <h2
              style={{
                fontSize: 'var(--font-h1)',
                color: 'var(--text-primary)',
                marginBottom: '12px',
                fontWeight: 'bold'
              }}
            >
              {current.title}
            </h2>
          )}

          {current.story && (
            <p
              style={{
                fontSize: 'calc(var(--font-base) * 1.1)',
                color: 'var(--text-primary)',
                lineHeight: '1.6',
                marginBottom: '20px'
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
                gap: '10px',
                marginBottom: '20px'
              }}
            >
              {current.people.map((person, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent-color)',
                    fontSize: 'var(--font-base)',
                    fontWeight: 'bold'
                  }}
                >
                  <AccessibleIcon name="user" size={20} />
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
                fontSize: 'var(--font-base)',
                color: 'var(--text-secondary)'
              }}
            >
              {current.approximatePeriod && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <AccessibleIcon name="clock" size={20} />
                  {current.approximatePeriod}
                </span>
              )}
              {current.location && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <AccessibleIcon name="mountain" size={20} />
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
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
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
              fontSize: 'var(--font-base)',
              color: 'var(--text-secondary)',
              fontWeight: 'bold',
              marginRight: '8px'
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
              gap: '8px',
              padding: '12px 18px',
              borderRadius: '12px',
              border: '2px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-secondary)',
              fontSize: 'calc(var(--font-base) * 0.95)',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            <AccessibleIcon name="eye-off" size={22} />
            <span>Set Picture Aside</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for "Set Aside" */}
      {confirmSetAside && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="set-aside-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1500
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
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
          >
            <h2
              id="set-aside-title"
              style={{
                fontSize: 'var(--font-h2)',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}
            >
              Set This Picture Aside?
            </h2>
            <p
              style={{
                fontSize: 'var(--font-base)',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                marginBottom: '28px'
              }}
            >
              If this photograph brings uncomfortable thoughts or sadness, we can gently set it aside.
              It will not appear in your album again.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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
