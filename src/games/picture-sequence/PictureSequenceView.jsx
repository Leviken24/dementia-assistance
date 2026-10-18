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
import { GameControlsBar } from '../../components/common/GameControlsBar.jsx';
import { PICTURE_STORIES } from '../../data/pictureSequences.js';

export function PictureSequenceView({ onComplete, onExit }) {
  const [selectedStoryId, setSelectedStoryId] = useState('story_plant_growth');
  const [state, setState] = useState(() => initSequenceGame('story_plant_growth'));

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
      setState(current => placeCardInSlot(current, slotIndex));
    } else if (state.slots[slotIndex]) {
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
  };

  const allSlotsFilled = state.slots.every(s => s !== null);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* 1. Unified Game Controls Bar */}
      <GameControlsBar
        title="Picture Stories"
        status={`Placed: ${state.slots.filter(Boolean).length} / 4`}
        onRestart={() => handleRestart(selectedStoryId)}
        onLeave={onExit}
        isGameActive={!state.isComplete}
        settingsAction={
          <div style={{ display: 'flex', gap: '4px' }}>
            {PICTURE_STORIES.map(story => (
              <button
                key={story.id}
                type="button"
                onClick={() => handleRestart(story.id)}
                style={{
                  padding: '6px 10px',
                  minHeight: '34px',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedStoryId === story.id ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                  backgroundColor: selectedStoryId === story.id ? 'var(--accent-soft)' : 'var(--bg-surface)',
                  color: selectedStoryId === story.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: selectedStoryId === story.id ? '700' : '500'
                }}
              >
                {story.title}
              </button>
            ))}
          </div>
        }
        secondaryAction={
          <BigButton
            variant="gentle"
            size="sm"
            onClick={handleHint}
            disabled={state.isComplete}
            icon={<AccessibleIcon name="lightbulb" size={16} />}
            ariaLabel="Need a hint for picture sequence?"
          >
            Hint
          </BigButton>
        }
      />

      {/* 2. Story Title & Status Guidance */}
      <div
        className="card-base"
        style={{
          padding: '12px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--font-base)', fontWeight: '700', color: 'var(--text-primary)' }}>
            {state.storyTitle}
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
            {state.storyDescription}
          </div>
        </div>

        <div style={{ fontSize: 'var(--font-sm)', fontWeight: '600', color: 'var(--accent-color)' }}>
          {state.feedbackMessage}
        </div>
      </div>

      {/* 3. Story Sequence Timeline Slots (Target) */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px' }}>
          STORY ORDER (Step 1 to 4):
        </div>

        <div className="story-boxes-grid">
          {state.slots.map((placedId, idx) => {
            const placedStep = state.steps.find(s => s.id === placedId);
            const isTargeted = state.targetSlotIndex === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSlotClick(idx)}
                aria-label={
                  placedStep
                    ? `Slot ${idx + 1}: ${placedStep.label}. Click to return to pool.`
                    : `Slot ${idx + 1}: empty. Click to place selected card.`
                }
                style={{
                  minHeight: '120px',
                  borderRadius: 'var(--radius-lg)',
                  border: isTargeted
                    ? '2px solid #F59E0B'
                    : placedStep
                    ? '2px solid var(--accent-border)'
                    : '2px dashed var(--border-color)',
                  backgroundColor: placedStep
                    ? 'var(--bg-surface)'
                    : 'var(--bg-surface-elevated)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 8px',
                  boxShadow: isTargeted ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-speed) ease'
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--text-muted)',
                    marginBottom: '4px'
                  }}
                >
                  Step {idx + 1}
                </div>

                {placedStep ? (
                  <>
                    <div style={{ color: 'var(--accent-color)', marginBottom: '4px' }}>
                      <AccessibleIcon name={placedStep.iconType} size={36} />
                    </div>
                    <span
                      style={{
                        fontSize: 'var(--font-xs)',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        textAlign: 'center',
                        lineHeight: '1.2'
                      }}
                    >
                      {placedStep.label}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Tap to remove
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                    {state.selectedCardId ? 'Tap to place' : 'Empty'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Available Cards Pool */}
      <div
        className="card-base"
        style={{
          padding: '16px',
          marginBottom: '16px'
        }}
      >
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '10px' }}>
          AVAILABLE PICTURES (Tap a card to choose it):
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          {state.pool.map(step => {
            const isSelected = state.selectedCardId === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleCardClick(step.id)}
                aria-label={`Picture card: ${step.label}. ${isSelected ? 'Selected.' : ''}`}
                style={{
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected
                    ? '2px solid var(--accent-color)'
                    : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                }}
              >
                <div style={{ color: 'var(--accent-color)' }}>
                  <AccessibleIcon name={step.iconType} size={32} />
                </div>
                <span
                  style={{
                    fontSize: 'var(--font-xs)',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    textAlign: 'center'
                  }}
                >
                  {step.label}
                </span>
                {isSelected && (
                  <span style={{ fontSize: '10px', color: 'var(--accent-color)', fontWeight: '700' }}>
                    Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Check Sequence Button */}
      {allSlotsFilled && !state.isComplete && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <BigButton
            variant="primary"
            size="md"
            onClick={handleCheck}
            icon={<AccessibleIcon name="check" size={20} />}
          >
            Check Story Order
          </BigButton>
        </div>
      )}
    </div>
  );
}
