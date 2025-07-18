/**
 * Interface for game service operations
 */

import { GameSession, GameConfig, GameWord, Player, GameState } from '../types';

/**
 * Core game service interface for managing game state and logic
 */
export interface IGameService {
  /**
   * Initializes a new game session with the provided configuration
   * @param config - Game configuration settings
   * @param players - Array of players participating in the game
   * @returns Promise resolving to the created game session
   */
  initializeGame(config: GameConfig, players: Player[]): Promise<GameSession>;

  /**
   * Starts the game session
   * @param sessionId - Unique identifier for the game session
   * @returns Promise resolving to the updated game session
   */
  startGame(sessionId: string): Promise<GameSession>;

  /**
   * Selects a random word for the current round
   * @param sessionId - Unique identifier for the game session
   * @returns Promise resolving to the selected word
   */
  selectWord(sessionId: string): Promise<GameWord>;

  /**
   * Submits a guess for the current word
   * @param sessionId - Unique identifier for the game session
   * @param playerId - ID of the player making the guess
   * @param guess - The guessed word
   * @returns Promise resolving to whether the guess was correct
   */
  submitGuess(sessionId: string, playerId: string, guess: string): Promise<boolean>;

  /**
   * Ends the current round and prepares for the next one
   * @param sessionId - Unique identifier for the game session
   * @returns Promise resolving to the updated game session
   */
  endRound(sessionId: string): Promise<GameSession>;

  /**
   * Gets the current game session state
   * @param sessionId - Unique identifier for the game session
   * @returns Promise resolving to the current game session
   */
  getGameSession(sessionId: string): Promise<GameSession | null>;

  /**
   * Updates the game state
   * @param sessionId - Unique identifier for the game session
   * @param newState - The new game state
   * @returns Promise resolving to the updated game session
   */
  updateGameState(sessionId: string, newState: GameState): Promise<GameSession>;
}

/**
 * Interface for timer-related operations
 */
export interface ITimerService {
  /**
   * Starts a timer for the specified duration
   * @param sessionId - Unique identifier for the game session
   * @param duration - Timer duration in seconds
   * @param onTick - Callback function called every second
   * @param onComplete - Callback function called when timer completes
   */
  startTimer(
    sessionId: string,
    duration: number,
    onTick: (timeRemaining: number) => void,
    onComplete: () => void
  ): void;

  /**
   * Stops the timer for the specified session
   * @param sessionId - Unique identifier for the game session
   */
  stopTimer(sessionId: string): void;

  /**
   * Gets the remaining time for the specified session
   * @param sessionId - Unique identifier for the game session
   * @returns Remaining time in seconds, or null if no timer is active
   */
  getRemainingTime(sessionId: string): number | null;
}

/**
 * Interface for word management operations
 */
export interface IWordService {
  /**
   * Gets a random word based on the specified difficulty
   * @param difficulty - Difficulty level for word selection
   * @returns Promise resolving to a random word
   */
  getRandomWord(difficulty: string): Promise<GameWord>;

  /**
   * Gets all available words for a specific difficulty
   * @param difficulty - Difficulty level
   * @returns Promise resolving to array of words
   */
  getWordsByDifficulty(difficulty: string): Promise<GameWord[]>;

  /**
   * Validates if a guess matches the target word
   * @param guess - The guessed word
   * @param targetWord - The word to match against
   * @returns Whether the guess is correct
   */
  validateGuess(guess: string, targetWord: string): boolean;
}
