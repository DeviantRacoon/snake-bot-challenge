import type { IInputController, InputCallback, Direction } from './types';
import type { SnakeGame } from './SnakeGame';

export type InputMode = 'MANUAL' | 'AI';

export class GameController implements IInputController {
  private onInput: InputCallback | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private mode: InputMode = 'MANUAL';
  private game: SnakeGame | null = null;

  constructor(game?: SnakeGame) {
    if (game) this.game = game;
  }

  setGame(game: SnakeGame) {
    this.game = game;
  }

  setMode(mode: InputMode) {
    this.mode = mode;
  }

  getMode(): InputMode {
    return this.mode;
  }

  init(onInput: InputCallback): void {
    this.onInput = onInput;

    // Escucha de teclado global
    this.keyHandler = (e: KeyboardEvent) => {
      if (this.mode === 'AI') return;

      let dir: Direction | null = null;
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          dir = 'UP';
          break;
        case 'ArrowDown':
        case 'KeyS':
          dir = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'KeyA':
          dir = 'LEFT';
          break;
        case 'ArrowRight':
        case 'KeyD':
          dir = 'RIGHT';
          break;
      }

      if (dir) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
          e.preventDefault();
        }
        this.emitDirection(dir);
      }
    };

    window.addEventListener('keydown', this.keyHandler);
  }

  /**
   * Entrada directa (usada por Touch / Botones en pantalla / UI)
   */
  sendDirection(dir: Direction): void {
    if (this.mode === 'AI') return;
    this.emitDirection(dir);
  }

  /**
   * Ejecuta la decisión de la IA si está en modo AI
   */
  stepAI(): void {
    if (this.mode !== 'AI' || !this.game || !this.onInput) return;

    const head = this.game.snake[0];
    const food = this.game.food;
    if (!head || !food) return;

    // Lógica básica de IA hacia la comida
    const currentDir = this.game.direction;
    let nextDir: Direction = currentDir;

    const dx = food.x - head.x;
    const dy = food.y - head.y;

    if (dx !== 0 && currentDir !== 'LEFT' && currentDir !== 'RIGHT') {
      nextDir = dx > 0 ? 'RIGHT' : 'LEFT';
    } else if (dy !== 0 && currentDir !== 'UP' && currentDir !== 'DOWN') {
      nextDir = dy > 0 ? 'DOWN' : 'UP';
    } else if (dx !== 0 && ((currentDir === 'LEFT' && dx > 0) || (currentDir === 'RIGHT' && dx < 0))) {
      nextDir = dy >= 0 ? 'DOWN' : 'UP';
    }

    this.emitDirection(nextDir);
  }

  private triggerActiveVisual(dir: Direction): void {
    const el = document.querySelector<HTMLElement>(`[data-dir="${dir}"]`);
    if (!el) return;

    el.classList.add('is-pressed');
    setTimeout(() => {
      el.classList.remove('is-pressed');
    }, 120);
  }

  private emitDirection(dir: Direction): void {
    this.triggerActiveVisual(dir);
    this.onInput?.(dir);
  }

  destroy(): void {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
    this.onInput = null;
  }
}
