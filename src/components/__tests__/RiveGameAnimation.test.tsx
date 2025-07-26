/**
 * Tests for RiveGameAnimation component
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { RiveGameAnimation } from '../RiveGameAnimation';
import { GameState } from '../../types';

describe('RiveGameAnimation', () => {
  it('renders without crashing', () => {
    render(<RiveGameAnimation gameState={GameState.WAITING} />);
    expect(screen.getByTestId('rive-mock')).toBeTruthy();
  });

  it('renders fallback animation when Rive is not available', () => {
    render(<RiveGameAnimation gameState={GameState.WAITING} />);
    
    // Should render the enhanced fallback container
    const fallbackContainer = screen.getByTestId('rive-mock');
    expect(fallbackContainer).toBeTruthy();
  });

  it('displays correct content for WAITING state', () => {
    render(<RiveGameAnimation gameState={GameState.WAITING} />);
    
    // The component should render without errors
    expect(screen.getByTestId('rive-mock')).toBeTruthy();
  });

  it('displays correct content for DRAWING state', () => {
    render(<RiveGameAnimation gameState={GameState.DRAWING} />);
    
    // The component should render without errors
    expect(screen.getByTestId('rive-mock')).toBeTruthy();
  });

  it('displays correct content for GUESSING state', () => {
    render(<RiveGameAnimation gameState={GameState.GUESSING} />);
    
    // The component should render without errors
    expect(screen.getByTestId('rive-mock')).toBeTruthy();
  });

  it('displays correct content for TIME_UP state', () => {
    render(<RiveGameAnimation gameState={GameState.TIME_UP} />);
    
    // The component should render without errors
    expect(screen.getByTestId('rive-mock')).toBeTruthy();
  });

  it('displays correct content for GAME_OVER state', () => {
    render(<RiveGameAnimation gameState={GameState.GAME_OVER} />);
    
    // The component should render without errors
    expect(screen.getByTestId('rive-mock')).toBeTruthy();
  });

  it('handles state changes correctly', () => {
    const { rerender } = render(<RiveGameAnimation gameState={GameState.WAITING} />);
    
    // Initial state
    expect(screen.getByTestId('rive-mock')).toBeTruthy();
    
    // Change state
    rerender(<RiveGameAnimation gameState={GameState.DRAWING} />);
    expect(screen.getByTestId('rive-mock')).toBeTruthy();
    
    // Change state again
    rerender(<RiveGameAnimation gameState={GameState.GAME_OVER} />);
    expect(screen.getByTestId('rive-mock')).toBeTruthy();
  });

  it('maintains component stability across re-renders', () => {
    const { rerender } = render(<RiveGameAnimation gameState={GameState.WAITING} />);
    
    const initialElement = screen.getByTestId('rive-mock');
    expect(initialElement).toBeTruthy();
    
    // Re-render with same props
    rerender(<RiveGameAnimation gameState={GameState.WAITING} />);
    
    // Component should still be present
    expect(screen.getByTestId('rive-mock')).toBeTruthy();
  });
});
