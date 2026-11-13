## Idea clave

Con una **expresión regular** describes "cualquier vocal, con o sin tilde, mayúscula o minúscula", y `match` te devuelve todas las que encontró. Cuentas cuántas son con `length`. El detalle: si no encuentra nada, `match` devuelve `null`, y `??` lo cambia por un arreglo vacío.

## Paso a paso

1. **Arma la expresión regular** `/[aeiouáéíóúü]/gi`:
   - `[...]` es un **conjunto**: coincide con *uno* de los caracteres de adentro.
   - La bandera `g` (global) busca **todas** las coincidencias, no solo la primera.
   - La bandera `i` ignora mayúsculas: `A` y `Á` también coinciden.
2. **Usa `texto.match(regex)`**. Con la bandera `g` devuelve un arreglo con cada vocal encontrada, por ejemplo `["A", "u", "e", ...]`.
3. **Protégete del `null`**: si no hay ninguna vocal, `match` devuelve `null`. Con `?? []` lo reemplazas por un arreglo vacío.
4. **Devuelve `length`** del arreglo: la cantidad de vocales.

```js
export function contarVocales(texto) {
  const vocales = texto.match(/[aeiouáéíóúü]/gi) ?? [];
  return vocales.length;
}
```

## Por qué funciona

| Texto | `texto.match(/[aeiouáéíóúü]/gi)` | Después de `?? []` | `length` |
|---|---|---|---|
| `"Arqueología"` | `["A", "u", "e", "o", "o", "í", "a"]` | igual | `7` |
| `"AEIOU"` | `["A", "E", "I", "O", "U"]` | igual | `5` |
| `"canción árbol"` | `["a", "i", "ó", "á", "o"]` | igual | `5` |
| `"xyz"` | `null` | `[]` | `0` |
| `""` | `null` | `[]` | `0` |

Fíjate en `"Arqueología"`: la `A` mayúscula entra gracias a la `i`, y la `í` entra porque está dentro del conjunto. Los espacios y las consonantes no están en el conjunto, así que se ignoran solos.

## Errores comunes

- **No cuidar el `null` de `match`**: `texto.match(...).length` lanza **TypeError: Cannot read properties of null (reading 'length')** cuando no hay vocales. Lo reconoces porque fallan los tests de `"xyz"` y del texto vacío con ese mensaje.
- **Olvidar la bandera `g`**: sin ella, `match` devuelve solo la primera coincidencia (con datos extra), y el conteo sale mal. Por ejemplo `"Arqueología"` da `1`.
- **Olvidar la bandera `i`** o el `toLowerCase()`: no cuenta las mayúsculas. Lo reconoces porque `contarVocales("AEIOU")` da `0` y `"Arqueología"` da `6`.
- **Olvidar las tildes o la `ü`** en la lista de vocales. Lo reconoces porque `"canción árbol"` da `3` en vez de `5`, o `"pingüino"` da `3` en vez de `4`.
- **Usar `includes` al revés**: `"aeiou".includes(texto)` pregunta si el texto entero está dentro de `"aeiou"`, y casi siempre da `false`. Debe ser `vocales.includes(letra)`, letra por letra. Lo reconoces porque casi todos los tests reciben `0`.

## Otra forma de resolverlo

Sin expresiones regulares, con un bucle:

```js
export function contarVocales(texto) {
  const vocales = "aeiouáéíóúü";
  let cuenta = 0;
  for (const letra of texto.toLowerCase()) {
    if (vocales.includes(letra)) {
      cuenta++;
    }
  }
  return cuenta;
}
```

`for...of` sobre un texto recorre sus caracteres uno por uno. `toLowerCase()` convierte `"Á"` en `"á"`, así la lista de vocales solo necesita minúsculas.

**¿Cuál conviene?** El bucle es más fácil de leer si aún no dominas las expresiones regulares, y es igual de rápido (O(n)). La versión con `match` es más corta y muy común en código real. En una entrevista, cualquiera vale; lo importante es que menciones los casos de mayúsculas y tildes.

## Cómo explicarlo en la entrevista

> "Uso una expresión regular con un conjunto de vocales que incluye las tildes y la ü, con la bandera `g` para encontrar todas y la `i` para ignorar mayúsculas. `match` me da un arreglo con las coincidencias y cuento su longitud. Como `match` devuelve `null` cuando no encuentra nada, lo cambio por un arreglo vacío con `??`. Es O(n) porque revisa cada carácter una vez. Si no quisiera regex, haría un `for...of` con `includes`."

## Conceptos

- **Expresión regular**: un patrón para buscar texto, escrito entre barras: `/patrón/banderas`.
- **Conjunto `[...]`**: coincide con un solo carácter de los que pongas adentro.
- **Banderas `g` e `i`**: `g` busca todas las coincidencias; `i` ignora mayúsculas y minúsculas.
- **`match`**: devuelve un arreglo con las coincidencias, o `null` si no hay ninguna.
- **Operador `??`**: usa el valor de la derecha solo si el de la izquierda es `null` o `undefined`.
- **`for...of` sobre un string**: recorre el texto carácter por carácter.
- **`includes`**: dice si un texto (o arreglo) contiene un valor.
