export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME';

export const DIFFICULTY_SPEEDS: Record<Difficulty, number> = {
  EASY: 110,   // Velocidad actual por defecto
  MEDIUM: 80,
  HARD: 55,
  EXTREME: 35,
};

export type InputCallback = (direction: Direction) => void;

/**
 * Interfaz desacoplada para controladores (teclado, gamepad/joystick, bots, touch, etc.)
 */
export interface IInputController {
  init(onInput: InputCallback): void;
  destroy(): void;
}
