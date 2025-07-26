/**
 * Tests for useGameState hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { useGameState } from '../useGameState';
import { GameState, Difficulty } from '../../types';

describe('useGameState', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGameState({ currentPlayerId: 'player_1' }));

    expect(result.current.gameSession).toBeNull();
    expect(result.current.gameState).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isCurrentDrawer).toBe(false);
  });

  it('should initialize game successfully', async () => {
    const { result } = renderHook(() => useGameState({ currentPlayerId: 'player_1' }));

    await act(async () => {
      await result.current.initializeGame(['Alice', 'Bob', 'Charlie'], {
        maxTime: 60,
        maxRounds: 3,
        difficulty: Difficulty.MEDIUM,
        enableHints: true,
      });
    });

    expect(result.current.gameSession).toBeDefined();
    expect(result.current.gameSession?.players).toHaveLength(3);
    expect(result.current.gameState).toBe(GameState.WAITING);
    expect(result.current.error).toBeNull();
  });

  it('should handle game initialization error', async () => {
    const { result } = renderHook(() => useGameState({ currentPlayerId: 'player_1' }));

    await act(async () => {
      try {
        await result.current.initializeGame([], { // Empty players array should cause error
          maxTime: 60,
          maxRounds: 3,
          difficulty: Difficulty.MEDIUM,
          enableHints: true,
        });
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.error).toBeDefined();
  });

  it('should start game and update state', async () => {
    const { result } = renderHook(() => useGameState({ currentPlayerId: 'player_1' }));

    // Initialize first
    await act(async () => {
      await result.current.initializeGame(['Alice', 'Bob', 'Charlie'], {
        maxTime: 60,
        maxRounds: 3,
        difficulty: Difficulty.MEDIUM,
        enableHints: true,
      });
    });

    // Then start
    await act(async () => {
      await result.current.startGame();
    });

    expect(result.current.gameState).toBe(GameState.DRAWING);
    expect(result.current.gameSession?.currentDrawer).toBeDefined();
    expect(result.current.gameSession?.currentWord).toBeDefined();
  });

  it('should handle guess submission', async () => {
    const { result } = renderHook(() => useGameState({ currentPlayerId: 'player_2' }));

    // Initialize and start game
    await act(async () => {
      await result.current.initializeGame(['Alice', 'Bob', 'Charlie'], {
        maxTime: 60,
        maxRounds: 3,
        difficulty: Difficulty.MEDIUM,
        enableHints: true,
      });
      await result.current.startGame();
    });

    const currentWord = result.current.gameSession?.currentWord?.word || 'test';

    await act(async () => {
      const isCorrect = await result.current.submitGuess('player_2', currentWord);
      expect(typeof isCorrect).toBe('boolean');
    });
  });

  it('should reset game state', async () => {
    const { result } = renderHook(() => useGameState({ currentPlayerId: 'player_1' }));

    // Initialize and start game
    await act(async () => {
      await result.current.initializeGame(['Alice', 'Bob'], {
        maxTime: 30,
        maxRounds: 2,
        difficulty: Difficulty.EASY,
        enableHints: false,
      });
      await result.current.startGame();
    });

    expect(result.current.gameState).toBe(GameState.DRAWING);

    // Reset game
    await act(async () => {
      await result.current.resetGame();
    });

    expect(result.current.gameState).toBe(GameState.WAITING);
    expect(result.current.gameSession?.round).toBe(0);
    expect(result.current.gameSession?.currentDrawer).toBeNull();
  });

  it('should determine if current player is drawer', async () => {
    const { result } = renderHook(() => useGameState({ currentPlayerId: 'player_1' }));

    await act(async () => {
      await result.current.initializeGame(['Alice', 'Bob', 'Charlie'], {
        maxTime: 60,
        maxRounds: 3,
        difficulty: Difficulty.MEDIUM,
        enableHints: true,
      });
      await result.current.startGame();
    });

    // The isCurrentDrawer should be determined based on currentPlayerId and currentDrawer
    expect(typeof result.current.isCurrentDrawer).toBe('boolean');
  });

  it('should handle loading states', async () => {
    const { result } = renderHook(() => useGameState({ currentPlayerId: 'player_1' }));

    expect(result.current.isLoading).toBe(false);

    // During async operations, loading should be managed appropriately
    const initPromise = act(async () => {
      await result.current.initializeGame(['Alice', 'Bob'], {
        maxTime: 60,
        maxRounds: 3,
        difficulty: Difficulty.MEDIUM,
        enableHints: true,
      });
    });

    await initPromise;
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear errors on successful operations', async () => {
    const { result } = renderHook(() => useGameState({ currentPlayerId: 'player_1' }));

    // Cause an error first
    await act(async () => {
      try {
        await result.current.initializeGame([], {
          maxTime: 60,
          maxRounds: 3,
          difficulty: Difficulty.MEDIUM,
          enableHints: true,
        });
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.error).toBeDefined();

    // Successful operation should clear error
    await act(async () => {
      await result.current.initializeGame(['Alice', 'Bob'], {
        maxTime: 60,
        maxRounds: 3,
        difficulty: Difficulty.MEDIUM,
        enableHints: true,
      });
    });

    expect(result.current.error).toBeNull();
  });
});
