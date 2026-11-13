## Idea clave

El único estado es el **índice** del slide actual. Todo lo demás (qué texto se ve, el "2 / 3") se calcula a partir de él. Para que la navegación sea circular se usa el **operador módulo** `%`, que "da la vuelta" cuando el número se pasa del total.

## Paso a paso

1. **Estado mínimo.** `const [indice, setIndice] = useState(0)`: empezamos en el primer slide.
2. **Función `mover(paso)`.** Recibe `1` (siguiente) o `-1` (anterior) y calcula el nuevo índice con `(actual + paso + total) % total`.
3. **Actualización funcional.** Usamos `setIndice((actual) => ...)` porque el nuevo índice depende del anterior.
4. **Pintar lo derivado.** El slide visible es `slides[indice]` y el indicador es `indice + 1` (las personas cuentan desde 1, los arreglos desde 0).
5. **Accesibilidad.** Los botones muestran `‹` y `›`, que un lector de pantalla no sabe leer bien; por eso llevan `aria-label`. El `aria-live="polite"` hace que se anuncie el slide nuevo.

```jsx
import { useState } from "react";

export function Carrusel({ slides }) {
  const [indice, setIndice] = useState(0);
  const total = slides.length;

  // paso = -1 (anterior) o +1 (siguiente). Sumar `total` evita negativos.
  function mover(paso) {
    setIndice((actual) => (actual + paso + total) % total);
  }

  return (
    <div aria-roledescription="carrusel">
      <p aria-live="polite">{slides[indice]}</p>
      <button type="button" aria-label="Anterior" onClick={() => mover(-1)}>
        ‹
      </button>
      <span>
        {indice + 1} / {total}
      </span>
      <button type="button" aria-label="Siguiente" onClick={() => mover(1)}>
        ›
      </button>
    </div>
  );
}
```

## Por qué funciona

Con `slides = ["Uno", "Dos", "Tres"]`, `total` es 3:

| Acción | Cálculo | `indice` | Se pinta |
|---|---|---|---|
| (inicio) | | 0 | Uno, `1 / 3` |
| Anterior | `(0 - 1 + 3) % 3 = 2` | 2 | Tres, `3 / 3` |
| Siguiente | `(2 + 1 + 3) % 3 = 0` | 0 | Uno, `1 / 3` |
| Siguiente | `(0 + 1 + 3) % 3 = 1` | 1 | Dos, `2 / 3` |

El truco de sumar `total`: en JavaScript `-1 % 3` da `-1` (no `2` como en matemáticas). Al sumar 3 antes, el número siempre es positivo y el módulo lo deja entre `0` y `total - 1`. Sumar `total` cuando avanzas no cambia nada, porque `(x + 3) % 3` es lo mismo que `x % 3`.

Cada clic llama a `setIndice`, React vuelve a ejecutar `Carrusel` con el índice nuevo y pinta solo ese slide.

## Errores comunes

- **Olvidar sumar `total`** y escribir `(actual - 1) % total`. Desde el primero da `-1` y `slides[-1]` es `undefined`: el carrusel queda en blanco. Lo reconoces porque falla el test de "Anterior desde el primero".
- **Usar `if` en cascada** (`if (actual === 0) return total - 1`...). Funciona, pero es más largo y fácil de equivocar. El módulo resuelve los dos extremos con una línea.
- **Guardar el slide actual además del índice** (`const [slideActual, setSlideActual] = useState(slides[0])`). Es estado duplicado: tienes que mantener los dos sincronizados.
- **Mostrar `indice` en vez de `indice + 1`** en el indicador. Se ve `0 / 3` al inicio.
- **Pintar todos los slides y ocultarlos con CSS** sin necesidad. Para un carrusel simple basta con renderizar solo el visible.

## Otra forma de resolverlo

Con botones que **se deshabilitan** en los extremos en vez de dar la vuelta:

```jsx
<button aria-label="Anterior" disabled={indice === 0} onClick={() => setIndice((i) => i - 1)}>‹</button>
<button aria-label="Siguiente" disabled={indice === total - 1} onClick={() => setIndice((i) => i + 1)}>›</button>
```

**¿Cuándo conviene?** Cuando el orden importa y no tiene sentido saltar del final al inicio, por ejemplo los pasos de un tutorial o un onboarding. Para galerías de fotos o banners, la navegación circular es lo esperado.

También podrías agregar avance automático con un `setInterval` dentro de un `useEffect` que llame a `mover(1)` cada pocos segundos, limpiándolo en el return del efecto.

## Cómo explicarlo en la entrevista

> "Solo guardo el índice del slide actual; el texto visible y el indicador los calculo. Para que la navegación sea circular uso el operador módulo, y sumo el total antes de aplicarlo porque en JavaScript el módulo de un número negativo da negativo. Así, desde el primero, 'Anterior' va al último sin ningún `if`. Uso la actualización funcional porque el nuevo índice depende del anterior, y le pongo `aria-label` a los botones porque solo muestran flechas."

## Conceptos

- **`useState`** para un índice numérico.
- **Operador módulo `%`**: el resto de una división; sirve para "dar la vuelta" en rangos.
- **Módulo de negativos en JavaScript**: `-1 % 3` es `-1`, por eso se suma el total.
- **Actualización funcional** `setX((anterior) => ...)` cuando el nuevo valor depende del anterior.
- **Estado derivado**: el slide visible y el indicador se calculan del índice.
- **`aria-label`**: nombre accesible para botones que solo tienen un ícono.
- **`aria-live`**: avisa a los lectores de pantalla cuando cambia un contenido.
