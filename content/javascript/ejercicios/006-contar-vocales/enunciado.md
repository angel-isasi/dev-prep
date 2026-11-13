Escribe la función `contarVocales(texto)` que reciba un texto y devuelva **cuántas vocales tiene**.

## Reglas

- Cuentan las vocales `a e i o u` en **mayúsculas o minúsculas**.
- También cuentan las vocales **con tilde** (`á é í ó ú`) y la `ü` (como en "pingüino").
- Las demás letras, números, espacios y signos no cuentan.
- Si no hay vocales, o el texto está vacío, devuelve `0`.

## Ejemplos

```js
contarVocales("Arqueología");     // 7
contarVocales("AEIOU");           // 5
contarVocales("canción árbol");   // 5
contarVocales("pingüino");        // 4
contarVocales("xyz");             // 0
contarVocales("");                // 0
```

## Por qué importa

Recorrer un texto carácter por carácter y decidir si cada uno "cuenta" es la base de validaciones de formularios, buscadores y contadores. Además, en español las tildes son un caso borde real que muchos olvidan.
