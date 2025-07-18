/**
 * Timer component for displaying game countdown
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle, TextStyle } from 'react-native';
import { BaseComponentProps, Colors } from '../common/BaseComponent';

/**
 * Props interface for the Timer component
 */
export interface TimerProps extends BaseComponentProps {
  /** Current time remaining in seconds */
  timeRemaining: number;
  /** Maximum time for the round in seconds */
  maxTime: number;
  /** Whether the timer is active */
  isActive?: boolean;
  /** Callback when timer reaches zero */
  onTimeUp?: () => void;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Whether to show progress bar */
  showProgressBar?: boolean;
  /** Whether to animate the timer */
  animated?: boolean;
}

/**
 * Timer component that displays countdown with visual feedback
 *
 * @example
 * ```tsx
 * <Timer
 *   timeRemaining={45}
 *   maxTime={60}
 *   isActive={true}
 *   onTimeUp={handleTimeUp}
 *   showProgressBar={true}
 * />
 * ```
 */
export const Timer: React.FC<TimerProps> = ({
  timeRemaining,
  maxTime,
  isActive = true,
  onTimeUp,
  containerStyle,
  textStyle,
  showProgressBar = true,
  animated = true,
  style,
  testID,
}) => {
  const [animatedValue] = useState(new Animated.Value(1));
  const [pulseAnimation] = useState(new Animated.Value(1));

  /**
   * Formats time in MM:SS format
   * @param seconds - Time in seconds
   * @returns Formatted time string
   */
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * Gets the color based on remaining time
   * @param timeRemaining - Current time remaining
   * @param maxTime - Maximum time
   * @returns Color string
   */
  const getTimerColor = (timeRemaining: number, maxTime: number): string => {
    const ratio = timeRemaining / maxTime;

    if (ratio > 0.5) {
      return Colors.success;
    } else if (ratio > 0.25) {
      return Colors.warning;
    } else {
      return Colors.error;
    }
  };

  /**
   * Gets the progress percentage
   * @param timeRemaining - Current time remaining
   * @param maxTime - Maximum time
   * @returns Progress as percentage (0-100)
   */
  const getProgressPercentage = (timeRemaining: number, maxTime: number): number => {
    return Math.max(0, (timeRemaining / maxTime) * 100);
  };

  // Effect for handling time up
  useEffect(() => {
    if (timeRemaining <= 0 && onTimeUp) {
      onTimeUp();
    }
  }, [timeRemaining, onTimeUp]);

  // Effect for pulse animation when time is low
  useEffect(() => {
    if (animated && timeRemaining <= 10 && timeRemaining > 0) {
      const pulse = Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);

      const loop = Animated.loop(pulse);
      loop.start();

      return () => {
        loop.stop();
        pulseAnimation.setValue(1);
      };
    }

    return () => {};
  }, [timeRemaining, animated, pulseAnimation]);

  // Effect for progress bar animation
  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: getProgressPercentage(timeRemaining, maxTime) / 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [timeRemaining, maxTime, animated, animatedValue]);

  const timerColor = getTimerColor(timeRemaining, maxTime);
  const progressPercentage = getProgressPercentage(timeRemaining, maxTime);

  const containerStyles = StyleSheet.flatten(
    [styles.container, containerStyle, style].filter(Boolean)
  ) as ViewStyle;

  const timeTextStyles = StyleSheet.flatten(
    [styles.timeText, { color: timerColor }, textStyle].filter(Boolean)
  ) as TextStyle;

  return (
    <View style={containerStyles} testID={testID}>
      {/* Timer Display */}
      <Animated.View
        style={[
          styles.timerContainer,
          animated &&
            timeRemaining <= 10 && {
              transform: [{ scale: pulseAnimation }],
            },
        ]}
      >
        <Text style={timeTextStyles}>{formatTime(timeRemaining)}</Text>
        <Text style={styles.labelText}>{isActive ? 'Time Remaining' : 'Time'}</Text>
      </Animated.View>

      {/* Progress Bar */}
      {showProgressBar && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBackground, { borderColor: timerColor }]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: timerColor,
                  width: animated
                    ? animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      })
                    : `${progressPercentage}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progressPercentage)}%</Text>
        </View>
      )}

      {/* Warning Text */}
      {timeRemaining <= 10 && timeRemaining > 0 && (
        <Text style={styles.warningText}>Hurry up!</Text>
      )}

      {/* Time Up Text */}
      {timeRemaining <= 0 && <Text style={styles.timeUpText}>Time's Up!</Text>}
    </View>
  );
};

/**
 * Styles for the Timer component
 */
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  } as ViewStyle,

  timerContainer: {
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  } as TextStyle,

  labelText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  } as TextStyle,

  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  } as ViewStyle,

  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border.light,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
  } as ViewStyle,

  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  } as ViewStyle,

  progressText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 4,
  } as TextStyle,

  warningText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
    marginTop: 8,
    textAlign: 'center',
  } as TextStyle,

  timeUpText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.error,
    marginTop: 8,
    textAlign: 'center',
  } as TextStyle,
});
