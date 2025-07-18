/**
 * Core type definitions for the Pictionary game application
 */

/**
 * Represents the current state of the game
 */
export enum GameState {
  WAITING = 'waiting',
  DRAWING = 'drawing',
  GUESSING = 'guessing',
  CORRECT_GUESS = 'correct_guess',
  TIME_UP = 'time_up',
  GAME_OVER = 'game_over',
}

/**
 * Difficulty levels for word selection
 */
export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

/**
 * Represents a word to be drawn in the game
 */
export interface GameWord {
  readonly id: string;
  readonly word: string;
  readonly difficulty: Difficulty;
  readonly category: string;
  readonly hints?: string[];
}

/**
 * Represents a player in the game
 */
export interface Player {
  readonly id: string;
  readonly name: string;
  score: number;
  isDrawing: boolean;
}

/**
 * Represents the current game session
 */
export interface GameSession {
  readonly id: string;
  readonly players: Player[];
  readonly currentWord: GameWord | null;
  readonly currentDrawer: Player | null;
  readonly state: GameState;
  readonly timeRemaining: number;
  readonly maxTime: number;
  readonly round: number;
  readonly maxRounds: number;
}

/**
 * Configuration for game settings
 */
export interface GameConfig {
  readonly maxTime: number;
  readonly maxRounds: number;
  readonly difficulty: Difficulty;
  readonly enableHints: boolean;
}

/**
 * Drawing stroke data for canvas
 */
export interface DrawingStroke {
  readonly id: string;
  readonly points: Point[];
  readonly color: string;
  readonly width: number;
  readonly timestamp: number;
}

/**
 * Point coordinates for drawing
 */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * Animation state for Rive animations
 */
export interface AnimationState {
  readonly stateMachine: string;
  readonly inputs: Record<string, boolean | number | string>;
}

/**
 * Events that can be emitted during the game
 */
export enum GameEvent {
  GAME_STARTED = 'game_started',
  WORD_SELECTED = 'word_selected',
  DRAWING_STARTED = 'drawing_started',
  GUESS_SUBMITTED = 'guess_submitted',
  CORRECT_GUESS = 'correct_guess',
  TIME_UP = 'time_up',
  ROUND_ENDED = 'round_ended',
  GAME_ENDED = 'game_ended',
}

/**
 * Event payload interface
 */
export interface GameEventPayload {
  readonly event: GameEvent;
  readonly data?: any;
  readonly timestamp: number;
}
