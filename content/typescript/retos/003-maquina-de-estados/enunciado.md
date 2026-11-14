Modela el ciclo de vida de un pedido de una tienda online como una **máquina de estados**: el pedido solo puede pasar de un estado a otro por caminos permitidos, y en cada estado tiene **solo** los datos que le corresponden.

## Los estados (tú escribes el tipo `Pedido`)

Una **unión discriminada** con la propiedad `estado` como discriminante. Todas las variantes tienen `id: string`.

| `estado` | Datos extra |
|---|---|
| `"pendiente"` | ninguno |
| `"pagado"` | `pagadoEn: string` |
| `"enviado"` | `pagadoEn: string`, `codigoSeguimiento: string` |
| `"entregado"` | `pagadoEn: string`, `codigoSeguimiento: string` |
| `"cancelado"` | `motivo: string` |

Las acciones ya vienen tipadas en el archivo de inicio:

```ts
type Accion =
  | { tipo: "pagar"; fecha: string }
  | { tipo: "enviar"; codigoSeguimiento: string }
  | { tipo: "entregar" }
  | { tipo: "cancelar"; motivo: string };
```

## Transiciones permitidas

```
pendiente --pagar--> pagado --enviar--> enviado --entregar--> entregado
    |                   |
    +----cancelar-------+--> cancelado
```

- `pagar` un pedido `pendiente`: pasa a `pagado` con `pagadoEn` igual a la `fecha` de la acción.
- `enviar` un pedido `pagado`: pasa a `enviado`, conserva `pagadoEn` y agrega `codigoSeguimiento`.
- `entregar` un pedido `enviado`: pasa a `entregado` con los mismos datos.
- `cancelar` un pedido `pendiente` o `pagado`: pasa a `cancelado` con el `motivo` (y sin `pagadoEn`).
- **Cualquier otra combinación** lanza `new Error("No se puede <tipo> un pedido <estado>")`, por ejemplo `"No se puede enviar un pedido pendiente"`.
- `transicionar` **no modifica** el pedido que recibe: devuelve uno nuevo.

## `mensajeDeEstado(pedido)`

| `estado` | Texto |
|---|---|
| `pendiente` | `"Pendiente de pago"` |
| `pagado` | `"Pagado el <pagadoEn>"` |
| `enviado` | `"En camino (seguimiento <codigoSeguimiento>)"` |
| `entregado` | `"Entregado"` |
| `cancelado` | `"Cancelado: <motivo>"` |

## Ejemplos

```ts
const p1 = transicionar({ estado: "pendiente", id: "P-1" }, { tipo: "pagar", fecha: "2026-11-14" });
// { estado: "pagado", id: "P-1", pagadoEn: "2026-11-14" }

const p2 = transicionar(p1, { tipo: "enviar", codigoSeguimiento: "OLV-123" });
mensajeDeEstado(p2);  // "En camino (seguimiento OLV-123)"

transicionar(p2, { tipo: "cancelar", motivo: "Ya no lo quiero" });
// Error: No se puede cancelar un pedido enviado

const malo: Pedido = { estado: "enviado", id: "P-9", pagadoEn: "2026-11-14" };
// Error de TypeScript: falta codigoSeguimiento
```

## Por qué importa

El modelo ingenuo es un solo objeto con todo opcional: `{ estado: string; pagadoEn?: string; codigoSeguimiento?: string; motivo?: string }`. Permite pedidos imposibles (un "pendiente" con código de seguimiento) y te obliga a revisar `undefined` en todas partes. Con una unión discriminada, **los estados imposibles no se pueden escribir**. Es la herramienta de TypeScript más útil en el día a día (estados de carga, respuestas de API, reducers) y una de las más preguntadas.
