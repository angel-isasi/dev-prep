## Idea clave

Una **unión de literales** (`"pendiente" | "pagado" | ...`) es un tipo que acepta solo esos textos exactos. Reemplaza al `string` genérico cuando los valores posibles son una lista cerrada: TypeScript rechaza los errores de tipeo, el editor autocompleta, y un `Record<EstadoPedido, string>` te obliga a cubrir cada estado.

## Paso a paso

1. **El tipo.** Un texto entre comillas usado como tipo es un **tipo literal**: `"pagado"` como tipo solo acepta el valor `"pagado"`. Con `|` los unes:

   ```ts
   export type EstadoPedido = "pendiente" | "pagado" | "enviado" | "entregado" | "cancelado";
   ```

2. **Los mensajes en un objeto.** En vez de 5 `if`, un objeto con un mensaje por estado. El tipo `Record<EstadoPedido, string>` significa "un objeto con **exactamente** esas 5 claves, todas con un string". Si falta una, `tsc` avisa: `La propiedad "cancelado" falta en el tipo ..., pero es obligatoria`.
3. **Leer el mensaje.** `MENSAJES[estado]`. Como `estado` es un `EstadoPedido`, TypeScript sabe que la clave existe.
4. **`puedeCancelarse`.** Compara con los dos estados permitidos. TypeScript también revisa las comparaciones: `estado === "pagdo"` (mal escrito) da error porque esa comparación nunca puede ser verdadera.

```ts
const MENSAJES: Record<EstadoPedido, string> = {
  pendiente: "Esperando el pago",
  pagado: "Pago recibido, estamos preparando tu pedido",
  enviado: "Tu pedido está en camino",
  entregado: "Pedido entregado",
  cancelado: "Pedido cancelado",
};

export function mensajeDeEstado(estado: EstadoPedido): string {
  return MENSAJES[estado];
}

export function puedeCancelarse(estado: EstadoPedido): boolean {
  return estado === "pendiente" || estado === "pagado";
}
```

## Por qué funciona

`mensajeDeEstado("enviado")`: busca la clave `enviado` en `MENSAJES` y devuelve `"Tu pedido está en camino"`.

`puedeCancelarse("enviado")`: `"enviado" === "pendiente"` es falso, `"enviado" === "pagado"` es falso, así que devuelve `false`.

Del lado de los tipos, compara lo que acepta cada versión:

| Llamada | Con `type EstadoPedido = string` | Con la unión |
|---|---|---|
| `mensajeDeEstado("pagado")` | compila | compila |
| `mensajeDeEstado("enviado-al-espacio")` | compila (y devuelve `undefined`) | **error** |
| `mensajeDeEstado("Pagado")` | compila | **error** |
| `mensajeDeEstado(textoDeLaApi)` (un `string`) | compila | **error** |

El último caso es importante: un `string` es más amplio que la unión (puede ser cualquier texto), así que no se puede pasar donde se espera un `EstadoPedido`. Si el texto viene de una API, primero lo validas (por ejemplo con `["pendiente", "pagado", ...].includes(texto)` y un *type guard*) y recién ahí lo usas.

## Errores comunes

- **Dejar `type EstadoPedido = string`.** Los valores funcionan, pero los `@ts-expect-error` de los tests quedan sin usar y `tsc` falla. Es justo lo que el ejercicio quiere evitar.
- **Escribir los literales sin comillas**: `type EstadoPedido = pendiente | pagado` busca tipos llamados `pendiente` y falla con "No se encuentra el nombre".
- **Usar `Record<string, string>` para los mensajes.** Compila, pero ya no te avisa si falta un estado, y `MENSAJES[estado]` podría ser `undefined` en la práctica.
- **Olvidar que las mayúsculas cuentan.** `"Pagado"` y `"pagado"` son tipos distintos.
- **Un `switch` sin `default` ni retorno final** con el tipo de retorno anotado: si cubres todos los casos TypeScript lo acepta, pero si falta uno da "La función carece de la instrucción return final".

## Otra forma de resolverlo

**Con `switch`**:

```ts
export function mensajeDeEstado(estado: EstadoPedido): string {
  switch (estado) {
    case "pendiente": return "Esperando el pago";
    case "pagado": return "Pago recibido, estamos preparando tu pedido";
    case "enviado": return "Tu pedido está en camino";
    case "entregado": return "Pedido entregado";
    case "cancelado": return "Pedido cancelado";
  }
}
```

Dentro de cada `case`, el editor autocompleta los estados. Como el `switch` cubre los 5, TypeScript sabe que la función siempre devuelve algo.

**¿Cuál conviene?** El objeto es mejor cuando solo traduces un valor a otro (estado a mensaje, estado a color de la etiqueta). El `switch` es mejor cuando cada caso hace cosas distintas.

**`enum`**: TypeScript también tiene `enum EstadoPedido { Pendiente = "pendiente", ... }`. Hoy muchos equipos prefieren la unión de literales: es más liviana (no genera código JavaScript) y funciona directo con los textos que llegan en un JSON.

## Cómo explicarlo en la entrevista

> "Como el estado solo puede tomar cinco valores, lo tipo como una unión de literales en vez de string. Así un error de tipeo como enviado-al-espacio falla al compilar y el editor autocompleta los estados. Los mensajes van en un Record de EstadoPedido a string, que me obliga a tener un mensaje por cada estado: si mañana agregan 'devuelto', TypeScript me marca dónde falta. Si el estado viene de una API como string, lo valido antes de usarlo. Prefiero esto a un enum porque no genera código y trabaja directo con los textos del JSON."

## Conceptos

- **Tipo literal**: `"pagado"` como tipo acepta solo ese valor.
- **Unión de literales**: `"a" | "b" | "c"`, una lista cerrada de valores.
- **`Record<Union, V>`**: objeto con exactamente las claves de la unión.
- **Asignabilidad**: un literal se puede asignar a `string`, pero un `string` no se puede asignar a una unión de literales.
- **`switch` exhaustivo**: si cubre todos los casos, TypeScript sabe que siempre retorna.
- **Unión de literales vs `enum`**.
- Tema de Aprender: uniones y narrowing en TypeScript.
