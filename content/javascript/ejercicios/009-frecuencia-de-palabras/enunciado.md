Escribe la función `frecuencia(frase)` que reciba un texto y devuelva un **objeto** donde cada clave es una palabra y su valor es cuántas veces aparece.

## Reglas

- No distingue mayúsculas de minúsculas: `"Ica"` e `"ica"` son la misma palabra. Las claves van en minúsculas.
- Las palabras se separan por uno o más espacios. Los espacios al inicio o al final no cuentan.
- Si el texto está vacío, devuelve un objeto vacío `{}`.
- El texto no trae signos de puntuación.

## Ejemplos

```js
frecuencia("Ica es Ica");        // { ica: 2, es: 1 }
frecuencia("Hola hola HOLA");    // { hola: 3 }
frecuencia("  a   b  a ");       // { a: 2, b: 1 }
frecuencia("");                  // {}
```

## Por qué importa

Contar con un objeto es uno de los patrones que más aparecen en entrevistas: anagramas, el carácter más repetido, votos por candidato, productos más vendidos. Si dominas este, dominas todos esos.
