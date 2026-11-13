Crea el componente `Pedido`: un menú con un botón por pizza para agregarla al pedido, y un resumen con cuántas pizzas llevas y el total a pagar.

## Reglas

- Exporta la función `Pedido`. No recibe props.
- El menú es fijo; defínelo **fuera** del componente:

```js
const MENU = [
  { id: 1, nombre: "Margarita", precio: 28 },
  { id: 2, nombre: "Pepperoni", precio: 32 },
];
```

- Un `<button>` por cada pizza del menú, con el texto `Agregar {nombre}` (`Agregar Margarita`, `Agregar Pepperoni`). Genéralos con `map`.
- Cada clic agrega esa pizza al pedido. Se puede agregar la misma varias veces.
- Un párrafo con el resumen, con este texto exacto:
  - `{cantidad} pizzas, total S/ {total}` en general (`0 pizzas, total S/ 0`, `2 pizzas, total S/ 60`).
  - `1 pizza, total S/ {total}` cuando hay exactamente una (en **singular**).
- El total **no** se guarda en el estado: se calcula a partir de las pizzas agregadas.

## Ejemplo

```jsx
<Pedido />
```

| Acción | Se ve |
|---|---|
| (al inicio) | 0 pizzas, total S/ 0 |
| clic en "Agregar Margarita" | 1 pizza, total S/ 28 |
| clic en "Agregar Pepperoni" | 2 pizzas, total S/ 60 |
| (otra vez desde cero) dos clics en "Agregar Margarita" | 2 pizzas, total S/ 56 |

## Por qué importa

Es el corazón de cualquier carrito de compras: agregar a un arreglo en el estado sin mutarlo y calcular totales. En entrevistas se fijan en dos cosas: que no hagas `push` sobre el estado y que no guardes el total aparte.
