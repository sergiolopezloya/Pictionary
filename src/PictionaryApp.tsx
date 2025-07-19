/**
 * Main Pictionary App component
 * Orchestrates the entire game experience
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native';

// Import components
import {
  Button,
  Timer,
  PlayerInfo,
  WordDisplay,
  GuessInput,
  DrawingCanvas,
  RiveGameAnimation,
} from './components';
import { Colors } from './components/common/BaseComponent';

// Import hooks
import { useGameState } from './hooks';

// Import types
import { GameState } from './types';

/**
 * Main Pictionary application component
 *
 * @returns JSX element for the complete Pictionary game
 */
export const PictionaryApp: React.FC = () => {
  // Game state management
  const {
    gameSession,
    gameState,
    isLoading,
    error,
    isCurrentDrawer,
    initializeGame,
    startGame,
    submitGuess,
    resetGame,
  } = useGameState({
    currentPlayerId: 'player_1', // For demo purposes, using fixed player ID
  });

  // Animation management (placeholder)
  const animationState = { isReady: true };

  // Local state
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentPlayerId] = useState('player_1');
  const [localTimeRemaining, setLocalTimeRemaining] = useState(60);

  /**
   * Handles starting a new game
   */
  const handleStartNewGame = async (): Promise<void> => {
    try {
      const playerNames = ['Alice', 'Bob', 'Charlie', 'Diana'];
      await initializeGame(playerNames, {
        maxTime: 60,
        maxRounds: 3,
        difficulty: 'medium' as any,
        enableHints: true,
      });

      await startGame();
      setIsGameStarted(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to start game. Please try again.');
      console.error('Failed to start game:', err);
    }
  };

  /**
   * Handles submitting a guess
   * @param guess - The player's guess
   */
  const handleGuessSubmit = async (guess: string): Promise<void> => {
    try {
      const isCorrect = await submitGuess(currentPlayerId, guess);

      if (isCorrect) {
        Alert.alert('Correct!', `Great job! "${guess}" is correct!`);
      } else {
        Alert.alert('Incorrect', `"${guess}" is not the word. Keep trying!`);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to submit guess. Please try again.');
      console.error('Failed to submit guess:', err);
    }
  };

  /**
   * Handles resetting the game
   */
  const handleResetGame = (): void => {
    resetGame();
    setIsGameStarted(false);
  };

  // Timer countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === GameState.DRAWING && localTimeRemaining > 0) {
      timer = setInterval(() => {
        setLocalTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up!
            console.log('Time is up!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState, localTimeRemaining]);

  // Reset timer when game state changes
  useEffect(() => {
    if (gameState === GameState.DRAWING) {
      setLocalTimeRemaining(gameSession?.maxTime || 60);
    }
  }, [gameState, gameSession?.maxTime]);

  // Animation state tracking (placeholder)
  useEffect(() => {
    if (gameState && animationState.isReady) {
      console.log('Game state changed:', gameState);
    }
  }, [gameState, animationState.isReady]);

  // Show error if there's one
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button
            title='Try Again'
            onPress={handleResetGame}
            variant='primary'
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Show welcome screen if game hasn't started
  if (!isGameStarted || !gameSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.title}>🎨 Pictionary Game</Text>
          <Text style={styles.subtitle}>Draw, guess, and have fun with friends!</Text>

          <View style={styles.featuresContainer}>
            <Text style={styles.featureText}>✨ Interactive Rive animations</Text>
            <Text style={styles.featureText}>⏱️ Real-time timer</Text>
            <Text style={styles.featureText}>🏆 Score tracking</Text>
            <Text style={styles.featureText}>💡 Helpful hints</Text>
          </View>

          <Button
            title={isLoading ? 'Starting Game...' : 'Start New Game'}
            onPress={handleStartNewGame}
            variant='primary'
            size='large'
            loading={isLoading}
            disabled={isLoading}
            style={styles.startButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Main game interface
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps='handled'
      >
        {/* Compact Full Screen Layout */}
        <View style={styles.compactGameArea}>
          {/* Left Panel: Game Info + Word + Animation */}
          <View style={styles.compactLeftPanel}>
            {/* Compact Game Info */}
            <View style={styles.compactGameInfo}>
              <Text style={styles.miniTitle}>🎨 Pictionary</Text>
              <Text style={styles.miniRound}>
                R{gameSession.round}/{gameSession.maxRounds}
              </Text>
            </View>

            <WordDisplay
              word={gameSession.currentWord}
              isDrawer={isCurrentDrawer}
              showHints={!isCurrentDrawer}
              hintsEnabled={true}
            />
            <View style={styles.compactAnimationContainer}>
              <RiveGameAnimation gameState={gameState || GameState.WAITING} />
            </View>
          </View>

          {/* Center Panel: Canvas (Moved Up) */}
          <View style={styles.compactCenterPanel}>
            {/* Canvas Title */}
            <Text style={styles.canvasTitle}>🎨 Draw Here!</Text>
            <DrawingCanvas
              enabled={gameState === GameState.DRAWING && isCurrentDrawer}
              onDrawingChange={pathData => {
                console.log('Drawing updated:', pathData);
                // TODO: Send drawing data to other players
              }}
            />
          </View>

          {/* Right Panel: Timer + Players */}
          <View style={styles.compactRightPanel}>
            {/* Compact Timer */}
            {gameState === GameState.DRAWING && (
              <View style={styles.compactTimer}>
                <Timer
                  timeRemaining={localTimeRemaining}
                  maxTime={gameSession.maxTime}
                  isActive={true}
                  showProgressBar={true}
                  animated={true}
                />
              </View>
            )}

            <PlayerInfo
              players={gameSession.players}
              {...(gameSession.currentDrawer?.id && {
                currentDrawerId: gameSession.currentDrawer.id,
              })}
              showScores={true}
              highlightDrawer={true}
            />
          </View>
        </View>

        {/* Bottom: Guess Input */}
        <GuessInput
          enabled={gameState === GameState.DRAWING && !isCurrentDrawer}
          isDrawer={isCurrentDrawer}
          onGuessSubmit={handleGuessSubmit}
          placeholder='Enter your guess...'
        />

        {/* Game Controls */}
        <View style={styles.controlsContainer}>
          {gameState === GameState.GAME_OVER && (
            <Button
              title='Start New Game'
              onPress={handleStartNewGame}
              variant='success'
              size='large'
              style={styles.controlButton}
            />
          )}

          <Button
            title='Reset Game'
            onPress={handleResetGame}
            variant='outline'
            size='medium'
            style={styles.controlButton}
          />
        </View>

        {/* Game State Debug Info (for development) */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>Debug: State = {gameState || 'None'}</Text>
            <Text style={styles.debugText}>
              Animation Ready: {animationState.isReady ? 'Yes' : 'No'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Styles for the PictionaryApp component
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    padding: 4,
    paddingBottom: 8, // Minimal padding for full screen
    ...Platform.select({
      web: {
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },

  // Welcome screen styles
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 18,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },

  featuresContainer: {
    marginBottom: 48,
  },

  featureText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },

  startButton: {
    minWidth: 200,
  },

  // Game interface styles
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },

  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },

  roundInfo: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 4,
  },

  controlsContainer: {
    marginTop: 24,
    gap: 12,
  },

  controlButton: {
    alignSelf: 'center',
    minWidth: 150,
  },

  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },

  errorMessage: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },

  errorButton: {
    minWidth: 150,
  },

  // Compact Layout Styles
  compactGameArea: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },

  compactGameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 2,
  },

  miniTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },

  miniRound: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },

  canvasTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },

  // Compact Panel Layout
  compactLeftPanel: {
    flex: 1,
    gap: 3,
  },

  compactCenterPanel: {
    flex: 2,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  compactRightPanel: {
    flex: 1,
    gap: 3,
  },

  compactAnimationContainer: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    minHeight: 60,
  },

  compactTimer: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 4,
  },

  // Animation styles
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },

  animationText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },

  animationSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  // Debug styles
  debugContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.border.light,
    borderRadius: 8,
  },

  debugText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontFamily: 'monospace',
  },
});
