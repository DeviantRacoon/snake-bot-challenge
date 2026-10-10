import type { Position, Direction, IInputController } from './types';

export class SnakeGame {
  readonly width: number;
  readonly height: number;

  snake: Position[] = [];
  food: Position = { x: 0, y: 0 };
  direction: Direction = 'RIGHT';
  nextDirection: Direction = 'RIGHT';
  score: number = 0;
  highScore: number = 0;
  hasStarted: boolean = false;
  isGameOver: boolean = false;
  isPaused: boolean = false;

  private controller: IInputController;
  private onStateChange?: () => void;

  constructor(
    width: number = 20,
    height: number = 20,
    controller: IInputController,
    onStateChange?: () => void
  ) {
    this.width = width;
    this.height = height;
    this.controller = controller;
    this.onStateChange = onStateChange;

    this.loadHighScore();
    this.reset(false);
    this.setupController();
  }

  private loadHighScore() {
    try {
      const saved = localStorage.getItem('snake_highscore');
      if (saved) this.highScore = parseInt(saved, 10) || 0;
    } catch {
      // localstorage unavailable or disabled
    }
  }

  private saveHighScore() {
    try {
      localStorage.setItem('snake_highscore', this.highScore.toString());
    } catch {
      // ignore
    }
  }

  setController(controller: IInputController) {
    this.controller.destroy();
    this.controller = controller;
    this.setupController();
  }

  getController(): IInputController {
    return this.controller;
  }

  private setupController() {
    this.controller.init((dir: Direction) => {
      this.handleInput(dir);
    });
  }

  private handleInput(newDir: Direction) {
    if (this.isGameOver) return;

    // Impedir retroceso en 180 grados
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    if (opposites[this.direction] !== newDir) {
      this.nextDirection = newDir;
    }
  }

  start() {
    this.hasStarted = true;
    this.isPaused = false;
    this.isGameOver = false;
    this.notify();
  }

  reset(autoStart: boolean = true) {
    const startX = Math.floor(this.width / 2);
    const startY = Math.floor(this.height / 2);

    this.snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
    this.direction = 'RIGHT';
    this.nextDirection = 'RIGHT';
    this.score = 0;
    this.hasStarted = autoStart;
    this.isGameOver = false;
    this.isPaused = false;
    this.spawnFood();
    this.notify();
  }

  spawnFood() {
    const occupied = new Set(this.snake.map(p => `${p.x},${p.y}`));
    const emptyCells: Position[] = [];

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (!occupied.has(`${x},${y}`)) {
          emptyCells.push({ x, y });
        }
      }
    }

    if (emptyCells.length === 0) {
      // Ganó el juego / pantalla completa
      this.isGameOver = true;
      return;
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    this.food = emptyCells[randomIndex];
  }

  update() {
    if (!this.hasStarted || this.isGameOver || this.isPaused) return;

    if ('step' in this.controller && typeof (this.controller as any).step === 'function') {
      (this.controller as any).step();
    }

    this.direction = this.nextDirection;
    const head = this.snake[0];

    const deltas: Record<Direction, Position> = {
      UP: { x: 0, y: -1 },
      DOWN: { x: 0, y: 1 },
      LEFT: { x: -1, y: 0 },
      RIGHT: { x: 1, y: 0 },
    };

    const delta = deltas[this.direction];
    const newHead: Position = {
      x: head.x + delta.x,
      y: head.y + delta.y,
    };

    // Colisión con paredes
    if (
      newHead.x < 0 ||
      newHead.x >= this.width ||
      newHead.y < 0 ||
      newHead.y >= this.height
    ) {
      this.handleGameOver();
      return;
    }

    // Colisión con propio cuerpo (excepto la cola que se moverá a menos que coma)
    const eatsFood = newHead.x === this.food.x && newHead.y === this.food.y;
    const bodyToCheck = eatsFood ? this.snake : this.snake.slice(0, -1);

    if (bodyToCheck.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      this.handleGameOver();
      return;
    }

    // Mover serpiente
    this.snake.unshift(newHead);

    if (eatsFood) {
      this.score += 10;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.saveHighScore();
      }
      this.spawnFood();
    } else {
      this.snake.pop();
    }

    this.notify();
  }

  private handleGameOver() {
    this.isGameOver = true;
    this.notify();
  }

  togglePause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
    this.notify();
  }

  private notify() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }

  destroy() {
    this.controller.destroy();
  }
}
