Vas a escribir la lógica de un carrito de compras como un **reducer**: una función pura `(estado, accion) => nuevoEstado`. Luego la conectas a un componente con `useReducer`.

Exporta:

- `carritoReducer(estado, accion)`: el estado es un arreglo de items `{ id, nombre, precio, cantidad }`.
- `Carrito({ productos })`: componente que usa el reducer.

## Reglas

**Reducer** (acciones con la propiedad `tipo`):

- `{ tipo: "agregar", item }`: si ya hay un item con ese `id`, le suma 1 a su `cantidad`; si no, lo agrega al final con `cantidad: 1`.
- `{ tipo: "quitar", id }`: elimina el item con ese `id`.
- `{ tipo: "vaciar" }`: deja el carrito vacío.
- Cualquier otro `tipo`: lanza un error cuyo mensaje empiece con `Acción desconocida`.
- **Nunca modifica** el estado ni los items recibidos (en los tests llegan congelados con `Object.freeze`). Siempre devuelve arreglos y objetos nuevos.

**Componente**:

- Por cada producto, un botón con el texto `Agregar {nombre}`.
- Una `<ul>` con un `<li>` por item del carrito. Dentro: un `<span>` con `{nombre} x{cantidad}` (por ejemplo, `Margarita x2`) y un botón `Quitar` con `aria-label="Quitar {nombre}"`.
- Un botón `Vaciar`.

## Ejemplo

```js
const margarita = { id: "m", nombre: "Margarita", precio: 28 };

let estado = [];
estado = carritoReducer(estado, { tipo: "agregar", item: margarita });
estado = carritoReducer(estado, { tipo: "agregar", item: margarita });
// [{ id: "m", nombre: "Margarita", precio: 28, cantidad: 2 }]

carritoReducer(estado, { tipo: "quitar", id: "m" }); // []
carritoReducer(estado, { tipo: "inventada" });      // Error: Acción desconocida: inventada
```

## Por qué importa

Un reducer es **JavaScript puro**: se prueba sin React, con un simple `reduce` sobre una lista de acciones. Es el corazón de `useReducer` y de Redux, y en entrevistas te piden escribir uno y explicar por qué no debe mutar el estado (React compara referencias para decidir si re-renderiza).
