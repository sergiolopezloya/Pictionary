/**
 * Custom hook for managing game state
 * Provides centralized game state management with clean separation of concerns
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameSession, GameConfig, GameState, GameEventPayload } from '../types';
import { GameController, IGameEventHandler } from '../controllers/GameController';
import { ServiceFactory } from '../services';
import { IAnimationService } from '../interfaces';

/**
 * Game state hook interface
 */
interface GameStateHook {
  /** Current game session */
  gameSession: GameSession | null;
  /** Current game state */
  gameState: GameState | null;
  /** Whether the game is loading */
  isLoading: boolean;
  /** Current error message */
  error: string | null;
  /** Whether the current user is the drawer */
  isCurrentDrawer: boolean;
  /** Function to initialize a new game */
  initializeGame: (playerNames: string[], config?: Partial<GameConfig>) => Promise<void>;
  /** Function to start the game */
  startGame: () => Promise<void>;
  /** Function to submit a guess */
  submitGuess: (playerId: string, guess: string) => Promise<boolean>;

  /** Function to reset the game */
  resetGame: () => void;
}

/**
 * Hook options interface
 */
interface UseGameStateOptions {
  /** Current player ID */
  currentPlayerId?: string;
  /** Animation service for game state changes */
  animationService?: IAnimationService;
  /** Custom event handler for game events */
  onGameEvent?: (event: GameEventPayload) => void;
}

/**
 * Custom hook for managing game state in the Pictionary game
 *
 * @param options - Hook configuration options
 * @returns Game state and control functions
 *
 * @example
 * ```tsx
 * const {
 *   gameSession,
 *   gameState,
 *   isLoading,
 *   initializeGame,
 *   startGame,
 *   submitGuess
 * } = useGameState({
 *   currentPlayerId: 'player_1',
 *   onGameEvent: handleGameEvent
 * });
 * ```
 */
export const useGameState = (options: UseGameStateOptions = {}): GameStateHook => {
  const { currentPlayerId, animationService, onGameEvent } = options;

  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const gameControllerRef = useRef<GameController | null>(null);
  const serviceFactory = ServiceFactory.getInstance();

  /**
   * Game event handler implementation
   */
  const gameEventHandler: IGameEventHandler = {
    onGameEvent: (event: GameEventPayload) => {
      console.log('Game event received:', event);

      // Update game session from event data if available
      if (event.data?.session) {
        setGameSession(event.data.session);
      }

      // Handle specific events
      switch (event.event) {
        case 'game_started':
        case 'round_ended':
        case 'game_ended':
          if (event.data?.session) {
            setGameSession(event.data.session);
          }
          break;
        case 'correct_guess':
          // Refresh session after correct guess
          refreshGameSession();
          break;
      }

      // Call custom event handler if provided
      if (onGameEvent) {
        onGameEvent(event);
      }
    },
  };

  /**
   * Initializes the game controller
   */
  const initializeController = useCallback((): void => {
    if (gameControllerRef.current) {
      return;
    }

    try {
      const gameService = serviceFactory.getGameService();
      const defaultAnimationService = animationService || serviceFactory.createAnimationService();

      gameControllerRef.current = new GameController(gameService, defaultAnimationService);
      gameControllerRef.current.addEventListener(gameEventHandler);

      console.log('Game controller initialized');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to initialize game controller';
      setError(errorMessage);
      console.error('Failed to initialize game controller:', err);
    }
  }, [serviceFactory, animationService, gameEventHandler]);

  /**
   * Refreshes the current game session
   */
  const refreshGameSession = useCallback(async (): Promise<void> => {
    if (!gameControllerRef.current) {
      return;
    }

    const currentSession = gameControllerRef.current.getCurrentSession();
    if (currentSession) {
      setGameSession(currentSession);
    }
  }, []);

  /**
   * Initializes a new game
   * @param playerNames - Array of player names
   * @param config - Optional game configuration
   */
  const initializeGame = useCallback(
    async (playerNames: string[], config?: Partial<GameConfig>): Promise<void> => {
      if (!gameControllerRef.current) {
        initializeController();
      }

      if (!gameControllerRef.current) {
        throw new Error('Failed to initialize game controller');
      }

      try {
        setIsLoading(true);
        setError(null);

        const session = await gameControllerRef.current.initializeGame(playerNames, config);
        setGameSession(session);

        console.log('Game initialized successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize game';
        setError(errorMessage);
        console.error('Failed to initialize game:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [initializeController]
  );

  /**
   * Starts the game
   */
  const startGame = useCallback(async (): Promise<void> => {
    if (!gameControllerRef.current) {
      throw new Error('Game controller not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      const session = await gameControllerRef.current.startGame();
      setGameSession(session);

      console.log('Game started successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start game';
      setError(errorMessage);
      console.error('Failed to start game:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Submits a guess
   * @param playerId - ID of the player making the guess
   * @param guess - The guessed word
   * @returns Whether the guess was correct
   */
  const submitGuess = useCallback(
    async (playerId: string, guess: string): Promise<boolean> => {
      if (!gameControllerRef.current) {
        throw new Error('Game controller not initialized');
      }

      try {
        setError(null);

        const isCorrect = await gameControllerRef.current.submitGuess(playerId, guess);

        // Refresh session to get updated scores
        await refreshGameSession();

        return isCorrect;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit guess';
        setError(errorMessage);
        console.error('Failed to submit guess:', err);
        throw err;
      }
    },
    [refreshGameSession]
  );

  /**
   * Resets the game state
   */
  const resetGame = useCallback((): void => {
    if (gameControllerRef.current) {
      gameControllerRef.current.reset();
    }

    setGameSession(null);
    setIsLoading(false);
    setError(null);

    console.log('Game state reset');
  }, []);

  // Initialize controller on mount
  useEffect(() => {
    initializeController();

    return () => {
      if (gameControllerRef.current) {
        gameControllerRef.current.reset();
        gameControllerRef.current = null;
      }
    };
  }, [initializeController]);

  // Computed values
  const gameState = gameSession?.state || null;
  const isCurrentDrawer = Boolean(
    currentPlayerId && gameSession?.currentDrawer?.id === currentPlayerId
  );

  return {
    gameSession,
    gameState,
    isLoading,
    error,
    isCurrentDrawer,
    initializeGame,
    startGame,
    submitGuess,
    resetGame,
  };
};
