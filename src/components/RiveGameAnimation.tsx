import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, Platform, Animated, Easing } from 'react-native';
import { GameState } from '../types/GameTypes';

// Conditional Rive import with fallback
let Rive: any = null;
let RiveRef: any = null;
let isRiveAvailable = false;

try {
  const RiveModule = require('rive-react-native');
  Rive = RiveModule.default || RiveModule.Rive;
  RiveRef = RiveModule.RiveRef;

  // Always use fallback in Expo Go - native components aren't available
  // We'll detect this at runtime when the component tries to render
  isRiveAvailable = true; // Allow JS module to load
  console.log('✅ Rive JS module loaded - Will test native component availability');
} catch (error) {
  console.log('⚠️ Rive not available, using enhanced fallback animations');
  isRiveAvailable = false;
}

export interface RiveGameAnimationProps {
  gameState: GameState;
  currentWord?: string | undefined;
}

const { width: screenWidth } = Dimensions.get('window');

// Error boundary component for Rive
const RiveErrorBoundary: React.FC<{ children: React.ReactNode; onError: () => void }> = ({
  children,
  onError,
}) => {
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('RiveReactNativeView') || message.includes('View config not found')) {
        onError();
        return;
      }
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, [onError]);

  return <>{children}</>;
};

export const RiveGameAnimation: React.FC<RiveGameAnimationProps> = ({ gameState, currentWord }) => {
  // State for error handling
  const [hasError, setHasError] = useState(false);
  const [useNativeFallback, setUseNativeFallback] = useState(false);

  // Rive reference
  const riveRef = useRef<any>(null);

  // Advanced animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Particle animation values
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;

  // Advanced animation controller
  const startAnimation = (type: string) => {
    // Stop all current animations
    scaleAnim.stopAnimation();
    rotateAnim.stopAnimation();
    bounceAnim.stopAnimation();
    pulseAnim.stopAnimation();
    slideAnim.stopAnimation();
    opacityAnim.stopAnimation();
    particle1.stopAnimation();
    particle2.stopAnimation();
    particle3.stopAnimation();

    switch (type) {
      case 'waiting':
        startWaitingAnimation();
        break;
      case 'drawing':
        startDrawingAnimation();
        break;
      case 'guessing':
        startGuessingAnimation();
        break;
      case 'celebration':
        startCelebrationAnimation();
        break;
      case 'victory':
        startVictoryAnimation();
        break;
      default:
        startIdleAnimation();
    }
  };

  const startWaitingAnimation = () => {
    // Gentle breathing effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Fallback animation effect
  useEffect(() => {
    if (hasError) {
      // Create a simple bounce animation
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      // Create a rotation animation for drawing state
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );

      if (gameState === 'playing') {
        rotateAnimation.start();
      } else {
        bounceAnimation.start();
      }

      return () => {
        bounceAnimation.stop();
        rotateAnimation.stop();
      };
    }
  }, [gameState, hasError, scaleAnim, rotateAnim]);

  // Effect to detect native component availability
  useEffect(() => {
    if (isRiveAvailable && Rive) {
      // Test if native component is actually available
      const timer = setTimeout(() => {
        // If we get here without the component mounting, use fallback
        if (!riveRef.current) {
          console.log('🔄 Native Rive component not available, using fallback');
          setUseNativeFallback(true);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Enhanced fallback content
  const renderFallback = () => {
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.container}>
        <View style={styles.fallbackContainer}>
          <Animated.Text
            style={[
              styles.fallbackEmoji,
              {
                transform: [
                  { scale: gameState === 'playing' ? 1 : scaleAnim },
                  { rotate: gameState === 'playing' ? spin : '0deg' },
                ],
              },
            ]}
          >
            {gameState === 'playing'
              ? '🎨'
              : gameState === 'guessing'
              ? '🤔'
              : gameState === 'roundEnd'
              ? '🎉'
              : gameState === 'gameEnd'
              ? '🏆'
              : '⏳'}
          </Animated.Text>
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
          {hasError && (
            <Text style={styles.fallbackSubtext}>(Animation error - using fallback)</Text>
          )}
        </View>
      </View>
    );
  };

  // Always use fallback for now - Rive native components not available in Expo Go
  console.log('🎨 Using enhanced fallback animations for optimal Expo Go experience');
  return renderFallback();
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
  fallbackSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default RiveGameAnimation;
