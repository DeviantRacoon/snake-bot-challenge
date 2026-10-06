import type { IInputController, InputCallback, Direction } from './types';
import type { SnakeGame } from './SnakeGame';

/**
 * AI / Bot Controller for SnakeGame.
 * Implementa IInputController para juego autónomo.
 * Actualmente sin lógica: listo para que implementes el algoritmo del reto.
 */
export class AIController implements IInputController {
  private game?: SnakeGame;
  private onInput: InputCallback | null = null;

  constructor(game?: SnakeGame) {
    this.game = game;
  }

  setGame(game: SnakeGame) {
    this.game = game;
  }

  getGame(): SnakeGame | undefined {
    return this.game;
  }

  init(onInput: InputCallback): void {
    console.warn('[AIController] Not yet implemented. Placeholder for future bot/AI logic.');
    this.onInput = onInput;
  }

  /**
   * Se ejecuta en cada tick/update del SnakeGame.
   * Aquí irá la lógica de pathfinding/decisión de tu bot.
   */
  step(): void {
    if (!this.game || !this.onInput) return;

    // TODO: Implementar algoritmo del reto (BFS, A*, Ciclo Hamiltoniano, etc.)
    // Cuando decidas la siguiente dirección, llama a:
    // this.emitDirection(nextDir);
  }

  protected emitDirection(dir: Direction): void {
    const el = document.querySelector<HTMLElement>(`[data-dir="${dir}"]`);
    if (el) {
      el.classList.add('is-pressed');
      setTimeout(() => el.classList.remove('is-pressed'), 120);
    }
    this.onInput?.(dir);
  }

  destroy(): void {
    this.onInput = null;
  }
}
