import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, Animated, Easing, Platform } from 'react-native';
import { GameState } from '../types';

// Rive import
let Rive: any = null;
let isRiveAvailable = false;

try {
  // Import Rive
  Rive = require('rive-react-native').default;
  isRiveAvailable = true;
  console.log('✅ Rive module loaded successfully');
} catch (error) {
  console.log('⚠️ Rive not available, using fallback animations:', error);
  isRiveAvailable = false;
}

export interface RiveGameAnimationProps {
  gameState: GameState;
  currentWord?: string | undefined;
}

const { width: screenWidth } = Dimensions.get('window');

export const RiveGameAnimation: React.FC<RiveGameAnimationProps> = ({ gameState }) => {
  // Rive reference
  const riveRef = useRef<any>(null);

  // State for fallback
  const [useRive, setUseRive] = useState(isRiveAvailable);

  // Fallback animation values (only used if Rive fails)
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Animation controller
  const startAnimation = (type: string) => {
    // Stop all current animations
    scaleAnim.stopAnimation();
    rotateAnim.stopAnimation();
    opacityAnim.stopAnimation();

    // Reset animation values
    scaleAnim.setValue(1);
    rotateAnim.setValue(0);
    opacityAnim.setValue(1);

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

  const startDrawingAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const startGuessingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startCelebrationAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startVictoryAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const startIdleAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Start animations when gameState changes
  useEffect(() => {
    switch (gameState) {
      case GameState.WAITING:
        startAnimation('waiting');
        break;
      case GameState.DRAWING:
        startAnimation('drawing');
        break;
      case GameState.GUESSING:
        startAnimation('guessing');
        break;
      case GameState.TIME_UP:
        startAnimation('celebration');
        break;
      case GameState.GAME_OVER:
        startAnimation('victory');
        break;
      default:
        startAnimation('idle');
    }
  }, [gameState]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      scaleAnim.stopAnimation();
      rotateAnim.stopAnimation();
      opacityAnim.stopAnimation();
    };
  }, []);

  // Control Rive animations based on game state
  useEffect(() => {
    if (riveRef.current && isRiveAvailable) {
      try {
        // Play different animations based on game state
        switch (gameState) {
          case GameState.WAITING:
            riveRef.current.play('waiting');
            break;
          case GameState.DRAWING:
            riveRef.current.play('drawing');
            break;
          case GameState.GUESSING:
            riveRef.current.play('guessing');
            break;
          case GameState.TIME_UP:
            riveRef.current.play('timeup');
            break;
          case GameState.GAME_OVER:
            riveRef.current.play('victory');
            break;
          default:
            riveRef.current.play('idle');
        }
      } catch (error) {
        console.log('Error controlling Rive animation:', error);
        setUseRive(false);
      }
    }
  }, [gameState]);

  // Handle Rive errors
  const handleRiveError = (error: any) => {
    console.log('Rive error, falling back to React Native animations:', error);
    setUseRive(false);
  };

  // Render Rive animation
  const renderRiveAnimation = () => {
    if (!isRiveAvailable || !Rive) {
      return renderFallback();
    }

    return (
      <View style={styles.riveContainer}>
        <Rive
          ref={riveRef}
          url='https://cdn.rive.app/animations/vehicles.riv'
          autoplay={true}
          style={styles.riveAnimation}
          onError={handleRiveError}
        />
      </View>
    );
  };

  // Enhanced fallback content with better animations
  const renderFallback = () => {
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const getAnimationContent = () => {
      switch (gameState) {
        case GameState.DRAWING:
          return {
            emoji: '🎨',
            title: 'Drawing Time!',
            subtitle: 'Create your masterpiece',
            color: '#FF6B6B',
            bgColor: '#FFE5E5',
          };
        case GameState.GUESSING:
          return {
            emoji: '🤔',
            title: 'Think Fast!',
            subtitle: 'What could it be?',
            color: '#4ECDC4',
            bgColor: '#E5F9F7',
          };
        case GameState.TIME_UP:
          return {
            emoji: '⏰',
            title: 'Time Up!',
            subtitle: 'Round ended',
            color: '#E67E22',
            bgColor: '#FDF2E9',
          };
        case GameState.GAME_OVER:
          return {
            emoji: '🏆',
            title: 'Game Over!',
            subtitle: 'Thanks for playing!',
            color: '#9B59B6',
            bgColor: '#F3E5F5',
          };
        case GameState.WAITING:
          return {
            emoji: '⏳',
            title: 'Get Ready...',
            subtitle: 'Game starting soon',
            color: '#BB8FCE',
            bgColor: '#F4F1F8',
          };
        default:
          return {
            emoji: '🎮',
            title: 'Pictionary',
            subtitle: 'Let the fun begin!',
            color: '#34495E',
            bgColor: '#ECF0F1',
          };
      }
    };

    const content = getAnimationContent();

    return (
      <View style={[styles.enhancedContainer, { backgroundColor: content.bgColor }]}>
        <Animated.View style={styles.animationWrapper}>
          <Animated.Text
            style={[
              styles.enhancedEmoji,
              {
                transform: [
                  { scale: gameState === GameState.DRAWING ? 1 : scaleAnim },
                  { rotate: gameState === GameState.DRAWING ? spin : '0deg' },
                ],
              },
            ]}
          >
            {content.emoji}
          </Animated.Text>
          <Text style={[styles.enhancedTitle, { color: content.color }]}>{content.title}</Text>
          <Text style={styles.enhancedSubtitle}>{content.subtitle}</Text>
        </Animated.View>
      </View>
    );
  };

  // Use Rive if available, otherwise fallback
  if (useRive && isRiveAvailable) {
    console.log('🎨 Using Rive animations');
    return renderRiveAnimation();
  } else {
    console.log('🎨 Using enhanced fallback animations');
    return renderFallback();
  }
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth * 0.8,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  riveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  riveAnimation: {
    width: '100%',
    height: '100%',
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

  // Enhanced Animation Styles
  enhancedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    minHeight: 150,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  animationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  enhancedEmoji: {
    fontSize: 48,
    marginBottom: 12,
    textAlign: 'center',
  },

  enhancedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },

  enhancedSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default RiveGameAnimation;
