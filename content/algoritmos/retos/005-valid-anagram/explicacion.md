## Idea clave

Dos palabras son anagramas si cada letra aparece **la misma cantidad de veces** en las dos. Cuentas las letras de la primera con un objeto y "gastas" ese conteo con la segunda: si alguna letra no alcanza, no son anagramas.

## Paso a paso

1. **Revisa los largos primero.** Si `a` tiene 3 letras y `b` tiene 4, es imposible que sean anagramas. Es O(1) y te ahorra trabajo.
2. **La solución directa** (dila en voz alta): ordenar las letras de las dos palabras y comparar. Dos anagramas ordenados dan la misma cadena. Funciona y es corta, pero ordenar cuesta O(n log n).

   ```js
   const ordenar = (p) => [...p].sort().join("");
   return ordenar(a) === ordenar(b);
   ```

3. **Mejora contando.** Recorre `a` y guarda en un objeto cuántas veces aparece cada letra: `conteo[letra] = (conteo[letra] || 0) + 1`. El `|| 0` es para la primera vez, cuando `conteo[letra]` todavía es `undefined`.
4. **Gasta con `b`.** Por cada letra de `b`, si su conteo es 0 o no existe, esa letra sobra en `b`: devuelve `false`. Si hay, resta 1.
5. **¿Por qué no hace falta revisar al final que todo quedó en 0?** Porque ya sabes que los largos son iguales. Si `b` gastó exactamente `n` letras sin que faltara ninguna, no puede sobrar nada en el conteo.

```js
export function esAnagrama(a, b) {
  if (a.length !== b.length) return false;

  const conteo = {};
  for (const letra of a) {
    conteo[letra] = (conteo[letra] || 0) + 1;
  }

  for (const letra of b) {
    if (!conteo[letra]) return false;
    conteo[letra]--;
  }

  return true;
}
```

## Por qué funciona

Recorrido con `esAnagrama("aab", "abb")`. Después de contar `a`, el objeto queda `{ a: 2, b: 1 }`. Ahora gastamos con `b`:

| Letra de `b` | `conteo[letra]` antes | ¿Hay? | `conteo` después |
|---|---|---|---|
| `a` | 2 | sí | `{ a: 1, b: 1 }` |
| `b` | 1 | sí | `{ a: 1, b: 0 }` |
| `b` | **0** | **no** | devuelve `false` |

La segunda `b` no tiene de dónde salir: en `"aab"` solo había una. Este es justo el caso que rompe la idea de comparar solo **qué** letras hay (con un `Set` las dos palabras dan `{a, b}`).

Con `esAnagrama("roma", "amor")`: el conteo es `{ r: 1, o: 1, m: 1, a: 1 }` y cada letra de `"amor"` lo baja a 0 sin que falte ninguna. Devuelve `true`.

## Errores comunes

- **Comparar con `Set`.** `new Set("aab")` y `new Set("abb")` son iguales, pero no son anagramas. Lo reconoces en el test de "distintas cantidades".
- **Olvidar el `|| 0`.** `conteo[letra] + 1` con `undefined` da `NaN`, y luego `!NaN` es `true`: todo sale `false`.
- **No revisar los largos.** Sin ese `if`, `esAnagrama("a", "ab")` da `false` igual (falta la `b`), pero `esAnagrama("ab", "a")` da `true`, porque `"a"` gasta su letra y nunca se revisa que sobró la `b`.
- **Usar `p.sort()` sobre una cadena.** Las cadenas no tienen `sort`: hay que pasarla a arreglo con `[...p]` y luego unir con `join("")`.
- **Usar `includes` o `indexOf` dentro del bucle.** Funciona si vas borrando letras, pero cada búsqueda recorre la palabra: O(n²).

## Otra forma de resolverlo

**Ordenar y comparar** (paso 2): O(n log n) de tiempo y O(n) de memoria por los arreglos que creas. Su gran ventaja es que se escribe en dos líneas y casi no tiene dónde fallar.

**Contar con un arreglo de 26 posiciones** en lugar de un objeto, usando `letra.charCodeAt(0) - 97` como índice. Es O(n) y la memoria es fija, O(1), pero solo sirve si sabes que son letras `a-z`.

**¿Cuál conviene?** En entrevista, menciona la de ordenar como primera idea y escribe la de conteo: es O(n) y el mismo patrón te sirve para Ransom Note y Group Anagrams.

## Cómo explicarlo en la entrevista

> "Podría ordenar las dos palabras y compararlas, pero eso es O(n log n). Prefiero contar: primero reviso que tengan el mismo largo, porque si no ya sé que no son anagramas. Luego recorro la primera sumando cuántas veces aparece cada letra en un objeto, y recorro la segunda restando. Si me piden una letra que ya no tengo, devuelvo false. Queda O(n) de tiempo y O(k) de memoria, donde k es la cantidad de letras distintas."

## Conceptos

- **Objeto como contador**: `conteo[clave] = (conteo[clave] || 0) + 1`, el patrón más usado en problemas de frecuencias.
- **Valores "falsy"**: `undefined`, `0`, `NaN` y `""` son falsos en un `if`. Aquí `!conteo[letra]` aprovecha que 0 y `undefined` significan "no hay".
- **Spread de una cadena**: `[...palabra]` la convierte en un arreglo de letras.
- **O(n log n) vs O(n)**: ordenar casi siempre cuesta O(n log n); contar con un objeto, O(n).
- **Validar antes de trabajar**: revisar los largos es una salida temprana barata.
