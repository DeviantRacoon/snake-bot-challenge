import type { IInputController, InputCallback, Direction, Position } from './types';
import type { SnakeGame } from './SnakeGame';

export interface OverlayPixel extends Position {
  color?: string;
}

/**
 * AI / Bot Controller for SnakeGame.
 * Implementa IInputController para juego autónomo.
 * Permite renderizar overlays de píxeles/ruta en el tablero.
 */
export class AIController implements IInputController {
  private game?: SnakeGame;
  private onInput: InputCallback | null = null;
  private debugPixels: Map<string, string> = new Map();
  private intelligent_route: Position[] = []

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
    this.onInput = onInput;
  }

  /**
   * Pinta un pixel en las coordenadas dadas con el color especificado.
   * Por defecto usa un color translúcido de ruta (#0f380f66 o el que le indiques).
   */
  setPixel(x: number, y: number, color: string = 'rgba(15, 56, 15, 0.45)'): void {
    this.debugPixels.set(`${x},${y}`, color);
  }

  /**
   * Pinta un conjunto o ruta de píxeles/posiciones de una sola vez.
   */
  setPath(positions: (Position | OverlayPixel)[], defaultColor: string = 'rgba(15, 56, 15, 0.45)'): void {
    positions.forEach((pos) => {
      const color = 'color' in pos && pos.color ? pos.color : defaultColor;
      this.setPixel(pos.x, pos.y, color);
    });
  }

  /**
   * Limpia un píxel específico.
   */
  clearPixel(x: number, y: number): void {
    this.debugPixels.delete(`${x},${y}`);
  }

  /**
   * Limpia todos los píxeles/rutas visuales pintados.
   */
  clearPixels(): void {
    this.debugPixels.clear();
  }

  /**
   * Obtiene el mapa de píxeles pintados.
   */
  getPixels(): Map<string, string> {
    return this.debugPixels;
  }

  /**
   * Se ejecuta en cada tick/update del SnakeGame.
   * Aquí irá la lógica de pathfinding/decisión de tu bot.
   */
  step(): void {
    if (!this.game || !this.onInput) return;
    const { snake, food } = this.game;
    const current_position: Position = { x: snake[0].x, y: snake[0].y }

    if (this.game.score === 0 && snake.length === 3 && snake[0].x === 10) {
      this.intelligent_route = [];
      this.clearPixels();
    }

    if (this.intelligent_route.length === 0) {
      let { x, y } = snake[0];

      while (x !== food.x || y !== food.y) {
        if (x !== food.x) {
          x += Math.sign(food.x - x);
        } else if (y !== food.y) {
          y += Math.sign(food.y - y);
        }

        this.intelligent_route.push({ x, y });
      }

      this.setPath(this.intelligent_route, '#c40e0eff');
    }

    const next_position = this.intelligent_route.shift();

    if (!next_position) return;

    this.clearPixel(next_position.x, next_position.y);

    const dx = next_position.x - current_position.x;
    const dy = next_position.y - current_position.y;

    if (dx === 0 && dy === 0) {
      console.warn("Posición duplicada");
      return;
    }

    if (Math.abs(dx) + Math.abs(dy) !== 1) {
      console.warn("La siguiente posición no es adyacente");
      return;
    }

    if (dx === -1) {
      this.emitDirection("LEFT");
    } else if (dx === 1) {
      this.emitDirection("RIGHT");
    } else if (dy === -1) {
      this.emitDirection("UP");
    } else if (dy === 1) {
      this.emitDirection("DOWN");
    }
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
    this.debugPixels.clear();
  }
}
