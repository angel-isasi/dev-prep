## Idea clave

La suma de un tramo es la diferencia entre dos **sumas de prefijo** (lo acumulado desde el inicio). Si la suma acumulada ahora es `suma`, un tramo que termina aquí vale `k` cuando antes hubo un prefijo que valía `suma - k`. Un `Map` cuenta cuántas veces apareció cada suma de prefijo, así que en cada paso sabes al instante cuántos tramos que terminan aquí suman `k`.

## Paso a paso

1. **La solución directa** (dila en voz alta): para cada inicio `i`, extiende el tramo hacia la derecha acumulando la suma y cuenta cada vez que valga `k`. Es O(n²), pero ya es mejor que recalcular cada tramo desde cero (eso sería O(n³)).

   ```js
   let total = 0;
   for (let i = 0; i < nums.length; i++) {
     let suma = 0;
     for (let j = i; j < nums.length; j++) {
       suma += nums[j];
       if (suma === k) total++;
     }
   }
   return total;
   ```

2. **¿Por qué no una ventana deslizante?** Con solo positivos, agrandar la ventana siempre sube la suma y achicarla siempre la baja, así que sabrías qué puntero mover. Con negativos eso se rompe: agregar un número puede bajar la suma. Hace falta otra idea.
3. **Sumas de prefijo.** Llama `P(j)` a la suma de los elementos desde el inicio hasta `j`. La suma del tramo de `i + 1` a `j` es `P(j) - P(i)`. Quieres `P(j) - P(i) = k`, o sea `P(i) = P(j) - k`.
4. **Traducido a código:** mientras recorres, `suma` es el prefijo actual. La cantidad de tramos que terminan aquí y valen `k` es **cuántas veces viste antes el prefijo `suma - k`**. Eso lo guarda un `Map` de suma a cantidad de veces (no un `Set`, porque el mismo prefijo puede repetirse, por ejemplo con ceros o negativos).
5. **El `0 -> 1` inicial.** Representa el prefijo vacío, antes del primer elemento. Sin él no cuentas los tramos que empiezan en la posición 0: en `[3]` con `k = 3`, la suma es 3, buscas `3 - 3 = 0`, y necesitas que el 0 esté.
6. **Primero consultas, después registras.** Si registraras la suma actual antes de consultar, con `k = 0` contarías un tramo vacío (el prefijo actual menos sí mismo).

```js
export function contarSubarreglos(nums, k) {
  const vecesPrefijo = new Map([[0, 1]]);
  let suma = 0;
  let total = 0;

  for (const num of nums) {
    suma += num;
    total += vecesPrefijo.get(suma - k) || 0;
    vecesPrefijo.set(suma, (vecesPrefijo.get(suma) || 0) + 1);
  }

  return total;
}
```

## Por qué funciona

Recorrido con `contarSubarreglos([1, 2, 1, 2, 1], 3)`. El `Map` empieza como `{ 0: 1 }`.

| `num` | `suma` | Busco `suma - 3` | Veces que lo vi | `total` | Tramo encontrado | `vecesPrefijo` después |
|---|---|---|---|---|---|---|
| 1 | 1 | -2 | 0 | 0 | | `{0:1, 1:1}` |
| 2 | 3 | 0 | 1 | 1 | `[1, 2]` | `{0:1, 1:1, 3:1}` |
| 1 | 4 | 1 | 1 | 2 | `[2, 1]` | `{..., 4:1}` |
| 2 | 6 | 3 | 1 | 3 | `[1, 2]` | `{..., 6:1}` |
| 1 | 7 | 4 | 1 | 4 | `[2, 1]` | `{..., 7:1}` |

Ahora con `[1, -1, 0]` y `k = 0`, donde se ve por qué se cuentan **veces** y no solo si existe:

| `num` | `suma` | Busco `suma - 0` | Veces que lo vi | `total` |
|---|---|---|---|---|
| 1 | 1 | 1 | 0 | 0 |
| -1 | 0 | 0 | 1 (el prefijo vacío) | 1: `[1, -1]` |
| 0 | 0 | 0 | **2** (vacío y después de `-1`) | 3: `[0]` y `[1, -1, 0]` |

En el último paso el prefijo 0 había aparecido dos veces, y cada una cierra un tramo distinto. Con un `Set` solo sumarías 1 y darías 2.

## Errores comunes

- **Usar ventana deslizante.** Funciona con positivos pero falla con negativos: en `[1, -1, 0]` y `k = 0` no encuentras todos los tramos. Lo reconoces en el test "con negativos".
- **Olvidar el `0 -> 1` inicial.** No cuentas los tramos que empiezan en el índice 0: `[3]` con `k = 3` da 0 en vez de 1.
- **Registrar la suma antes de consultar.** Con `k = 0` cada paso se encuentra a sí mismo y cuentas tramos vacíos: `[1, 2, 3]` con `k = 0` daría 3 en vez de 0.
- **Usar un `Set` en vez de contar.** Pierdes los prefijos repetidos: `[0, 0, 0]` con `k = 0` da menos de 6.
- **Buscar `k - suma`** en vez de `suma - k`. El signo importa: estás despejando `P(i) = P(j) - k`.
- **Olvidar el `|| 0`** al leer el `Map`: `total += undefined` deja `total` en `NaN`.

## Otra forma de resolverlo

**Doble bucle acumulando** (paso 1): O(n²) de tiempo y O(1) de memoria. Es una respuesta correcta y honesta para empezar; muchos entrevistadores la aceptan como base antes de pedirte la mejora.

**Arreglo de prefijos y doble bucle**: calculas primero todas las sumas de prefijo en un arreglo y luego comparas cada par `P(j) - P(i)`. Sigue siendo O(n²), pero te ayuda a ver la fórmula antes de llegar al `Map`.

**Ventana deslizante**: solo si te aseguran que **todos** los números son positivos. Es O(n) y O(1) de memoria, pero aquí no aplica.

**¿Cuál conviene?** Sumas de prefijo con `Map`: O(n) de tiempo y O(n) de memoria. Es el patrón que hay que reconocer cuando aparecen "subarreglos que suman X" con negativos.

## Cómo explicarlo en la entrevista

> "La forma directa es fijar cada inicio y extender acumulando la suma: O(n²). Como hay negativos, la ventana deslizante no sirve. Uso sumas de prefijo: la suma de un tramo es la resta de dos prefijos, así que si el prefijo actual es suma, me sirve cualquier prefijo anterior que valga suma menos k. Guardo en un Map cuántas veces apareció cada prefijo, empezando con el 0 una vez para los tramos que empiezan al inicio. En cada paso sumo las veces de suma menos k y luego registro la suma actual. Queda O(n) de tiempo y O(n) de memoria."

## Conceptos

- **Suma de prefijo**: lo acumulado desde el inicio; un tramo es la resta de dos prefijos.
- **Despejar la ecuación**: de `P(j) - P(i) = k` a "busco `P(j) - k`", la misma idea de "lo que me falta" de Two Sum.
- **`Map` como contador**: guardar cuántas veces, no solo si existe.
- **Valor inicial del `Map`**: `new Map([[0, 1]])` para el prefijo vacío.
- **Cuándo no sirve la ventana deslizante**: con negativos la suma no crece al agrandar la ventana.
