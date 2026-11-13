## Idea clave

Usa un objeto como **contador**: cada palabra es una clave y su valor es cuántas veces apareció. Recorres las palabras una sola vez y en cada una sumas 1.

## Paso a paso

1. **Unifica mayúsculas** con `toLowerCase()`. Así `"Ica"` e `"ica"` terminan siendo la misma clave.
2. **Corta el texto en palabras** con `split(/\s+/)`. La expresión regular `\s+` significa "uno o más espacios seguidos", así que `"a   b"` se corta en `["a", "b"]` y no en `["a", "", "", "b"]`.
3. **Quita los textos vacíos** con `filter(Boolean)`. Aparecen cuando el texto empieza o termina con espacios, o cuando está vacío. `Boolean("")` es `false`, así que `filter` los descarta.
4. **Crea el contador** vacío: `const conteo = {}`.
5. **Recorre y suma**: para cada palabra, `conteo[palabra] = (conteo[palabra] ?? 0) + 1`. Si la palabra ya estaba, toma su valor; si no estaba, `conteo[palabra]` es `undefined` y el `?? 0` lo convierte en 0.
6. **Devuelve** el objeto.

```js
export function frecuencia(frase) {
  const conteo = {};
  const palabras = frase.toLowerCase().split(/\s+/).filter(Boolean);

  for (const palabra of palabras) {
    conteo[palabra] = (conteo[palabra] ?? 0) + 1;
  }

  return conteo;
}
```

## Por qué funciona

Recorrido con `frecuencia("Ica es Ica")`:

- Después de `toLowerCase()`: `"ica es ica"`.
- Después de `split(/\s+/)`: `["ica", "es", "ica"]`.
- `filter(Boolean)` no quita nada, porque no hay textos vacíos.

| Vuelta | `palabra` | `conteo[palabra] ?? 0` | `conteo` al terminar la vuelta |
|---|---|---|---|
| antes del bucle | | | `{}` |
| 1 | `"ica"` | `0` (no existía) | `{ ica: 1 }` |
| 2 | `"es"` | `0` (no existía) | `{ ica: 1, es: 1 }` |
| 3 | `"ica"` | `1` | `{ ica: 2, es: 1 }` |

Y con espacios de sobra, `"  a   b  a "`:

- `split(/\s+/)` da `["", "a", "b", "a", ""]`: los extremos quedan vacíos porque el texto empieza y termina con espacios.
- `filter(Boolean)` los quita: `["a", "b", "a"]` y el resultado es `{ a: 2, b: 1 }`.

Con el texto vacío, `"".split(/\s+/)` da `[""]`, el filtro lo deja en `[]`, el bucle no da ninguna vuelta y se devuelve `{}`.

## Errores comunes

- **Usar `split(" ")` en vez de `split(/\s+/)`.** Con `"a  b"` (dos espacios) da `["a", "", "b"]` y terminas contando la palabra vacía: `{ a: 1, "": 1, b: 1 }`. Lo reconoces porque en el test de espacios dobles aparece una clave `""` en lo recibido.
- **Olvidar el `filter(Boolean)`.** Con el texto vacío devuelves `{ "": 1 }` en vez de `{}`.
- **Sumar sin inicializar: `conteo[palabra]++` o `conteo[palabra] += 1`.** La primera vez `conteo[palabra]` es `undefined`, y `undefined + 1` es `NaN`. Lo reconoces porque recibes `{ ica: NaN, es: NaN }`.
- **Olvidar `toLowerCase()`.** Con `"Hola hola HOLA"` recibes `{ Hola: 1, hola: 1, HOLA: 1 }`.
- **Olvidar el `return`.** La función devuelve `undefined` y todos los tests fallan con "expected undefined to deeply equal...".

## Otra forma de resolverlo

Con `reduce`, encadenando todo:

```js
export function frecuencia(frase) {
  return frase
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .reduce((conteo, palabra) => {
      conteo[palabra] = (conteo[palabra] ?? 0) + 1;
      return conteo;
    }, {});
}
```

`reduce` recibe el acumulador (`conteo`) y el elemento actual (`palabra`), y lo que devuelves en cada vuelta pasa a ser el acumulador de la siguiente. El `{}` del final es el valor inicial.

**¿Cuál conviene?** Las dos son correctas y un entrevistador acepta cualquiera. El `for...of` es más fácil de leer y de explicar en voz alta; `reduce` muestra que manejas métodos de array. Si dudas, usa el bucle y menciona que también se puede con `reduce`.

**Detalle avanzado (suma puntos si lo mencionas):** un objeto `{}` hereda propiedades como `constructor`. Con `frecuencia("constructor")`, `conteo["constructor"]` ya existe (es una función) y el resultado sale mal. Se evita con `Object.create(null)` (un objeto sin herencia) o con un `Map`:

```js
const conteo = new Map();
for (const palabra of palabras) {
  conteo.set(palabra, (conteo.get(palabra) ?? 0) + 1);
}
return Object.fromEntries(conteo); // lo convierte a objeto normal
```

## Cómo explicarlo en la entrevista

> "Primero normalizo el texto: lo paso a minúsculas y lo corto por uno o más espacios, y filtro los textos vacíos que quedan en los extremos. Después uso un objeto como contador: recorro las palabras y, para cada una, sumo 1 a lo que ya tenía, o arranco en 0 si es la primera vez. Recorro el texto una sola vez, así que es O(n). Si las palabras pudieran ser cosas como `constructor`, usaría un `Map` para evitar choques con las propiedades heredadas del objeto."

## Conceptos

- **Objeto como diccionario**: guardar y leer con corchetes, `obj[clave]`, cuando la clave está en una variable.
- **`toLowerCase()`**: devuelve una copia del texto en minúsculas.
- **`split()` con expresión regular**: `\s` es cualquier espacio en blanco y `+` significa "uno o más".
- **`filter(Boolean)`**: atajo para quitar valores "falsy" (`""`, `0`, `null`, `undefined`, `NaN`, `false`).
- **Operador `??`**: devuelve el lado derecho solo si el izquierdo es `null` o `undefined`.
- **`for...of`**: recorre los valores de un array.
- **`reduce`**: convierte un array en un solo valor acumulado.
