/**
 * Animation service implementation for managing Rive animations
 * Provides clean separation between animation logic and app logic
 */

import { IAnimationService, IAnimationEventHandler } from '../interfaces';
import { AnimationState, GameState } from '../types';

/**
 * Service for managing Rive animations in the Pictionary game
 * Implements IAnimationService interface following Dependency Inversion Principle
 */
export class AnimationService implements IAnimationService {
  private currentState: AnimationState | null = null;
  private isInitialized: boolean = false;
  private eventHandler: IAnimationEventHandler | null = null;
  private animationPlaying: boolean = false;
  private animationPaused: boolean = false;

  // State machine mappings for different game states
  private readonly stateAnimationMap: Map<GameState, string> = new Map([
    [GameState.WAITING, 'WaitingState'],
    [GameState.DRAWING, 'DrawingState'],
    [GameState.GUESSING, 'GuessingState'],
    [GameState.CORRECT_GUESS, 'CorrectGuessState'],
    [GameState.TIME_UP, 'TimeUpState'],
    [GameState.GAME_OVER, 'GameOverState'],
  ]);

  /**
   * Initializes the animation service with the specified Rive file
   * @param riveFileUrl - URL or path to the Rive animation file
   * @returns Promise resolving when initialization is complete
   */
  public async initialize(riveFileUrl: string): Promise<void> {
    if (!riveFileUrl) {
      throw new Error('Rive file URL is required for initialization');
    }

    try {
      // In a real implementation, this would load the Rive file
      // For now, we'll simulate the initialization
      await this.simulateRiveFileLoad(riveFileUrl);

      this.isInitialized = true;

      // Initialize with default state
      this.currentState = {
        stateMachine: 'GameStateMachine',
        inputs: {},
      };

      console.log(`Animation service initialized with file: ${riveFileUrl}`);
    } catch (error) {
      throw new Error(`Failed to initialize animation service: ${error}`);
    }
  }

  /**
   * Plays an animation based on the current game state
   * @param gameState - Current state of the game
   * @returns Promise resolving when animation starts
   */
  public async playAnimationForState(gameState: GameState): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Animation service not initialized');
    }

    const animationName = this.stateAnimationMap.get(gameState);
    if (!animationName) {
      throw new Error(`No animation mapped for game state: ${gameState}`);
    }

    try {
      // Update current state
      this.currentState = {
        stateMachine: 'GameStateMachine',
        inputs: {
          currentState: animationName,
          isPlaying: true,
        },
      };

      this.animationPlaying = true;
      this.animationPaused = false;

      // Notify event handler
      if (this.eventHandler) {
        this.eventHandler.onAnimationStart(animationName);
        this.eventHandler.onStateChange(animationName);
      }

      console.log(`Playing animation for state: ${gameState} -> ${animationName}`);

      // Simulate animation duration
      await this.simulateAnimationPlayback(animationName);
    } catch (error) {
      throw new Error(`Failed to play animation for state ${gameState}: ${error}`);
    }
  }

  /**
   * Sets input values for the Rive state machine
   * @param inputName - Name of the input parameter
   * @param value - Value to set (boolean, number, or string)
   * @returns Promise resolving when input is set
   */
  public async setInput(inputName: string, value: boolean | number | string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Animation service not initialized');
    }

    if (!this.currentState) {
      throw new Error('No current animation state');
    }

    try {
      // Update the input in current state
      this.currentState = {
        ...this.currentState,
        inputs: {
          ...this.currentState.inputs,
          [inputName]: value,
        },
      };

      console.log(`Set animation input: ${inputName} = ${value}`);
    } catch (error) {
      throw new Error(`Failed to set input ${inputName}: ${error}`);
    }
  }

  /**
   * Triggers a specific animation trigger
   * @param triggerName - Name of the trigger to fire
   * @returns Promise resolving when trigger is fired
   */
  public async fireTrigger(triggerName: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Animation service not initialized');
    }

    try {
      // Fire the trigger
      await this.setInput(triggerName, true);

      console.log(`Fired animation trigger: ${triggerName}`);

      // Reset trigger after a brief delay (simulating Rive behavior)
      setTimeout(async () => {
        await this.setInput(triggerName, false);
      }, 100);
    } catch (error) {
      throw new Error(`Failed to fire trigger ${triggerName}: ${error}`);
    }
  }

  /**
   * Gets the current state of the animation
   * @returns Current animation state
   */
  public getCurrentState(): AnimationState | null {
    return this.currentState;
  }

  /**
   * Pauses the current animation
   */
  public pause(): void {
    if (this.animationPlaying && !this.animationPaused) {
      this.animationPaused = true;
      console.log('Animation paused');
    }
  }

  /**
   * Resumes the paused animation
   */
  public resume(): void {
    if (this.animationPlaying && this.animationPaused) {
      this.animationPaused = false;
      console.log('Animation resumed');
    }
  }

  /**
   * Stops the current animation and resets to initial state
   */
  public stop(): void {
    this.animationPlaying = false;
    this.animationPaused = false;

    if (this.currentState) {
      this.currentState = {
        ...this.currentState,
        inputs: {
          ...this.currentState.inputs,
          isPlaying: false,
        },
      };
    }

    console.log('Animation stopped');
  }

  /**
   * Checks if an animation is currently playing
   * @returns Whether an animation is playing
   */
  public isPlaying(): boolean {
    return this.animationPlaying && !this.animationPaused;
  }

  /**
   * Sets the event handler for animation events
   * @param handler - Event handler implementation
   */
  public setEventHandler(handler: IAnimationEventHandler): void {
    this.eventHandler = handler;
  }

  /**
   * Removes the current event handler
   */
  public removeEventHandler(): void {
    this.eventHandler = null;
  }

  /**
   * Gets available animation states
   * @returns Array of available animation state names
   */
  public getAvailableStates(): string[] {
    return Array.from(this.stateAnimationMap.values());
  }

  /**
   * Simulates loading a Rive file (placeholder for actual implementation)
   * @param fileUrl - URL of the Rive file
   * @returns Promise resolving when file is loaded
   * @private
   */
  private async simulateRiveFileLoad(fileUrl: string): Promise<void> {
    return new Promise(resolve => {
      // Simulate loading time
      setTimeout(() => {
        console.log(`Simulated loading of Rive file: ${fileUrl}`);
        resolve();
      }, 500);
    });
  }

  /**
   * Simulates animation playback (placeholder for actual implementation)
   * @param animationName - Name of the animation
   * @returns Promise resolving when animation completes
   * @private
   */
  private async simulateAnimationPlayback(animationName: string): Promise<void> {
    return new Promise(resolve => {
      // Simulate animation duration
      const duration = this.getAnimationDuration(animationName);

      setTimeout(() => {
        if (this.eventHandler) {
          this.eventHandler.onAnimationComplete(animationName);
        }
        resolve();
      }, duration);
    });
  }

  /**
   * Gets the duration for a specific animation
   * @param animationName - Name of the animation
   * @returns Duration in milliseconds
   * @private
   */
  private getAnimationDuration(animationName: string): number {
    // Default durations for different animations
    const durations: Record<string, number> = {
      WaitingState: 2000,
      DrawingState: 1500,
      GuessingState: 1000,
      CorrectGuessState: 3000,
      TimeUpState: 2500,
      GameOverState: 4000,
    };

    return durations[animationName] || 2000;
  }
}
