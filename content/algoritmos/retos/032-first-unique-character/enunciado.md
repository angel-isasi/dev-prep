Escribe la función `primerUnico(s)` que reciba una cadena y devuelva el **índice** del primer carácter que aparece **una sola vez** en toda la cadena. Si no hay ninguno, devuelve `-1`.

"Primero" significa el que está más a la izquierda en la cadena.

## Reglas

- Devuelve un índice (un número), no el carácter.
- Si todos los caracteres se repiten, o la cadena está vacía, devuelve `-1`.
- Distingue mayúsculas: `"a"` y `"A"` son caracteres distintos.
- Cualquier carácter cuenta, incluidos espacios y dígitos.

## Ejemplos

```js
primerUnico("leetcode");      // 0    la "l" no se repite
primerUnico("loveleetcode");  // 2    la "v"
primerUnico("aabb");          // -1   todos se repiten
primerUnico("");              // -1
```

## Reto extra

Para cada carácter podrías recorrer toda la cadena y contar cuántas veces sale, pero eso es O(n²). ¿Puedes hacerlo en **dos pasadas**, O(n)?
