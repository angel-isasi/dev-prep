Una pizzería tiene su carta como un arreglo plano de pizzas, cada una con su `categoria`. Quieres mostrarla **agrupada por secciones**: un título por categoría y debajo sus pizzas.

Exporta dos cosas:

- `agrupar(lista, clave)`: función pura que recibe un arreglo de objetos y el nombre de una propiedad, y devuelve un objeto cuyas claves son los valores de esa propiedad y cuyos valores son arreglos con los elementos de cada grupo.
- `MenuPorCategoria({ pizzas })`: componente que usa `agrupar` para pintar la carta.

## Reglas

- `agrupar` no modifica el arreglo que recibe.
- Los grupos aparecen en el **orden en que aparece por primera vez** cada categoría.
- Por cada categoría, un `<section>` con `aria-label` igual al nombre de la categoría.
- Dentro de cada sección, un `<h2>` con el nombre de la categoría y una `<ul>` con un `<li>` por pizza (solo el nombre).
- Si no hay pizzas, no se pinta ninguna sección.

## Ejemplo

```jsx
agrupar(
  [
    { nombre: "Margarita", categoria: "Clásicas" },
    { nombre: "Vegana", categoria: "Veggie" },
    { nombre: "Pepperoni", categoria: "Clásicas" },
  ],
  "categoria"
);
// {
//   Clásicas: [{ nombre: "Margarita", ... }, { nombre: "Pepperoni", ... }],
//   Veggie:   [{ nombre: "Vegana", ... }],
// }
```

Con esos datos, `<MenuPorCategoria pizzas={...} />` muestra:

```
Clásicas
  - Margarita
  - Pepperoni
Veggie
  - Vegana
```

## Por qué importa

Es el patrón base de muchas pantallas reales (productos por categoría, contactos por letra, movimientos por fecha). La idea que el entrevistador busca: **primero transformas los datos con JavaScript puro y después el JSX solo los recorre**. Separar las dos cosas hace el componente más corto y la función fácil de probar.
