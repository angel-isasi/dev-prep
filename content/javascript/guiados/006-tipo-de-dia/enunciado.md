Escribe la función `tipoDeDia(dia)` que reciba el nombre de un día de la semana y devuelva:

- `"laboral"` si es de lunes a viernes,
- `"fin de semana"` si es sábado o domingo,
- `"día inválido"` si no es ningún día.

Resuélvelo con un **`switch`**.

## Reglas

- No distingue mayúsculas de minúsculas: `"Lunes"`, `"LUNES"` y `"lunes"` valen igual.
- Los días se escriben con tilde cuando la llevan: `"miércoles"` y `"sábado"`.
- Cualquier otro texto, como `"feriado"` o `""`, es `"día inválido"`.

## Ejemplos

```js
tipoDeDia("lunes");     // "laboral"
tipoDeDia("Viernes");   // "laboral"
tipoDeDia("sábado");    // "fin de semana"
tipoDeDia("DOMINGO");   // "fin de semana"
tipoDeDia("feriado");   // "día inválido"
```

## Por qué importa

El `switch` aparece cuando comparas **un mismo valor** contra muchas opciones fijas: estados de un pedido, acciones de un reducer en React, teclas presionadas. Agrupar varios `case` que comparten resultado y no olvidar el `break` (o el `return`) es lo que separa un `switch` bien escrito de uno con bugs.
