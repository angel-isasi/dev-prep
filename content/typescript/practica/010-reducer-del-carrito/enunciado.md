En React, cuando el estado tiene varias formas de cambiar, se usa un **reducer**: una función `(estado, accion) => nuevoEstado` (es lo que recibe `useReducer`). Vas a escribir el reducer del carrito de una tienda, tipado con TypeScript.

Los tipos de los datos ya están en `inicio.ts`:

```ts
export interface Producto { id: number; nombre: string; precio: number }
export interface ItemCarrito extends Producto { cantidad: number }
export interface EstadoCarrito { items: ItemCarrito[] }
```

Tú completas:

1. `AccionCarrito`: una **unión discriminada** por `tipo` con 4 acciones:
   - `{ tipo: "agregar"; producto: Producto }`
   - `{ tipo: "quitar"; id: number }`
   - `{ tipo: "cambiarCantidad"; id: number; cantidad: number }`
   - `{ tipo: "vaciar" }`
2. `asegurarNunca(valor: never): never`: lanza un `Error` con el texto `"Acción desconocida"`. Sirve para la **exhaustividad**: si un día agregas una acción y olvidas su `case`, TypeScript da error.
3. `carritoReducer(estado: EstadoCarrito, accion: AccionCarrito): EstadoCarrito`.

## Reglas del reducer

- `agregar`: si el producto ya está en el carrito, súmale 1 a su `cantidad`; si no, agrégalo al final con `cantidad: 1`.
- `quitar`: elimina el ítem con ese `id`.
- `cambiarCantidad`: pone esa cantidad; si es `0` o menos, elimina el ítem.
- `vaciar`: deja `items` vacío.
- En el `default` del `switch`, llama a `asegurarNunca(accion)`.
- **No modifiques el estado que recibes**: devuelve un objeto nuevo (React compara referencias para saber si algo cambió).

## Ejemplos

```ts
const inca = { id: 1, nombre: "Inca Kola 1L", precio: 4.5 };
let estado: EstadoCarrito = { items: [] };

estado = carritoReducer(estado, { tipo: "agregar", producto: inca });
// { items: [{ id: 1, nombre: "Inca Kola 1L", precio: 4.5, cantidad: 1 }] }

estado = carritoReducer(estado, { tipo: "agregar", producto: inca });
// { items: [{ id: 1, ..., cantidad: 2 }] }

estado = carritoReducer(estado, { tipo: "cambiarCantidad", id: 1, cantidad: 0 });
// { items: [] }

carritoReducer(estado, { tipo: "quitar" });   // error de TypeScript: falta id
```

## Reto extra

Cuando termines, agrega a `AccionCarrito` una acción `{ tipo: "aplicarCupon"; codigo: string }` sin escribir su `case`. Mira el error que aparece en `asegurarNunca(accion)`: esa es la exhaustividad avisándote. Después quítala.
