## El problema

La diseñadora manda una captura: "Cuando el carrito está vacío aparece un **0 suelto** arriba del botón 'Seguir comprando'. Queda feo y la gente cree que es un error". Con productos en el carrito se ve bien.

## Qué debe hacer

`ResumenCarrito` recibe la prop `cantidad`:

- Si `cantidad` es mayor que 0, muestra el párrafo `Productos en tu carrito: N`.
- Siempre muestra el botón `Seguir comprando`.
- Con el carrito vacío no aparece nada más que el botón.

| Uso | Se ve |
|---|---|
| `<ResumenCarrito cantidad={3} />` | Productos en tu carrito: 3 / [Seguir comprando] |
| `<ResumenCarrito cantidad={0} />` | [Seguir comprando] |

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
