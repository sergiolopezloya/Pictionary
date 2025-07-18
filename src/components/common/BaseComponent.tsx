/**
 * Base component with common functionality
 */

import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

/**
 * Common style definitions used across components
 */
export const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  } as ViewStyle,

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  } as ViewStyle,

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  } as ViewStyle,

  buttonDisabled: {
    backgroundColor: '#cccccc',
  } as ViewStyle,

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,

  buttonTextDisabled: {
    color: '#666666',
  } as TextStyle,

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  } as TextStyle,

  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555555',
    textAlign: 'center',
    marginBottom: 12,
  } as TextStyle,

  bodyText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  } as TextStyle,

  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 8,
  } as TextStyle,

  successText: {
    fontSize: 14,
    color: '#34C759',
    textAlign: 'center',
    marginTop: 8,
  } as TextStyle,

  input: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    minHeight: 44,
  } as ViewStyle,

  inputFocused: {
    borderColor: '#007AFF',
  } as ViewStyle,

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  spaceBetween: {
    justifyContent: 'space-between',
  } as ViewStyle,

  marginSmall: {
    margin: 8,
  } as ViewStyle,

  marginMedium: {
    margin: 16,
  } as ViewStyle,

  marginLarge: {
    margin: 24,
  } as ViewStyle,

  paddingSmall: {
    padding: 8,
  } as ViewStyle,

  paddingMedium: {
    padding: 16,
  } as ViewStyle,

  paddingLarge: {
    padding: 24,
  } as ViewStyle,
});

/**
 * Color palette for consistent theming
 */
export const Colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',

  background: '#f5f5f5',
  surface: '#ffffff',

  text: {
    primary: '#333333',
    secondary: '#555555',
    tertiary: '#666666',
    disabled: '#999999',
  },

  border: {
    light: '#eeeeee',
    medium: '#dddddd',
    dark: '#cccccc',
  },

  shadow: '#000000',
};

/**
 * Common spacing values
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Common font sizes
 */
export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

/**
 * Common border radius values
 */
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

/**
 * Interface for component props that include common styling options
 */
export interface BaseComponentProps {
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

/**
 * Utility function to merge styles
 * @param styles - Array of styles to merge
 * @returns Merged style object
 */
export const mergeStyles = (
  ...styles: (ViewStyle | TextStyle | undefined)[]
): ViewStyle | TextStyle => {
  return StyleSheet.flatten(styles.filter(Boolean));
};

/**
 * Utility function to create responsive dimensions
 * @param size - Base size
 * @param factor - Scaling factor (default: 1)
 * @returns Scaled size
 */
export const responsiveSize = (size: number, factor: number = 1): number => {
  return Math.round(size * factor);
};

/**
 * Utility function to get color with opacity
 * @param color - Base color
 * @param opacity - Opacity value (0-1)
 * @returns Color with opacity
 */
export const getColorWithOpacity = (color: string, opacity: number): string => {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${color}${alpha}`;
};
