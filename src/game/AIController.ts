import type { IInputController, InputCallback } from './types';
import type { SnakeGame } from './SnakeGame';

/**
 * AI / Bot Controller for SnakeGame.
 * Implements IInputController interface for autonomous gameplay.
 * (NOT YET IMPLEMENTED)
 */
export class AIController implements IInputController {
  protected game?: SnakeGame;

  constructor(game?: SnakeGame) {
    this.game = game;
  }

  setGame(game: SnakeGame) {
    this.game = game;
  }

  getGame(): SnakeGame | undefined {
    return this.game;
  }

  init(_onInput: InputCallback): void {
    // NOT YET IMPLEMENTED
    console.warn('[AIController] Not yet implemented. Placeholder for future bot/AI logic.');
  }

  destroy(): void {
    // NOT YET IMPLEMENTED
  }
}
