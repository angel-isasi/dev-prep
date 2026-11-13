## Idea clave

Con `var` existe **una sola** variable `i` para todo el bucle, y los `setTimeout` la leen cuando el bucle ya terminó: todos ven `3`. Con `let`, cada vuelta tiene **su propia** `i`, y cada flecha recuerda la suya.

## Paso a paso

1. **Predice** pensando en el orden real: primero corre todo el bucle (código síncrono), y recién después los `setTimeout`.
2. Al terminar el bucle con `var`, `i` vale `3` (es el valor que hizo falsa la condición `i < 3`).
3. Las tres flechas apuntan a la **misma** variable, así que las tres guardan `3`: `[3, 3, 3]`.
4. **Arregla** cambiando `var` por `let`. Nada más.

```js
export const prediccion = [3, 3, 3];

export function arreglado(n) {
  const salida = [];
  for (let i = 0; i < n; i++) {
    setTimeout(() => salida.push(i), 0);
  }
  return salida;
}
```

## Por qué funciona

Con `var`, la línea de tiempo de `conVar(3)` es:

| Momento | `i` (una sola variable) | Qué pasa |
|---|---|---|
| vuelta 1 | 0 | programa la flecha A, que **leerá `i` más tarde** |
| vuelta 2 | 1 | programa la flecha B |
| vuelta 3 | 2 | programa la flecha C |
| fin del bucle | 3 | `i < 3` es falso, el bucle termina y se devuelve `salida` (vacío) |
| corren los timers | 3 | A, B y C leen `i`: guardan 3, 3 y 3 |

Las flechas no copian el valor de `i` al crearse: guardan una referencia a **la variable**. Y como solo hay una, todas leen su valor final.

Con `let`, el `for` crea una variable `i` distinta para cada vuelta (`i₀ = 0`, `i₁ = 1`, `i₂ = 2`). La flecha A recuerda `i₀`, la B recuerda `i₁` y la C recuerda `i₂`. Cuando corren, cada una lee la suya: `[0, 1, 2]`.

Por eso el arreglo está vacío justo después de llamar a la función: los `setTimeout` con 0 ms igual esperan a que termine todo el código síncrono.

## Errores comunes

- **Predecir `[0, 1, 2]`.** Es la respuesta "intuitiva", pero olvida que los `setTimeout` corren cuando el bucle ya terminó. Lo reconoces porque el test de la predicción dice que recibió `[3, 3, 3]`.
- **Predecir `[2, 2, 2]`.** Olvidas que el `i++` de la última vuelta deja `i` en 3, no en 2.
- **Arreglarlo quitando el `setTimeout` y haciendo `salida.push(i)` directo.** El resultado es correcto, pero cambiaste el problema. Lo reconoces porque falla el test "devuelve el arreglo vacío al instante".
- **Escribir `setTimeout(salida.push(i), 0)`.** Ejecuta el `push` en ese momento y le pasa un número a `setTimeout`. Mismo síntoma que el anterior.

## Otra forma de resolverlo

Antes de que existiera `let` (ES2015), se arreglaba con una función que se ejecuta al instante (IIFE) para crear una variable nueva por vuelta:

```js
export function arreglado(n) {
  const salida = [];
  for (var i = 0; i < n; i++) {
    ((copia) => {
      setTimeout(() => salida.push(copia), 0);
    })(i);
  }
  return salida;
}
```

Cada llamada a la flecha `(copia) => {...}` recibe el valor de `i` **en ese momento** como parámetro, y el parámetro es una variable nueva cada vez. Hoy se usa `let`, pero mencionar esta forma muestra que entiendes **por qué** funciona `let`: crea un ámbito nuevo por vuelta, igual que la función. También sirve pasar el valor como tercer argumento de `setTimeout`: `setTimeout((x) => salida.push(x), 0, i)`.

## Cómo explicarlo en la entrevista

> "Imprime 3, 3, 3. Con `var` hay una sola variable `i` para todo el bucle, porque `var` tiene alcance de función, no de bloque. Los `setTimeout` se ejecutan cuando el bucle ya terminó, y en ese momento `i` vale 3, así que todos leen 3. Lo arreglo con `let`: tiene alcance de bloque y el `for` crea una variable nueva en cada vuelta, así que cada callback guarda la suya. Antes de `let` se hacía con una IIFE para capturar el valor."

## Conceptos

- **`var`**: alcance de función; una sola variable aunque la declares dentro de un bloque.
- **`let` y `const`**: alcance de bloque; en un `for` con `let` hay una variable nueva por vuelta.
- **Closure**: la flecha recuerda la variable, no una copia de su valor.
- **`setTimeout(fn, 0)`**: no es "ahora mismo"; corre cuando termina todo el código síncrono.
- **IIFE**: función que se define y se ejecuta al instante, `((x) => {...})(valor)`.
