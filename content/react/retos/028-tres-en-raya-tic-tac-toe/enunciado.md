Crea el componente `TresEnRaya` (sin props): el clásico juego de 3 x 3 para dos jugadores, X y O, que se turnan. Gana quien complete una fila, columna o diagonal.

## Reglas

- 9 botones, uno por casilla, con `aria-label` **"Casilla 1"** a **"Casilla 9"** (de izquierda a derecha y de arriba abajo). El texto del botón es `X`, `O` o vacío.
- Empieza **X**. Después de cada jugada el turno pasa al otro.
- Arriba, un mensaje con uno de estos textos exactos:
  - **"Turno de X"** o **"Turno de O"** mientras se juega.
  - **"Ganó X"** o **"Ganó O"** si alguien completó una línea.
  - **"Empate"** si se llenaron las 9 casillas sin ganador.
- No se puede jugar en una casilla ocupada (el clic no hace nada y no cambia el turno).
- Cuando hay ganador, el tablero queda bloqueado.
- Un botón **"Reiniciar"** vacía el tablero y el turno vuelve a X.

## Ejemplo

```jsx
<TresEnRaya />
```

| Jugadas (casillas) | Se ve |
|---|---|
| (inicio) | Turno de X, tablero vacío |
| 1 | X en la casilla 1, Turno de O |
| 1, 4, 2, 5, 3 | X completa la primera fila: Ganó X |
| luego clic en 9 | no pasa nada, la casilla 9 sigue vacía |
| 1, 2, 3, 5, 4, 6, 8, 7, 9 | tablero lleno sin línea: Empate |

## Por qué importa

Es el tutorial oficial de React y un clásico de entrevista. Evalúan si guardas el **estado mínimo** (solo las casillas) y calculas el resto: de quién es el turno, quién ganó y si hay empate.
