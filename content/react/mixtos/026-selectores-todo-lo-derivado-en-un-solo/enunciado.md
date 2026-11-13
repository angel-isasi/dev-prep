Crea y exporta la función pura `seleccionar(pizzas, filtros)`. Es un **selector**: recibe los datos crudos y los filtros que eligió el usuario, y devuelve **todo lo que la pantalla necesita mostrar**.

- `pizzas`: arreglo de objetos `{ nombre, precio, veggie }`.
- `filtros`: objeto opcional `{ busqueda, soloVeggie }`. Si falta algo, usa `busqueda = ""` y `soloVeggie = false`.

Devuelve un objeto con tres datos:

- `visibles`: las pizzas que pasan los filtros, **en el mismo orden** en que llegaron.
- `cantidad`: cuántas pizzas visibles hay.
- `masBarata`: la pizza visible de menor precio, o `null` si no hay ninguna.

## Reglas

- La búsqueda no distingue mayúsculas e ignora los espacios al inicio y al final: `"  MAR "` equivale a `"mar"`.
- Una pizza pasa si su `nombre` **contiene** el texto buscado y, cuando `soloVeggie` es `true`, además es `veggie`.
- **No modifiques** el arreglo `pizzas` que recibes (ni su orden).
- Se debe poder llamar sin el segundo argumento: `seleccionar(pizzas)`.

## Ejemplo

```js
const pizzas = [
  { nombre: "Margarita", precio: 28, veggie: true },
  { nombre: "Marinera", precio: 24, veggie: true },
  { nombre: "Carnívora", precio: 38, veggie: false },
];

seleccionar(pizzas, { busqueda: "mar" });
// { visibles: [Margarita, Marinera], cantidad: 2, masBarata: Marinera }

seleccionar(pizzas, { soloVeggie: true }).cantidad; // 2
seleccionar(pizzas, { busqueda: "zzz" }).masBarata; // null
```

Así se usaría dentro de un componente:

```jsx
const [filtros, setFiltros] = useState({ busqueda: "", soloVeggie: false });
const { visibles, cantidad, masBarata } = seleccionar(pizzas, filtros);
```

## Por qué importa

En React, el error más común con datos es guardar en el estado cosas que se pueden calcular (la lista filtrada, el total, el más barato) y luego pelear para mantenerlas sincronizadas. Un selector junta todo lo derivado en una función pura: el componente guarda solo los filtros, y la función se prueba sin montar nada.
