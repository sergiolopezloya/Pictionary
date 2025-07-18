/**
 * Timer service implementation for managing game timers
 */

import { ITimerService } from '../interfaces';

/**
 * Interface for timer data
 */
interface TimerData {
  readonly sessionId: string;
  readonly duration: number;
  timeRemaining: number;
  readonly onTick: (timeRemaining: number) => void;
  readonly onComplete: () => void;
  intervalId: NodeJS.Timeout | null;
  isActive: boolean;
}

/**
 * Service for managing game timers
 * Implements ITimerService interface following Dependency Inversion Principle
 */
export class TimerService implements ITimerService {
  private readonly timers: Map<string, TimerData> = new Map();

  /**
   * Starts a timer for the specified duration
   * @param sessionId - Unique identifier for the game session
   * @param duration - Timer duration in seconds
   * @param onTick - Callback function called every second
   * @param onComplete - Callback function called when timer completes
   */
  public startTimer(
    sessionId: string,
    duration: number,
    onTick: (timeRemaining: number) => void,
    onComplete: () => void
  ): void {
    // Stop existing timer if any
    this.stopTimer(sessionId);

    if (duration <= 0) {
      throw new Error('Timer duration must be greater than 0');
    }

    const timerData: TimerData = {
      sessionId,
      duration,
      timeRemaining: duration,
      onTick,
      onComplete,
      intervalId: null,
      isActive: true,
    };

    // Call onTick immediately with initial time
    onTick(duration);

    // Set up interval to tick every second
    const intervalId = setInterval(() => {
      if (!timerData.isActive) {
        return;
      }

      timerData.timeRemaining -= 1;

      if (timerData.timeRemaining <= 0) {
        // Timer completed
        timerData.timeRemaining = 0;
        timerData.isActive = false;

        // Call callbacks
        onTick(0);
        onComplete();

        // Clean up
        this.stopTimer(sessionId);
      } else {
        // Timer still running
        onTick(timerData.timeRemaining);
      }
    }, 1000);

    timerData.intervalId = intervalId;
    this.timers.set(sessionId, timerData);
  }

  /**
   * Stops the timer for the specified session
   * @param sessionId - Unique identifier for the game session
   */
  public stopTimer(sessionId: string): void {
    const timerData = this.timers.get(sessionId);

    if (timerData) {
      timerData.isActive = false;

      if (timerData.intervalId) {
        clearInterval(timerData.intervalId);
      }

      this.timers.delete(sessionId);
    }
  }

  /**
   * Gets the remaining time for the specified session
   * @param sessionId - Unique identifier for the game session
   * @returns Remaining time in seconds, or null if no timer is active
   */
  public getRemainingTime(sessionId: string): number | null {
    const timerData = this.timers.get(sessionId);

    if (timerData && timerData.isActive) {
      return timerData.timeRemaining;
    }

    return null;
  }

  /**
   * Pauses the timer for the specified session
   * @param sessionId - Unique identifier for the game session
   * @returns Whether the timer was successfully paused
   */
  public pauseTimer(sessionId: string): boolean {
    const timerData = this.timers.get(sessionId);

    if (timerData && timerData.isActive && timerData.intervalId) {
      clearInterval(timerData.intervalId);
      timerData.intervalId = null;
      return true;
    }

    return false;
  }

  /**
   * Resumes a paused timer for the specified session
   * @param sessionId - Unique identifier for the game session
   * @returns Whether the timer was successfully resumed
   */
  public resumeTimer(sessionId: string): boolean {
    const timerData = this.timers.get(sessionId);

    if (timerData && timerData.isActive && !timerData.intervalId) {
      // Resume the timer
      const intervalId = setInterval(() => {
        if (!timerData.isActive) {
          return;
        }

        timerData.timeRemaining -= 1;

        if (timerData.timeRemaining <= 0) {
          // Timer completed
          timerData.timeRemaining = 0;
          timerData.isActive = false;

          // Call callbacks
          timerData.onTick(0);
          timerData.onComplete();

          // Clean up
          this.stopTimer(sessionId);
        } else {
          // Timer still running
          timerData.onTick(timerData.timeRemaining);
        }
      }, 1000);

      timerData.intervalId = intervalId;
      return true;
    }

    return false;
  }

  /**
   * Checks if a timer is active for the specified session
   * @param sessionId - Unique identifier for the game session
   * @returns Whether a timer is active
   */
  public isTimerActive(sessionId: string): boolean {
    const timerData = this.timers.get(sessionId);
    return timerData ? timerData.isActive : false;
  }

  /**
   * Gets all active timer session IDs
   * @returns Array of session IDs with active timers
   */
  public getActiveTimerSessions(): string[] {
    const activeSessions: string[] = [];

    for (const [sessionId, timerData] of this.timers.entries()) {
      if (timerData.isActive) {
        activeSessions.push(sessionId);
      }
    }

    return activeSessions;
  }

  /**
   * Stops all active timers
   */
  public stopAllTimers(): void {
    const sessionIds = Array.from(this.timers.keys());

    for (const sessionId of sessionIds) {
      this.stopTimer(sessionId);
    }
  }

  /**
   * Gets timer statistics for debugging
   * @returns Object containing timer statistics
   */
  public getTimerStats(): { activeCount: number; totalCount: number } {
    const activeCount = this.getActiveTimerSessions().length;
    const totalCount = this.timers.size;

    return { activeCount, totalCount };
  }
}
