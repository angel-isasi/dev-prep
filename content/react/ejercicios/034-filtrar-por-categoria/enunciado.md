Crea el componente `MenuFiltrable` que muestra una carta de pizzas y permite **filtrarlas por categoría** con botones.

```jsx
<MenuFiltrable pizzas={[{ nombre: "Margarita", categoria: "clásicas" }, ...]} />
```

## Reglas

- Recibe `pizzas`: un arreglo de objetos `{ nombre, categoria }`.
- Arriba, una fila de botones:
  - El primero dice **"todas"**.
  - Después, un botón por cada categoría **sin repetir**, en el orden en que aparecen por primera vez en `pizzas`.
- Debajo, una lista `<ul>` con un `<li>` por pizza visible, mostrando su **nombre**.
- Al inicio está seleccionado **"todas"** y se ven todas las pizzas.
- Al hacer clic en una categoría solo se ven las pizzas de esa categoría. Clic en "todas" las muestra todas otra vez.
- El botón seleccionado tiene `aria-pressed="true"` y los demás `aria-pressed="false"`.

## Ejemplo

```jsx
const pizzas = [
  { nombre: "Margarita", categoria: "clásicas" },
  { nombre: "Vegana", categoria: "veggie" },
  { nombre: "Americana", categoria: "clásicas" },
  { nombre: "Espinaca", categoria: "veggie" },
];

<MenuFiltrable pizzas={pizzas} />
```

Botones: **todas**, **clásicas**, **veggie**.

| Clic en | Se ve |
|---|---|
| (inicio) | Margarita, Vegana, Americana, Espinaca |
| veggie | Vegana, Espinaca |
| clásicas | Margarita, Americana |
| todas | Margarita, Vegana, Americana, Espinaca |

## Por qué importa

Los filtros por categoría están en casi toda tienda online. Lo que se evalúa: guardar en el estado **solo el filtro elegido** y **derivar** la lista visible y los botones, sin duplicar datos.
