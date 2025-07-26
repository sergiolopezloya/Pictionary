/**
 * Tests for PictionaryApp component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PictionaryApp } from '../PictionaryApp';

// Mock the useGameState hook
jest.mock('../hooks/useGameState', () => ({
  useGameState: jest.fn(() => ({
    gameSession: null,
    gameState: null,
    isLoading: false,
    error: null,
    isCurrentDrawer: false,
    initializeGame: jest.fn(),
    startGame: jest.fn(),
    submitGuess: jest.fn(),
    resetGame: jest.fn(),
  })),
}));

describe('PictionaryApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders welcome screen when game is not started', () => {
    render(<PictionaryApp />);

    expect(screen.getByText('🎨 Pictionary Game')).toBeTruthy();
    expect(screen.getByText('Draw, guess, and have fun with friends!')).toBeTruthy();
    expect(screen.getByText('Start New Game')).toBeTruthy();
  });

  it('displays game features in welcome screen', () => {
    render(<PictionaryApp />);

    expect(screen.getByText('✨ Interactive Rive animations')).toBeTruthy();
    expect(screen.getByText('⏱️ Real-time timer')).toBeTruthy();
    expect(screen.getByText('🏆 Score tracking')).toBeTruthy();
    expect(screen.getByText('💡 Helpful hints')).toBeTruthy();
  });

  it('shows loading state when game is loading', () => {
    const mockUseGameState = require('../hooks/useGameState').useGameState;
    mockUseGameState.mockReturnValue({
      gameSession: null,
      gameState: null,
      isLoading: true,
      error: null,
      isCurrentDrawer: false,
      initializeGame: jest.fn(),
      startGame: jest.fn(),
      submitGuess: jest.fn(),
      resetGame: jest.fn(),
    });

    render(<PictionaryApp />);

    expect(screen.getByText('🎮 Starting Game...')).toBeTruthy();
    expect(screen.getByText('Setting up players and game configuration')).toBeTruthy();
  });

  it('shows error state when there is an error', () => {
    const mockUseGameState = require('../hooks/useGameState').useGameState;
    mockUseGameState.mockReturnValue({
      gameSession: null,
      gameState: null,
      isLoading: false,
      error: 'Test error message',
      isCurrentDrawer: false,
      initializeGame: jest.fn(),
      startGame: jest.fn(),
      submitGuess: jest.fn(),
      resetGame: jest.fn(),
    });

    render(<PictionaryApp />);

    expect(screen.getByText('❌ Game Error')).toBeTruthy();
    expect(screen.getByText('Test error message')).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('calls initializeGame when start button is pressed', async () => {
    const mockInitializeGame = jest.fn();
    const mockStartGame = jest.fn();
    
    const mockUseGameState = require('../hooks/useGameState').useGameState;
    mockUseGameState.mockReturnValue({
      gameSession: null,
      gameState: null,
      isLoading: false,
      error: null,
      isCurrentDrawer: false,
      initializeGame: mockInitializeGame,
      startGame: mockStartGame,
      submitGuess: jest.fn(),
      resetGame: jest.fn(),
    });

    render(<PictionaryApp />);

    const startButton = screen.getByText('Start New Game');
    fireEvent.press(startButton);

    await waitFor(() => {
      expect(mockInitializeGame).toHaveBeenCalledWith(
        ['Alice', 'Bob', 'Charlie', 'Diana'],
        {
          maxTime: 60,
          maxRounds: 3,
          difficulty: 'medium',
          enableHints: true,
        }
      );
      expect(mockStartGame).toHaveBeenCalled();
    });
  });

  it('renders game interface when game is active', () => {
    const mockGameSession = {
      id: 'test-session',
      players: [
        { id: 'player_1', name: 'Alice', score: 0, isDrawing: false },
        { id: 'player_2', name: 'Bob', score: 0, isDrawing: false },
      ],
      currentDrawer: { id: 'player_1', name: 'Alice', score: 0, isDrawing: true },
      currentWord: { id: 'word_1', word: 'cat', difficulty: 'easy', category: 'animals', hints: ['Pet', 'Meows'] },
      round: 1,
      maxRounds: 3,
      maxTime: 60,
      timeRemaining: 45,
      state: 'drawing',
    };

    const mockUseGameState = require('../hooks/useGameState').useGameState;
    mockUseGameState.mockReturnValue({
      gameSession: mockGameSession,
      gameState: 'drawing',
      isLoading: false,
      error: null,
      isCurrentDrawer: false,
      initializeGame: jest.fn(),
      startGame: jest.fn(),
      submitGuess: jest.fn(),
      resetGame: jest.fn(),
    });

    render(<PictionaryApp />);

    expect(screen.getByText('🎨 Pictionary')).toBeTruthy();
    expect(screen.getByText('R1/3')).toBeTruthy();
    expect(screen.getByText('🎨 Draw Here!')).toBeTruthy();
    expect(screen.getByText('Reset Game')).toBeTruthy();
  });

  it('calls resetGame when reset button is pressed', async () => {
    const mockResetGame = jest.fn();
    
    const mockGameSession = {
      id: 'test-session',
      players: [
        { id: 'player_1', name: 'Alice', score: 0, isDrawing: false },
      ],
      currentDrawer: { id: 'player_1', name: 'Alice', score: 0, isDrawing: true },
      currentWord: { id: 'word_1', word: 'cat', difficulty: 'easy', category: 'animals', hints: [] },
      round: 1,
      maxRounds: 3,
      maxTime: 60,
      timeRemaining: 45,
      state: 'drawing',
    };

    const mockUseGameState = require('../hooks/useGameState').useGameState;
    mockUseGameState.mockReturnValue({
      gameSession: mockGameSession,
      gameState: 'drawing',
      isLoading: false,
      error: null,
      isCurrentDrawer: false,
      initializeGame: jest.fn(),
      startGame: jest.fn(),
      submitGuess: jest.fn(),
      resetGame: mockResetGame,
    });

    render(<PictionaryApp />);

    const resetButton = screen.getByText('Reset Game');
    fireEvent.press(resetButton);

    await waitFor(() => {
      expect(mockResetGame).toHaveBeenCalled();
    });
  });

  it('handles component unmounting gracefully', () => {
    const { unmount } = render(<PictionaryApp />);
    
    expect(() => unmount()).not.toThrow();
  });
});
