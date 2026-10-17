import React, { useState, useEffect } from 'react';
import {
  initSequenceGame,
  selectCard,
  placeCardInSlot,
  removeCardFromSlot,
  evaluateSequence,
  triggerSequenceHint
} from './pictureSequenceEngine.js';
import { AccessibleIcon } from '../../components/common/AccessibleIcons.jsx';
import { BigButton } from '../../components/common/BigButton.jsx';
import { PICTURE_STORIES } from '../../data/pictureSequences.js';

export function PictureSequenceView({ onComplete, onExit }) {
  const [selectedStoryId, setSelectedStoryId] = useState('story_plant_growth');
  const [state, setState] = useState(() => initSequenceGame('story_plant_growth'));
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  // When completed, notify parent after gentle pause
  useEffect(() => {
    if (state.isComplete) {
      const timer = setTimeout(() => {
        onComplete({
          gameId: 'picture-sequence',
          durationSeconds: state.durationSeconds,
          turnsTaken: state.attemptsCount,
          hintsUsed: state.hintsUsed,
          completed: true
        });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [state.isComplete, state.durationSeconds, state.attemptsCount, state.hintsUsed, onComplete]);

  const handleCardClick = stepId => {
    if (state.isComplete) return;
    setState(current => selectCard(current, stepId));
  };

  const handleSlotClick = slotIndex => {
    if (state.isComplete) return;

    if (state.selectedCardId) {
      // Place selected card into this slot
      setState(current => placeCardInSlot(current, slotIndex));
    } else if (state.slots[slotIndex]) {
      // Remove card from this slot back to pool
      setState(current => removeCardFromSlot(current, slotIndex));
    }
  };

  const handleCheck = () => {
    setState(current => evaluateSequence(current));
  };

  const handleHint = () => {
    setState(current => triggerSequenceHint(current));
  };

  const handleRestart = (storyId = selectedStoryId) => {
    setSelectedStoryId(storyId);
    setState(initSequenceGame(storyId));
    setShowRestartConfirm(false);
  };

  const allSlotsFilled = state.slots.every(s => s !== null);

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '10px 0' }}>
      {/* Top Banner: Story Title & Story Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
          padding: '16px 20px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '12px',
          border: '2px solid var(--border-color)'
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--font-h3)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {state.storyTitle}
          </div>
          <div style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)' }}>
            {state.storyDescription}
          </div>
        </div>

        {/* Story Switcher */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {PICTURE_STORIES.map(story => (
            <button
              key={story.id}
              onClick={() => handleRestart(story.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: selectedStoryId === story.id ? '2px solid var(--focus-ring)' : '2px solid var(--border-color)',
                backgroundColor: selectedStoryId === story.id ? 'var(--accent-soft)' : 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                fontWeight: selectedStoryId === story.id ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              {story.title}
            </button>
          ))}
        </div>
      </div>

      {/* Live Feedback / Instruction Message */}
      <div
        role="status"
        aria-live="polite"
        style={{
          textAlign: 'center',
          padding: '12px 16px',
          backgroundColor: state.isComplete ? 'var(--success-soft)' : 'var(--bg-surface-elevated)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          fontSize: 'var(--font-base)',
          color: state.isComplete ? 'var(--success-color)' : 'var(--text-primary)',
          fontWeight: 'bold',
          marginBottom: '24px'
        }}
      >
        {state.feedbackMessage || 'Tap a picture card below, then tap an empty box above to place it in order.'}
      </div>

      {/* Target Destination Boxes (Story Line) */}
      <section aria-label="Story Sequence Boxes" style={{ marginBottom: '32px' }}>
        <h4 style={{ fontSize: 'var(--font-h3)', color: 'var(--text-primary)', marginBottom: '12px' }}>
          Story Order:
        </h4>
        <div
          className="story-boxes-grid"
        >
          {state.slots.map((slotCard, index) => (
            <button
              key={`slot-${index}`}
              onClick={() => handleSlotClick(index)}
              aria-label={`Box ${index + 1}: ${slotCard ? slotCard.title + ', tap to remove' : 'Empty, tap to place selected card'}`}
              style={{
                minHeight: '150px',
                borderRadius: '14px',
                border: state.selectedCardId && !slotCard
                  ? '3px dashed var(--accent-color)'
                  : slotCard
                  ? '3px solid var(--success-color)'
                  : '2px dashed var(--border-color)',
                backgroundColor: slotCard ? 'var(--bg-surface)' : 'var(--bg-surface-elevated)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 8px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: slotCard ? '0 4px 8px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px'
                }}
              >
                Box {index + 1}
              </div>

              {slotCard ? (
                <>
                  <div style={{ color: 'var(--success-color)', marginBottom: '6px' }}>
                    <AccessibleIcon name={slotCard.iconType} size={40} />
                  </div>
                  <span style={{ fontSize: 'var(--font-base)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {slotCard.title}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    (Tap to return)
                  </span>
                </>
              ) : (
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {state.selectedCardId ? 'Tap to place here' : 'Empty'}
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Available Pictures Pool */}
      <section aria-label="Available Story Pictures" style={{ marginBottom: '32px' }}>
        <h4 style={{ fontSize: 'var(--font-h3)', color: 'var(--text-primary)', marginBottom: '12px' }}>
          Available Pictures:
        </h4>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px'
          }}
        >
          {state.availableCards.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '20px',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: '10px'
              }}
            >
              All pictures are placed! Now tap "Check Story" to see your sequence.
            </div>
          ) : (
            state.availableCards.map(card => {
              const isSelected = state.selectedCardId === card.stepId;
              const isHinted = state.hintedCardId === card.stepId;

              return (
                <button
                  key={card.stepId}
                  onClick={() => handleCardClick(card.stepId)}
                  aria-pressed={isSelected}
                  aria-label={`Picture: ${card.title}, ${card.description}`}
                  style={{
                    minHeight: '130px',
                    borderRadius: '14px',
                    border: isHinted
                      ? '4px solid #FFD700'
                      : isSelected
                      ? '4px solid var(--focus-ring)'
                      : '2px solid var(--border-color)',
                    backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '14px 10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: isHinted
                      ? '0 0 16px rgba(255, 215, 0, 0.6)'
                      : '0 4px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  <div style={{ color: 'var(--accent-color)', marginBottom: '6px' }}>
                    <AccessibleIcon name={card.iconType} size={40} />
                  </div>
                  <span style={{ fontSize: 'var(--font-base)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {card.title}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Action Controls: Check Story, Hint, Restart */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}
      >
        <BigButton
          variant="primary"
          onClick={handleCheck}
          disabled={!allSlotsFilled || state.isComplete}
          icon={<AccessibleIcon name="check" size={24} />}
          ariaLabel="Check Story sequence"
        >
          Check Story
        </BigButton>

        <BigButton
          variant="gentle"
          onClick={handleHint}
          disabled={state.isComplete}
          icon={<AccessibleIcon name="lightbulb" size={24} />}
          ariaLabel="Need a hint? Highlight the next picture"
        >
          Need a Hint?
        </BigButton>

        <BigButton
          variant="secondary"
          onClick={() => setShowRestartConfirm(true)}
          icon={<AccessibleIcon name="refresh" size={24} />}
          ariaLabel="Restart story cards"
        >
          Restart
        </BigButton>
      </div>

      {/* Restart Confirmation Dialog */}
      {showRestartConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="restart-seq-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '3px solid var(--border-color)',
              padding: '28px',
              maxWidth: '480px',
              width: '100%'
            }}
          >
            <h3 id="restart-seq-title" style={{ fontSize: 'var(--font-h2)', marginBottom: '12px', color: 'var(--text-primary)' }}>
              Restart this story?
            </h3>
            <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Would you like to clear the story boxes and start over?
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <BigButton variant="secondary" onClick={() => setShowRestartConfirm(false)}>
                Keep Trying
              </BigButton>
              <BigButton variant="primary" onClick={() => handleRestart()}>
                Yes, Start Over
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
