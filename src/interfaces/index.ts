/**
 * Central export file for all service interfaces
 * Provides clean imports throughout the application
 */

// Game service interfaces
export {
  IGameService,
  ITimerService,
  IWordService
} from './IGameService';

// Animation service interfaces
export {
  IAnimationService,
  IAnimationEventHandler,
  IAnimationManager
} from './IAnimationService';

// Drawing service interfaces
export {
  IDrawingService,
  IDrawingToolService,
  IDrawingEventHandler,
  ICanvasStateService
} from './IDrawingService';
