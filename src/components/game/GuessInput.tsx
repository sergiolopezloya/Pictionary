/**
 * GuessInput component for players to submit their guesses
 */

import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle, Alert } from 'react-native';
import { BaseComponentProps, Colors } from '../common/BaseComponent';
import { Button } from '../common/Button';

/**
 * Props interface for the GuessInput component
 */
export interface GuessInputProps extends BaseComponentProps {
  /** Whether the input is enabled */
  enabled?: boolean;
  /** Whether the current user is the drawer */
  isDrawer?: boolean;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Maximum length for guesses */
  maxLength?: number;
  /** Callback when a guess is submitted */
  onGuessSubmit?: (guess: string) => void;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom input style */
  inputStyle?: ViewStyle;
}

/**
 * GuessInput component that allows players to submit their guesses
 *
 * @example
 * ```tsx
 * <GuessInput
 *   enabled={!isDrawer && gameState === 'drawing'}
 *   isDrawer={currentPlayer.isDrawing}
 *   onGuessSubmit={handleGuessSubmit}
 *   placeholder="Enter your guess..."
 * />
 * ```
 */
export const GuessInput: React.FC<GuessInputProps> = ({
  enabled = true,
  isDrawer = false,
  placeholder = 'Enter your guess...',
  maxLength = 50,
  onGuessSubmit,
  containerStyle,
  inputStyle,
  style,
  testID,
}) => {
  const [guess, setGuess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const inputRef = useRef<TextInput>(null);

  /**
   * Handles submitting a guess
   */
  const handleSubmitGuess = async (): Promise<void> => {
    const trimmedGuess = guess.trim();

    if (!trimmedGuess) {
      Alert.alert('Invalid Guess', 'Please enter a guess before submitting.');
      return;
    }

    if (trimmedGuess.length < 2) {
      Alert.alert('Invalid Guess', 'Your guess must be at least 2 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (onGuessSubmit) {
        await onGuessSubmit(trimmedGuess);
      }

      // Clear the input after successful submission
      setGuess('');
      inputRef.current?.blur();
    } catch (error) {
      console.error('Error submitting guess:', error);
      Alert.alert('Error', 'Failed to submit your guess. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles text input changes
   * @param text - New input text
   */
  const handleTextChange = (text: string): void => {
    // Remove extra whitespace and convert to lowercase for consistency
    const cleanedText = text.replace(/\s+/g, ' ');
    setGuess(cleanedText);
  };

  /**
   * Handles when the user presses the return key
   */
  const handleSubmitEditing = (): void => {
    if (enabled && !isSubmitting && guess.trim()) {
      handleSubmitGuess();
    }
  };

  const containerStyles = StyleSheet.flatten(
    [styles.container, containerStyle, style].filter(Boolean)
  ) as ViewStyle;

  const inputStyles = StyleSheet.flatten(
    [styles.input, !enabled ? styles.inputDisabled : undefined, inputStyle].filter(Boolean)
  ) as ViewStyle;

  // Don't show input for drawer
  if (isDrawer) {
    return (
      <View style={containerStyles} testID={testID}>
        <View style={styles.drawerMessage}>
          <Text style={styles.drawerMessageText}>
            🎨 You are drawing! Others will guess your word.
          </Text>
        </View>
      </View>
    );
  }

  // Don't show input if disabled
  if (!enabled) {
    return (
      <View style={containerStyles} testID={testID}>
        <View style={styles.disabledMessage}>
          <Text style={styles.disabledMessageText}>Guessing is currently disabled</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyles} testID={testID}>
      <Text style={styles.label}>Make your guess:</Text>

      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={inputStyles}
          value={guess}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.tertiary}
          maxLength={maxLength}
          autoCapitalize='none'
          autoCorrect={false}
          returnKeyType='send'
          editable={enabled && !isSubmitting}
          testID={`${testID}-input`}
        />

        <Button
          title='Submit'
          onPress={handleSubmitGuess}
          disabled={!guess.trim() || isSubmitting}
          loading={isSubmitting}
          size='medium'
          buttonStyle={styles.submitButton}
          testID={`${testID}-submit`}
        />
      </View>

      <Text style={styles.helperText}>
        {guess.length}/{maxLength} characters
      </Text>
    </View>
  );
};

/**
 * Styles for the GuessInput component
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

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  } as TextStyle,

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  } as ViewStyle,

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: Colors.background,
    color: Colors.text.primary,
  } as ViewStyle,

  inputDisabled: {
    backgroundColor: Colors.border.light,
    color: Colors.text.disabled,
  } as ViewStyle,

  submitButton: {
    minWidth: 80,
  } as ViewStyle,

  helperText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 4,
    textAlign: 'right',
  } as TextStyle,

  drawerMessage: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  } as ViewStyle,

  drawerMessageText: {
    fontSize: 16,
    color: Colors.surface,
    textAlign: 'center',
    fontWeight: '500',
  } as TextStyle,

  disabledMessage: {
    backgroundColor: Colors.border.light,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  } as ViewStyle,

  disabledMessageText: {
    fontSize: 16,
    color: Colors.text.disabled,
    textAlign: 'center',
    fontStyle: 'italic',
  } as TextStyle,
});
