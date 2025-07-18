/**
 * Main Pictionary App component
 * Orchestrates the entire game experience
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native';

// Import components
import { Button, Timer, PlayerInfo, WordDisplay, GuessInput } from './components';
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.gameTitle}>Pictionary Game</Text>
          <Text style={styles.roundInfo}>
            Round {gameSession.round} of {gameSession.maxRounds}
          </Text>
        </View>

        {/* Timer */}
        {gameState === GameState.DRAWING && (
          <Timer
            timeRemaining={gameSession.timeRemaining}
            maxTime={gameSession.maxTime}
            isActive={true}
            showProgressBar={true}
            animated={true}
          />
        )}

        {/* Word Display */}
        <WordDisplay
          word={gameSession.currentWord}
          isDrawer={isCurrentDrawer}
          showHints={!isCurrentDrawer}
          hintsEnabled={true}
        />

        {/* Player Info */}
        <PlayerInfo
          players={gameSession.players}
          {...(gameSession.currentDrawer?.id && {
            currentDrawerId: gameSession.currentDrawer.id,
          })}
          showScores={true}
          highlightDrawer={true}
        />

        {/* Game Animation Placeholder */}
        {gameState && (
          <View style={styles.animationContainer}>
            <Text style={styles.animationText}>🎮 Game Animation</Text>
            <Text style={styles.animationSubtext}>
              {gameState === GameState.DRAWING
                ? '🎨 Drawing...'
                : gameState === GameState.GUESSING
                ? '🤔 Guessing...'
                : gameState === GameState.GAME_OVER
                ? '🏆 Game Over!'
                : '⏳ Waiting...'}
            </Text>
          </View>
        )}

        {/* Guess Input */}
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
    padding: 16,
    paddingBottom: 32, // Extra padding at bottom for better scroll experience
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
