Un pedido guarda solo los **ids** de las pizzas (`["p2", "p9"]`) y el catálogo es un arreglo de `{ id, nombre }`. Para mostrar el detalle, en vez de hacer un `find` por cada id, conviertes el catálogo en un objeto **indexado por id** y buscas al instante.

Exporta:

- `porId(lista)`: función pura que convierte un arreglo de objetos con `id` en un objeto `{ [id]: objeto }`.
- `DetallePedido({ pedido, pizzas })`: componente que muestra el nombre de cada pizza del pedido.

## Reglas

- `porId` no modifica la lista. Si la lista está vacía, devuelve `{}`.
- `DetallePedido` pinta una `<ul>` con un `<li>` por cada id de `pedido`, en el mismo orden.
- Cada `<li>` muestra el `nombre` de la pizza con ese id.
- Si el id no existe en el catálogo, el `<li>` dice `Pizza no disponible`.
- Usa `useMemo` para no reconstruir el índice en cada render si `pizzas` no cambió.

## Ejemplo

```js
porId([{ id: "p1", nombre: "Margarita" }, { id: "p2", nombre: "Pepperoni" }]);
// { p1: { id: "p1", nombre: "Margarita" }, p2: { id: "p2", nombre: "Pepperoni" } }
```

```jsx
<DetallePedido
  pedido={["p2", "p9"]}
  pizzas={[{ id: "p1", nombre: "Margarita" }, { id: "p2", nombre: "Pepperoni" }]}
/>
// - Pepperoni
// - Pizza no disponible
```

## Por qué importa

**Normalizar** datos (guardarlos por id) es lo que hacen Redux, React Query y casi cualquier app grande. Pasa de "buscar en toda la lista cada vez" a "ir directo por la clave". Y `useMemo` aparece porque el índice es un cálculo derivado que no hace falta repetir en cada render.
