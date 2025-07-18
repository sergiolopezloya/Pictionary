/**
 * Service factory for dependency injection
 * Implements Factory pattern for service creation
 */

import {
  IGameService,
  IWordService,
  ITimerService,
  IAnimationService,
  IAnimationManager,
} from '../interfaces';

import {
  GameService,
  WordService,
  TimerService,
  AnimationService,
  AnimationManager,
} from './index';

/**
 * Factory class for creating and managing service instances
 * Provides centralized dependency injection and service lifecycle management
 */
export class ServiceFactory {
  private static instance: ServiceFactory | null = null;

  // Service instances (singletons)
  private wordService: IWordService | null = null;
  private timerService: ITimerService | null = null;
  private gameService: IGameService | null = null;
  private animationManager: IAnimationManager | null = null;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Gets the singleton instance of the service factory
   * @returns ServiceFactory instance
   */
  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  /**
   * Gets or creates the word service instance
   * @returns IWordService implementation
   */
  public getWordService(): IWordService {
    if (!this.wordService) {
      this.wordService = new WordService();
    }
    return this.wordService;
  }

  /**
   * Gets or creates the timer service instance
   * @returns ITimerService implementation
   */
  public getTimerService(): ITimerService {
    if (!this.timerService) {
      this.timerService = new TimerService();
    }
    return this.timerService;
  }

  /**
   * Gets or creates the game service instance
   * @returns IGameService implementation
   */
  public getGameService(): IGameService {
    if (!this.gameService) {
      // Inject dependencies
      const wordService = this.getWordService();
      const timerService = this.getTimerService();

      this.gameService = new GameService(wordService, timerService);
    }
    return this.gameService;
  }

  /**
   * Gets or creates the animation manager instance
   * @returns IAnimationManager implementation
   */
  public getAnimationManager(): IAnimationManager {
    if (!this.animationManager) {
      this.animationManager = new AnimationManager();
    }
    return this.animationManager;
  }

  /**
   * Creates a new animation service instance
   * Note: Animation services are not singletons as we may need multiple instances
   * @returns IAnimationService implementation
   */
  public createAnimationService(): IAnimationService {
    return new AnimationService();
  }

  /**
   * Resets all service instances (useful for testing)
   */
  public reset(): void {
    // Stop any active timers
    if (this.timerService) {
      this.timerService.stopAllTimers();
    }

    // Stop all animations
    if (this.animationManager) {
      this.animationManager.stopAll();
    }

    // Clear all instances
    this.wordService = null;
    this.timerService = null;
    this.gameService = null;
    this.animationManager = null;
  }

  /**
   * Gets all active service instances
   * @returns Object containing all active services
   */
  public getActiveServices(): {
    wordService: IWordService | null;
    timerService: ITimerService | null;
    gameService: IGameService | null;
    animationManager: IAnimationManager | null;
  } {
    return {
      wordService: this.wordService,
      timerService: this.timerService,
      gameService: this.gameService,
      animationManager: this.animationManager,
    };
  }

  /**
   * Checks if all core services are initialized
   * @returns Whether all core services are ready
   */
  public areServicesReady(): boolean {
    return !!(this.wordService && this.timerService && this.gameService && this.animationManager);
  }

  /**
   * Initializes all core services
   * @returns Promise resolving when all services are initialized
   */
  public async initializeAllServices(): Promise<void> {
    try {
      // Initialize services in dependency order
      this.getWordService();
      this.getTimerService();
      this.getGameService();
      this.getAnimationManager();

      console.log('All services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize services:', error);
      throw error;
    }
  }

  /**
   * Performs cleanup for all services
   * @returns Promise resolving when cleanup is complete
   */
  public async cleanup(): Promise<void> {
    try {
      // Stop timers
      if (this.timerService) {
        this.timerService.stopAllTimers();
      }

      // Stop animations
      if (this.animationManager) {
        this.animationManager.stopAll();
        this.animationManager.clear();
      }

      console.log('Service cleanup completed');
    } catch (error) {
      console.error('Error during service cleanup:', error);
      throw error;
    }
  }

  /**
   * Gets service health status
   * @returns Object containing health information for each service
   */
  public getServiceHealth(): {
    wordService: boolean;
    timerService: boolean;
    gameService: boolean;
    animationManager: boolean;
  } {
    return {
      wordService: !!this.wordService,
      timerService: !!this.timerService,
      gameService: !!this.gameService,
      animationManager: !!this.animationManager,
    };
  }
}
