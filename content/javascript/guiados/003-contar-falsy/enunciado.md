Escribe la función `contarFalsy(valores)` que reciba un array con valores de cualquier tipo y devuelva **cuántos son falsy**.

Un valor es **falsy** cuando JavaScript lo trata como `false` dentro de un `if`. Todos los demás son **truthy**.

## Reglas

- El array puede traer cualquier cosa: números, textos, `null`, objetos, arrays.
- Si el array está vacío, devuelve `0`.
- No modifiques el array que recibes.

## Ejemplos

```js
contarFalsy([0, 1, 2]);                   // 1   (solo el 0)
contarFalsy(["", "hola", null]);          // 2   ("" y null)
contarFalsy(["0", "false", [], {}]);      // 0   (¡todos son truthy!)
contarFalsy([]);                          // 0
```

## Por qué importa

Cada `if (algo)` que escribes depende de esta regla. Si no la tienes clara, un `0` o un texto vacío te rompen la lógica sin que lo notes. Y en entrevistas es clásico preguntar "¿cuáles son los valores falsy?" o "¿`[]` es truthy?".
