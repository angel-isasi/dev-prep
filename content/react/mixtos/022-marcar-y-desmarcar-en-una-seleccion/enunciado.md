El cliente elige ingredientes extra para su pizza marcando casillas. La selección es un arreglo de textos. Escribe la función que **marca o desmarca** un elemento sin mutar el arreglo, y úsala en un componente.

Exporta:

- `alternar(seleccion, id)`: si `id` está en `seleccion`, devuelve un arreglo **nuevo** sin él; si no está, devuelve un arreglo **nuevo** con `id` agregado al final.
- `SelectorIngredientes({ opciones })`: componente con una casilla por opción.

## Reglas

- `alternar` **nunca** modifica el arreglo recibido (en los tests llega congelado).
- `SelectorIngredientes`:
  - Por cada opción, un `<label>` que contiene un `<input type="checkbox">` y el texto de la opción (así `getByLabelText("queso")` encuentra la casilla).
  - La casilla está marcada si la opción está en la selección (input controlado con `checked`).
  - Debajo, un `<p>` con `Elegiste: queso, jamón` (en el orden en que se marcaron) o `No elegiste nada` si la selección está vacía.

## Ejemplo

```js
alternar(["queso"], "jamón"); // ["queso", "jamón"]
alternar(["queso"], "queso"); // []
```

```jsx
<SelectorIngredientes opciones={["queso", "jamón", "aceitunas"]} />
// marco "aceitunas" y luego "queso"  ->  "Elegiste: aceitunas, queso"
```

## Por qué importa

Seleccionar varios elementos (filtros, etiquetas, filas de una tabla) aparece en todas partes. La lógica es una línea de JavaScript, pero tiene que ser **inmutable** para que `setState` funcione: si haces `push` o `splice` sobre el arreglo del estado, React no se entera del cambio.
