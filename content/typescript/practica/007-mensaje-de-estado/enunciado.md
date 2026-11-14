En la página "Mis pedidos" de una tienda online, cada pedido muestra un mensaje según su estado. Un pedido solo puede estar en uno de estos 5 estados, y ningún otro:

`"pendiente"`, `"pagado"`, `"enviado"`, `"entregado"`, `"cancelado"`

1. Define el tipo `EstadoPedido` como una **unión de literales** con esos 5 textos.
2. Escribe `mensajeDeEstado(estado: EstadoPedido): string` que devuelva:

| Estado | Mensaje |
|---|---|
| `"pendiente"` | `"Esperando el pago"` |
| `"pagado"` | `"Pago recibido, estamos preparando tu pedido"` |
| `"enviado"` | `"Tu pedido está en camino"` |
| `"entregado"` | `"Pedido entregado"` |
| `"cancelado"` | `"Pedido cancelado"` |

3. Escribe `puedeCancelarse(estado: EstadoPedido): boolean`: un pedido solo se puede cancelar si está `"pendiente"` o `"pagado"` (ya enviado, no).

## Reglas

- Un estado inventado, como `"enviado-al-espacio"`, debe ser un **error de tipos**.
- Un `string` cualquiera tampoco se acepta: si el texto viene de afuera, primero hay que comprobar que es un estado válido.
- Los tests revisan el tipo `EstadoPedido` con `tsc`.

## Ejemplos

```ts
mensajeDeEstado("pagado");      // "Pago recibido, estamos preparando tu pedido"
mensajeDeEstado("enviado");     // "Tu pedido está en camino"
puedeCancelarse("pendiente");   // true
puedeCancelarse("enviado");     // false

mensajeDeEstado("enviado-al-espacio");   // error de TypeScript
```

## Reto extra

Escribe `mensajeDeEstado("` en VS Code y espera: el editor te sugiere los 5 estados. Las uniones de literales le dan autocompletado a tus textos.
