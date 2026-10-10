# 🐍 Snake Bot Challenge

> Reto de desarrollo: construir un bot autónomo capaz de jugar Snake al máximo nivel, sobrevivir en espacios reducidos y superar las dificultades más extremas.

---

## 🎯 Objetivo del Reto

El propósito principal de este repositorio es diseñar e implementar un bot inteligente para el clásico juego de Snake. El bot debe demostrar habilidades avanzadas de toma de decisiones:

- 🧠 **Pathfinding óptimo**: Encontrar la ruta más corta hacia la comida (BFS, A*, etc.).
- 🛡️ **Estrategias de supervivencia**: Evitar callejones sin salida (*deadlocks*) y verificar caminos de salida hacia la cola.
- ⚡ **Nivel Maestro / Difícil**: Superar obstáculos, mayor velocidad y tableros con alta densidad corporal (Hamiltonian cycles, safe space heuristics).
- 🔌 **Arquitectura Modular**: Implementar [`AIController`](file:///Users/jzavala/Projects/hobbies/snake/src/game/AIController.ts) desacoplado del motor de juego [`SnakeGame`](file:///Users/jzavala/Projects/hobbies/snake/src/game/SnakeGame.ts).

---

## 🚀 Inicio Rápido

### Requisitos previos
- [Bun](https://bun.sh/) (o Node.js 18+)

### Instalación y ejecución

```bash
# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 🧩 ¿Cómo participar en el reto?

La arquitectura del juego ya cuenta con una interfaz de entrada desacoplada:

1. Ve a [`src/game/AIController.ts`](file:///Users/jzavala/Projects/hobbies/snake/src/game/AIController.ts).
2. Lee el estado del juego mediante `this.game` (posición de la cabeza, cuerpo, comida, dimensiones del tablero).
3. Emite la siguiente dirección calculada invocando el callback `onInput(direction)` en cada tick o cambio de estado.
4. Conecta tu algoritmo:
   - **Nivel 1:** BFS / A* directo hacia la comida.
   - **Nivel 2:** A* con validación de escape (Flood Fill / verificación de camino a la cola).
   - **Nivel 3:** Algoritmos avanzados / Ciclos Hamiltonianos / Redes Neuronales (RL).

### 🎨 Visualización de Ruta en Tiempo Real *(Opcional)*
Para facilitar el debug y ver cómo "piensa" tu bot, `AIController` cuenta con herramientas visuales opcionales:

```typescript
// En tu método step():
this.clearPixels(); // Limpia el rastro anterior
this.setPath(miRutaCalculada, 'rgba(15, 56, 15, 0.45)'); // Pinta la ruta planificada
this.setPixel(objetivoX, objetivoY, '#3b82f6'); // O píxeles individuales
```
> Si decides no usarlo, el juego funciona exactamente igual sin necesidad de pintar píxeles.

---

## 🛠️ Stack Tecnológico

- **React 19** + **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **Motor de juego modular Canvas / State**
