/**
 * Animation manager implementation for managing multiple Rive animation instances
 */

import { IAnimationManager, IAnimationService } from '../interfaces';
import { AnimationService } from './AnimationService';

/**
 * Manager for handling multiple animation instances
 * Implements IAnimationManager interface following Dependency Inversion Principle
 */
export class AnimationManager implements IAnimationManager {
  private readonly instances: Map<string, IAnimationService> = new Map();

  /**
   * Creates a new animation instance
   * @param instanceId - Unique identifier for the animation instance
   * @param riveFileUrl - URL or path to the Rive animation file
   * @returns Promise resolving to the created animation service
   */
  public async createInstance(instanceId: string, riveFileUrl: string): Promise<IAnimationService> {
    if (this.instances.has(instanceId)) {
      throw new Error(`Animation instance already exists: ${instanceId}`);
    }

    try {
      const animationService = new AnimationService();
      await animationService.initialize(riveFileUrl);

      this.instances.set(instanceId, animationService);

      console.log(`Created animation instance: ${instanceId} with file: ${riveFileUrl}`);
      return animationService;
    } catch (error) {
      throw new Error(`Failed to create animation instance ${instanceId}: ${error}`);
    }
  }

  /**
   * Gets an existing animation instance
   * @param instanceId - Unique identifier for the animation instance
   * @returns Animation service instance or null if not found
   */
  public getInstance(instanceId: string): IAnimationService | null {
    return this.instances.get(instanceId) || null;
  }

  /**
   * Removes an animation instance and cleans up resources
   * @param instanceId - Unique identifier for the animation instance
   */
  public removeInstance(instanceId: string): void {
    const instance = this.instances.get(instanceId);

    if (instance) {
      // Stop the animation before removing
      instance.stop();

      // Remove from instances map
      this.instances.delete(instanceId);

      console.log(`Removed animation instance: ${instanceId}`);
    }
  }

  /**
   * Gets all active animation instances
   * @returns Map of instance IDs to animation services
   */
  public getAllInstances(): Map<string, IAnimationService> {
    return new Map(this.instances);
  }

  /**
   * Pauses all active animations
   */
  public pauseAll(): void {
    for (const [instanceId, instance] of this.instances) {
      try {
        instance.pause();
        console.log(`Paused animation instance: ${instanceId}`);
      } catch (error) {
        console.error(`Failed to pause animation instance ${instanceId}:`, error);
      }
    }
  }

  /**
   * Resumes all paused animations
   */
  public resumeAll(): void {
    for (const [instanceId, instance] of this.instances) {
      try {
        instance.resume();
        console.log(`Resumed animation instance: ${instanceId}`);
      } catch (error) {
        console.error(`Failed to resume animation instance ${instanceId}:`, error);
      }
    }
  }

  /**
   * Stops all animations and cleans up resources
   */
  public stopAll(): void {
    for (const [instanceId, instance] of this.instances) {
      try {
        instance.stop();
        console.log(`Stopped animation instance: ${instanceId}`);
      } catch (error) {
        console.error(`Failed to stop animation instance ${instanceId}:`, error);
      }
    }
  }

  /**
   * Gets statistics about the animation manager
   * @returns Object containing manager statistics
   */
  public getStats(): { totalInstances: number; playingInstances: number } {
    const totalInstances = this.instances.size;
    let playingInstances = 0;

    for (const instance of this.instances.values()) {
      if (instance.isPlaying()) {
        playingInstances++;
      }
    }

    return { totalInstances, playingInstances };
  }

  /**
   * Checks if an instance exists
   * @param instanceId - Unique identifier for the animation instance
   * @returns Whether the instance exists
   */
  public hasInstance(instanceId: string): boolean {
    return this.instances.has(instanceId);
  }

  /**
   * Gets all instance IDs
   * @returns Array of instance identifiers
   */
  public getInstanceIds(): string[] {
    return Array.from(this.instances.keys());
  }

  /**
   * Clears all instances and stops all animations
   */
  public clear(): void {
    this.stopAll();
    this.instances.clear();
    console.log('Cleared all animation instances');
  }

  /**
   * Creates multiple instances from a configuration object
   * @param configs - Array of configuration objects with instanceId and riveFileUrl
   * @returns Promise resolving to array of created animation services
   */
  public async createMultipleInstances(
    configs: Array<{ instanceId: string; riveFileUrl: string }>
  ): Promise<IAnimationService[]> {
    const createdInstances: IAnimationService[] = [];
    const errors: string[] = [];

    for (const config of configs) {
      try {
        const instance = await this.createInstance(config.instanceId, config.riveFileUrl);
        createdInstances.push(instance);
      } catch (error) {
        errors.push(`Failed to create instance ${config.instanceId}: ${error}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Some instances failed to create:', errors);
    }

    return createdInstances;
  }

  /**
   * Removes multiple instances
   * @param instanceIds - Array of instance IDs to remove
   */
  public removeMultipleInstances(instanceIds: string[]): void {
    for (const instanceId of instanceIds) {
      this.removeInstance(instanceId);
    }
  }

  /**
   * Gets instances that are currently playing
   * @returns Map of playing instance IDs to animation services
   */
  public getPlayingInstances(): Map<string, IAnimationService> {
    const playingInstances = new Map<string, IAnimationService>();

    for (const [instanceId, instance] of this.instances) {
      if (instance.isPlaying()) {
        playingInstances.set(instanceId, instance);
      }
    }

    return playingInstances;
  }

  /**
   * Executes a function on all instances
   * @param callback - Function to execute on each instance
   */
  public forEachInstance(
    callback: (instance: IAnimationService, instanceId: string) => void
  ): void {
    for (const [instanceId, instance] of this.instances) {
      try {
        callback(instance, instanceId);
      } catch (error) {
        console.error(`Error executing callback on instance ${instanceId}:`, error);
      }
    }
  }
}
