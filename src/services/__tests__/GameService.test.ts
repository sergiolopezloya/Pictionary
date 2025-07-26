/**
 * Tests for GameService
 */

import { GameService } from '../GameService';
import { GameState, Difficulty } from '../../types';

describe('GameService', () => {
  let gameService: GameService;

  beforeEach(() => {
    gameService = new GameService();
  });

  describe('Game Initialization', () => {
    it('should initialize a new game with players', async () => {
      const playerNames = ['Alice', 'Bob', 'Charlie'];
      const config = {
        maxTime: 60,
        maxRounds: 3,
        difficulty: Difficulty.MEDIUM,
        enableHints: true,
      };

      const session = await gameService.initializeGame(playerNames, config);

      expect(session).toBeDefined();
      expect(session.players).toHaveLength(3);
      expect(session.players[0].name).toBe('Alice');
      expect(session.maxTime).toBe(60);
      expect(session.maxRounds).toBe(3);
      expect(session.state).toBe('waiting');
    });

    it('should throw error with empty player list', async () => {
      const config = {
        maxTime: 60,
        maxRounds: 3,
        difficulty: Difficulty.MEDIUM,
        enableHints: true,
      };

      await expect(gameService.initializeGame([], config)).rejects.toThrow();
    });

    it('should throw error with invalid configuration', async () => {
      const playerNames = ['Alice', 'Bob'];
      const config = {
        maxTime: 0, // Invalid
        maxRounds: 3,
        difficulty: Difficulty.MEDIUM,
        enableHints: true,
      };

      await expect(gameService.initializeGame(playerNames, config)).rejects.toThrow();
    });
  });

  describe('Game Flow', () => {
    beforeEach(async () => {
      const playerNames = ['Alice', 'Bob', 'Charlie'];
      const config = {
        maxTime: 60,
        maxRounds: 3,
        difficulty: Difficulty.MEDIUM,
        enableHints: true,
      };
      await gameService.initializeGame(playerNames, config);
    });

    it('should start a game successfully', async () => {
      const result = await gameService.startGame();

      expect(result.success).toBe(true);
      expect(result.gameState).toBe(GameState.DRAWING);
      
      const session = gameService.getCurrentSession();
      expect(session?.currentDrawer).toBeDefined();
      expect(session?.currentWord).toBeDefined();
    });

    it('should handle guess submission', async () => {
      await gameService.startGame();
      const session = gameService.getCurrentSession();
      const currentWord = session?.currentWord?.word || 'test';

      const result = await gameService.submitGuess('player_2', currentWord);

      expect(result.isCorrect).toBe(true);
      expect(result.points).toBeGreaterThan(0);
    });

    it('should handle incorrect guess', async () => {
      await gameService.startGame();

      const result = await gameService.submitGuess('player_2', 'wrongguess');

      expect(result.isCorrect).toBe(false);
      expect(result.points).toBe(0);
    });

    it('should end round when time is up', async () => {
      await gameService.startGame();

      const result = await gameService.endRound();

      expect(result.success).toBe(true);
      expect(result.gameState).toBeDefined();
    });

    it('should reset game to initial state', async () => {
      await gameService.startGame();
      
      const result = await gameService.resetGame();

      expect(result.success).toBe(true);
      expect(result.gameState).toBe(GameState.WAITING);
      
      const session = gameService.getCurrentSession();
      expect(session?.round).toBe(0);
      expect(session?.currentDrawer).toBeNull();
    });
  });

  describe('Game State Management', () => {
    it('should return current game state', () => {
      const state = gameService.getCurrentGameState();
      expect(state).toBe(GameState.WAITING);
    });

    it('should return null session when not initialized', () => {
      const session = gameService.getCurrentSession();
      expect(session).toBeNull();
    });

    it('should handle multiple game sessions', async () => {
      // First game
      await gameService.initializeGame(['Alice', 'Bob'], {
        maxTime: 30,
        maxRounds: 2,
        difficulty: Difficulty.EASY,
        enableHints: false,
      });

      const firstSession = gameService.getCurrentSession();
      expect(firstSession?.maxTime).toBe(30);

      // Reset and start new game
      await gameService.resetGame();
      await gameService.initializeGame(['Charlie', 'Diana'], {
        maxTime: 90,
        maxRounds: 5,
        difficulty: Difficulty.HARD,
        enableHints: true,
      });

      const secondSession = gameService.getCurrentSession();
      expect(secondSession?.maxTime).toBe(90);
      expect(secondSession?.players).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle starting game without initialization', async () => {
      await expect(gameService.startGame()).rejects.toThrow();
    });

    it('should handle guess submission without active game', async () => {
      await expect(gameService.submitGuess('player_1', 'test')).rejects.toThrow();
    });

    it('should handle ending round without active game', async () => {
      await expect(gameService.endRound()).rejects.toThrow();
    });
  });
});
