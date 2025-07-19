import React, { useEffect, useRef, useState, ErrorInfo } from 'react';
import { View, StyleSheet, Dimensions, Text, Animated, Easing } from 'react-native';
import { GameState } from '../types';

// Conditional Rive import with fallback
let Rive: any = null;
let isRiveAvailable = false;

try {
  const RiveModule = require('rive-react-native');
  Rive = RiveModule.default || RiveModule.Rive || RiveModule;

  // Check if we're in a development build or Expo Go
  // In development builds, Rive native components should be available
  // In Expo Go, they won't be available and we'll fall back
  isRiveAvailable = true;
  console.log('✅ Rive JS module loaded - Testing native component availability...');
} catch (error) {
  console.log('⚠️ Rive module not found, using enhanced fallback animations');
  isRiveAvailable = false;
}

export interface RiveGameAnimationProps {
  gameState: GameState;
  currentWord?: string | undefined;
}

const { width: screenWidth } = Dimensions.get('window');

// Error Boundary Component for Rive
class RiveErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean } {
    console.log('🚨 RiveErrorBoundary caught error:', error.message);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log('🚨 Rive component error details:', error, errorInfo);
    // Check for specific Rive errors
    if (
      error.message.includes('RiveReactNativeView') ||
      error.message.includes('View config not found') ||
      error.message.includes('Invariant Violation')
    ) {
      console.log('🔄 Detected Rive native component unavailable, switching to fallback');
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return null; // Let parent handle fallback
    }
    return this.props.children;
  }
}

export const RiveGameAnimation: React.FC<RiveGameAnimationProps> = ({ gameState, currentWord }) => {
  // State for error handling
  const [hasError, setHasError] = useState(false);
  const [useNativeFallback, setUseNativeFallback] = useState(false);
  const [riveRenderAttempted, setRiveRenderAttempted] = useState(false);

  // Rive reference
  const riveRef = useRef<any>(null);

  // Animation values
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

  // Control Rive animations based on game state
  const controlRiveAnimation = (state: GameState) => {
    if (riveRef.current && !hasError && !useNativeFallback) {
      try {
        // Control Rive animation states
        switch (state) {
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
            riveRef.current.play('celebration');
            break;
          case GameState.GAME_OVER:
            riveRef.current.play('victory');
            break;
          default:
            riveRef.current.play('idle');
            break;
        }
        console.log(`🎮 Rive animation changed to: ${state}`);
      } catch (error) {
        console.log('❌ Error controlling Rive animation:', error);
        setHasError(true);
        setUseNativeFallback(true);
      }
    }
  };

  // Start animations when gameState changes
  useEffect(() => {
    // Try to control Rive first, fallback to React Native animations
    if (isRiveAvailable && !hasError && !useNativeFallback) {
      controlRiveAnimation(gameState);
    } else {
      // Use React Native animations as fallback
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
          break;
      }
    }
  }, [gameState, hasError, useNativeFallback]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      scaleAnim.stopAnimation();
      rotateAnim.stopAnimation();
      opacityAnim.stopAnimation();
    };
  }, []);

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

      if (gameState === GameState.DRAWING) {
        rotateAnimation.start();
      } else {
        bounceAnimation.start();
      }

      return () => {
        bounceAnimation.stop();
        rotateAnimation.stop();
      };
    }

    return () => {};
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

    return () => {};
  }, []);

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

  // Handle Rive errors and switch to fallback
  const handleRiveError = () => {
    console.log('🔄 Switching to fallback due to Rive error');
    setHasError(true);
    setUseNativeFallback(true);
    setRiveRenderAttempted(true);
  };

  // Render Rive component if available and no errors, otherwise use fallback
  if (isRiveAvailable && Rive && !hasError && !useNativeFallback && !riveRenderAttempted) {
    console.log('🎨 Attempting to render Rive native component');

    return (
      <RiveErrorBoundary onError={handleRiveError}>
        <View style={styles.container}>
          <Rive
            ref={riveRef}
            resourceName='game_animation'
            style={styles.animation}
            autoplay={true}
            onError={(error: any) => {
              console.log('❌ Rive component onError:', error);
              handleRiveError();
            }}
            onLoad={() => {
              console.log('✅ Rive component loaded successfully');
            }}
          />
        </View>
      </RiveErrorBoundary>
    );
  }

  // Use fallback for Expo Go or when Rive is not available
  console.log('🎨 Using enhanced fallback animations for optimal compatibility');
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
