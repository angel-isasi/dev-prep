Arma el carrito de una pizzería con **un reducer** que decide cómo cambia el estado y **un Context** que lo reparte a los componentes. Exporta cinco piezas:

- `reducerCarrito(items, accion)`: función **pura** que recibe la lista actual y una acción, y devuelve una lista **nueva**.
- `ProveedorCarrito({ children })`: guarda el estado con `useReducer` y lo comparte con un Context.
- `useCarrito()`: hook que lee el Context. Si se usa fuera del proveedor, lanza un error claro.
- `Menu({ pizzas })`: un botón por pizza.
- `ResumenCarrito()`: la lista del carrito, el total y el botón para vaciarlo.

Cada item del carrito es la pizza con su cantidad: `{ id, nombre, precio, cantidad }`.

## Reglas

**Reducer** (`accion.tipo`):

- `"agregar"` con `accion.pizza`: si la pizza ya está, suma 1 a su `cantidad`; si no, la agrega al final con `cantidad: 1`.
- `"restar"` con `accion.id`: resta 1 a esa pizza; si llega a 0, la quita de la lista.
- `"vaciar"`: devuelve `[]`.
- Cualquier otro tipo: lanza un error (`throw new Error(...)`).
- Nunca modifica el arreglo ni los objetos que recibe.

**Interfaz**:

- `Menu`: un botón con el texto exacto **"Agregar {nombre}"** por cada pizza.
- `ResumenCarrito` con el carrito vacío: solo el texto **"Tu carrito está vacío."**
- Con pizzas: un `<li>` por pizza con **"{nombre} x{cantidad}"** y un botón con `aria-label="Quitar una {nombre}"`; debajo, el texto **"{unidades} pizzas, total S/ {total}"** y un botón **"Vaciar carrito"**.
- Los totales (`unidades` y `total`) se **calculan** a partir de los items, no se guardan aparte.

## Ejemplo

```jsx
const pizzas = [
  { id: 1, nombre: "Margarita", precio: 28 },
  { id: 2, nombre: "Pepperoni", precio: 32 },
];

<ProveedorCarrito>
  <Menu pizzas={pizzas} />
  <ResumenCarrito />
</ProveedorCarrito>
```

| Acción | Se ve |
|---|---|
| (inicio) | Tu carrito está vacío. |
| Agregar Margarita, Agregar Margarita, Agregar Pepperoni | Margarita x2, Pepperoni x1, "3 pizzas, total S/ 88" |
| Quitar una Pepperoni | Margarita x2, "2 pizzas, total S/ 56" |
| Vaciar carrito | Tu carrito está vacío. |

## Por qué importa

El carrito es el mini proyecto clásico de entrevista porque junta todo: estado complejo, inmutabilidad, estado compartido entre componentes que no son padre e hijo y valores derivados. Si sabes separar "quién decide" (reducer), "quién reparte" (Context) y "quién muestra" (componentes), demuestras que entiendes la arquitectura de una app React.
