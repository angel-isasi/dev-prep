Crea un carrito de compras usando **`useReducer`**. Exporta dos cosas:

- `carritoReducer(estado, accion)`: una función **pura** que recibe el carrito (un arreglo) y una acción, y devuelve el carrito nuevo.
- `Carrito`: el componente, que recibe en la prop `productos` un arreglo como `{ id, nombre, precio }`.

## Reglas

**El reducer** entiende estas acciones (el campo se llama `tipo`):

| Acción | Qué hace |
|---|---|
| `{ tipo: "agregar", producto }` | Si el producto no está, lo agrega con `cantidad: 1`. Si ya está, le suma 1 a su cantidad. |
| `{ tipo: "quitar", id }` | Le resta 1 a la cantidad. Si llega a 0, lo saca del carrito. |
| `{ tipo: "vaciar" }` | Devuelve el carrito vacío. |

Nunca modifica el arreglo que recibe: siempre devuelve uno nuevo.

**El componente:**

- Un botón por producto con el texto **"Agregar {nombre}"** (por ejemplo `Agregar Pizza`).
- Una lista `<ul>` con un `<li>` por producto del carrito que muestra **"{nombre} × {cantidad}"** (con el signo `×`, por ejemplo `Pizza × 2`) y un botón con `aria-label="Quitar {nombre}"`.
- Un texto **"Total: S/ X.XX"** con 2 decimales (por ejemplo `Total: S/ 54.50`). Con el carrito vacío: `Total: S/ 0.00`.

## Ejemplo

```jsx
<Carrito
  productos={[
    { id: 1, nombre: "Pizza", precio: 25 },
    { id: 2, nombre: "Gaseosa", precio: 4.5 },
  ]}
/>
```

| Acción | Se ve en el carrito | Total |
|---|---|---|
| (al inicio) | (nada) | S/ 0.00 |
| Agregar Pizza | Pizza × 1 | S/ 25.00 |
| Agregar Pizza | Pizza × 2 | S/ 50.00 |
| Agregar Gaseosa | Pizza × 2, Gaseosa × 1 | S/ 54.50 |
| Quitar Gaseosa | Pizza × 2 | S/ 50.00 |

## Por qué importa

El carrito es el ejemplo clásico para preguntar **cuándo usar `useReducer` en vez de `useState`**. Además evalúa actualizar arreglos sin mutarlos y calcular el total en vez de guardarlo.
