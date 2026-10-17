import React, { useState, Component } from 'react';
import { Header } from './components/common/Header.jsx';
import { HomeScreen } from './components/home/HomeScreen.jsx';
import { MemoryMatchView } from './games/memory-match/MemoryMatchView.jsx';
import { PictureSequenceView } from './games/picture-sequence/PictureSequenceView.jsx';
import { NumberPathView } from './games/number-path/NumberPathView.jsx';
import { DiceMatchView } from './games/dice-match/DiceMatchView.jsx';
import { WordMatchView } from './games/word-match/WordMatchView.jsx';
import { GentleMomentsView } from './components/gentle-moments/GentleMomentsView.jsx';
import { CompletionScreen } from './components/common/CompletionScreen.jsx';
import { storageService } from './services/storageService.js';
import { BigButton } from './components/common/BigButton.jsx';

/**
 * Top-level Error Boundary to ensure the UI never crashes to a white screen.
 */
class FriendlyErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FriendlyErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '2px solid var(--border-color)',
            margin: '40px auto',
            maxWidth: '600px'
          }}
        >
          <h2 style={{ fontSize: 'var(--font-h1)', marginBottom: '16px', color: 'var(--text-primary)' }}>
            All is Well
          </h2>
          <p style={{ fontSize: 'var(--font-base)', marginBottom: '28px', color: 'var(--text-secondary)' }}>
            We encountered a little hiccup, but there is nothing to worry about. Let us return to the main room together.
          </p>
          <BigButton variant="primary" onClick={this.handleReset}>
            Return to Home Screen
          </BigButton>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const [currentView, setCurrentView] = useState('home');
  const [lastGameResult, setLastGameResult] = useState(null);

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

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Header
        title={getHeaderTitle()}
        showBack={currentView !== 'home'}
        onBack={handleReturnHome}
        backLabel="Leave Game"
      />

      <main id="main-content" tabIndex="-1" style={{ flex: 1 }}>
        <FriendlyErrorBoundary onReset={handleReturnHome}>
          {currentView === 'home' && (
            <HomeScreen onSelectGame={gameId => setCurrentView(gameId)} />
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
            <GentleMomentsView onExit={handleReturnHome} />
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
            />
          )}
        </FriendlyErrorBoundary>
      </main>
    </div>
  );
}

export default App;
