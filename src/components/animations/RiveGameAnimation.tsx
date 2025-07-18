/**
 * RiveGameAnimation component for displaying interactive Rive animations
 * Integrates Rive animations with game state following clean separation of concerns
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import Rive, { RiveRef } from 'rive-react-native';
import { GameState } from '../../types';
import { BaseComponentProps } from '../common/BaseComponent';
import { IAnimationEventHandler } from '../../interfaces';

/**
 * Props interface for the RiveGameAnimation component
 */
export interface RiveGameAnimationProps extends BaseComponentProps {
  /** Current game state to determine animation */
  gameState: GameState;
  /** URL or path to the Rive animation file */
  riveFileUrl: string;
  /** Whether the animation should auto-play */
  autoPlay?: boolean;
  /** Animation width */
  width?: number;
  /** Animation height */
  height?: number;
  /** Whether to fit the animation to container */
  fit?: 'contain' | 'cover' | 'fill' | 'fitWidth' | 'fitHeight' | 'none';
  /** Animation alignment */
  alignment?:
    | 'center'
    | 'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'centerLeft'
    | 'centerRight'
    | 'bottomLeft'
    | 'bottomCenter'
    | 'bottomRight';
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Event handler for animation events */
  onAnimationEvent?: IAnimationEventHandler;
  /** Callback when animation is ready */
  onAnimationReady?: () => void;
  /** Callback when animation state changes */
  onStateChange?: (stateName: string) => void;
}

/**
 * RiveGameAnimation component that displays Rive animations based on game state
 *
 * @example
 * ```tsx
 * <RiveGameAnimation
 *   gameState={currentGameState}
 *   riveFileUrl="https://example.com/game-animations.riv"
 *   autoPlay={true}
 *   fit="contain"
 *   onAnimationReady={handleAnimationReady}
 * />
 * ```
 */
export const RiveGameAnimation: React.FC<RiveGameAnimationProps> = ({
  gameState,
  riveFileUrl,
  autoPlay = true,
  width,
  height,
  fit = 'contain',
  alignment = 'center',
  containerStyle,
  onAnimationEvent,
  onAnimationReady,
  onStateChange,
  style,
  testID,
}) => {
  const riveRef = useRef<RiveRef>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [currentState, setCurrentState] = useState<GameState | null>(null);

  // Get screen dimensions for responsive sizing
  const screenDimensions = Dimensions.get('window');
  const defaultWidth = width || screenDimensions.width * 0.8;
  const defaultHeight = height || screenDimensions.height * 0.3;

  /**
   * Maps game states to Rive state machine inputs
   * @param gameState - Current game state
   * @returns Object with state machine inputs
   */
  const getStateInputs = (gameState: GameState): Record<string, boolean | number> => {
    const baseInputs = {
      isWaiting: false,
      isDrawing: false,
      isGuessing: false,
      isCorrectGuess: false,
      isTimeUp: false,
      isGameOver: false,
    };

    switch (gameState) {
      case GameState.WAITING:
        return { ...baseInputs, isWaiting: true };
      case GameState.DRAWING:
        return { ...baseInputs, isDrawing: true };
      case GameState.GUESSING:
        return { ...baseInputs, isGuessing: true };
      case GameState.CORRECT_GUESS:
        return { ...baseInputs, isCorrectGuess: true };
      case GameState.TIME_UP:
        return { ...baseInputs, isTimeUp: true };
      case GameState.GAME_OVER:
        return { ...baseInputs, isGameOver: true };
      default:
        return baseInputs;
    }
  };

  /**
   * Updates the Rive animation based on game state
   * @param newGameState - New game state
   */
  const updateAnimationState = async (newGameState: GameState): Promise<void> => {
    if (!isReady || !riveRef.current) {
      return;
    }

    try {
      const stateInputs = getStateInputs(newGameState);

      // Set all state inputs
      for (const [inputName, value] of Object.entries(stateInputs)) {
        // Ensure value is number or boolean (Rive requirement)
        if (typeof value === 'boolean' || typeof value === 'number') {
          riveRef.current.setInputState('GameStateMachine', inputName, value);
        }
      }

      // Fire transition trigger if needed
      if (currentState !== newGameState) {
        riveRef.current.fireState('GameStateMachine', 'stateTransition');
      }

      setCurrentState(newGameState);

      // Notify event handler
      if (onAnimationEvent) {
        onAnimationEvent.onStateChange(newGameState);
      }

      // Notify state change callback
      if (onStateChange) {
        onStateChange(newGameState);
      }

      console.log(`Animation state updated to: ${newGameState}`);
    } catch (error) {
      console.error('Failed to update animation state:', error);
    }
  };

  /**
   * Handles when the Rive animation is loaded and ready
   */
  const handleRiveReady = (): void => {
    setIsReady(true);

    if (onAnimationReady) {
      onAnimationReady();
    }

    // Set initial state
    if (gameState) {
      updateAnimationState(gameState);
    }

    console.log('Rive animation ready');
  };

  /**
   * Handles Rive animation events
   * @param riveEvent - Rive event object
   */
  const handleRiveEvent = (riveEvent: any): void => {
    console.log('Rive event:', riveEvent);

    if (onAnimationEvent) {
      switch (riveEvent.type) {
        case 'start':
          onAnimationEvent.onAnimationStart(riveEvent.name || 'unknown');
          break;
        case 'end':
          onAnimationEvent.onAnimationComplete(riveEvent.name || 'unknown');
          break;
        case 'loop':
          onAnimationEvent.onAnimationLoop(riveEvent.name || 'unknown');
          break;
      }
    }
  };

  /**
   * Handles animation errors
   * @param error - Error object
   */
  const handleRiveError = (error: any): void => {
    console.error('Rive animation error:', error);
  };

  // Effect to update animation when game state changes
  useEffect(() => {
    if (isReady && gameState !== currentState) {
      updateAnimationState(gameState);
    }
  }, [gameState, isReady, currentState]);

  const containerStyles = StyleSheet.flatten(
    [styles.container, containerStyle, style].filter(Boolean)
  ) as ViewStyle;

  return (
    <View style={containerStyles} testID={testID}>
      <Rive
        ref={riveRef}
        url={riveFileUrl}
        autoplay={autoPlay}
        style={StyleSheet.flatten([
          styles.animation,
          {
            width: defaultWidth,
            height: defaultHeight,
          },
        ])}
        fit={fit as any}
        alignment={alignment as any}
        onRiveEventReceived={handleRiveEvent}
        onError={handleRiveError}
        onPlay={handleRiveReady}
        testID={`${testID}-rive`}
      />
    </View>
  );
};

/**
 * Styles for the RiveGameAnimation component
 */
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  } as ViewStyle,

  animation: {
    backgroundColor: 'transparent',
  } as ViewStyle,
});
