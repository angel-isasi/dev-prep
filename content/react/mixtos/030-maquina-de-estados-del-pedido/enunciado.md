Modela el flujo de compra de una pizzería como una **máquina de estados**: una tabla que dice, para cada paso, a qué paso lleva cada evento. Exporta:

1. `TRANSICIONES`: el objeto con la tabla.
2. `siguiente(estado, evento)`: función pura que devuelve el estado al que se pasa. Si el evento **no está permitido** en ese estado (o el estado no existe), devuelve el **mismo estado**.
3. `Checkout`: componente que usa `siguiente` como reducer de `useReducer`.

La tabla de transiciones es:

| Estado | Evento | Pasa a |
|---|---|---|
| `carrito` | `pagar` | `pago` |
| `pago` | `confirmar` | `confirmado` |
| `pago` | `volver` | `carrito` |
| `confirmado` | (ninguno) | |

## Reglas

- `Checkout` arranca en `carrito`.
- Muestra un párrafo con el texto **"Paso: estado"** (por ejemplo `Paso: carrito`).
- Muestra **un botón por cada evento permitido** en el estado actual, con el nombre del evento como texto (`pagar`, `confirmar`, `volver`). Los botones salen de la tabla, no los escribas a mano.
- En `confirmado` no hay eventos, así que **no se muestra ningún botón**.

## Ejemplo

```js
siguiente("carrito", "pagar");     // "pago"
siguiente("carrito", "confirmar"); // "carrito" (no se puede confirmar sin pagar)
siguiente("pago", "volver");       // "carrito"
```

| Acción | Se ve |
|---|---|
| (inicio) | Paso: carrito, botón `pagar` |
| clic en `pagar` | Paso: pago, botones `confirmar` y `volver` |
| clic en `confirmar` | Paso: confirmado, sin botones |

## Por qué importa

Muchos bugs de interfaz son "estados imposibles": confirmar un pedido sin pagar, o mostrar el botón de pagar cuando ya se pagó. Si el flujo vive en una tabla, solo existen las transiciones que escribiste. Es una idea que impresiona en entrevistas y que usan librerías como XState.
