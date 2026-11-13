Escribe la función `puedeEscribir(nota, revista)` que devuelva `true` si puedes armar el texto `nota` recortando letras de `revista`, o `false` si no.

Cada letra de la revista se puede usar **una sola vez**: si la nota tiene dos `a`, la revista necesita al menos dos `a`.

## Reglas

- El orden de las letras en la revista no importa.
- Distingue mayúsculas: `"A"` y `"a"` son letras distintas.
- Una nota vacía siempre se puede escribir.
- A la revista le pueden sobrar letras.

## Ejemplos

```js
puedeEscribir("a", "b");          // false  no hay ninguna a
puedeEscribir("aa", "ab");        // false  solo hay una a
puedeEscribir("aa", "aab");       // true
puedeEscribir("hola", "alohxyz"); // true   sobran letras, no importa el orden
```

## Reto extra

Buscar cada letra de la nota en la revista (y tacharla) es O(n · m). ¿Puedes hacerlo en **O(n + m)** recorriendo cada texto una sola vez?
