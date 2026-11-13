## Idea clave

El único estado es el **conjunto de ids elegidos** (un `Set`). Si "Seleccionar todo" está marcado, desmarcado o indeterminado se **calcula** comparando el tamaño del `Set` con el número de items. Como React compara por referencia, cada cambio crea un `Set` **nuevo**. Y como `indeterminate` no se puede poner desde JSX, se asigna con un `ref`.

## Paso a paso

1. **Estado:** `useState(() => new Set())`. La función hace que el `Set` se cree solo en el primer render (inicialización perezosa).
2. **Derivados:** `todos = items.length > 0 && elegidos.size === items.length` y `algunos = elegidos.size > 0 && !todos`.
3. **Alternar un item sin mutar:** dentro de `setElegidos((anteriores) => ...)`, copia con `new Set(anteriores)`, agrega o quita el id y devuelve la copia.
4. **Alternar todos:** si `todos`, `new Set()` (vacío); si no, un `Set` con todos los ids.
5. **Indeterminado con `ref`:** `useRef` apunta al input de "Seleccionar todo" y un `useEffect` le asigna `indeterminate = algunos` cada vez que `algunos` cambia.
6. **Checkboxes controlados:** `checked={todos}` arriba y `checked={elegidos.has(item.id)}` en cada item.

```jsx
import { useEffect, useRef, useState } from "react";

export function SeleccionMultiple({ items }) {
  // Set con los ids elegidos: buscar con .has(id) es directo.
  const [elegidos, setElegidos] = useState(() => new Set());
  const refTodos = useRef(null);

  // Estado derivado.
  const todos = items.length > 0 && elegidos.size === items.length;
  const algunos = elegidos.size > 0 && !todos;

  // `indeterminate` no existe como atributo HTML: solo se puede poner desde JavaScript.
  useEffect(() => {
    if (refTodos.current) refTodos.current.indeterminate = algunos;
  }, [algunos]);

  function alternar(id) {
    setElegidos((anteriores) => {
      const nuevo = new Set(anteriores); // copia: nunca mutamos el Set del estado
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  }

  function alternarTodos() {
    setElegidos(todos ? new Set() : new Set(items.map((item) => item.id)));
  }

  return (
    <div>
      <label>
        <input ref={refTodos} type="checkbox" checked={todos} onChange={alternarTodos} />
        Seleccionar todo
      </label>
      {items.map((item) => (
        <label key={item.id}>
          <input type="checkbox" checked={elegidos.has(item.id)} onChange={() => alternar(item.id)} />
          {item.nombre}
        </label>
      ))}
      <p>{elegidos.size} seleccionados</p>
    </div>
  );
}
```

## Por qué funciona

Con 2 items:

| Acción | `elegidos` | `todos` | `algunos` | "Seleccionar todo" | Texto |
|---|---|---|---|---|---|
| (inicio) | `{}` | false | false | desmarcado | 0 seleccionados |
| Marca Noticia A | `{1}` | false | true | indeterminado (por el efecto) | 1 seleccionados |
| Seleccionar todo | `{1, 2}` | true | false | marcado | 2 seleccionados |
| Seleccionar todo | `{}` | false | false | desmarcado | 0 seleccionados |
| Marca A y B | `{1, 2}` | true | false | marcado | 2 seleccionados |

El efecto corre **después** de que React actualiza el DOM. Así, cuando `algunos` cambia, primero se pinta el render y luego el efecto ajusta la propiedad `indeterminate` del input real. Para el checkbox, `indeterminate` solo cambia **cómo se ve** (la rayita); su valor `checked` sigue siendo `false`.

## Errores comunes

- **Mutar el `Set` del estado:** `elegidos.add(id); setElegidos(elegidos)`. Es la misma referencia: React no vuelve a renderizar y el checkbox no cambia. Siempre `new Set(anteriores)`.
- **Poner `indeterminate={algunos}` en el JSX.** React no lo aplica como propiedad del DOM y el checkbox nunca muestra la rayita. Lo reconoces porque falla el test de "indeterminado". Por eso el `ref`.
- **Guardar `todos` en otro estado.** Si marcas los items uno por uno, tendrías que acordarte de actualizarlo también. Calculado, siempre está bien.
- **Olvidar `items.length > 0`.** Con una lista vacía, `0 === 0` haría que "Seleccionar todo" aparezca marcado sin nada que seleccionar.
- **Usar un arreglo con `includes`.** Funciona, pero agregar y quitar sin duplicados es más trabajo, y `includes` recorre todo el arreglo. Con un `Set`, `has`, `add` y `delete` son directos.

## Otra forma de resolverlo

Con un **arreglo de ids** en vez de un `Set`, más familiar si todavía no usas `Set`:

```jsx
const [elegidos, setElegidos] = useState([]);

function alternar(id) {
  setElegidos((anteriores) =>
    anteriores.includes(id) ? anteriores.filter((x) => x !== id) : [...anteriores, id],
  );
}

const todos = items.length > 0 && elegidos.length === items.length;
// checked={elegidos.includes(item.id)}
```

**¿Cuándo conviene?** Con listas cortas, el arreglo es igual de bueno y más fácil de serializar (por ejemplo, para mandarlo al servidor o guardarlo en localStorage, porque `JSON.stringify` de un `Set` da `{}`). Con listas largas, el `Set` es más eficiente.

Ten en cuenta un borde: si `items` cambia (por ejemplo, se filtra), el `Set` puede tener ids que ya no están en la lista. En una app real se calcularía `todos` contando solo los ids visibles.

## Cómo explicarlo en la entrevista

> "Guardo los ids elegidos en un `Set`, que me da búsquedas directas con `has`. Como React compara por referencia, en cada cambio creo un `Set` nuevo a partir del anterior en vez de mutarlo. Si 'Seleccionar todo' está marcado o es parcial lo calculo comparando tamaños, no lo guardo. El estado indeterminado es un caso especial: no existe como atributo HTML, solo como propiedad del DOM, así que lo asigno con un `ref` dentro de un `useEffect`."

## Conceptos

- **`Set`**: colección sin duplicados con `add`, `delete`, `has` y `size`.
- **Inmutabilidad con `Set`**: `new Set(anterior)` para copiar.
- **Inicialización perezosa** `useState(() => valor)`.
- **Estado derivado**: todos / algunos / ninguno.
- **`useRef`** para acceder a un elemento del DOM.
- **`useEffect`** para sincronizar React con algo que JSX no controla.
- **Checkbox `indeterminate`**: propiedad visual, solo desde JavaScript.
- **Checkboxes controlados**: `checked` + `onChange`.
