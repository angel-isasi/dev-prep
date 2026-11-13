## Idea clave

Un reducer es una **función pura**: recibe `(estado, accion)` y devuelve un estado **nuevo**, sin modificar el anterior. Toda la lógica del carrito queda en JavaScript puro (fácil de probar con `reduce`), y el componente solo hace `dispatch` de acciones.

## Paso a paso

1. **`switch` por `accion.tipo`**: un caso por cada cosa que puede pasar.
2. **Agregar**: con `some` preguntas si el item ya está.
   - Si está: `map` devuelve un arreglo nuevo donde **solo** el item con ese id se reemplaza por una copia con `cantidad + 1`. Los demás items se reutilizan tal cual.
   - Si no está: `[...estado, { ...accion.item, cantidad: 1 }]` crea un arreglo nuevo con el item al final.
3. **Quitar**: `filter` devuelve un arreglo nuevo sin ese id.
4. **Vaciar**: un arreglo vacío nuevo.
5. **`default` lanza un error**: así un error de tipeo (`"agrega"`) se detecta enseguida en vez de ignorarse en silencio.
6. **Componente**: `useReducer(carritoReducer, [])` devuelve `[items, dispatch]`. Cada botón envía una acción; React llama al reducer con el estado actual y re-renderiza con el resultado.

```jsx
import { useReducer } from "react";

export function carritoReducer(estado, accion) {
  switch (accion.tipo) {
    case "agregar": {
      const existe = estado.some((item) => item.id === accion.item.id);
      if (existe) {
        return estado.map((item) =>
          item.id === accion.item.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...estado, { ...accion.item, cantidad: 1 }];
    }
    case "quitar":
      return estado.filter((item) => item.id !== accion.id);
    case "vaciar":
      return [];
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`);
  }
}

export function Carrito({ productos }) {
  const [items, dispatch] = useReducer(carritoReducer, []);

  return (
    <div>
      {productos.map((producto) => (
        <button key={producto.id} onClick={() => dispatch({ tipo: "agregar", item: producto })}>
          {`Agregar ${producto.nombre}`}
        </button>
      ))}

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <span>{`${item.nombre} x${item.cantidad}`}</span>
            <button aria-label={`Quitar ${item.nombre}`} onClick={() => dispatch({ tipo: "quitar", id: item.id })}>
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <button onClick={() => dispatch({ tipo: "vaciar" })}>Vaciar</button>
    </div>
  );
}
```

El `case "agregar": { ... }` lleva llaves porque declara una constante (`existe`); sin llaves, esa constante quedaría compartida con los demás `case`.

## Por qué funciona

`acciones.reduce(carritoReducer, [])` aplica las acciones una por una, igual que haría React con cada `dispatch`:

| Acción | Estado resultante |
|---|---|
| (inicial) | `[]` |
| agregar Margarita | `[Margarita x1]` (no existía: se agrega) |
| agregar Margarita | `[Margarita x2]` (existía: copia con cantidad + 1) |
| agregar Pepperoni | `[Margarita x2, Pepperoni x1]` |
| quitar `"p"` | `[Margarita x2]` |

El reducer tiene **la misma firma** que el callback de `Array.prototype.reduce`: `(acumulado, elemento) => nuevoAcumulado`. De ahí viene su nombre.

¿Por qué no mutar? `useReducer` compara el estado viejo con el nuevo usando `Object.is`. Si haces `estado.push(...)` y devuelves `estado`, es **la misma referencia**: React cree que nada cambió y **no re-renderiza**. Los tests congelan el estado con `Object.freeze` para detectarlo: cualquier `push` o `item.cantidad++` lanza un error.

## Errores comunes

- **`item.cantidad++` dentro del `map`** y devolver `item`. Mutas el objeto original: con `Object.freeze` lanza `TypeError`, y en una app real otros componentes que tenían ese objeto ven el cambio "por arte de magia".
- **`estado.push(...)` y `return estado`.** Misma referencia: React no se entera y la pantalla no cambia.
- **Olvidar el `return` en un `case`.** La ejecución "cae" al siguiente `case` y quita o vacía cosas que no debía.
- **`default: return estado`.** No es un error grave, pero oculta errores de tipeo en el nombre de la acción. Lanzar un error es más seguro mientras desarrollas.
- **Hacer `fetch` o leer `Date.now()` dentro del reducer.** Un reducer debe ser puro: los efectos van en el componente o en `useEffect`.

## Otra forma de resolverlo

Con un **objeto de manejadores** en vez de `switch`:

```jsx
const manejadores = {
  agregar: (estado, { item }) =>
    estado.some((i) => i.id === item.id)
      ? estado.map((i) => (i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i))
      : [...estado, { ...item, cantidad: 1 }],
  quitar: (estado, { id }) => estado.filter((i) => i.id !== id),
  vaciar: () => [],
};

export function carritoReducer(estado, accion) {
  const manejar = manejadores[accion.tipo];
  if (!manejar) throw new Error(`Acción desconocida: ${accion.tipo}`);
  return manejar(estado, accion);
}
```

**¿Cuándo conviene?** Cuando hay muchas acciones: cada una es una función pequeña que se puede probar sola y no hay riesgo de olvidar un `return`. Con tres o cuatro acciones, `switch` es lo más común y lo que verás en la documentación de React.

## Cómo explicarlo en la entrevista

> "Escribí el carrito como un reducer puro: recibe el estado y una acción y devuelve un estado nuevo con un `switch` por tipo. Para agregar, si el item existe hago `map` y copio solo ese item con la cantidad incrementada; si no, lo agrego con spread. Para quitar uso `filter`. Nunca muto, porque `useReducer` compara referencias para decidir si re-renderiza. Como es una función pura, la pruebo sin React aplicando una lista de acciones con `reduce`. Las acciones desconocidas lanzan un error para detectar errores de tipeo."

## Conceptos

- **Reducer**: función pura `(estado, accion) => nuevoEstado`.
- **`useReducer`**: hook que devuelve `[estado, dispatch]` a partir de un reducer.
- **`dispatch`**: envía una acción; React calcula el nuevo estado y re-renderiza.
- **Inmutabilidad**: crear copias (`map`, `filter`, spread) en vez de modificar.
- **Comparación por referencia (`Object.is`)**: si devuelves el mismo arreglo, React no re-renderiza.
- **`Object.freeze`**: congela datos en los tests para detectar mutaciones.
- **`Array.prototype.reduce`**: aplicar una secuencia de acciones a un estado inicial.
