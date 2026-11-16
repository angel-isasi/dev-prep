## El problema

Un blog quiere mostrar las palabras más usadas en los comentarios. La función que las cuenta ya está escrita y funciona. Te toca escribir **sus tests**. El texto lo escriben personas reales: con mayúsculas, signos, tildes, saltos de línea y a veces nada.

La app tiene **la función correcta y 6 versiones con un error escondido cada una**. Tus tests tienen que pasar con la correcta y **fallar** con cada versión con error.

## La función que vas a probar

`contarPalabras(texto)` devuelve un objeto donde cada clave es una palabra y su valor es cuántas veces aparece:

- **No distingue mayúsculas**: `"Hola"` y `"hola"` son la misma palabra, y la clave va en minúsculas.
- **Ignora los signos** `. , ; : ! ? ¡ ¿`.
- **Respeta las tildes y la ñ**: `"año"` es una palabra completa.
- Separa por **cualquier espacio en blanco**: espacios, tabulaciones o saltos de línea.
- Un texto vacío o de solo espacios devuelve `{}`.

```js
contarPalabras("el gato y el perro");  // { el: 2, gato: 1, y: 1, perro: 1 }
contarPalabras("¡Hola! hola, HOLA.");  // { hola: 3 }
contarPalabras("año está");            // { año: 1, está: 1 }
contarPalabras("uno\ndos");            // { uno: 1, dos: 1 }
contarPalabras("");                    // {}
```

## Tu tarea

En tu archivo, la función `misTests` recibe `test`, `expect` y la función a probar. Escribe ahí tus tests, igual que en Vitest:

```js
export function misTests({ test, expect }, contarPalabras) {
  test("cuenta cada palabra", () => {
    expect(contarPalabras("el gato y el perro")).toEqual({ el: 2, gato: 1, y: 1, perro: 1 });
  });
}
```

Para comparar objetos usa `toEqual`. No importa en qué orden escribas las claves: `{ a: 1, b: 2 }` y `{ b: 2, a: 1 }` son iguales para `toEqual`.

Escribe **al menos 3 tests**. Haz una lista de "tipos de texto" que puede recibir la función y prueba uno de cada tipo.
