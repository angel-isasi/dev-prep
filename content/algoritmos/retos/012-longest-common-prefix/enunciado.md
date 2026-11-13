Escribe la función `prefijoComun(palabras)` que reciba un arreglo de palabras y devuelva el **prefijo común más largo**: el texto más largo con el que empiezan **todas** las palabras. Si no hay ninguno, devuelve `""`.

## Reglas

- Si el arreglo está vacío, devuelve `""`.
- Si hay una sola palabra, el prefijo es la palabra completa.
- Distingue mayúsculas: `"Casa"` y `"casa"` no comparten prefijo.
- Si alguna palabra es `""`, el prefijo común es `""`.

## Ejemplos

```js
prefijoComun(["flower", "flow", "flight"]);    // "fl"
prefijoComun(["dog", "racecar", "car"]);       // ""
prefijoComun(["casa", "casas", "casado"]);     // "casa"
prefijoComun(["solo"]);                        // "solo"
prefijoComun([]);                              // ""
```
