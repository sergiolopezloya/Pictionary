/**
 * Reusable Button component
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { BaseComponentProps, Colors, CommonStyles } from './BaseComponent';

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';

/**
 * Button size types
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Props interface for the Button component
 */
export interface ButtonProps extends BaseComponentProps {
  /** Button text content */
  title: string;
  /** Function called when button is pressed */
  onPress: () => void;
  /** Button variant for different styles */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show loading indicator */
  loading?: boolean;
  /** Custom button style */
  buttonStyle?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
}

/**
 * Reusable Button component with multiple variants and states
 *
 * @example
 * ```tsx
 * <Button
 *   title="Start Game"
 *   onPress={handleStartGame}
 *   variant="primary"
 *   size="large"
 * />
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  buttonStyle,
  textStyle,
  style,
  testID,
  accessibilityLabel,
}) => {
  /**
   * Gets the button style based on variant
   * @param variant - Button variant
   * @returns Style object for the button
   */
  const getButtonStyle = (variant: ButtonVariant): ViewStyle => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'success':
        return styles.successButton;
      case 'warning':
        return styles.warningButton;
      case 'error':
        return styles.errorButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  /**
   * Gets the text style based on variant
   * @param variant - Button variant
   * @returns Style object for the text
   */
  const getTextStyle = (variant: ButtonVariant): TextStyle => {
    switch (variant) {
      case 'outline':
        return styles.outlineButtonText;
      default:
        return styles.buttonText;
    }
  };

  /**
   * Gets the size style based on size prop
   * @param size - Button size
   * @returns Style object for the size
   */
  const getSizeStyle = (size: ButtonSize): ViewStyle => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const isDisabled = disabled || loading;

  const buttonStyles = StyleSheet.flatten(
    [
      CommonStyles.button,
      getButtonStyle(variant),
      getSizeStyle(size),
      isDisabled ? styles.disabledButton : undefined,
      buttonStyle,
      style,
    ].filter(Boolean)
  ) as ViewStyle;

  const textStyles = StyleSheet.flatten(
    [
      CommonStyles.buttonText,
      getTextStyle(variant),
      isDisabled ? styles.disabledButtonText : undefined,
      textStyle,
    ].filter(Boolean)
  ) as TextStyle;

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole='button'
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size='small'
          color={variant === 'outline' ? Colors.primary : Colors.surface}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

/**
 * Styles for the Button component
 */
const styles = StyleSheet.create({
  // Variant styles
  primaryButton: {
    backgroundColor: Colors.primary,
  } as ViewStyle,

  secondaryButton: {
    backgroundColor: Colors.secondary,
  } as ViewStyle,

  successButton: {
    backgroundColor: Colors.success,
  } as ViewStyle,

  warningButton: {
    backgroundColor: Colors.warning,
  } as ViewStyle,

  errorButton: {
    backgroundColor: Colors.error,
  } as ViewStyle,

  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  } as ViewStyle,

  // Size styles
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  } as ViewStyle,

  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
  } as ViewStyle,

  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 52,
  } as ViewStyle,

  // State styles
  disabledButton: {
    backgroundColor: Colors.border.dark,
    borderColor: Colors.border.dark,
  } as ViewStyle,

  // Text styles
  buttonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,

  outlineButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,

  disabledButtonText: {
    color: Colors.text.disabled,
  } as TextStyle,
});
