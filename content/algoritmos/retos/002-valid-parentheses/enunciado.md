Escribe la función `esValido(s)` que reciba una cadena formada solo por los caracteres `(`, `)`, `[`, `]`, `{` y `}`, y devuelva `true` si todos los paréntesis están bien cerrados, o `false` si no.

Una cadena es válida cuando:

1. Cada símbolo que abre se cierra con uno **del mismo tipo**.
2. Se cierran **en el orden correcto**: el último que abriste es el primero que debes cerrar.
3. No hay cierres sin su apertura, ni aperturas que se quedan sin cerrar.

## Reglas

- La cadena solo contiene `()[]{}`, sin espacios ni letras.
- La cadena vacía `""` es válida (no hay nada mal cerrado).
- `"([)]"` **no** es válida: hay la misma cantidad de cada tipo, pero se cierran cruzados.

## Ejemplos

```js
esValido("()[]{}");   // true
esValido("([])");     // true   anidados bien
esValido("(]");       // false  se cierra con otro tipo
esValido("([)]");     // false  cruzados
esValido("((");       // false  quedan abiertos
esValido("]");        // false  cierra algo que nunca se abrió
```

## Reto extra

Resuélvelo recorriendo la cadena **una sola vez**, en O(n). Pista de entrevista: piensa en qué estructura de datos devuelve primero lo último que guardaste.
