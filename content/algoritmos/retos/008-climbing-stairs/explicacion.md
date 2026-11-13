## Idea clave

Para llegar al escalón `n`, el último paso vino desde `n - 1` o desde `n - 2`. Por eso las formas de llegar a `n` son **las de `n - 1` más las de `n - 2`**: es Fibonacci. En lugar de recalcular con recursión, lo construyes de abajo hacia arriba guardando solo los dos últimos valores.

## Paso a paso

1. **Encuentra la relación** con casos chicos: `formas(1) = 1`, `formas(2) = 2`, `formas(3) = 3`, `formas(4) = 5`, `formas(5) = 8`. Cada uno es la suma de los dos anteriores.
2. **¿Por qué?** Toda forma de llegar a `n` termina con un paso de 1 (y antes estabas en `n - 1`) o con un paso de 2 (y antes estabas en `n - 2`). Esos dos grupos no se mezclan, así que se suman: `formas(n) = formas(n - 1) + formas(n - 2)`.
3. **La solución directa** (dila en voz alta): escribir esa fórmula como recursión. Es correcta, pero cada llamada hace dos llamadas más, y se repiten los mismos cálculos una y otra vez: O(2ⁿ). Con `n = 45` son miles de millones de llamadas.

   ```js
   function formasDeSubir(n) {
     if (n <= 2) return n;
     return formasDeSubir(n - 1) + formasDeSubir(n - 2);
   }
   ```

4. **Mejora: de abajo hacia arriba.** Empieza por los casos base y avanza hasta `n`. Cada valor se calcula una sola vez: O(n).
5. **Solo necesitas los dos últimos.** No hace falta un arreglo con todos los valores: dos variables bastan, O(1) de memoria. Usamos `formas(0) = 1` (hay una forma de estar en el suelo: no moverse) para que el bucle funcione desde `i = 2`.

```js
export function formasDeSubir(n) {
  let anteAnterior = 1; // formas(0)
  let anterior = 1;     // formas(1)

  for (let i = 2; i <= n; i++) {
    const actual = anterior + anteAnterior;
    anteAnterior = anterior;
    anterior = actual;
  }

  return anterior;
}
```

Con `n = 1` el bucle no entra y devuelve `anterior = 1`, que es correcto.

## Por qué funciona

Recorrido con `formasDeSubir(5)`. Al terminar cada vuelta, `anterior` vale `formas(i)`:

| `i` | `actual` = `anterior + anteAnterior` | `anteAnterior` | `anterior` |
|---|---|---|---|
| inicio | | 1 | 1 |
| 2 | 1 + 1 = 2 | 1 | 2 |
| 3 | 2 + 1 = 3 | 2 | 3 |
| 4 | 3 + 2 = 5 | 3 | 5 |
| 5 | 5 + 3 = **8** | 5 | **8** |

Devuelve 8. Para comprobarlo a mano, las 8 formas de subir 5 escalones son: 1+1+1+1+1, 2+1+1+1, 1+2+1+1, 1+1+2+1, 1+1+1+2, 2+2+1, 2+1+2 y 1+2+2.

**Por qué la recursión es tan lenta**: `formas(5)` llama a `formas(4)` y `formas(3)`; pero `formas(4)` vuelve a llamar a `formas(3)`. El mismo cálculo se repite en cada rama, y el número de llamadas crece casi al doble con cada escalón.

## Errores comunes

- **Recursión sin memoria.** Pasa los tests chicos pero se cuelga con `n = 45`. Lo reconoces porque el último test falla por tiempo.
- **Actualizar las variables en el orden equivocado.** Si haces `anterior = anterior + anteAnterior` y después `anteAnterior = anterior`, `anteAnterior` recibe el valor **nuevo**. Guarda la suma en `actual` antes, o usa `[a, b] = [b, a + b]`.
- **Casos base mal puestos.** Con `anteAnterior = 0` y `anterior = 1` obtienes Fibonacci "puro" desplazado: `formasDeSubir(2)` daría 1 en vez de 2.
- **Bucle con `i < n`** en lugar de `i <= n`: devuelves las formas de `n - 1`.
- **Calcular combinaciones en vez de ordenes** (por ejemplo, contar cuántos pasos de 2 caben). `1 + 2` y `2 + 1` son formas distintas.

## Otra forma de resolverlo

**Recursión con memoria (memoización)**: la misma recursión del paso 3, pero guardando cada resultado en un `Map` para no recalcularlo. Baja a O(n) de tiempo y O(n) de memoria:

```js
function formasDeSubir(n, memo = new Map()) {
  if (n <= 2) return n;
  if (memo.has(n)) return memo.get(n);
  const r = formasDeSubir(n - 1, memo) + formasDeSubir(n - 2, memo);
  memo.set(n, r);
  return r;
}
```

**Arreglo de resultados (tabla)**: `dp[i] = dp[i - 1] + dp[i - 2]` con un arreglo de tamaño `n + 1`. O(n) de tiempo y memoria; es útil para dibujar la tabla y explicarla.

**¿Cuál conviene?** Las tres se aceptan. La memoización es la más natural si partes de la recursión; la de dos variables es la mejor en memoria. Mostrar el camino "recursión, luego memo, luego dos variables" es exactamente lo que el entrevistador quiere ver.

## Cómo explicarlo en la entrevista

> "Para llegar al escalón n, mi último paso fue de 1 o de 2, así que las formas de llegar a n son las de llegar a n menos 1 más las de n menos 2: es Fibonacci. La recursión directa repite cálculos y es exponencial, O(2 a la n). Podría memorizar resultados, pero mejor lo construyo de abajo hacia arriba: como cada valor solo depende de los dos anteriores, guardo solo dos variables. Queda O(n) de tiempo y O(1) de memoria."

## Conceptos

- **Relación de recurrencia**: una fórmula que define cada valor a partir de los anteriores.
- **Fibonacci**: cada número es la suma de los dos anteriores.
- **Programación dinámica**: resolver subproblemas una sola vez y reutilizar sus resultados.
- **Memoización**: guardar resultados de una función para no recalcularlos.
- **De abajo hacia arriba (bottom-up)**: empezar por los casos chicos y construir hasta `n`, sin recursión.
- **Desestructuración para intercambiar**: `[a, b] = [b, a + b]` actualiza las dos variables con los valores viejos.
