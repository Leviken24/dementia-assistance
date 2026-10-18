import React, { useState } from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { GentleOrientationBanner } from '../orientation/GentleOrientationBanner.jsx';
import { storageService } from '../../services/storageService.js';
import {
  sortActivitiesByFavorites,
  getRecentActivityShortcut
} from '../../services/personalizationEngine.js';

const ACTIVITIES = [
  {
    id: 'memory-match',
    title: 'Memory Match',
    category: 'Card Pairs',
    description: 'Turn over cards to find matching pairs of familiar nature pictures, flowers, and everyday teacups.',
    icon: 'flower',
    buttonLabel: 'Play Memory Match'
  },
  {
    id: 'picture-sequence',
    title: 'Picture Stories',
    category: 'Sequence',
    description: 'Arrange lovely pictures in order to tell simple, peaceful stories from daily life.',
    icon: 'leaf',
    buttonLabel: 'Play Picture Stories'
  },
  {
    id: 'number-path',
    title: 'Garden Path',
    category: 'Gentle Walk',
    description: 'Take a gentle, relaxing walk along the garden stepping stones to reach the pavilion.',
    icon: 'mountain',
    buttonLabel: 'Walk the Garden Path'
  },
  {
    id: 'dice-match',
    title: 'Dice Pattern Match',
    category: 'Numbers & Dots',
    description: 'Roll the wooden die and match the dot pattern with friendly, clear choices.',
    icon: 'star',
    buttonLabel: 'Play Dice Match'
  },
  {
    id: 'word-match',
    title: 'Word & Picture Match',
    category: 'Language',
    description: 'Look at peaceful nature pictures and choose the matching word from three simple, clear choices.',
    icon: 'cup',
    buttonLabel: 'Play Word Match'
  },
  {
    id: 'gentle-moments',
    title: 'A Gentle Moment',
    category: 'Calm & Discovery',
    description: 'Take a quiet pause with a comforting thought or discover a fascinating verified fact about nature.',
    icon: 'bloom',
    buttonLabel: 'Enjoy a Gentle Moment'
  },
  {
    id: 'memory-vault',
    title: 'My Memory Album',
    category: 'Family Memories',
    description: 'Enjoy peaceful family photographs and cherished memories together at your own comfortable pace.',
    icon: 'camera',
    buttonLabel: 'Open Memory Album'
  }
];

export function HomeScreen({ onSelectGame }) {
  const [preferences, setPreferences] = useState(() => storageService.getUserPreferences());
  const history = storageService.getGameHistory();
  const recentShortcut = getRecentActivityShortcut(history);

  const handleToggleFavorite = (gameId) => {
    const updated = storageService.toggleFavoriteGame(gameId);
    setPreferences(updated);
  };

  const sortedActivities = sortActivitiesByFavorites(
    ACTIVITIES,
    preferences.favoriteGameIds
  );

  const recentMeta = recentShortcut
    ? ACTIVITIES.find(a => a.id === recentShortcut.gameId) || { title: recentShortcut.gameId }
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Temporal Orientation & Upcoming Reminder */}
      <GentleOrientationBanner onManageReminders={() => onSelectGame('reminders')} />

      {/* 2. Welcome Bar & Quick Navigation Hub */}
      <section
        className="card-base"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 'var(--font-h3)',
              color: 'var(--text-primary)',
              fontWeight: '700',
              margin: '0 0 4px 0'
            }}
          >
            Welcome to Your Gentle Activity Room
          </h2>
          <p
            style={{
              fontSize: 'var(--font-sm)',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.4
            }}
          >
            Enjoy familiar activities at your own comfortable pace. There are no timers and no rush.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <BigButton
            variant="secondary"
            size="sm"
            onClick={() => onSelectGame('reminders')}
            icon={<AccessibleIcon name="bell" size={16} />}
            ariaLabel="Open daily reminders"
          >
            Daily Reminders
          </BigButton>

          <BigButton
            variant="secondary"
            size="sm"
            onClick={() => onSelectGame('history')}
            icon={<AccessibleIcon name="clock" size={16} />}
            ariaLabel="Open activity journal"
          >
            Activity Journal
          </BigButton>
        </div>
      </section>

      {/* 3. Pick Up Where You Left Off Quick Launcher */}
      {recentShortcut && recentMeta && (
        <section
          className="card-base"
          style={{
            padding: '12px 18px',
            backgroundColor: 'var(--accent-soft)',
            borderColor: 'var(--accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
          aria-label="Recently played activity shortcut"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--accent-color)',
                border: '1px solid var(--accent-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-hidden="true"
            >
              <AccessibleIcon name={recentMeta.icon || 'star'} size={20} />
            </div>

            <div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: '600' }}>
                Pick up where you left off
              </div>
              <div style={{ fontSize: 'var(--font-base)', fontWeight: '700', color: 'var(--text-primary)' }}>
                {recentMeta.title}
              </div>
            </div>
          </div>

          <BigButton
            variant="primary"
            size="sm"
            onClick={() => onSelectGame(recentShortcut.gameId)}
            ariaLabel={`Resume ${recentMeta.title}`}
          >
            Resume Activity
          </BigButton>
        </section>
      )}

      {/* 4. Main Activities Grid */}
      <section aria-labelledby="activities-heading">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}
        >
          <h3
            id="activities-heading"
            style={{
              fontSize: 'var(--font-h3)',
              color: 'var(--text-primary)',
              fontWeight: '700',
              margin: 0
            }}
          >
            Choose an Activity
          </h3>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
            {sortedActivities.length} calming activities ready
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '14px'
          }}
        >
          {sortedActivities.map(act => {
            const isFav = act.isFavorite;

            return (
              <div
                key={act.id}
                className="card-base"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  border: isFav ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                  backgroundColor: isFav ? 'var(--accent-soft)' : 'var(--bg-surface)'
                }}
              >
                <div>
                  {/* Card Header: Icon, Category & Favorite Toggle */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isFav ? 'var(--bg-surface)' : 'var(--accent-soft)',
                          color: 'var(--accent-color)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        aria-hidden="true"
                      >
                        <AccessibleIcon name={act.icon} size={22} />
                      </div>

                      <span className="badge badge-neutral">
                        {act.category}
                      </span>
                    </div>

                    {/* Star Favorite Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(act.id)}
                      aria-label={
                        isFav
                          ? `Remove ${act.title} from favorites`
                          : `Mark ${act.title} as favorite`
                      }
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isFav ? '#B45309' : 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: 'var(--font-xs)',
                        fontWeight: '600',
                        minHeight: '32px'
                      }}
                    >
                      <AccessibleIcon name="star" size={16} />
                      <span>{isFav ? 'Favorite' : ''}</span>
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h4
                    style={{
                      fontSize: 'var(--font-h3)',
                      color: 'var(--text-primary)',
                      fontWeight: '700',
                      margin: '0 0 6px 0'
                    }}
                  >
                    {act.title}
                  </h4>
                  <p
                    style={{
                      fontSize: 'var(--font-sm)',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: '1.4'
                    }}
                  >
                    {act.description}
                  </p>
                </div>

                {/* Single Primary Action Button */}
                <BigButton
                  variant="primary"
                  size="md"
                  onClick={() => onSelectGame(act.id)}
                  ariaLabel={`Start ${act.title}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {act.buttonLabel}
                </BigButton>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Dignified Gentle Footer */}
      <footer
        style={{
          marginTop: '16px',
          textAlign: 'center',
          padding: '12px',
          fontSize: 'var(--font-xs)',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        <p style={{ margin: 0 }}>
          Gentle Mind • A supportive, non-clinical space for cognitive stimulation and memory comfort.
        </p>
      </footer>
    </div>
  );
}
