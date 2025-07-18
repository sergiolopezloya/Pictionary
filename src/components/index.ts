/**
 * Central export file for all components
 * Provides clean imports throughout the application
 */

// Common components
export { Button } from './common/Button';
export {
  BaseComponentProps,
  CommonStyles,
  Colors,
  Spacing,
  FontSizes,
  BorderRadius,
} from './common/BaseComponent';
export type { ButtonProps, ButtonVariant, ButtonSize } from './common/Button';

// Game components
export { Timer } from './game/Timer';
export { PlayerInfo } from './game/PlayerInfo';
export { WordDisplay } from './game/WordDisplay';
export { GuessInput } from './game/GuessInput';
export { DrawingCanvas } from './game/DrawingCanvas';

// Animation components
// export { RiveGameAnimation } from './RiveGameAnimation';

// Component prop types
export type { TimerProps } from './game/Timer';
export type { PlayerInfoProps } from './game/PlayerInfo';
export type { WordDisplayProps } from './game/WordDisplay';
export type { GuessInputProps } from './game/GuessInput';
// export type { RiveGameAnimationProps } from './RiveGameAnimation';
