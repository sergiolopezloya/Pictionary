/**
 * Game service implementation for managing game state and logic
 * Depends on abstractions (IWordService, ITimerService) following DIP
 */

import { IGameService, IWordService, ITimerService } from '../interfaces';
import { GameSession, GameConfig, GameWord, Player, GameState } from '../types';

/**
 * Service for managing the core game logic and state
 * Implements IGameService interface following Dependency Inversion Principle
 */
export class GameService implements IGameService {
  private readonly sessions: Map<string, GameSession> = new Map();
  private readonly wordService: IWordService;
  private readonly timerService: ITimerService;

  /**
   * Creates a new GameService instance
   * @param wordService - Service for managing words
   * @param timerService - Service for managing timers
   */
  constructor(wordService: IWordService, timerService: ITimerService) {
    this.wordService = wordService;
    this.timerService = timerService;
  }

  /**
   * Initializes a new game session with the provided configuration
   * @param config - Game configuration settings
   * @param players - Array of players participating in the game
   * @returns Promise resolving to the created game session
   */
  public async initializeGame(config: GameConfig, players: Player[]): Promise<GameSession> {
    if (players.length < 2) {
      throw new Error('At least 2 players are required to start a game');
    }

    const sessionId = this.generateSessionId();

    // Reset all players' drawing status
    const initializedPlayers = players.map(player => ({
      ...player,
      score: 0,
      isDrawing: false,
    }));

    const session: GameSession = {
      id: sessionId,
      players: initializedPlayers,
      currentWord: null,
      currentDrawer: null,
      state: GameState.WAITING,
      timeRemaining: config.maxTime,
      maxTime: config.maxTime,
      round: 0,
      maxRounds: config.maxRounds,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Starts the game session
   * @param sessionId - Unique identifier for the game session
   * @returns Promise resolving to the updated game session
   */
  public async startGame(sessionId: string): Promise<GameSession> {
    const session = await this.getGameSession(sessionId);
    if (!session) {
      throw new Error(`Game session not found: ${sessionId}`);
    }

    if (session.state !== GameState.WAITING) {
      throw new Error(`Cannot start game in current state: ${session.state}`);
    }

    // Start first round
    const updatedSession = await this.startNewRound(session);
    return updatedSession;
  }

  /**
   * Selects a random word for the current round
   * @param sessionId - Unique identifier for the game session
   * @returns Promise resolving to the selected word
   */
  public async selectWord(sessionId: string): Promise<GameWord> {
    const session = await this.getGameSession(sessionId);
    if (!session) {
      throw new Error(`Game session not found: ${sessionId}`);
    }

    // For now, use medium difficulty. In a full implementation,
    // this could be based on game configuration
    const word = await this.wordService.getRandomWord('medium');

    // Update session with the selected word
    const updatedSession: GameSession = {
      ...session,
      currentWord: word,
      state: GameState.DRAWING,
    };

    this.sessions.set(sessionId, updatedSession);

    // Start the round timer
    this.startRoundTimer(sessionId);

    return word;
  }

  /**
   * Submits a guess for the current word
   * @param sessionId - Unique identifier for the game session
   * @param playerId - ID of the player making the guess
   * @param guess - The guessed word
   * @returns Promise resolving to whether the guess was correct
   */
  public async submitGuess(sessionId: string, playerId: string, guess: string): Promise<boolean> {
    const session = await this.getGameSession(sessionId);
    if (!session) {
      throw new Error(`Game session not found: ${sessionId}`);
    }

    if (session.state !== GameState.DRAWING && session.state !== GameState.GUESSING) {
      throw new Error(`Cannot submit guess in current state: ${session.state}`);
    }

    if (!session.currentWord) {
      throw new Error('No current word to guess');
    }

    // Find the player making the guess
    const player = session.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error(`Player not found: ${playerId}`);
    }

    // Check if the player is the current drawer (they can't guess their own word)
    if (session.currentDrawer && session.currentDrawer.id === playerId) {
      throw new Error('The drawer cannot guess their own word');
    }

    // Validate the guess
    const isCorrect = this.wordService.validateGuess(guess, session.currentWord.word);

    if (isCorrect) {
      // Award points to the guesser
      player.score += this.calculateGuessPoints(session.timeRemaining, session.maxTime);

      // Award points to the drawer
      if (session.currentDrawer) {
        session.currentDrawer.score += this.calculateDrawerPoints();
      }

      // Update game state
      const updatedSession: GameSession = {
        ...session,
        state: GameState.CORRECT_GUESS,
        players: [...session.players], // Create new array to trigger updates
      };

      this.sessions.set(sessionId, updatedSession);

      // Stop the timer
      this.timerService.stopTimer(sessionId);

      return true;
    }

    return false;
  }

  /**
   * Ends the current round and prepares for the next one
   * @param sessionId - Unique identifier for the game session
   * @returns Promise resolving to the updated game session
   */
  public async endRound(sessionId: string): Promise<GameSession> {
    const session = await this.getGameSession(sessionId);
    if (!session) {
      throw new Error(`Game session not found: ${sessionId}`);
    }

    // Stop the timer
    this.timerService.stopTimer(sessionId);

    // Check if game should end
    if (session.round >= session.maxRounds) {
      const updatedSession: GameSession = {
        ...session,
        state: GameState.GAME_OVER,
      };
      this.sessions.set(sessionId, updatedSession);
      return updatedSession;
    }

    // Start next round
    return await this.startNewRound(session);
  }

  /**
   * Gets the current game session state
   * @param sessionId - Unique identifier for the game session
   * @returns Promise resolving to the current game session
   */
  public async getGameSession(sessionId: string): Promise<GameSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Updates the game state
   * @param sessionId - Unique identifier for the game session
   * @param newState - The new game state
   * @returns Promise resolving to the updated game session
   */
  public async updateGameState(sessionId: string, newState: GameState): Promise<GameSession> {
    const session = await this.getGameSession(sessionId);
    if (!session) {
      throw new Error(`Game session not found: ${sessionId}`);
    }

    const updatedSession: GameSession = {
      ...session,
      state: newState,
    };

    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  /**
   * Generates a unique session ID
   * @returns Unique session identifier
   * @private
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Starts a new round in the game
   * @param session - Current game session
   * @returns Promise resolving to the updated game session
   * @private
   */
  private async startNewRound(session: GameSession): Promise<GameSession> {
    const nextRound = session.round + 1;

    // Select next drawer (rotate through players)
    const drawerIndex = (nextRound - 1) % session.players.length;
    const nextDrawer = session.players[drawerIndex];

    if (!nextDrawer) {
      throw new Error('No players available for next round');
    }

    // Reset all players' drawing status
    const updatedPlayers = session.players.map(player => ({
      ...player,
      isDrawing: player.id === nextDrawer.id,
    }));

    const updatedSession: GameSession = {
      ...session,
      players: updatedPlayers,
      currentDrawer: nextDrawer,
      round: nextRound,
      state: GameState.DRAWING,
      timeRemaining: session.maxTime,
      currentWord: null,
    };

    this.sessions.set(session.id, updatedSession);
    return updatedSession;
  }

  /**
   * Starts the round timer
   * @param sessionId - Unique identifier for the game session
   * @private
   */
  private startRoundTimer(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    this.timerService.startTimer(
      sessionId,
      session.maxTime,
      (timeRemaining: number) => {
        // Update session with remaining time
        const currentSession = this.sessions.get(sessionId);
        if (currentSession) {
          const updatedSession: GameSession = {
            ...currentSession,
            timeRemaining,
          };
          this.sessions.set(sessionId, updatedSession);
        }
      },
      async () => {
        // Time's up - end the round
        await this.updateGameState(sessionId, GameState.TIME_UP);
      }
    );
  }

  /**
   * Calculates points for a correct guess based on remaining time
   * @param timeRemaining - Time remaining when guess was made
   * @param maxTime - Maximum time for the round
   * @returns Points to award
   * @private
   */
  private calculateGuessPoints(timeRemaining: number, maxTime: number): number {
    const timeRatio = timeRemaining / maxTime;
    const basePoints = 100;
    const timeBonus = Math.floor(timeRatio * 50); // Up to 50 bonus points for quick guesses
    return basePoints + timeBonus;
  }

  /**
   * Calculates points for the drawer when someone guesses correctly
   * @returns Points to award to the drawer
   * @private
   */
  private calculateDrawerPoints(): number {
    return 50; // Fixed points for successful drawing
  }
}
