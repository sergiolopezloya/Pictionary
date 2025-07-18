/**
 * Game model implementations and utilities
 */

import {
  Player,
  GameWord,
  GameSession,
  GameConfig,
  Difficulty,
} from '../types';

/**
 * Factory class for creating game entities
 */
export class GameModelFactory {
  /**
   * Creates a new player instance
   * @param id - Unique player identifier
   * @param name - Player display name
   * @returns New player instance
   */
  public static createPlayer(id: string, name: string): Player {
    if (!id || !name) {
      throw new Error('Player ID and name are required');
    }

    return {
      id,
      name: name.trim(),
      score: 0,
      isDrawing: false,
    };
  }

  /**
   * Creates a new game word instance
   * @param word - The word to be drawn
   * @param difficulty - Difficulty level
   * @param category - Word category
   * @param hints - Optional hints for the word
   * @returns New game word instance
   */
  public static createGameWord(
    word: string,
    difficulty: Difficulty,
    category: string,
    hints?: string[]
  ): GameWord {
    if (!word || !category) {
      throw new Error('Word and category are required');
    }

    return {
      id: `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      word: word.toLowerCase().trim(),
      difficulty,
      category: category.trim(),
      hints: hints || [],
    };
  }

  /**
   * Creates a default game configuration
   * @param overrides - Optional configuration overrides
   * @returns New game configuration
   */
  public static createDefaultGameConfig(
    overrides?: Partial<GameConfig>
  ): GameConfig {
    const defaultConfig: GameConfig = {
      maxTime: 60, // 60 seconds per round
      maxRounds: 5, // 5 rounds per game
      difficulty: Difficulty.MEDIUM,
      enableHints: true,
    };

    return { ...defaultConfig, ...overrides };
  }

  /**
   * Creates multiple players from an array of names
   * @param names - Array of player names
   * @returns Array of player instances
   */
  public static createPlayersFromNames(names: string[]): Player[] {
    if (!names || names.length < 2) {
      throw new Error('At least 2 player names are required');
    }

    return names.map((name, index) =>
      this.createPlayer(`player_${index + 1}`, name)
    );
  }
}

/**
 * Utility class for game calculations and validations
 */
export class GameUtils {
  /**
   * Calculates the score for a correct guess based on timing
   * @param timeRemaining - Time remaining when guess was made (seconds)
   * @param maxTime - Maximum time for the round (seconds)
   * @param basePoints - Base points for correct guess
   * @returns Calculated score
   */
  public static calculateGuessScore(
    timeRemaining: number,
    maxTime: number,
    basePoints: number = 100
  ): number {
    if (timeRemaining < 0 || maxTime <= 0) {
      return 0;
    }

    const timeRatio = Math.max(0, timeRemaining / maxTime);
    const timeBonus = Math.floor(timeRatio * 50); // Up to 50 bonus points
    return basePoints + timeBonus;
  }

  /**
   * Calculates the score for a successful drawer
   * @param correctGuesses - Number of players who guessed correctly
   * @param totalPlayers - Total number of players (excluding drawer)
   * @param basePoints - Base points for successful drawing
   * @returns Calculated score
   */
  public static calculateDrawerScore(
    correctGuesses: number,
    totalPlayers: number,
    basePoints: number = 50
  ): number {
    if (correctGuesses <= 0 || totalPlayers <= 0) {
      return 0;
    }

    const successRatio = correctGuesses / totalPlayers;
    const bonus = Math.floor(successRatio * 25); // Up to 25 bonus points
    return basePoints + bonus;
  }

  /**
   * Validates a player guess against the target word
   * @param guess - Player's guess
   * @param targetWord - The correct word
   * @param allowPartialMatch - Whether to allow partial matches
   * @returns Whether the guess is correct
   */
  public static validateGuess(
    guess: string,
    targetWord: string,
    allowPartialMatch: boolean = false
  ): boolean {
    if (!guess || !targetWord) {
      return false;
    }

    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedTarget = targetWord.toLowerCase().trim();

    if (normalizedGuess === normalizedTarget) {
      return true;
    }

    if (allowPartialMatch) {
      // Check for close matches (e.g., plurals, simple variations)
      return this.isCloseMatch(normalizedGuess, normalizedTarget);
    }

    return false;
  }

  /**
   * Checks if two words are close matches
   * @param guess - Player's guess
   * @param target - Target word
   * @returns Whether the words are close matches
   * @private
   */
  private static isCloseMatch(guess: string, target: string): boolean {
    // Check for plural variations
    if (guess === target + 's' || target === guess + 's') {
      return true;
    }

    // Check for simple suffix variations
    const suffixes = ['ing', 'ed', 'er', 'est'];
    for (const suffix of suffixes) {
      if (guess === target + suffix || target === guess + suffix) {
        return true;
      }
    }

    // Check for Levenshtein distance (allow 1-2 character differences for longer words)
    if (target.length > 4) {
      const distance = this.levenshteinDistance(guess, target);
      return distance <= 2;
    }

    return false;
  }

  /**
   * Calculates Levenshtein distance between two strings
   * @param str1 - First string
   * @param str2 - Second string
   * @returns Levenshtein distance
   * @private
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0]![i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j]![0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j]![i] = Math.min(
          matrix[j]![i - 1]! + 1, // deletion
          matrix[j - 1]![i]! + 1, // insertion
          matrix[j - 1]![i - 1]! + indicator // substitution
        );
      }
    }

    return matrix[str2.length]![str1.length]!;
  }

  /**
   * Gets the next drawer in rotation
   * @param players - Array of players
   * @param currentDrawer - Current drawer (null for first round)
   * @returns Next drawer
   */
  public static getNextDrawer(
    players: Player[],
    currentDrawer: Player | null
  ): Player {
    if (players.length === 0) {
      throw new Error('No players available');
    }

    if (!currentDrawer) {
      return players[0];
    }

    const currentIndex = players.findIndex((p) => p.id === currentDrawer.id);
    if (currentIndex === -1) {
      return players[0];
    }

    const nextIndex = (currentIndex + 1) % players.length;
    return players[nextIndex];
  }

  /**
   * Checks if the game should end
   * @param session - Current game session
   * @returns Whether the game should end
   */
  public static shouldGameEnd(session: GameSession): boolean {
    return session.round >= session.maxRounds;
  }

  /**
   * Gets the game winner(s)
   * @param players - Array of players
   * @returns Array of winning players (can be multiple in case of tie)
   */
  public static getWinners(players: Player[]): Player[] {
    if (players.length === 0) {
      return [];
    }

    const maxScore = Math.max(...players.map((p) => p.score));
    return players.filter((p) => p.score === maxScore);
  }

  /**
   * Formats time remaining for display
   * @param seconds - Time in seconds
   * @returns Formatted time string (e.g., "1:30")
   */
  public static formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Generates a random session ID
   * @returns Unique session identifier
   */
  public static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
