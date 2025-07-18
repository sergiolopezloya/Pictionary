/**
 * Interface for Rive animation service operations
 * Provides clean separation between animation logic and app logic
 */

import { AnimationState, GameState } from '../types';

/**
 * Core animation service interface for managing Rive animations
 */
export interface IAnimationService {
  /**
   * Initializes the animation service with the specified Rive file
   * @param riveFileUrl - URL or path to the Rive animation file
   * @returns Promise resolving when initialization is complete
   */
  initialize(riveFileUrl: string): Promise<void>;

  /**
   * Plays an animation based on the current game state
   * @param gameState - Current state of the game
   * @returns Promise resolving when animation starts
   */
  playAnimationForState(gameState: GameState): Promise<void>;

  /**
   * Sets input values for the Rive state machine
   * @param inputName - Name of the input parameter
   * @param value - Value to set (boolean, number, or string)
   * @returns Promise resolving when input is set
   */
  setInput(inputName: string, value: boolean | number | string): Promise<void>;

  /**
   * Triggers a specific animation trigger
   * @param triggerName - Name of the trigger to fire
   * @returns Promise resolving when trigger is fired
   */
  fireTrigger(triggerName: string): Promise<void>;

  /**
   * Gets the current state of the animation
   * @returns Current animation state
   */
  getCurrentState(): AnimationState | null;

  /**
   * Pauses the current animation
   */
  pause(): void;

  /**
   * Resumes the paused animation
   */
  resume(): void;

  /**
   * Stops the current animation and resets to initial state
   */
  stop(): void;

  /**
   * Checks if an animation is currently playing
   * @returns Whether an animation is playing
   */
  isPlaying(): boolean;
}

/**
 * Interface for animation event handling
 */
export interface IAnimationEventHandler {
  /**
   * Called when an animation starts playing
   * @param animationName - Name of the animation that started
   */
  onAnimationStart(animationName: string): void;

  /**
   * Called when an animation completes
   * @param animationName - Name of the animation that completed
   */
  onAnimationComplete(animationName: string): void;

  /**
   * Called when an animation loops
   * @param animationName - Name of the animation that looped
   */
  onAnimationLoop(animationName: string): void;

  /**
   * Called when a state machine state changes
   * @param stateName - Name of the new state
   */
  onStateChange(stateName: string): void;
}

/**
 * Interface for managing multiple animation instances
 */
export interface IAnimationManager {
  /**
   * Creates a new animation instance
   * @param instanceId - Unique identifier for the animation instance
   * @param riveFileUrl - URL or path to the Rive animation file
   * @returns Promise resolving to the created animation service
   */
  createInstance(instanceId: string, riveFileUrl: string): Promise<IAnimationService>;

  /**
   * Gets an existing animation instance
   * @param instanceId - Unique identifier for the animation instance
   * @returns Animation service instance or null if not found
   */
  getInstance(instanceId: string): IAnimationService | null;

  /**
   * Removes an animation instance and cleans up resources
   * @param instanceId - Unique identifier for the animation instance
   */
  removeInstance(instanceId: string): void;

  /**
   * Gets all active animation instances
   * @returns Map of instance IDs to animation services
   */
  getAllInstances(): Map<string, IAnimationService>;

  /**
   * Pauses all active animations
   */
  pauseAll(): void;

  /**
   * Resumes all paused animations
   */
  resumeAll(): void;

  /**
   * Stops all animations and cleans up resources
   */
  stopAll(): void;

  /**
   * Clears all instances and stops all animations
   */
  clear(): void;
}
