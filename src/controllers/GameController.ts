/**
 * Game controller for orchestrating game flow and state management
 */

import { IGameService, IAnimationService } from '../interfaces';
import { GameSession, GameConfig, GameState, GameEvent, GameEventPayload } from '../types';
import { GameModelFactory, GameUtils } from '../models/GameModels';

/**
 * Event handler interface for game events
 */
export interface IGameEventHandler {
  onGameEvent(event: GameEventPayload): void;
}

/**
 * Controller class for managing game flow and coordinating services
 * Implements the Controller pattern and acts as a facade for game operations
 */
export class GameController {
  private readonly gameService: IGameService;
  private readonly animationService: IAnimationService;
  private currentSession: GameSession | null = null;
  private eventHandlers: IGameEventHandler[] = [];

  /**
   * Creates a new GameController instance
   * @param gameService - Service for game logic
   * @param animationService - Service for animations
   */
  constructor(gameService: IGameService, animationService: IAnimationService) {
    this.gameService = gameService;
    this.animationService = animationService;
  }

  /**
   * Initializes a new game with the specified players and configuration
   * @param playerNames - Array of player names
   * @param config - Game configuration (optional, uses defaults if not provided)
   * @returns Promise resolving to the created game session
   */
  public async initializeGame(
    playerNames: string[],
    config?: Partial<GameConfig>
  ): Promise<GameSession> {
    try {
      // Validate input
      if (!playerNames || playerNames.length < 2) {
        throw new Error('At least 2 players are required');
      }

      // Create players and configuration
      const players = GameModelFactory.createPlayersFromNames(playerNames);
      const gameConfig = GameModelFactory.createDefaultGameConfig(config);

      // Initialize game session
      this.currentSession = await this.gameService.initializeGame(gameConfig, players);

      // Initialize animation service if not already initialized
      try {
        await this.animationService.initialize('/assets/animations/game-animations.riv');
      } catch (error) {
        console.warn('Failed to initialize animation service:', error);
        // Continue without animations rather than failing the entire game
      }

      // Initialize animations
      try {
        await this.animationService.playAnimationForState(GameState.WAITING);
      } catch (error) {
        console.warn('Failed to play initial animation:', error);
        // Continue without animations rather than failing the entire game
      }

      // Emit game started event
      this.emitEvent(GameEvent.GAME_STARTED, { session: this.currentSession });

      console.log(`Game initialized with ${players.length} players`);
      return this.currentSession;
    } catch (error) {
      console.error('Failed to initialize game:', error);
      throw error;
    }
  }

  /**
   * Starts the game and begins the first round
   * @returns Promise resolving to the updated game session
   */
  public async startGame(): Promise<GameSession> {
    if (!this.currentSession) {
      throw new Error('No game session initialized');
    }

    try {
      // Start the game
      this.currentSession = await this.gameService.startGame(this.currentSession.id);

      // Select word for first round
      await this.selectWordForRound();

      console.log('Game started successfully');
      return this.currentSession;
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    }
  }

  /**
   * Selects a word for the current round
   * @returns Promise resolving when word is selected
   */
  public async selectWordForRound(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active game session');
    }

    try {
      // Select word
      const selectedWord = await this.gameService.selectWord(this.currentSession.id);

      // Update current session
      this.currentSession = await this.gameService.getGameSession(this.currentSession.id);

      if (!this.currentSession) {
        throw new Error('Failed to get updated session');
      }

      // Play drawing animation
      await this.animationService.playAnimationForState(GameState.DRAWING);

      // Emit word selected event
      this.emitEvent(GameEvent.WORD_SELECTED, {
        word: selectedWord,
        drawer: this.currentSession.currentDrawer,
      });

      // Emit drawing started event
      this.emitEvent(GameEvent.DRAWING_STARTED, {
        drawer: this.currentSession.currentDrawer,
        timeLimit: this.currentSession.maxTime,
      });

      console.log(
        `Word selected: ${selectedWord.word} for drawer: ${this.currentSession.currentDrawer?.name}`
      );
    } catch (error) {
      console.error('Failed to select word:', error);
      throw error;
    }
  }

  /**
   * Submits a guess from a player
   * @param playerId - ID of the player making the guess
   * @param guess - The guessed word
   * @returns Promise resolving to whether the guess was correct
   */
  public async submitGuess(playerId: string, guess: string): Promise<boolean> {
    if (!this.currentSession) {
      throw new Error('No active game session');
    }

    try {
      // Submit guess to game service
      const isCorrect = await this.gameService.submitGuess(this.currentSession.id, playerId, guess);

      // Update current session
      this.currentSession = await this.gameService.getGameSession(this.currentSession.id);

      if (!this.currentSession) {
        throw new Error('Failed to get updated session');
      }

      // Emit guess submitted event
      this.emitEvent(GameEvent.GUESS_SUBMITTED, {
        playerId,
        guess,
        isCorrect,
      });

      if (isCorrect) {
        // Play correct guess animation
        await this.animationService.playAnimationForState(GameState.CORRECT_GUESS);

        // Emit correct guess event
        this.emitEvent(GameEvent.CORRECT_GUESS, {
          playerId,
          guess,
          session: this.currentSession,
        });

        // End round after a brief delay to show animation
        setTimeout(async () => {
          await this.endRound();
        }, 3000);
      }

      return isCorrect;
    } catch (error) {
      console.error('Failed to submit guess:', error);
      throw error;
    }
  }

  /**
   * Ends the current round and prepares for the next one
   * @returns Promise resolving when round is ended
   */
  public async endRound(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active game session');
    }

    try {
      // End the round
      this.currentSession = await this.gameService.endRound(this.currentSession.id);

      // Emit round ended event
      this.emitEvent(GameEvent.ROUND_ENDED, {
        round: this.currentSession.round - 1,
        session: this.currentSession,
      });

      // Check if game should end
      if (GameUtils.shouldGameEnd(this.currentSession)) {
        await this.endGame();
      } else {
        // Start next round
        await this.selectWordForRound();
      }
    } catch (error) {
      console.error('Failed to end round:', error);
      throw error;
    }
  }

  /**
   * Handles when time runs out for the current round
   * @returns Promise resolving when time up is handled
   */
  public async handleTimeUp(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active game session');
    }

    try {
      // Update game state to time up
      this.currentSession = await this.gameService.updateGameState(
        this.currentSession.id,
        GameState.TIME_UP
      );

      // Play time up animation
      await this.animationService.playAnimationForState(GameState.TIME_UP);

      // Emit time up event
      this.emitEvent(GameEvent.TIME_UP, {
        session: this.currentSession,
      });

      // End round after showing time up animation
      setTimeout(async () => {
        await this.endRound();
      }, 2500);
    } catch (error) {
      console.error('Failed to handle time up:', error);
      throw error;
    }
  }

  /**
   * Ends the game and shows final results
   * @returns Promise resolving when game is ended
   */
  public async endGame(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active game session');
    }

    try {
      // Update game state to game over
      this.currentSession = await this.gameService.updateGameState(
        this.currentSession.id,
        GameState.GAME_OVER
      );

      // Play game over animation
      await this.animationService.playAnimationForState(GameState.GAME_OVER);

      // Get winners
      const winners = GameUtils.getWinners(this.currentSession.players);

      // Emit game ended event
      this.emitEvent(GameEvent.GAME_ENDED, {
        session: this.currentSession,
        winners,
      });

      console.log('Game ended. Winners:', winners.map(w => w.name).join(', '));
    } catch (error) {
      console.error('Failed to end game:', error);
      throw error;
    }
  }

  /**
   * Gets the current game session
   * @returns Current game session or null if no game is active
   */
  public getCurrentSession(): GameSession | null {
    return this.currentSession;
  }

  /**
   * Gets the current game state
   * @returns Current game state or null if no game is active
   */
  public getCurrentState(): GameState | null {
    return this.currentSession?.state || null;
  }

  /**
   * Adds an event handler for game events
   * @param handler - Event handler to add
   */
  public addEventListener(handler: IGameEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Removes an event handler
   * @param handler - Event handler to remove
   */
  public removeEventListener(handler: IGameEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Emits a game event to all registered handlers
   * @param event - Event type
   * @param data - Event data
   * @private
   */
  private emitEvent(event: GameEvent, data?: any): void {
    const eventPayload: GameEventPayload = {
      event,
      data,
      timestamp: Date.now(),
    };

    for (const handler of this.eventHandlers) {
      try {
        handler.onGameEvent(eventPayload);
      } catch (error) {
        console.error('Error in event handler:', error);
      }
    }
  }

  /**
   * Resets the controller state
   */
  public reset(): void {
    this.currentSession = null;
    this.eventHandlers = [];
    this.animationService.stop();
  }
}
