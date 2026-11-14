Escribe la función `sonIsomorfas(s, t)` que devuelva `true` si las dos cadenas son **isomorfas**, o `false` si no.

Dos cadenas son isomorfas si puedes obtener `t` **reemplazando** cada carácter de `s` por otro, siguiendo estas condiciones:

- Todas las apariciones de un mismo carácter se reemplazan por el **mismo** carácter.
- Dos caracteres **distintos** no pueden reemplazarse por el mismo carácter.
- Un carácter sí puede reemplazarse por sí mismo.

Dicho de otra forma: las dos cadenas tienen el mismo "patrón". `"egg"` y `"add"` tienen el patrón "uno, otro, el otro repetido".

## Reglas

- Las dos cadenas tienen el mismo largo.
- Dos cadenas vacías son isomorfas.
- Distingue mayúsculas.

## Ejemplos

```js
sonIsomorfas("egg", "add");      // true    e -> a, g -> d
sonIsomorfas("foo", "bar");      // false   la o tendría que ser a la vez a y r
sonIsomorfas("paper", "title");  // true    p -> t, a -> i, e -> l, r -> e
sonIsomorfas("badc", "baba");    // false   b y d quieren ir las dos a b
```

## Reto extra

El caso `"badc"` y `"baba"` engaña a muchas soluciones que solo revisan en una dirección. ¿Puedes resolverlo en **una pasada**, O(n), revisando el reemplazo en los dos sentidos?
