import type { IInputController, InputCallback, Direction } from './types';

export class KeyboardController implements IInputController {
  private handler: ((e: KeyboardEvent) => void) | null = null;

  init(onInput: InputCallback): void {
    this.handler = (e: KeyboardEvent) => {
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
        // Prevenir scroll en navegador con flechas
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
          e.preventDefault();
        }
        onInput(dir);
      }
    };

    window.addEventListener('keydown', this.handler);
  }

  destroy(): void {
    if (this.handler) {
      window.removeEventListener('keydown', this.handler);
      this.handler = null;
    }
  }
}
