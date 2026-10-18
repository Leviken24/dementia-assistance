import React, { useState, useEffect, Component } from 'react';
import { Header } from './components/common/Header.jsx';
import { HomeScreen } from './components/home/HomeScreen.jsx';
import { MemoryMatchView } from './games/memory-match/MemoryMatchView.jsx';
import { PictureSequenceView } from './games/picture-sequence/PictureSequenceView.jsx';
import { NumberPathView } from './games/number-path/NumberPathView.jsx';
import { DiceMatchView } from './games/dice-match/DiceMatchView.jsx';
import { WordMatchView } from './games/word-match/WordMatchView.jsx';
import { GentleMomentsView } from './components/gentle-moments/GentleMomentsView.jsx';
import { ActivityHistoryView } from './components/history/ActivityHistoryView.jsx';
import { RemindersView } from './components/reminders/RemindersView.jsx';
import { ReminderNotificationModal } from './components/reminders/ReminderNotificationModal.jsx';
import { MemoryVaultView } from './components/vault/MemoryVaultView.jsx';
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard.jsx';
import { CaregiverGateModal } from './components/caregiver/CaregiverGateModal.jsx';
import { CompletionScreen } from './components/common/CompletionScreen.jsx';
import { storageService } from './services/storageService.js';
import { evaluatePacingRecommendation } from './services/personalizationEngine.js';
import { checkDueReminders, sendBrowserNotification } from './services/reminderService.js';
import { BigButton } from './components/common/BigButton.jsx';

/**
 * Top-level Error Boundary to ensure the UI never crashes to a white screen.
 */
class FriendlyErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FriendlyErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      return (
        <div
          role="alert"
          style={{
            padding: '36px 24px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            margin: '32px auto',
            maxWidth: '600px'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px auto'
            }}
          >
            <span style={{ fontSize: '28px' }}>🌱</span>
          </div>
          <h2 style={{ fontSize: 'var(--font-h1)', marginBottom: '12px', color: 'var(--text-primary)', fontWeight: '700' }}>
            All is Well
          </h2>
          <p style={{ fontSize: 'var(--font-base)', marginBottom: '24px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            We encountered a little hiccup, but there is nothing to worry about. Let us return to the main room together.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <BigButton variant="primary" onClick={this.handleReset}>
              Return to Home Screen
            </BigButton>
            <BigButton variant="secondary" onClick={() => window.location.reload()}>
              Reload Page
            </BigButton>
          </div>

          {isDev && this.state.error && (
            <div style={{ marginTop: '24px', textAlign: 'left' }}>
              <button
                type="button"
                onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-color)',
                  fontSize: '12px',
                  fontWeight: '600',
                  textDecoration: 'underline',
                  padding: '4px 0',
                  cursor: 'pointer'
                }}
              >
                {this.state.showDetails ? 'Hide technical error' : 'Show technical error (development only)'}
              </button>
              {this.state.showDetails && (
                <pre
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#1E293B',
                    color: '#F87171',
                    fontSize: '12px',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}
                >
                  {this.state.error?.toString()}
                  {'\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              )}
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const [currentView, setCurrentView] = useState('home');
  const [lastGameResult, setLastGameResult] = useState(null);
  const [activeDueReminder, setActiveDueReminder] = useState(null);
  const [showCaregiverGate, setShowCaregiverGate] = useState(false);

  // Poll for due reminders every 5 seconds without disturbing current activity
  useEffect(() => {
    const checkReminders = () => {
      const allReminders = storageService.getReminders();
      const dueList = checkDueReminders(allReminders, new Date());
      if (dueList.length > 0) {
        setActiveDueReminder(current => {
          if (!current) {
            // Send optional browser notification if user enabled it
            sendBrowserNotification(dueList[0].title, {
              body: 'A gentle daily reminder from Gentle Mind.'
            });
            return dueList[0];
          }
          return current;
        });
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledgeDueReminder = id => {
    storageService.acknowledgeReminder(id);
    setActiveDueReminder(null);
  };

  const handleSnoozeDueReminder = (id, minutes = 10) => {
    storageService.snoozeReminder(id, minutes);
    setActiveDueReminder(null);
  };

  const handleDismissDueReminder = id => {
    if (id) {
      storageService.dismissReminder(id);
    }
    setActiveDueReminder(null);
  };

  const handleGameComplete = result => {
    // Record non-diagnostic activity result
    storageService.saveGameResult(result);
    setLastGameResult(result);
    setCurrentView('completed');
  };

  const handlePlayAgain = () => {
    if (lastGameResult && lastGameResult.gameId) {
      setCurrentView(lastGameResult.gameId);
    } else {
      setCurrentView('memory-match');
    }
  };

  const handleReturnHome = () => {
    setCurrentView('home');
  };

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'memory-match':
        return 'Memory Match';
      case 'picture-sequence':
        return 'Picture Stories';
      case 'number-path':
        return 'Garden Path';
      case 'dice-match':
        return 'Dice Pattern Match';
      case 'word-match':
        return 'Word & Picture Match';
      case 'gentle-moments':
        return 'A Gentle Moment';
      case 'history':
        return 'Activity Journal';
      case 'reminders':
        return 'My Daily Reminders';
      case 'memory-vault':
        return 'My Memory Album';
      case 'caregiver':
        return 'Caregiver Portal';
      case 'completed':
        return 'Activity Complete';
      case 'home':
      default:
        return 'Gentle Mind';
    }
  };

  const getCompletionDetails = () => {
    if (!lastGameResult) {
      return { title: 'Well Done!', message: 'You completed this relaxing activity.' };
    }

    switch (lastGameResult.gameId) {
      case 'memory-match':
        return {
          title: 'Pairs Found!',
          message: 'Wonderful job! You found all the matching cards at your own comfortable pace.'
        };
      case 'picture-sequence':
        return {
          title: 'Story Completed!',
          message: 'Lovely work! You arranged all the story pictures into a wonderful sequence.'
        };
      case 'number-path':
        return {
          title: 'Walk Completed!',
          message: 'Wonderful! You took a peaceful walk along the stepping stones to the Rose Garden Pavilion.'
        };
      case 'dice-match':
        return {
          title: 'Dice Matched!',
          message: 'Lovely job! You recognized and matched all the dice patterns.'
        };
      case 'word-match':
        return {
          title: 'Words Matched!',
          message: 'Wonderful work! You matched all the lovely pictures with their correct words.'
        };
      default:
        return {
          title: 'Well Done!',
          message: 'You completed this peaceful activity.'
        };
    }
  };

  const completionDetails = getCompletionDetails();

  const pacingRec = evaluatePacingRecommendation(storageService.getGameHistory());

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Only show header back button on non-game views; active games provide their own GameControlsBar */}
      <Header
        title={getHeaderTitle()}
        showBack={
          currentView !== 'home' &&
          !['memory-match', 'picture-sequence', 'number-path', 'dice-match', 'word-match'].includes(currentView)
        }
        onBack={handleReturnHome}
        onOpenCaregiver={() => setShowCaregiverGate(true)}
        backLabel={
          currentView === 'gentle-moments'
            ? 'Leave Gentle Moment'
            : currentView === 'history'
            ? 'Leave Journal'
            : currentView === 'reminders'
            ? 'Leave Reminders'
            : currentView === 'memory-vault'
            ? 'Leave Album'
            : currentView === 'caregiver'
            ? 'Exit Caregiver'
            : 'Back to Home'
        }
      />

      <main id="main-content" tabIndex="-1" style={{ flex: 1 }}>
        <FriendlyErrorBoundary onReset={handleReturnHome}>
          {currentView === 'home' && (
            <HomeScreen onSelectGame={gameId => setCurrentView(gameId)} />
          )}

          {currentView === 'reminders' && (
            <RemindersView onExit={handleReturnHome} />
          )}

          {currentView === 'history' && (
            <ActivityHistoryView
              onExit={handleReturnHome}
              onSelectGame={gameId => setCurrentView(gameId)}
            />
          )}

          {currentView === 'memory-match' && (
            <MemoryMatchView
              onComplete={handleGameComplete}
              onExit={handleReturnHome}
            />
          )}

          {currentView === 'picture-sequence' && (
            <PictureSequenceView
              onComplete={handleGameComplete}
              onExit={handleReturnHome}
            />
          )}

          {currentView === 'number-path' && (
            <NumberPathView
              onComplete={handleGameComplete}
              onExit={handleReturnHome}
            />
          )}

          {currentView === 'dice-match' && (
            <DiceMatchView
              onComplete={handleGameComplete}
              onExit={handleReturnHome}
            />
          )}

          {currentView === 'word-match' && (
            <WordMatchView
              onComplete={handleGameComplete}
              onExit={handleReturnHome}
            />
          )}

          {currentView === 'gentle-moments' && (
            <GentleMomentsView
              onExit={handleReturnHome}
              onReturnToGame={lastGameResult ? () => setCurrentView('completed') : null}
            />
          )}

          {currentView === 'memory-vault' && (
            <MemoryVaultView onExit={handleReturnHome} />
          )}

          {currentView === 'caregiver' && (
            <CaregiverDashboard
              onExit={handleReturnHome}
              onManageReminders={() => setCurrentView('reminders')}
              onViewHistory={() => setCurrentView('history')}
            />
          )}

          {currentView === 'completed' && lastGameResult && (
            <CompletionScreen
              title={completionDetails.title}
              message={completionDetails.message}
              durationSeconds={lastGameResult.durationSeconds}
              turnsTaken={lastGameResult.turnsTaken}
              pairsMatched={lastGameResult.pairsMatched}
              onPlayAgain={handlePlayAgain}
              onReturnHome={handleReturnHome}
              onGentleMoment={() => setCurrentView('gentle-moments')}
              pacingMessage={pacingRec.recommendRest ? pacingRec.message : null}
            />
          )}
        </FriendlyErrorBoundary>
      </main>

      {/* Caregiver PIN / Password Gate Modal */}
      <CaregiverGateModal
        isOpen={showCaregiverGate}
        onClose={() => setShowCaregiverGate(false)}
        onSuccess={() => {
          setShowCaregiverGate(false);
          setCurrentView('caregiver');
        }}
      />

      {/* Gentle Due Reminder In-App Alert Modal */}
      {activeDueReminder && (
        <ReminderNotificationModal
          reminder={activeDueReminder}
          onAcknowledge={handleAcknowledgeDueReminder}
          onSnooze={handleSnoozeDueReminder}
          onDismiss={handleDismissDueReminder}
        />
      )}
    </div>
  );
}

export default App;
