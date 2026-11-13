## Idea clave

El único estado es el **arreglo de 9 casillas**. El turno, el ganador y el empate se **calculan** a partir de él en cada render. Así es imposible que, por ejemplo, el turno diga "X" cuando en realidad le toca a "O": solo hay una fuente de verdad.

## Paso a paso

1. **Estado:** `useState(Array(9).fill(null))`, un arreglo con 9 `null`.
2. **Turno derivado:** cuenta las fichas con `casillas.filter(Boolean).length` (`Boolean` deja pasar solo los valores "verdaderos", es decir, `"X"` y `"O"`). Si el número es par, juega X.
3. **Ganador derivado:** `calcularGanador` recorre las 8 líneas de `LINEAS`. Una línea gana si su primera casilla no está vacía y las tres son iguales.
4. **Empate derivado:** no hay ganador y hay 9 fichas.
5. **Jugar sin mutar:** si la casilla está ocupada o ya hay ganador, `return`. Si no, copia el arreglo, pon la ficha en la copia y llama a `setCasillas(copia)`.
6. **Mensaje:** primero se revisa el ganador, luego el empate, y si no, el turno.
7. **Reiniciar:** `setCasillas(Array(9).fill(null))`. Como todo lo demás se deriva, no hay nada más que resetear.

```jsx
import { useState } from "react";

// Las 8 formas de ganar: 3 filas, 3 columnas y 2 diagonales (índices 0 a 8).
const LINEAS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function calcularGanador(casillas) {
  for (const [a, b, c] of LINEAS) {
    if (casillas[a] && casillas[a] === casillas[b] && casillas[a] === casillas[c]) {
      return casillas[a];
    }
  }
  return null;
}

export function TresEnRaya() {
  const [casillas, setCasillas] = useState(Array(9).fill(null));

  // Todo esto es estado derivado: se calcula a partir de las casillas.
  const fichas = casillas.filter(Boolean).length;
  const turno = fichas % 2 === 0 ? "X" : "O";
  const ganador = calcularGanador(casillas);
  const empate = !ganador && fichas === 9;

  function jugar(indice) {
    if (casillas[indice] || ganador) return;
    const copia = [...casillas];
    copia[indice] = turno;
    setCasillas(copia);
  }

  let mensaje = `Turno de ${turno}`;
  if (ganador) mensaje = `Ganó ${ganador}`;
  else if (empate) mensaje = "Empate";

  return (
    <div>
      <p aria-live="polite">{mensaje}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 3rem)", gap: 4 }}>
        {casillas.map((valor, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Casilla ${i + 1}`}
            style={{ height: "3rem" }}
            onClick={() => jugar(i)}
          >
            {valor}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => setCasillas(Array(9).fill(null))}>
        Reiniciar
      </button>
    </div>
  );
}
```

`calcularGanador` y `LINEAS` van fuera del componente: no dependen de props ni estado, y así se pueden probar solos.

## Por qué funciona

Jugadas 1, 4, 2, 5, 3 (casillas 1 a 9 son los índices 0 a 8):

| Clic | `casillas` (índices 0-8) | fichas | turno | ganador | Mensaje |
|---|---|---|---|---|---|
| (inicio) | `· · · · · · · · ·` | 0 | X | null | Turno de X |
| Casilla 1 | `X · · · · · · · ·` | 1 | O | null | Turno de O |
| Casilla 4 | `X · · O · · · · ·` | 2 | X | null | Turno de X |
| Casilla 2 | `X X · O · · · · ·` | 3 | O | null | Turno de O |
| Casilla 5 | `X X · O O · · · ·` | 4 | X | null | Turno de X |
| Casilla 3 | `X X X O O · · · ·` | 5 | O | X (línea `[0,1,2]`) | Ganó X |
| Casilla 9 | sin cambios (`return` por ganador) | | | | Ganó X |

Fíjate en que "turno" vale O al final, pero no importa: el mensaje muestra primero al ganador y `jugar` sale antes de usar el turno.

## Errores comunes

- **Guardar el turno en un `useState` aparte** (`const [turnoX, setTurnoX] = useState(true)`). Hay que acordarse de cambiarlo en cada jugada y de resetearlo al reiniciar; si una casilla ocupada no lo cambia, pero alguien olvida ese caso, se desincroniza.
- **Guardar el ganador en el estado** y calcularlo en un `useEffect`. Hay un render en el que el tablero ya tiene tres en raya pero el mensaje todavía dice "Turno de O".
- **Mutar el arreglo:** `casillas[i] = "X"; setCasillas(casillas)`. Es la misma referencia, React no ve el cambio y la X no aparece.
- **Olvidar revisar `casillas[a]`** en `calcularGanador`. Tres `null` en línea son "iguales" (`null === null`), así que la función haría `return null` en la primera línea vacía y nunca revisaría las demás: por ejemplo, no detectaría a X ganando en la segunda fila mientras la primera esté vacía.
- **No bloquear tras ganar.** Se puede seguir jugando y el mensaje cambia de ganador. Falla el test de "bloquea el tablero".

## Otra forma de resolverlo

Guardar el **historial** de tableros para poder volver a jugadas anteriores (como en el tutorial oficial de React):

```jsx
const [historial, setHistorial] = useState([Array(9).fill(null)]);
const casillas = historial[historial.length - 1];

function jugar(i) {
  if (casillas[i] || calcularGanador(casillas)) return;
  const copia = [...casillas];
  copia[i] = turno;
  setHistorial([...historial, copia]);
}

const deshacer = () => setHistorial((h) => (h.length > 1 ? h.slice(0, -1) : h));
```

**¿Cuándo conviene?** Si te piden "deshacer" o "ir a la jugada N". Gracias a que nunca mutamos los arreglos, cada tablero del historial queda intacto. Sin ese requisito, guardar solo el tablero actual es más simple.

## Cómo explicarlo en la entrevista

> "El único estado es el arreglo de 9 casillas. De quién es el turno lo deduzco contando las fichas, el ganador lo calculo revisando las 8 líneas posibles y el empate es no tener ganador con el tablero lleno. No guardo nada de eso en el estado porque se puede calcular, y así nunca queda desincronizado. Para jugar copio el arreglo, cambio la copia y la guardo, sin mutar. Si me pidieran deshacer, guardaría un historial de tableros, y como no muto, cada uno queda intacto."

## Conceptos

- **Estado mínimo**: guardar solo lo que no se puede calcular.
- **Estado derivado**: turno, ganador y empate salen de las casillas.
- **Inmutabilidad**: copiar con spread `[...arr]` antes de cambiar.
- **`Array(9).fill(null)`**: crear un arreglo de largo fijo.
- **`filter(Boolean)`**: quedarse solo con valores verdaderos.
- **Desestructuración en `for...of`**: `for (const [a, b, c] of LINEAS)`.
- **Funciones puras fuera del componente**: fáciles de probar y no se recrean en cada render.
- **`key` con índice**: aquí es correcto porque las casillas nunca se reordenan ni se eliminan.
