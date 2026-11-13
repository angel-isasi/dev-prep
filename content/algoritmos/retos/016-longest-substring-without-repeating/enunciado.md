Escribe la función `sinRepetidos(s)` que reciba una cadena y devuelva el **largo** de la subcadena más larga que **no tiene caracteres repetidos**.

Una subcadena es un tramo de caracteres **seguidos**: en `"pwwkew"`, `"wke"` es subcadena, pero `"pwke"` no (se salta una `w`).

## Reglas

- Devuelve un número (el largo), no la subcadena.
- La cadena puede estar vacía: devuelve `0`.
- Cualquier carácter cuenta, incluidos espacios y dígitos.
- Distingue mayúsculas: `"a"` y `"A"` son distintos.

## Ejemplos

```js
sinRepetidos("abcabcbb");   // 3   "abc"
sinRepetidos("bbbbb");      // 1   "b"
sinRepetidos("pwwkew");     // 3   "wke"
sinRepetidos("dvdf");       // 3   "vdf"
sinRepetidos("abba");       // 2   "ab" o "ba"
sinRepetidos("");           // 0
```

## Reto extra

Probar todas las subcadenas es O(n²) o peor. Con una **ventana deslizante** y un `Map` que recuerde dónde viste cada carácter por última vez, se resuelve en **una sola pasada**, O(n).
