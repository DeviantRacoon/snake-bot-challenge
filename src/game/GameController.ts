import type { IInputController, InputCallback, Direction } from './types';

export type InputMode = 'MANUAL' | 'AI';

export class GameController implements IInputController {
  private onInput: InputCallback | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private mode: InputMode = 'MANUAL';

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
