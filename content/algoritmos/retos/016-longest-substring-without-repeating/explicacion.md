## Idea clave

Mantienes una **ventana deslizante** `[inicio, i]` sin caracteres repetidos. Un `Map` recuerda la última posición de cada carácter. Si el carácter nuevo ya está **dentro** de la ventana, mueves `inicio` justo después de su aparición anterior. En cada paso, el largo de la ventana es un candidato a respuesta.

## Paso a paso

1. **La solución directa** (dila en voz alta): para cada posición de inicio, avanza mientras no se repita ningún carácter (usando un `Set`) y guarda el largo máximo. Es O(n²).

   ```js
   let mejor = 0;
   for (let i = 0; i < s.length; i++) {
     const vistos = new Set();
     for (let j = i; j < s.length && !vistos.has(s[j]); j++) {
       vistos.add(s[j]);
     }
     mejor = Math.max(mejor, vistos.size);
   }
   return mejor;
   ```

2. **¿Qué trabajo se repite?** Si la ventana `"abc"` encuentra otra `a`, la solución directa vuelve a empezar desde la `b` y recorre de nuevo `"bc"`. Pero ya sabías que `"bc"` no tenía repetidos.
3. **Ventana deslizante.** Lleva un `inicio` y avanza `i` de uno en uno. La ventana `s[inicio..i]` siempre está libre de repetidos.
4. **Cuando `s[i]` se repite**, no vuelvas al principio: salta `inicio` directamente a la posición siguiente a su aparición anterior. Para saber dónde fue, guardas en un `Map` la última posición de cada carácter.
5. **El detalle importante: ¿la aparición anterior está dentro de la ventana?** Solo mueves `inicio` si `ultimaPos.get(c) >= inicio`. Si la aparición vieja quedó a la izquierda de `inicio`, ya no molesta, y mover `inicio` hacia atrás metería repetidos en la ventana.
6. **Actualiza y mide**: guarda la posición actual del carácter y calcula el largo `i - inicio + 1`.

```js
export function sinRepetidos(s) {
  const ultimaPos = new Map();
  let inicio = 0;
  let mejor = 0;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (ultimaPos.has(c) && ultimaPos.get(c) >= inicio) {
      inicio = ultimaPos.get(c) + 1;
    }
    ultimaPos.set(c, i);
    mejor = Math.max(mejor, i - inicio + 1);
  }

  return mejor;
}
```

## Por qué funciona

Recorrido con `sinRepetidos("abba")`, el caso que más errores encuentra:

| `i` | `c` | Última posición de `c` | ¿Dentro de la ventana? | `inicio` | Ventana | Largo | `mejor` |
|---|---|---|---|---|---|---|---|
| 0 | `a` | (no visto) | | 0 | `"a"` | 1 | 1 |
| 1 | `b` | (no visto) | | 0 | `"ab"` | 2 | 2 |
| 2 | `b` | 1 | sí (1 >= 0) | **2** | `"b"` | 1 | 2 |
| 3 | `a` | 0 | **no** (0 < 2) | 2 | `"ba"` | 2 | 2 |

En `i = 3` la `a` anterior está en la posición 0, que ya quedó **fuera** de la ventana (que empieza en 2). Si movieras `inicio` a 0 + 1 = 1, la ventana sería `"bba"`, con una `b` repetida, y darías 3. Por eso existe la condición `>= inicio`.

Con `"dvdf"`: en `i = 2` aparece otra `d` (antes en 0), así que `inicio` pasa a 1 y la ventana es `"vd"`. Con la `f` crece a `"vdf"`: largo 3. Si al repetirse hubieras reiniciado la ventana **en** el carácter repetido, te quedaría `"df"` y darías 2.

## Errores comunes

- **No revisar que la aparición anterior esté dentro de la ventana.** `inicio` retrocede y cuentas repetidos. Lo reconoces en el test `"abba"`: devuelves 3 en vez de 2.
- **Reiniciar la ventana en el carácter repetido** (`inicio = i`) en vez de después de su aparición anterior. Pierdes caracteres válidos: `"dvdf"` da 2.
- **Calcular el largo como `i - inicio`.** Te falta el `+ 1`: una ventana de `inicio = 0` a `i = 0` tiene un carácter, no cero.
- **Usar `if (ultimaPos.get(c))`** para preguntar si existe. Si la posición guardada es 0, el `if` no entra. Usa `has`.
- **Confundir subcadena con subsecuencia.** No puedes saltarte caracteres: en `"pwwkew"`, `"pwke"` no vale.

## Otra forma de resolverlo

**Fuerza bruta con `Set`** (paso 1): O(n²) de tiempo y O(k) de memoria, donde k es la cantidad de caracteres distintos. Fácil de escribir, buena como primera respuesta.

**Ventana con `Set` (borrando por la izquierda)**: cuando `s[i]` ya está en el `Set`, vas sacando `s[inicio]` y avanzando `inicio` hasta que deje de estar. Cada carácter entra y sale del `Set` como mucho una vez, así que también es O(n):

```js
const ventana = new Set();
let inicio = 0;
let mejor = 0;
for (let i = 0; i < s.length; i++) {
  while (ventana.has(s[i])) {
    ventana.delete(s[inicio]);
    inicio++;
  }
  ventana.add(s[i]);
  mejor = Math.max(mejor, i - inicio + 1);
}
return mejor;
```

**¿Cuál conviene?** La del `Set` es más fácil de razonar y no tiene la trampa de `"abba"`. La del `Map` salta directo en vez de avanzar de uno en uno. Las dos son O(n): escribe la que puedas explicar con seguridad.

## Cómo explicarlo en la entrevista

> "La solución directa es probar cada punto de inicio y extender mientras no haya repetidos, que es O(n²). Para mejorarlo uso una ventana deslizante: mantengo el inicio de una ventana sin repetidos y un Map con la última posición de cada carácter. Si el carácter actual ya apareció dentro de la ventana, muevo el inicio justo después de esa aparición; en cada paso actualizo el máximo. El detalle importante es comprobar que la aparición anterior esté dentro de la ventana, como en el caso abba. Queda O(n) de tiempo y O(k) de memoria, con k los caracteres distintos."

## Conceptos

- **Ventana deslizante**: dos índices que delimitan un tramo; uno avanza siempre y el otro solo cuando hace falta.
- **`Map` de últimas posiciones**: recordar dónde viste cada valor por última vez.
- **Invariante de la ventana**: "entre `inicio` e `i` no hay repetidos", y cada paso lo mantiene.
- **Largo de un rango inclusivo**: `fin - inicio + 1`.
- **`has` vs `get`**: `get` puede devolver 0 y engañar a un `if`.
