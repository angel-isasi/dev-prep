Crea el componente `Menu`, que recibe en la prop `pizzas` un arreglo de objetos `{ id, nombre }` y los muestra como una lista.

## Reglas

- Devuelve una lista `<ul>`.
- Pinta un `<li>` por cada pizza, con su `nombre` como texto, **en el mismo orden** del arreglo.
- Cada `<li>` lleva una **`key` única y estable**: usa el `id` de la pizza. Si falta la `key`, React muestra una advertencia en la consola y uno de los tests falla.
- Si el arreglo está vacío, la `<ul>` queda sin elementos.

## Ejemplo

```jsx
<Menu
  pizzas={[
    { id: "m", nombre: "Margarita" },
    { id: "p", nombre: "Pepperoni" },
  ]}
/>
```

| Prop `pizzas` | Se ve |
|---|---|
| Margarita y Pepperoni | • Margarita<br>• Pepperoni |
| `[]` | (lista vacía) |

## Por qué importa

Pintar una lista a partir de un arreglo con `map` es diario en React: productos, comentarios, resultados. Y la pregunta "¿para qué sirve la `key`?" es de las más repetidas en entrevistas junior.
