En un catálogo con varios filtros (categoría, precio máximo, texto), en vez de un `filter` gigante con todas las condiciones, vas a crear **filtros pequeños que se combinan**. Exporta cuatro funciones:

- `deCategoria(categoria)`, `hastaPrecio(max)` y `conTexto(texto)`: cada una es una **fábrica**: recibe su configuración y devuelve un **predicado**, una función `(pizza) => true/false`.
- `todos(...condiciones)`: recibe cualquier cantidad de predicados y devuelve **uno solo** que es `true` cuando **todos** se cumplen.

El resultado se usa directo con `filter`: `pizzas.filter(todos(...))`.

## Reglas

- `deCategoria(categoria)`: pasa si `pizza.categoria === categoria`. Si `categoria` es `""` (el usuario eligió "Todas"), pasa **cualquier** pizza.
- `hastaPrecio(max)`: pasa si `pizza.precio <= max`.
- `conTexto(texto)`: pasa si el `nombre` contiene el texto, **sin distinguir mayúsculas**.
- `todos(...condiciones)`: pasa si cumple todas. Sin condiciones (`todos()`), pasa cualquier pizza.

## Ejemplo

```js
const pizzas = [
  { nombre: "Margarita", categoria: "clásica", precio: 28 },
  { nombre: "Marinera", categoria: "clásica", precio: 40 },
  { nombre: "Vegana", categoria: "veggie", precio: 30 },
];

const filtro = todos(deCategoria("clásica"), hastaPrecio(35), conTexto("mar"));
pizzas.filter(filtro).map((p) => p.nombre); // ["Margarita"]

pizzas.filter(todos(deCategoria(""), hastaPrecio(100))).length; // 3
```

En un componente, los filtros salen del estado:

```jsx
const visibles = pizzas.filter(
  todos(deCategoria(categoria), hastaPrecio(precioMax), conTexto(busqueda)),
);
```

## Por qué importa

Las pantallas de catálogo, tablas y buscadores siempre terminan con muchos filtros. Si cada uno es una función pequeña, agregar uno nuevo ("solo con stock") no toca los demás, y cada pieza se prueba sola. Además practicas closures y funciones que devuelven funciones, un tema clásico de entrevista.
