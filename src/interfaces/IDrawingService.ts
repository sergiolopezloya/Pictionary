/**
 * Interface for drawing service operations
 * Manages canvas drawing functionality and stroke data
 */

import { DrawingStroke, Point } from '../types';

/**
 * Core drawing service interface for managing canvas operations
 */
export interface IDrawingService {
  /**
   * Initializes the drawing canvas with specified dimensions
   * @param width - Canvas width in pixels
   * @param height - Canvas height in pixels
   * @returns Promise resolving when canvas is initialized
   */
  initializeCanvas(width: number, height: number): Promise<void>;

  /**
   * Starts a new drawing stroke
   * @param startPoint - Initial point of the stroke
   * @param color - Stroke color
   * @param width - Stroke width
   * @returns Unique identifier for the stroke
   */
  startStroke(startPoint: Point, color: string, width: number): string;

  /**
   * Adds a point to the current stroke
   * @param strokeId - Unique identifier for the stroke
   * @param point - Point to add to the stroke
   */
  addPointToStroke(strokeId: string, point: Point): void;

  /**
   * Ends the current stroke
   * @param strokeId - Unique identifier for the stroke
   * @returns The completed stroke data
   */
  endStroke(strokeId: string): DrawingStroke;

  /**
   * Clears the entire canvas
   */
  clearCanvas(): void;

  /**
   * Undoes the last stroke
   * @returns The stroke that was undone, or null if no strokes to undo
   */
  undoLastStroke(): DrawingStroke | null;

  /**
   * Redoes the last undone stroke
   * @returns The stroke that was redone, or null if no strokes to redo
   */
  redoStroke(): DrawingStroke | null;

  /**
   * Gets all strokes currently on the canvas
   * @returns Array of all drawing strokes
   */
  getAllStrokes(): DrawingStroke[];

  /**
   * Replays all strokes on the canvas
   * @param strokes - Array of strokes to replay
   * @param animationSpeed - Speed multiplier for replay animation
   */
  replayStrokes(strokes: DrawingStroke[], animationSpeed?: number): void;
}

/**
 * Interface for drawing tool management
 */
export interface IDrawingToolService {
  /**
   * Sets the current drawing color
   * @param color - Color in hex format (e.g., "#FF0000")
   */
  setColor(color: string): void;

  /**
   * Sets the current brush width
   * @param width - Brush width in pixels
   */
  setBrushWidth(width: number): void;

  /**
   * Gets the current drawing color
   * @returns Current color in hex format
   */
  getCurrentColor(): string;

  /**
   * Gets the current brush width
   * @returns Current brush width in pixels
   */
  getCurrentBrushWidth(): number;

  /**
   * Gets available color palette
   * @returns Array of available colors
   */
  getColorPalette(): string[];

  /**
   * Gets available brush sizes
   * @returns Array of available brush widths
   */
  getBrushSizes(): number[];
}

/**
 * Interface for drawing event handling
 */
export interface IDrawingEventHandler {
  /**
   * Called when a stroke starts
   * @param strokeId - Unique identifier for the stroke
   * @param startPoint - Initial point of the stroke
   */
  onStrokeStart(strokeId: string, startPoint: Point): void;

  /**
   * Called when a point is added to a stroke
   * @param strokeId - Unique identifier for the stroke
   * @param point - Point that was added
   */
  onStrokeUpdate(strokeId: string, point: Point): void;

  /**
   * Called when a stroke ends
   * @param stroke - The completed stroke data
   */
  onStrokeEnd(stroke: DrawingStroke): void;

  /**
   * Called when the canvas is cleared
   */
  onCanvasClear(): void;

  /**
   * Called when an undo operation is performed
   * @param undoneStroke - The stroke that was undone
   */
  onUndo(undoneStroke: DrawingStroke): void;

  /**
   * Called when a redo operation is performed
   * @param redoneStroke - The stroke that was redone
   */
  onRedo(redoneStroke: DrawingStroke): void;
}

/**
 * Interface for canvas state management
 */
export interface ICanvasStateService {
  /**
   * Saves the current canvas state
   * @returns Unique identifier for the saved state
   */
  saveState(): string;

  /**
   * Restores a previously saved canvas state
   * @param stateId - Unique identifier for the state to restore
   * @returns Whether the state was successfully restored
   */
  restoreState(stateId: string): boolean;

  /**
   * Gets all saved states
   * @returns Array of state identifiers
   */
  getSavedStates(): string[];

  /**
   * Removes a saved state
   * @param stateId - Unique identifier for the state to remove
   */
  removeSavedState(stateId: string): void;

  /**
   * Clears all saved states
   */
  clearSavedStates(): void;
}
