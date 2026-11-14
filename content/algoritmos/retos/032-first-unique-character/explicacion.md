## Idea clave

No puedes saber si un carácter es único hasta haber visto **toda** la cadena. Por eso haces dos pasadas: en la primera cuentas cuántas veces aparece cada carácter, y en la segunda recorres la cadena en orden y devuelves el primer índice cuyo conteo es 1.

## Paso a paso

1. **La solución directa** (dila en voz alta): para cada posición `i`, recorre toda la cadena contando cuántas veces aparece `s[i]`. Si sale una sola vez, devuelve `i`. Es O(n²) porque por cada carácter recorres todo de nuevo.

   ```js
   for (let i = 0; i < s.length; i++) {
     let veces = 0;
     for (const c of s) {
       if (c === s[i]) veces++;
     }
     if (veces === 1) return i;
   }
   return -1;
   ```

2. **¿Qué trabajo se repite?** Cuentas la misma letra muchas veces. En `"loveleetcode"` cuentas las `e` en cada una de sus cuatro apariciones. Mejor contar **todo una sola vez** y guardar el resultado.
3. **Primera pasada: contar.** Un `Map` de carácter a cantidad. `conteo.get(c) || 0` da 0 la primera vez que ves el carácter.
4. **Segunda pasada: buscar en orden.** Recorre la cadena **por índice** (necesitas devolver la posición) y pregunta `conteo.get(s[i]) === 1`. El primero que cumpla es la respuesta, porque recorres de izquierda a derecha.
5. **Si terminas sin encontrar**, devuelve `-1`. Esto también cubre la cadena vacía: ningún bucle entra.

```js
export function primerUnico(s) {
  const conteo = new Map();
  for (const c of s) {
    conteo.set(c, (conteo.get(c) || 0) + 1);
  }

  for (let i = 0; i < s.length; i++) {
    if (conteo.get(s[i]) === 1) return i;
  }

  return -1;
}
```

## Por qué funciona

Recorrido con `primerUnico("loveleetcode")`. Después de la primera pasada:

`conteo = { l: 2, o: 2, v: 1, e: 4, t: 1, c: 1, d: 1 }`

Segunda pasada:

| `i` | `s[i]` | `conteo.get(s[i])` | ¿Es 1? |
|---|---|---|---|
| 0 | `l` | 2 | no |
| 1 | `o` | 2 | no |
| 2 | `v` | 1 | **sí: devuelve 2** |

Fíjate que la `t`, la `c` y la `d` también son únicas, pero la segunda pasada va en el orden de la cadena, así que la `v` (índice 2) gana.

Con `"abcabd"` se ve por qué hace falta la primera pasada completa: al leer la `a` en el índice 0 parece única, pero vuelve a salir en el índice 3. Con el conteo completo, `a: 2`, `b: 2`, `c: 1`, `d: 1`, y la respuesta es 2.

## Errores comunes

- **Decidir en una sola pasada.** Por ejemplo, devolver el primer carácter que "todavía no habías visto". En `"abcabd"` devolverías 0, porque la `a` aún no se había repetido. Lo reconoces en el test "una letra que se repite más adelante no es única".
- **Devolver el carácter en vez del índice.** Te piden `2`, no `"v"`.
- **Recorrer el `Map` en la segunda pasada sin guardar índices.** El `Map` sí respeta el orden de la primera aparición, pero no te dice la posición. Lo más simple es recorrer la cadena.
- **Olvidar el `|| 0`** al contar: `undefined + 1` es `NaN`, y `NaN === 1` nunca es verdad, así que siempre devolverías `-1`.
- **Pasar todo a minúsculas.** El enunciado distingue mayúsculas: en `"aAa"` la respuesta es 1, la `A`.

## Otra forma de resolverlo

**Doble bucle contando** (paso 1): O(n²) de tiempo y O(1) de memoria.

**`indexOf` y `lastIndexOf`**: un carácter es único si su primera y su última aparición están en la misma posición.

```js
for (let i = 0; i < s.length; i++) {
  if (s.indexOf(s[i]) === s.lastIndexOf(s[i])) return i;
}
return -1;
```

Es muy corta y fácil de leer, pero cada `indexOf` recorre la cadena: sigue siendo O(n²).

**Objeto en vez de `Map`**: `conteo[c] = (conteo[c] || 0) + 1`. Funciona igual; el `Map` es más claro cuando las claves pueden ser cualquier cosa.

**¿Cuál conviene?** La de conteo con dos pasadas: O(n) de tiempo y O(k) de memoria, con k la cantidad de caracteres distintos. Si solo hubiera letras `a-z`, k es como mucho 26 y la memoria es O(1).

## Cómo explicarlo en la entrevista

> "No puedo saber si un carácter es único hasta ver toda la cadena, así que hago dos pasadas. En la primera cuento cuántas veces aparece cada carácter con un Map. En la segunda recorro la cadena en orden y devuelvo el primer índice cuyo conteo sea 1; si no hay ninguno, devuelvo -1. La forma directa de contar cada carácter recorriendo todo es O(n²); con el conteo previo queda O(n) de tiempo y O(k) de memoria, con k los caracteres distintos."

## Conceptos

- **Conteo con `Map`**: `map.set(c, (map.get(c) || 0) + 1)`.
- **Dos pasadas**: primero juntas información, después decides con toda la información.
- **Recorrer por índice** cuando la respuesta es una posición.
- **`indexOf` y `lastIndexOf` son O(n)**: dentro de un bucle dan O(n²).
- **Mismo patrón que Ransom Note y Valid Anagram**: contar caracteres.
