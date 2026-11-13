## Idea clave

Guarda en el estado **solo las pizzas agregadas**. La cantidad (`items.length`) y el total (`reduce` de los precios) son **estado derivado**: se calculan en cada render. Para agregar, crea un **arreglo nuevo** con spread; nunca uses `push` sobre el estado.

## Paso a paso

1. **Menú fuera del componente.** `MENU` no cambia, así que no va en el estado ni se vuelve a crear en cada render.
2. **Estado: arreglo vacío.** `const [items, setItems] = useState([])`.
3. **Botones con `map`.** `MENU.map((pizza) => <button key={pizza.id} ...>)` genera un botón por pizza. La `key` es el `id`, único y estable.
4. **Agregar sin mutar.** `setItems((anteriores) => [...anteriores, pizza])` crea un arreglo nuevo con todo lo anterior y la pizza al final. La forma funcional garantiza partir del valor más reciente, aunque haya clics muy seguidos.
5. **Total con `reduce`.** `items.reduce((suma, item) => suma + item.precio, 0)` recorre el arreglo acumulando precios; el `0` es el valor inicial (por eso con el arreglo vacío da `0`).
6. **Singular o plural.** `items.length === 1 ? "pizza" : "pizzas"`.

```jsx
import { useState } from "react";

const MENU = [
  { id: 1, nombre: "Margarita", precio: 28 },
  { id: 2, nombre: "Pepperoni", precio: 32 },
];

export function Pedido() {
  const [items, setItems] = useState([]);

  // Estado derivado: se calculan en cada render, no se guardan.
  const total = items.reduce((suma, item) => suma + item.precio, 0);
  const palabra = items.length === 1 ? "pizza" : "pizzas";

  function agregar(pizza) {
    // Arreglo nuevo con lo anterior más la pizza (sin push).
    setItems((anteriores) => [...anteriores, pizza]);
  }

  return (
    <div>
      {MENU.map((pizza) => (
        <button key={pizza.id} onClick={() => agregar(pizza)}>
          Agregar {pizza.nombre}
        </button>
      ))}

      <p>
        {items.length} {palabra}, total S/ {total}
      </p>
    </div>
  );
}
```

## Por qué funciona

Recorrido con Margarita y luego Pepperoni:

| Acción | `items` | `items.length` | `total` | Se pinta |
|---|---|---|---|---|
| Primer render | `[]` | 0 | 0 | 0 pizzas, total S/ 0 |
| Clic en Margarita | `[Margarita]` | 1 | 28 | 1 pizza, total S/ 28 |
| Clic en Pepperoni | `[Margarita, Pepperoni]` | 2 | 28 + 32 = 60 | 2 pizzas, total S/ 60 |

Cada `setItems` entrega un arreglo **nuevo**, React detecta el cambio de referencia y vuelve a ejecutar `Pedido`. En esa nueva ejecución, `total` y `palabra` se recalculan solos a partir de `items`. No hay forma de que el total quede desactualizado, porque no existe un "total guardado" que olvidar actualizar.

## Errores comunes

- **Usar `items.push(pizza)` y luego `setItems(items)`.** Modificas el mismo arreglo; React compara la referencia, ve que es la misma y **no vuelve a renderizar**. Lo reconoces porque el resumen se queda en `0 pizzas`.
- **Guardar el total en otro `useState`** y sumarlo en cada clic. Funciona hasta que agregas "quitar del pedido" y te olvidas de restar. Dos estados que deben coincidir son una fuente de bugs.
- **Olvidar el valor inicial de `reduce`.** `items.reduce((s, i) => s + i.precio)` sin el `0` falla con el arreglo vacío ("Reduce of empty array with no initial value") o suma un objeto con un número.
- **Escribir `onClick={agregar(pizza)}`** sin la flecha. Se ejecuta durante el render y React entra en un bucle de renders.
- **Olvidar la `key` en los botones** del `map`. React avisa en la consola.
- **No manejar el singular.** El test espera `1 pizza`, no `1 pizzas`.

## Otra forma de resolverlo

Guardar cantidades por pizza en un objeto, en vez de un arreglo con repetidos:

```jsx
import { useState } from "react";

const MENU = [
  { id: 1, nombre: "Margarita", precio: 28 },
  { id: 2, nombre: "Pepperoni", precio: 32 },
];

export function Pedido() {
  const [cantidades, setCantidades] = useState({}); // { 1: 2, 2: 1 }

  const cantidad = Object.values(cantidades).reduce((s, n) => s + n, 0);
  const total = MENU.reduce((s, p) => s + p.precio * (cantidades[p.id] ?? 0), 0);

  function agregar(pizza) {
    setCantidades((c) => ({ ...c, [pizza.id]: (c[pizza.id] ?? 0) + 1 }));
  }

  return (
    <div>
      {MENU.map((pizza) => (
        <button key={pizza.id} onClick={() => agregar(pizza)}>Agregar {pizza.nombre}</button>
      ))}
      <p>{cantidad} {cantidad === 1 ? "pizza" : "pizzas"}, total S/ {total}</p>
    </div>
  );
}
```

**¿Cuándo conviene?** Cuando necesitas mostrar "Margarita x2" o cambiar cantidades (como en un carrito real). El arreglo simple es más fácil de entender y suficiente si solo necesitas contar y sumar.

## Cómo explicarlo en la entrevista

> "El único estado es el arreglo de pizzas agregadas. Para agregar uso spread y creo un arreglo nuevo, porque si muto con `push` React no detecta el cambio. La cantidad y el total los calculo en cada render, con `length` y con `reduce`, porque son estado derivado: si los guardara aparte tendría que mantenerlos sincronizados. Los botones los genero con `map` sobre el menú, usando el `id` como `key`."

## Conceptos

- **Estado con arreglo**: `useState([])` para guardar una colección.
- **Inmutabilidad**: `[...anteriores, nuevo]` crea un arreglo nuevo en vez de modificar el actual.
- **Estado derivado**: cantidad y total se calculan a partir de `items`.
- **`reduce`**: recorre un arreglo acumulando un resultado; siempre con valor inicial.
- **Setter funcional**: `setItems((anteriores) => ...)` usa el estado más reciente.
- **`map` para generar elementos**: un botón por cada pizza del menú, con `key`.
- **Ternario para textos**: singular o plural según la cantidad.
