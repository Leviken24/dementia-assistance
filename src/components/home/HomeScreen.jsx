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
    description: 'Turn over cards to find matching pairs of familiar nature pictures, flowers, and everyday teacups.',
    icon: 'flower',
    buttonLabel: 'Play Memory Match'
  },
  {
    id: 'picture-sequence',
    title: 'Picture Stories',
    description: 'Arrange lovely pictures in order to tell simple, peaceful stories from daily life.',
    icon: 'leaf',
    buttonLabel: 'Play Picture Stories'
  },
  {
    id: 'number-path',
    title: 'Garden Path',
    description: 'Take a gentle, relaxing walk along the garden stepping stones to reach the pavilion.',
    icon: 'mountain',
    buttonLabel: 'Walk the Garden Path'
  },
  {
    id: 'dice-match',
    title: 'Dice Pattern Match',
    description: 'Roll the wooden die and match the dot pattern with friendly, clear choices.',
    icon: 'star',
    buttonLabel: 'Play Dice Match'
  },
  {
    id: 'word-match',
    title: 'Word & Picture Match',
    description: 'Look at peaceful nature pictures and choose the matching word from three simple, clear choices.',
    icon: 'cup',
    buttonLabel: 'Play Word Match'
  },
  {
    id: 'gentle-moments',
    title: 'A Gentle Moment',
    description: 'Take a peaceful pause with a comforting thought or discover a fascinating little fact about nature and the world.',
    icon: 'bloom',
    buttonLabel: 'Enjoy a Gentle Moment'
  },
  {
    id: 'memory-vault',
    title: 'My Memory Album',
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
    <div style={{ padding: '20px 0' }}>
      {/* Gentle Temporal Orientation Banner & Upcoming Reminder */}
      <GentleOrientationBanner onManageReminders={() => onSelectGame('reminders')} />

      {/* Welcoming Greeting */}
      <section
        style={{
          textAlign: 'center',
          padding: '32px 20px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '20px',
          border: '2px solid var(--border-color)',
          marginBottom: '28px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}
      >
        <h2
          style={{
            fontSize: 'var(--font-h1)',
            color: 'var(--text-primary)',
            marginBottom: '12px',
            fontWeight: 'bold'
          }}
        >
          Welcome to Your Gentle Activity Room
        </h2>
        <p
          style={{
            fontSize: 'var(--font-h3)',
            color: 'var(--text-secondary)',
            maxWidth: '620px',
            margin: '0 auto',
            lineHeight: '1.5'
          }}
        >
          Take a calm, pleasant moment to play a peaceful game. There are no timers and no rush—simply enjoy at your own pace.
        </p>

        {/* Home Navigation Hub: Reminders & Activity Journal */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <BigButton
            variant="primary"
            onClick={() => onSelectGame('reminders')}
            icon={<AccessibleIcon name="bell" size={22} />}
            ariaLabel="Open your daily reminders"
          >
            My Daily Reminders
          </BigButton>

          <BigButton
            variant="secondary"
            onClick={() => onSelectGame('history')}
            icon={<AccessibleIcon name="star" size={22} />}
            ariaLabel="Open your activity journal"
          >
            My Activity Journal
          </BigButton>
        </div>
      </section>

      {/* Pick Up Where You Left Off Quick Launcher */}
      {recentShortcut && recentMeta && (
        <section
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '2px solid var(--accent-color)',
            padding: '20px 28px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}
          aria-label="Recently played activity shortcut"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-hidden="true"
            >
              <AccessibleIcon name={recentMeta.icon || 'star'} size={28} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 'calc(var(--font-base) * 0.85)',
                  fontWeight: 'bold',
                  color: 'var(--accent-color)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Pick Up Where You Left Off
              </div>
              <div
                style={{
                  fontSize: 'var(--font-h3)',
                  color: 'var(--text-primary)',
                  fontWeight: 'bold'
                }}
              >
                {recentMeta.title}
              </div>
            </div>
          </div>

          <BigButton
            variant="primary"
            onClick={() => onSelectGame(recentShortcut.gameId)}
            ariaLabel={`Resume ${recentMeta.title}`}
          >
            Resume Activity
          </BigButton>
        </section>
      )}

      {/* Main Activities Section */}
      <section aria-labelledby="activities-heading">
        <h3
          id="activities-heading"
          style={{
            fontSize: 'var(--font-h2)',
            color: 'var(--text-primary)',
            marginBottom: '20px',
            textAlign: 'center'
          }}
        >
          Choose an Activity
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            justifyContent: 'center'
          }}
        >
          {sortedActivities.map(act => {
            const isFav = act.isFavorite;

            return (
              <div
                key={act.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '16px',
                  border: isFav ? '3px solid #D97706' : '3px solid var(--border-color)',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  position: 'relative',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '20px'
                    }}
                  >
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--accent-soft)',
                        color: 'var(--accent-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      aria-hidden="true"
                    >
                      <AccessibleIcon name={act.icon} size={40} />
                    </div>

                    {/* Favorite Toggle Button */}
                    <button
                      onClick={() => handleToggleFavorite(act.id)}
                      aria-label={
                        isFav
                          ? `Remove ${act.title} from favorites`
                          : `Mark ${act.title} as favorite`
                      }
                      style={{
                        background: isFav ? '#FEF3C7' : 'var(--bg-surface-elevated)',
                        border: isFav ? '2px solid #D97706' : '2px solid var(--border-color)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: isFav ? '#92400E' : 'var(--text-secondary)',
                        fontSize: 'calc(var(--font-base) * 0.85)',
                        fontWeight: 'bold',
                        transition: 'background-color 0.2s ease, color 0.2s ease'
                      }}
                    >
                      <AccessibleIcon name="star" size={20} />
                      <span>{isFav ? 'Favorited' : 'Add Favorite'}</span>
                    </button>
                  </div>

                  <h4
                    style={{
                      fontSize: 'var(--font-h2)',
                      color: 'var(--text-primary)',
                      marginBottom: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {act.title}
                  </h4>
                  <p
                    style={{
                      fontSize: 'var(--font-base)',
                      color: 'var(--text-secondary)',
                      marginBottom: '24px',
                      lineHeight: '1.5'
                    }}
                  >
                    {act.description}
                  </p>
                </div>

                <BigButton
                  variant={isFav ? 'primary' : 'secondary'}
                  onClick={() => onSelectGame(act.id)}
                  ariaLabel={`Start ${act.title}`}
                  style={{ width: '100%' }}
                >
                  {act.buttonLabel}
                </BigButton>
              </div>
            );
          })}
        </div>
      </section>

      {/* Gentle Footer Note */}
      <footer
        style={{
          marginTop: '48px',
          textAlign: 'center',
          padding: '16px',
          fontSize: 'var(--font-base)',
          color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border-color)'
        }}
      >
        <p>A supportive space designed for peaceful comfort and memory engagement.</p>
      </footer>
    </div>
  );
}
