## Idea clave

En cada posición decides una sola cosa: **¿sigo el tramo que traigo o empiezo uno nuevo aquí?** Si la suma que traes es negativa, solo te resta, así que conviene empezar de nuevo. Mientras tanto guardas la mejor suma vista. Eso es el algoritmo de Kadane.

## Paso a paso

1. **La solución directa** (dila en voz alta): para cada inicio `i`, ve sumando hacia la derecha y guarda la mejor suma. Prueba todos los tramos: O(n²).

   ```js
   let mejor = -Infinity;
   for (let i = 0; i < nums.length; i++) {
     let suma = 0;
     for (let j = i; j < nums.length; j++) {
       suma += nums[j];
       mejor = Math.max(mejor, suma);
     }
   }
   return mejor;
   ```

2. **Cambia la pregunta.** En vez de "¿cuál es el mejor tramo?", pregunta "¿cuál es el mejor tramo que **termina justo aquí**?". Llamémoslo `actual`.
3. **Ese valor se calcula con el anterior.** El mejor tramo que termina en `i` es una de dos cosas:
   - solo `nums[i]` (empiezo de nuevo), o
   - el mejor tramo que terminaba en `i - 1`, más `nums[i]` (sigo).

   Por eso `actual = Math.max(nums[i], actual + nums[i])`. Esto es **programación dinámica**: la respuesta de un paso se construye con la del paso anterior.
4. **Guarda el máximo global.** El mejor tramo termina en alguna posición, así que la respuesta es el mayor `actual` que viste: `mejor = Math.max(mejor, actual)`.
5. **Inicia con `nums[0]`, no con 0.** Si todos son negativos, la respuesta es negativa; empezar en 0 te haría devolver 0, que corresponde a un tramo vacío (no permitido).

```js
export function maxSubarreglo(nums) {
  let actual = nums[0];
  let mejor = nums[0];

  for (let i = 1; i < nums.length; i++) {
    actual = Math.max(nums[i], actual + nums[i]);
    mejor = Math.max(mejor, actual);
  }

  return mejor;
}
```

## Por qué funciona

Recorrido con `maxSubarreglo([-2, 1, -3, 4, -1, 2, 1, -5, 4])`:

| `i` | `nums[i]` | Empezar aquí | Seguir (`actual + nums[i]`) | `actual` | `mejor` |
|---|---|---|---|---|---|
| 0 | -2 | | | -2 | -2 |
| 1 | 1 | **1** | -2 + 1 = -1 | 1 | 1 |
| 2 | -3 | -3 | 1 - 3 = **-2** | -2 | 1 |
| 3 | 4 | **4** | -2 + 4 = 2 | 4 | 4 |
| 4 | -1 | -1 | 4 - 1 = **3** | 3 | 4 |
| 5 | 2 | 2 | 3 + 2 = **5** | 5 | 5 |
| 6 | 1 | 1 | 5 + 1 = **6** | 6 | **6** |
| 7 | -5 | -5 | 6 - 5 = **1** | 1 | 6 |
| 8 | 4 | 4 | 1 + 4 = **5** | 5 | 6 |

En `i = 3` el tramo que traía sumaba -2, así que empezar en el 4 era mejor: ahí nace el tramo ganador `[4, -1, 2, 1]`. En `i = 4` conviene seguir aunque el número sea negativo, porque 4 - 1 = 3 sigue siendo mejor que empezar en -1.

Con `[-3, -1, -2]`: `actual` y `mejor` empiezan en -3; con el -1, empezar de nuevo da -1 (mejor que -4), y `mejor` sube a -1. Con el -2, seguir da -3 y empezar da -2; `actual` es -2 pero `mejor` se queda en -1.

## Errores comunes

- **Iniciar `mejor` en 0.** Con todos negativos devuelves 0. Lo reconoces en el test `[-3, -1, -2]`.
- **Reiniciar `actual` a 0 cuando se vuelve negativo** (`if (actual < 0) actual = 0`) y además iniciar `mejor` en 0. Es una versión conocida de Kadane, pero solo funciona si hay al menos un positivo.
- **Confundir subarreglo con subsecuencia** y sumar todos los positivos. Con `[5, 4, -1, 7, 8]` darías 24 en vez de 23: el -1 está en medio y no puedes saltarlo.
- **Empezar el bucle en `i = 0`** con `actual = nums[0]`: cuentas el primer número dos veces (`actual + nums[0]`).
- **Guardar solo `actual` y devolverlo al final.** `actual` es el mejor tramo que termina en el **último** elemento, no el mejor en general. En el ejemplo devolverías 5 en vez de 6.

## Otra forma de resolverlo

Los **dos bucles** del paso 1: O(n²) de tiempo y O(1) de memoria. Es correcta y fácil de razonar, pero con 100 000 números hace unos 5 000 millones de sumas.

También existe una solución **divide y vencerás** en O(n log n): partes el arreglo a la mitad, el mejor tramo está a la izquierda, a la derecha o cruza el centro. Es más compleja y peor que Kadane; sirve solo si te la piden expresamente.

**¿Cuál conviene?** Menciona los dos bucles y luego escribe Kadane. Es uno de los algoritmos con nombre propio que más preguntan, y saber decir "esto es Kadane" suma puntos.

## Cómo explicarlo en la entrevista

> "La solución directa es probar todos los tramos con dos bucles, que es O(n²). Para mejorarlo uso el algoritmo de Kadane: en cada posición decido si me conviene seguir el tramo que traigo o empezar uno nuevo ahí. Si la suma acumulada es negativa, solo me resta, así que empiezo de nuevo en el número actual. Mientras tanto guardo la mejor suma vista. Inicio las dos variables con el primer elemento para que funcione aunque todos sean negativos. Queda O(n) de tiempo y O(1) de memoria."

## Conceptos

- **Algoritmo de Kadane**: suma máxima de un subarreglo contiguo en una pasada.
- **Programación dinámica**: resolver un problema construyendo cada respuesta a partir de la anterior, sin recalcular.
- **Subarreglo vs subsecuencia**: el subarreglo es contiguo; la subsecuencia puede saltarse elementos.
- **Óptimo local y global**: `actual` es el mejor tramo que termina aquí; `mejor` es el mejor de todos.
- **Inicializar con datos reales**: usar `nums[0]` en lugar de 0 evita respuestas imposibles.
