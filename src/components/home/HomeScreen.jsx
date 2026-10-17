import React from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';

export function HomeScreen({ onSelectGame }) {
  return (
    <div style={{ padding: '20px 0' }}>
      {/* Welcoming Greeting */}
      <section
        style={{
          textAlign: 'center',
          padding: '32px 20px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '20px',
          border: '2px solid var(--border-color)',
          marginBottom: '36px',
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
      </section>

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
          {/* Card 1: Memory Match */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '3px solid var(--border-color)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
          >
            <div>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
                aria-hidden="true"
              >
                <AccessibleIcon name="flower" size={40} />
              </div>
              <h4
                style={{
                  fontSize: 'var(--font-h2)',
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  fontWeight: 'bold'
                }}
              >
                Memory Match
              </h4>
              <p
                style={{
                  fontSize: 'var(--font-base)',
                  color: 'var(--text-secondary)',
                  marginBottom: '24px',
                  lineHeight: '1.5'
                }}
              >
                Turn over cards to find matching pairs of familiar nature pictures, flowers, and everyday teacups.
              </p>
            </div>

            <BigButton
              variant="primary"
              onClick={() => onSelectGame('memory-match')}
              ariaLabel="Start Memory Match game"
              style={{ width: '100%' }}
            >
              Play Memory Match
            </BigButton>
          </div>

          {/* Card 2: Picture Sequencing */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '3px solid var(--border-color)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
          >
            <div>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--success-soft)',
                  color: 'var(--success-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
                aria-hidden="true"
              >
                <AccessibleIcon name="sprout" size={40} />
              </div>
              <h4
                style={{
                  fontSize: 'var(--font-h2)',
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  fontWeight: 'bold'
                }}
              >
                Picture Stories
              </h4>
              <p
                style={{
                  fontSize: 'var(--font-base)',
                  color: 'var(--text-secondary)',
                  marginBottom: '24px',
                  lineHeight: '1.5'
                }}
              >
                Arrange simple story cards in order, such as how a seed grows into a flower or how tea is warmed.
              </p>
            </div>

            <BigButton
              variant="primary"
              onClick={() => onSelectGame('picture-sequence')}
              ariaLabel="Start Picture Stories activity"
              style={{ width: '100%' }}
            >
              Play Picture Stories
            </BigButton>
          </div>

          {/* Card 3: Number Path (Board Game) */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '3px solid var(--border-color)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
          >
            <div>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
                aria-hidden="true"
              >
                <AccessibleIcon name="sun" size={40} />
              </div>
              <h4
                style={{
                  fontSize: 'var(--font-h2)',
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  fontWeight: 'bold'
                }}
              >
                Garden Path
              </h4>
              <p
                style={{
                  fontSize: 'var(--font-base)',
                  color: 'var(--text-secondary)',
                  marginBottom: '24px',
                  lineHeight: '1.5'
                }}
              >
                Roll a gentle die to stroll forward along 20 stepping stones to the rose pavilion. Always forward, with zero traps.
              </p>
            </div>

            <BigButton
              variant="primary"
              onClick={() => onSelectGame('number-path')}
              ariaLabel="Start Garden Path board game"
              style={{ width: '100%' }}
            >
              Walk the Path
            </BigButton>
          </div>

          {/* Card 4: Dice Match Activity */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '3px solid var(--border-color)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
          >
            <div>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--success-soft)',
                  color: 'var(--success-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
                aria-hidden="true"
              >
                <AccessibleIcon name="flower" size={40} />
              </div>
              <h4
                style={{
                  fontSize: 'var(--font-h2)',
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  fontWeight: 'bold'
                }}
              >
                Dice Pattern Match
              </h4>
              <p
                style={{
                  fontSize: 'var(--font-base)',
                  color: 'var(--text-secondary)',
                  marginBottom: '24px',
                  lineHeight: '1.5'
                }}
              >
                Count the dots on a large, friendly die and match them with the correct number. A relaxing counting exercise.
              </p>
            </div>

            <BigButton
              variant="primary"
              onClick={() => onSelectGame('dice-match')}
              ariaLabel="Start Dice Pattern Match activity"
              style={{ width: '100%' }}
            >
              Play Dice Match
            </BigButton>
          </div>

          {/* Card 5: Word & Picture Match */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '3px solid var(--border-color)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
          >
            <div>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
                aria-hidden="true"
              >
                <AccessibleIcon name="cup" size={40} />
              </div>
              <h4
                style={{
                  fontSize: 'var(--font-h2)',
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  fontWeight: 'bold'
                }}
              >
                Word & Picture Match
              </h4>
              <p
                style={{
                  fontSize: 'var(--font-base)',
                  color: 'var(--text-secondary)',
                  marginBottom: '24px',
                  lineHeight: '1.5'
                }}
              >
                Look at peaceful nature pictures and choose the matching word from three simple, clear choices.
              </p>
            </div>

            <BigButton
              variant="primary"
              onClick={() => onSelectGame('word-match')}
              ariaLabel="Start Word and Picture Match puzzle"
              style={{ width: '100%' }}
            >
              Play Word Match
            </BigButton>
          </div>

          {/* Card 6: A Gentle Moment */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '3px solid var(--border-color)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
          >
            <div>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
                aria-hidden="true"
              >
                <AccessibleIcon name="bloom" size={40} />
              </div>
              <h4
                style={{
                  fontSize: 'var(--font-h2)',
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  fontWeight: 'bold'
                }}
              >
                A Gentle Moment
              </h4>
              <p
                style={{
                  fontSize: 'var(--font-base)',
                  color: 'var(--text-secondary)',
                  marginBottom: '24px',
                  lineHeight: '1.5'
                }}
              >
                Take a peaceful pause with a comforting thought or discover a fascinating little fact about nature and the world.
              </p>
            </div>

            <BigButton
              variant="secondary"
              onClick={() => onSelectGame('gentle-moments')}
              ariaLabel="Open A Gentle Moment for calm thoughts and nature discoveries"
              style={{ width: '100%' }}
            >
              Enjoy a Gentle Moment
            </BigButton>
          </div>
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
