import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Rive, { RiveRef } from 'rive-react-native';
import { GameState } from '../types/GameTypes';

export interface RiveGameAnimationProps {
  gameState: GameState;
  currentWord?: string | undefined;
}

const { width: screenWidth } = Dimensions.get('window');

export const RiveGameAnimation: React.FC<RiveGameAnimationProps> = ({ gameState, currentWord }) => {
  const riveRef = useRef<RiveRef>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!riveRef.current) return;

    try {
      // Cambiar animación basada en el estado del juego
      switch (gameState) {
        case 'waiting':
          riveRef.current.play('idle');
          break;
        case 'playing':
          riveRef.current.play('drawing');
          break;
        case 'guessing':
          riveRef.current.play('thinking');
          break;
        case 'roundEnd':
          riveRef.current.play('celebration');
          break;
        case 'gameEnd':
          riveRef.current.play('victory');
          break;
        default:
          riveRef.current.play('idle');
      }
    } catch (error) {
      console.warn('Error controlling Rive animation:', error);
    }
  }, [gameState]);

  // Efecto para cambios de palabra (opcional)
  useEffect(() => {
    if (currentWord && riveRef.current && gameState === 'playing') {
      try {
        // Trigger una animación especial cuando cambia la palabra
        riveRef.current.play('newWord');
      } catch (error) {
        console.warn('Error triggering word change animation:', error);
      }
    }
  }, [currentWord, gameState]);

  // Fallback content when animation fails to load
  if (hasError) {
    return (
      <View style={styles.container}>
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackEmoji}>
            {gameState === 'playing'
              ? '🎨'
              : gameState === 'guessing'
              ? '🤔'
              : gameState === 'roundEnd'
              ? '🎉'
              : gameState === 'gameEnd'
              ? '🏆'
              : '⏳'}
          </Text>
          <Text style={styles.fallbackText}>
            {gameState === 'playing'
              ? 'Drawing...'
              : gameState === 'guessing'
              ? 'Guessing...'
              : gameState === 'roundEnd'
              ? 'Round Complete!'
              : gameState === 'gameEnd'
              ? 'Game Over!'
              : 'Waiting...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Rive
        ref={riveRef}
        resourceName='game_animation'
        style={styles.animation}
        autoplay={true}
        onPlay={animationName => {
          console.log(`Playing animation: ${animationName}`);
          setHasError(false);
        }}
        onPause={animationName => {
          console.log(`Paused animation: ${animationName}`);
        }}
        onStop={animationName => {
          console.log(`Stopped animation: ${animationName}`);
        }}
        onLoopEnd={animationName => {
          console.log(`Loop ended for animation: ${animationName}`);
        }}
        onStateChanged={stateMachineName => {
          console.log(`State machine changed: ${stateMachineName}`);
        }}
        onError={error => {
          console.warn('Rive animation error:', error);
          setHasError(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth * 0.8,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  fallbackEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
});

export default RiveGameAnimation;
