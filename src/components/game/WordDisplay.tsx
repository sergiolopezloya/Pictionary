/**
 * WordDisplay component for showing the current word and hints
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { GameWord } from '../../types';
import { BaseComponentProps, Colors } from '../common/BaseComponent';
import { Button } from '../common/Button';

/**
 * Props interface for the WordDisplay component
 */
export interface WordDisplayProps extends BaseComponentProps {
  /** The current word to display */
  word: GameWord | null;
  /** Whether the current user is the drawer */
  isDrawer: boolean;
  /** Whether to show hints */
  showHints?: boolean;
  /** Whether hints are enabled in game config */
  hintsEnabled?: boolean;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom word style */
  wordStyle?: TextStyle;
  /** Callback when hint is requested */
  onHintRequested?: () => void;
}

/**
 * WordDisplay component that shows the current word to the drawer and hints to others
 *
 * @example
 * ```tsx
 * <WordDisplay
 *   word={currentWord}
 *   isDrawer={currentPlayer.isDrawing}
 *   showHints={true}
 *   hintsEnabled={gameConfig.enableHints}
 *   onHintRequested={handleHintRequest}
 * />
 * ```
 */
export const WordDisplay: React.FC<WordDisplayProps> = ({
  word,
  isDrawer,
  showHints = false,
  hintsEnabled = true,
  containerStyle,
  wordStyle,
  style,
  testID,
  onHintRequested,
}) => {
  const [currentHintIndex, setCurrentHintIndex] = useState<number>(-1);
  const [hintsUsed, setHintsUsed] = useState<number>(0);

  /**
   * Handles showing the next hint
   */
  const handleShowHint = (): void => {
    if (!word || !word.hints || currentHintIndex >= word.hints.length - 1) {
      return;
    }

    const nextIndex = currentHintIndex + 1;
    setCurrentHintIndex(nextIndex);
    setHintsUsed(hintsUsed + 1);

    if (onHintRequested) {
      onHintRequested();
    }
  };

  /**
   * Gets the masked word for guessers (shows blanks)
   * @param word - The word to mask
   * @returns Masked word string
   */
  const getMaskedWord = (word: string): string => {
    return word
      .replace(/[a-zA-Z]/g, '_')
      .split('')
      .join(' ');
  };

  /**
   * Gets the difficulty color
   * @param difficulty - Word difficulty
   * @returns Color string
   */
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return Colors.success;
      case 'medium':
        return Colors.warning;
      case 'hard':
        return Colors.error;
      default:
        return Colors.text.secondary;
    }
  };

  const containerStyles = StyleSheet.flatten(
    [styles.container, containerStyle, style].filter(Boolean)
  ) as ViewStyle;

  if (!word) {
    return (
      <View style={containerStyles} testID={testID}>
        <Text style={styles.noWordText}>Waiting for word...</Text>
      </View>
    );
  }

  return (
    <View style={containerStyles} testID={testID}>
      {/* Word Section */}
      <View style={styles.wordSection}>
        {isDrawer ? (
          // Show actual word to drawer
          <View style={styles.drawerWordContainer}>
            <Text style={styles.drawerLabel}>Your word:</Text>
            <Text style={[styles.wordText, styles.drawerWord, wordStyle]}>
              {word.word.toUpperCase()}
            </Text>
          </View>
        ) : (
          // Show masked word to guessers
          <View style={styles.guesserWordContainer}>
            <Text style={styles.guesserLabel}>Guess the word:</Text>
            <Text style={[styles.wordText, styles.guesserWord, wordStyle]}>
              {getMaskedWord(word.word)}
            </Text>
          </View>
        )}

        {/* Word Info */}
        <View style={styles.wordInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Category:</Text>
            <Text style={styles.infoValue}>{word.category}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Difficulty:</Text>
            <Text style={[styles.infoValue, { color: getDifficultyColor(word.difficulty) }]}>
              {word.difficulty.toUpperCase()}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Length:</Text>
            <Text style={styles.infoValue}>{word.word.length} letters</Text>
          </View>
        </View>
      </View>

      {/* Hints Section */}
      {!isDrawer && showHints && hintsEnabled && word.hints && word.hints.length > 0 && (
        <View style={styles.hintsSection}>
          <Text style={styles.hintsTitle}>Hints</Text>

          {/* Show used hints */}
          {currentHintIndex >= 0 && (
            <View style={styles.hintsContainer}>
              {word.hints.slice(0, currentHintIndex + 1).map((hint, index) => (
                <View key={index} style={styles.hintItem}>
                  <Text style={styles.hintNumber}>#{index + 1}</Text>
                  <Text style={styles.hintText}>{hint}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Hint button */}
          {currentHintIndex < word.hints.length - 1 && (
            <Button
              title={`Get Hint (${hintsUsed}/${word.hints.length} used)`}
              onPress={handleShowHint}
              variant='outline'
              size='small'
              buttonStyle={styles.hintButton}
            />
          )}

          {/* No more hints */}
          {currentHintIndex >= word.hints.length - 1 && word.hints.length > 0 && (
            <Text style={styles.noMoreHintsText}>No more hints available</Text>
          )}
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsSection}>
        {isDrawer ? (
          <Text style={styles.instructionText}>🎨 Draw this word for others to guess!</Text>
        ) : (
          <Text style={styles.instructionText}>
            🤔 Watch the drawing and try to guess the word!
          </Text>
        )}
      </View>
    </View>
  );
};

/**
 * Styles for the WordDisplay component
 */
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  wordSection: {
    marginBottom: 16,
  } as ViewStyle,

  drawerWordContainer: {
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  guesserWordContainer: {
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  drawerLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  } as TextStyle,

  guesserLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  } as TextStyle,

  wordText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  } as TextStyle,

  drawerWord: {
    color: Colors.primary,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  } as TextStyle,

  guesserWord: {
    color: Colors.text.primary,
    fontFamily: 'monospace',
    letterSpacing: 2,
  } as TextStyle,

  wordInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
  } as ViewStyle,

  infoItem: {
    alignItems: 'center',
  } as ViewStyle,

  infoLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: 2,
  } as TextStyle,

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  } as TextStyle,

  hintsSection: {
    marginBottom: 16,
  } as ViewStyle,

  hintsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  } as TextStyle,

  hintsContainer: {
    marginBottom: 12,
  } as ViewStyle,

  hintItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  } as ViewStyle,

  hintNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: 8,
    minWidth: 20,
  } as TextStyle,

  hintText: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  } as TextStyle,

  hintButton: {
    alignSelf: 'center',
  } as ViewStyle,

  noMoreHintsText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  } as TextStyle,

  instructionsSection: {
    alignItems: 'center',
  } as ViewStyle,

  instructionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  } as TextStyle,

  noWordText: {
    fontSize: 16,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  } as TextStyle,
});
