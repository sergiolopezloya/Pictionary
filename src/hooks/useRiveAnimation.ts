/**
 * Custom hook for managing Rive animations
 * Provides clean separation between animation logic and components
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameState } from '../types';
import { IAnimationService, IAnimationEventHandler } from '../interfaces';
import { ServiceFactory } from '../services';

/**
 * Animation state interface
 */
interface AnimationState {
  isReady: boolean;
  isPlaying: boolean;
  currentState: GameState | null;
  error: string | null;
}

/**
 * Hook options interface
 */
interface UseRiveAnimationOptions {
  /** URL or path to the Rive animation file */
  riveFileUrl: string;
  /** Whether to auto-initialize the animation */
  autoInitialize?: boolean;
  /** Event handler for animation events */
  eventHandler?: IAnimationEventHandler;
}

/**
 * Return type for the useRiveAnimation hook
 */
interface UseRiveAnimationReturn {
  /** Current animation state */
  animationState: AnimationState;
  /** Animation service instance */
  animationService: IAnimationService | null;
  /** Function to play animation for a specific game state */
  playAnimationForState: (gameState: GameState) => Promise<void>;
  /** Function to set animation input */
  setAnimationInput: (inputName: string, value: boolean | number | string) => Promise<void>;
  /** Function to fire animation trigger */
  fireAnimationTrigger: (triggerName: string) => Promise<void>;
  /** Function to pause animation */
  pauseAnimation: () => void;
  /** Function to resume animation */
  resumeAnimation: () => void;
  /** Function to stop animation */
  stopAnimation: () => void;
  /** Function to initialize animation */
  initializeAnimation: () => Promise<void>;
}

/**
 * Custom hook for managing Rive animations in the Pictionary game
 *
 * @param options - Hook configuration options
 * @returns Animation state and control functions
 *
 * @example
 * ```tsx
 * const {
 *   animationState,
 *   playAnimationForState,
 *   setAnimationInput
 * } = useRiveAnimation({
 *   riveFileUrl: 'https://example.com/game-animations.riv',
 *   autoInitialize: true,
 *   eventHandler: myEventHandler
 * });
 * ```
 */
export const useRiveAnimation = (options: UseRiveAnimationOptions): UseRiveAnimationReturn => {
  const { riveFileUrl, autoInitialize = true, eventHandler } = options;

  const [animationState, setAnimationState] = useState<AnimationState>({
    isReady: false,
    isPlaying: false,
    currentState: null,
    error: null,
  });

  const animationServiceRef = useRef<IAnimationService | null>(null);
  const serviceFactory = ServiceFactory.getInstance();

  /**
   * Updates the animation state
   * @param updates - Partial state updates
   */
  const updateAnimationState = useCallback((updates: Partial<AnimationState>): void => {
    setAnimationState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Initializes the animation service
   */
  const initializeAnimation = useCallback(async (): Promise<void> => {
    try {
      updateAnimationState({ error: null });

      // Create animation service instance
      const animationService = serviceFactory.createAnimationService();

      // Set event handler if provided
      if (eventHandler && 'setEventHandler' in animationService) {
        (animationService as any).setEventHandler(eventHandler);
      }

      // Initialize with Rive file
      await animationService.initialize(riveFileUrl);

      animationServiceRef.current = animationService;

      updateAnimationState({
        isReady: true,
        error: null,
      });

      console.log('Animation service initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown animation error';
      updateAnimationState({
        isReady: false,
        error: errorMessage,
      });
      console.error('Failed to initialize animation:', error);
    }
  }, [riveFileUrl, eventHandler, serviceFactory, updateAnimationState]);

  /**
   * Plays animation for a specific game state
   * @param gameState - Game state to animate
   */
  const playAnimationForState = useCallback(
    async (gameState: GameState): Promise<void> => {
      if (!animationServiceRef.current || !animationState.isReady) {
        console.warn('Animation service not ready');
        return;
      }

      try {
        await animationServiceRef.current.playAnimationForState(gameState);

        updateAnimationState({
          isPlaying: true,
          currentState: gameState,
          error: null,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Animation playback error';
        updateAnimationState({ error: errorMessage });
        console.error('Failed to play animation for state:', gameState, error);
      }
    },
    [animationState.isReady, updateAnimationState]
  );

  /**
   * Sets an animation input value
   * @param inputName - Name of the input
   * @param value - Value to set
   */
  const setAnimationInput = useCallback(
    async (inputName: string, value: boolean | number | string): Promise<void> => {
      if (!animationServiceRef.current || !animationState.isReady) {
        console.warn('Animation service not ready');
        return;
      }

      try {
        await animationServiceRef.current.setInput(inputName, value);
        updateAnimationState({ error: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Input setting error';
        updateAnimationState({ error: errorMessage });
        console.error('Failed to set animation input:', inputName, error);
      }
    },
    [animationState.isReady, updateAnimationState]
  );

  /**
   * Fires an animation trigger
   * @param triggerName - Name of the trigger
   */
  const fireAnimationTrigger = useCallback(
    async (triggerName: string): Promise<void> => {
      if (!animationServiceRef.current || !animationState.isReady) {
        console.warn('Animation service not ready');
        return;
      }

      try {
        await animationServiceRef.current.fireTrigger(triggerName);
        updateAnimationState({ error: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Trigger firing error';
        updateAnimationState({ error: errorMessage });
        console.error('Failed to fire animation trigger:', triggerName, error);
      }
    },
    [animationState.isReady, updateAnimationState]
  );

  /**
   * Pauses the animation
   */
  const pauseAnimation = useCallback((): void => {
    if (!animationServiceRef.current) {
      return;
    }

    animationServiceRef.current.pause();
    updateAnimationState({ isPlaying: false });
  }, [updateAnimationState]);

  /**
   * Resumes the animation
   */
  const resumeAnimation = useCallback((): void => {
    if (!animationServiceRef.current) {
      return;
    }

    animationServiceRef.current.resume();
    updateAnimationState({ isPlaying: true });
  }, [updateAnimationState]);

  /**
   * Stops the animation
   */
  const stopAnimation = useCallback((): void => {
    if (!animationServiceRef.current) {
      return;
    }

    animationServiceRef.current.stop();
    updateAnimationState({
      isPlaying: false,
      currentState: null,
    });
  }, [updateAnimationState]);

  // Auto-initialize effect
  useEffect(() => {
    if (autoInitialize && riveFileUrl && !animationState.isReady && !animationState.error) {
      initializeAnimation();
    }
  }, [
    autoInitialize,
    riveFileUrl,
    animationState.isReady,
    animationState.error,
    initializeAnimation,
  ]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationServiceRef.current) {
        animationServiceRef.current.stop();
        animationServiceRef.current = null;
      }
    };
  }, []);

  return {
    animationState,
    animationService: animationServiceRef.current,
    playAnimationForState,
    setAnimationInput,
    fireAnimationTrigger,
    pauseAnimation,
    resumeAnimation,
    stopAnimation,
    initializeAnimation,
  };
};
