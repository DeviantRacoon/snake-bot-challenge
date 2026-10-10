import { useEffect, useRef, useState, useReducer } from 'react';
import { SnakeGame } from './game/SnakeGame';
import { GameController } from './game/GameController';
import { AIController } from './game/AIController';
import { type Difficulty, type Direction, DIFFICULTY_SPEEDS } from './game/types';
import {
  CaretUp,
  CaretDown,
  CaretLeft,
  CaretRight,
  ArrowsClockwise,
  Robot,
  User,
} from '@phosphor-icons/react';

const DIFFICULTIES: { label: string; value: Difficulty }[] = [
  { label: 'EASY', value: 'EASY' },
  { label: 'MED', value: 'MEDIUM' },
  { label: 'HARD', value: 'HARD' },
  { label: 'PRO', value: 'EXTREME' },
];

export default function App() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [lcdFilter, setLcdFilter] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [useAI, setUseAI] = useState(false);
  const gameRef = useRef<SnakeGame | null>(null);
  const manualControllerRef = useRef<GameController>(new GameController());
  const aiControllerRef = useRef<AIController>(new AIController());

  // Instanciar el juego (POO) y enlazarlo una sola vez
  useEffect(() => {
    const initialController = manualControllerRef.current;
    const game = new SnakeGame(20, 20, initialController, () => {
      forceUpdate();
    });
    aiControllerRef.current.setGame(game);
    gameRef.current = game;

    return () => {
      game.destroy();
    };
  }, []);

  const handleStartGame = () => {
    if (!gameRef.current) return;
    const targetController = useAI ? aiControllerRef.current : manualControllerRef.current;
    gameRef.current.setController(targetController);
    gameRef.current.start();
  };

  const handleDirection = (dir: Direction) => {
    if (!useAI) {
      manualControllerRef.current.sendDirection(dir);
    }
  };

  // Game loop dinámico según la dificultad seleccionada
  useEffect(() => {
    const speed = DIFFICULTY_SPEEDS[difficulty];
    const interval = setInterval(() => {
      gameRef.current?.update();
    }, speed);

    return () => {
      clearInterval(interval);
    };
  }, [difficulty]);

  const game = gameRef.current;
  if (!game) return null;

  return (
    <div className="w-full min-h-dvh sm:h-auto bg-stone-950 sm:flex sm:items-center sm:justify-center sm:p-4 select-none touch-none overflow-hidden">
      
      {/* CUERPO DEL GAME BOY:
          En mobile: h-dvh, w-full, sin bordes ni márgenes redondeados externos, llenando toda la pantalla del teléfono.
          En desktop (sm): tarjeta centrada con bordes y aspecto de consola clásica. */}
      <div className="w-full h-dvh sm:h-auto sm:max-w-[390px] bg-[#c8c7c1] sm:border-4 sm:border-[#9e9c94] sm:rounded-t-3xl sm:rounded-b-[45px] p-3 sm:p-5 sm:shadow-[0_20px_35px_rgba(0,0,0,0.7),inset_2px_2px_4px_rgba(255,255,255,0.7),inset_-3px_-3px_5px_rgba(0,0,0,0.3)] flex flex-col justify-between items-center relative">
        
        {/* Ranuras de ventilación superiores decorativas */}
        <div className="w-full flex justify-between items-center px-2 pt-1 sm:pt-0">
          <div className="flex gap-1.5">
            <div className="w-6 h-1 bg-[#a3a199] rounded-full shadow-inner" />
            <div className="w-6 h-1 bg-[#a3a199] rounded-full shadow-inner" />
          </div>
          <span className="font-arcade text-[7px] sm:text-[8px] text-[#78766e] tracking-widest">
            DOT MATRIX WITH STEREO SOUND
          </span>
        </div>

        {/* MARCO OSCURO DE LA PANTALLA (Bisel gris azulado con líneas roja y azul) */}
        <div className="w-full bg-[#52525b] border-2 border-[#3f3f46] rounded-t-lg rounded-b-[20px] sm:rounded-b-[26px] p-2.5 sm:p-4 shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] flex flex-col items-center relative my-1 sm:my-2">
          
          {/* Indicador LED de Batería y franjas decorativas */}
          <div className="w-full flex items-center justify-between mb-1.5 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-600 shadow-[0_0_6px_#f43f5e] animate-pulse" />
              <span className="font-arcade text-[6px] text-zinc-300">BATTERY</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-[2px] w-6 sm:w-8 bg-[#8b1e3f]" />
              <div className="h-[2px] w-6 sm:w-8 bg-[#1e3a8a]" />
            </div>
          </div>

          {/* PANTALLA LCD GAME BOY (Verde oliva monocromático con pixel dot-matrix) */}
          <div
            className={`w-full max-w-[320px] relative rounded-md border-3 border-[#27272a] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.6)] ${
              lcdFilter ? 'gb-screen' : 'bg-[#9bbc0f]'
            }`}
            style={{ aspectRatio: '1 / 1' }}
          >
            {/* Grilla de juego LCD */}
            <div
              className="w-full h-full grid"
              style={{
                gridTemplateColumns: `repeat(${game.width}, 1fr)`,
                gridTemplateRows: `repeat(${game.height}, 1fr)`,
                backgroundColor: lcdFilter ? '#8b956d' : '#9bbc0f',
              }}
            >
              {(() => {
                const activeController = game.getController();
                const debugPixels = activeController instanceof AIController ? activeController.getPixels() : null;

                return Array.from({ length: game.height }).map((_, y) =>
                  Array.from({ length: game.width }).map((_, x) => {
                    const isHead = game.snake[0]?.x === x && game.snake[0]?.y === y;
                    const isBody = !isHead && game.snake.some((seg) => seg.x === x && seg.y === y);
                    const isFood = game.food.x === x && game.food.y === y;
                    const debugColor = debugPixels?.get(`${x},${y}`);

                    return (
                      <div
                        key={`${x}-${y}`}
                        className="relative flex items-center justify-center"
                      >
                        {/* Overlay visual de IA/Ruta */}
                        {debugColor && !isHead && !isBody && !isFood && (
                          <div
                            className="w-[75%] h-[75%] rounded-[1px] transition-colors"
                            style={{ backgroundColor: debugColor }}
                          />
                        )}
                        {isHead && (
                          <div className="w-full h-full bg-[#0f380f] rounded-[1px] border border-[#306230]" />
                        )}
                        {isBody && (
                          <div className="w-[90%] h-[90%] bg-[#1b4a1b] rounded-[1px]" />
                        )}
                        {isFood && (
                          <div className="w-[80%] h-[80%] bg-[#0f380f] rounded-full animate-pulse border border-[#8b956d]" />
                        )}
                      </div>
                    );
                  })
                );
              })()}
            </div>

            {/* Marcador LCD integrado */}
            <div className="absolute top-1 left-2 right-2 flex justify-between items-center font-arcade text-[8px] text-[#0f380f] pointer-events-none z-10 opacity-80">
              <span>SC:{String(game.score).padStart(3, '0')}</span>
              <span>HI:{String(game.highScore).padStart(3, '0')}</span>
            </div>

            {/* Overlay: Pantalla de START / SETUP */}
            {!game.hasStarted && !game.isGameOver && (
              <div className="absolute inset-0 bg-[#8b956d]/95 z-30 flex flex-col items-center justify-center p-3 text-[#0f380f]">
                <p className="font-arcade text-xs mb-3 text-center tracking-wider font-bold">
                  * SNAKE GB *
                </p>

                {/* Selección de Velocidad */}
                <div className="w-full max-w-[210px] mb-3">
                  <span className="block font-arcade text-[7px] mb-1.5 text-center">
                    SPEED LEVEL
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {DIFFICULTIES.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setDifficulty(d.value)}
                        className={`font-arcade text-[7px] py-1 border border-[#0f380f] cursor-pointer ${
                          difficulty === d.value
                            ? 'bg-[#0f380f] text-[#8b956d] font-bold'
                            : 'bg-transparent text-[#0f380f]'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selector Bot IA */}
                <div
                  onClick={() => setUseAI(!useAI)}
                  className="flex items-center gap-1.5 mb-3 px-2 py-1 border border-[#0f380f] cursor-pointer text-[7px] font-arcade"
                >
                  <span className="w-3 h-3 border border-[#0f380f] flex items-center justify-center font-bold">
                    {useAI ? 'X' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    {useAI ? <Robot size={12} weight="bold" /> : <User size={12} weight="bold" />}
                    AUTOPILOT (BOT)
                  </span>
                </div>

                <button
                  onClick={handleStartGame}
                  className="font-arcade text-[9px] bg-[#0f380f] text-[#8b956d] px-3.5 py-1.5 border border-[#306230] cursor-pointer animate-pulse font-bold tracking-widest shadow-md"
                >
                  ► START
                </button>
              </div>
            )}

            {/* Overlay: GAME OVER */}
            {game.isGameOver && (
              <div className="absolute inset-0 bg-[#8b956d]/90 z-30 flex flex-col items-center justify-center p-3 text-[#0f380f]">
                <p className="font-arcade text-xs mb-2 font-bold animate-pulse">
                  GAME OVER
                </p>
                <p className="font-arcade text-[8px] mb-4">
                  SCORE: {game.score}
                </p>
                <button
                  onClick={() => game.reset()}
                  className="font-arcade text-[8px] bg-[#0f380f] text-[#8b956d] px-2.5 py-1.5 cursor-pointer flex items-center gap-1 border border-[#0f380f]"
                >
                  <ArrowsClockwise size={10} weight="bold" />
                  RETRY
                </button>
              </div>
            )}

            {/* Overlay: PAUSED */}
            {game.isPaused && !game.isGameOver && game.hasStarted && (
              <div className="absolute inset-0 bg-[#8b956d]/85 z-30 flex flex-col items-center justify-center p-3 text-[#0f380f]">
                <p className="font-arcade text-[10px] font-bold mb-2">
                  - PAUSE -
                </p>
                <button
                  onClick={() => game.togglePause()}
                  className="font-arcade text-[8px] bg-[#0f380f] text-[#8b956d] px-2 py-1 cursor-pointer"
                >
                  RESUME
                </button>
              </div>
            )}
          </div>

          {/* Bisel inferior con texto GAME BOY y toggle LCD */}
          <div className="w-full flex justify-between items-center mt-1.5 px-2">
            <span className="font-arcade text-[7px] text-zinc-300 tracking-wider">
              GAME BOY
            </span>
            <button
              onClick={() => setLcdFilter(!lcdFilter)}
              className="font-arcade text-[6px] text-zinc-400 hover:text-zinc-200 border border-zinc-600 px-1.5 py-0.5 rounded cursor-pointer"
            >
              LCD:{lcdFilter ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* LOGO DE NINTENDO GAME BOY EN RELIEVE */}
        <div className="w-full flex items-center gap-1.5 px-2 my-0.5 sm:my-1">
          <span className="font-arcade text-[10px] sm:text-[11px] text-[#3b4382] font-black italic tracking-tight">
            Nintendo
          </span>
          <span className="font-arcade text-[8px] sm:text-[9px] text-[#71717a] font-bold tracking-widest">
            GAME BOY™
          </span>
        </div>

        {/* SECCIÓN DE CONTROLES: D-PAD + BOTONES A / B */}
        <div className="w-full flex items-center justify-between px-2 sm:px-3 my-auto">
          
          {/* D-PAD EN FORMA DE CRUZ */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
            {/* Cruz física */}
            <div className="absolute w-24 sm:w-28 h-8 sm:h-9 bg-[#27272a] rounded-sm shadow-[2px_3px_5px_rgba(0,0,0,0.6)]" />
            <div className="absolute w-8 sm:w-9 h-24 sm:h-28 bg-[#27272a] rounded-sm shadow-[2px_3px_5px_rgba(0,0,0,0.6)]" />
            
            {/* Pivote central */}
            <div className="absolute w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-[#18181b] z-20 shadow-inner flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#27272a]/70" />
            </div>

            {/* Tecla Arriba */}
            <button
              data-dir="UP"
              onPointerDown={() => handleDirection('UP')}
              className="gb-dpad-btn absolute top-1 sm:top-2 w-10 h-10 flex items-center justify-center text-zinc-400 cursor-pointer transition-all"
              aria-label="Arriba"
            >
              <CaretUp size={18} weight="fill" />
            </button>

            {/* Tecla Abajo */}
            <button
              data-dir="DOWN"
              onPointerDown={() => handleDirection('DOWN')}
              className="gb-dpad-btn absolute bottom-1 sm:bottom-2 w-10 h-10 flex items-center justify-center text-zinc-400 cursor-pointer transition-all"
              aria-label="Abajo"
            >
              <CaretDown size={18} weight="fill" />
            </button>

            {/* Tecla Izquierda */}
            <button
              data-dir="LEFT"
              onPointerDown={() => handleDirection('LEFT')}
              className="gb-dpad-btn absolute left-1 sm:left-2 w-10 h-10 flex items-center justify-center text-zinc-400 cursor-pointer transition-all"
              aria-label="Izquierda"
            >
              <CaretLeft size={18} weight="fill" />
            </button>

            {/* Tecla Derecha */}
            <button
              data-dir="RIGHT"
              onPointerDown={() => handleDirection('RIGHT')}
              className="gb-dpad-btn absolute right-1 sm:right-2 w-10 h-10 flex items-center justify-center text-zinc-400 cursor-pointer transition-all"
              aria-label="Derecha"
            >
              <CaretRight size={18} weight="fill" />
            </button>
          </div>

          {/* BOTONES A / B INCLINADOS (-25°) */}
          <div className="flex gap-3 -rotate-25 mr-1 sm:mr-2">
            {/* Botón B */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => game.togglePause()}
                className="gb-btn-round"
                aria-label="Botón B (Pausa)"
              />
              <span className="font-arcade text-[8px] text-[#3b4382] font-bold mt-1.5">
                B
              </span>
            </div>

            {/* Botón A */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  if (!game.hasStarted) handleStartGame();
                  else if (game.isGameOver) game.reset();
                  else game.togglePause();
                }}
                className="gb-btn-round"
                aria-label="Botón A (Acción / Start)"
              />
              <span className="font-arcade text-[8px] text-[#3b4382] font-bold mt-1.5">
                A
              </span>
            </div>
          </div>
        </div>

        {/* BOTONES INFERIORES SELECT Y START (Pastillas inclinadas) */}
        <div className="flex justify-center items-center gap-8 my-2">
          {/* SELECT */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => game.reset(false)}
              className="gb-pill-btn"
              aria-label="Select"
            />
            <span className="font-arcade text-[7px] text-[#3b4382] font-bold mt-2">
              SELECT
            </span>
          </div>

          {/* START */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                if (!game.hasStarted) handleStartGame();
                else game.togglePause();
              }}
              className="gb-pill-btn"
              aria-label="Start"
            />
            <span className="font-arcade text-[7px] text-[#3b4382] font-bold mt-2">
              START
            </span>
          </div>
        </div>

        {/* Ranuras del altavoz en esquina inferior derecha */}
        <div className="w-full flex justify-end pr-4 pb-2 sm:pb-0">
          <div className="flex gap-1.5 -rotate-25">
            <div className="w-1 h-5 sm:h-6 bg-[#a3a199] rounded-full shadow-inner" />
            <div className="w-1 h-5 sm:h-6 bg-[#a3a199] rounded-full shadow-inner" />
            <div className="w-1 h-5 sm:h-6 bg-[#a3a199] rounded-full shadow-inner" />
            <div className="w-1 h-5 sm:h-6 bg-[#a3a199] rounded-full shadow-inner" />
            <div className="w-1 h-5 sm:h-6 bg-[#a3a199] rounded-full shadow-inner" />
          </div>
        </div>

      </div>
    </div>
  );
}
