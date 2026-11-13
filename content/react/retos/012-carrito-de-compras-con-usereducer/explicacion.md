## Idea clave

Con `useReducer` **toda la lógica de cómo cambia el estado vive en una función pura** (el reducer), fuera del componente. El componente solo **despacha acciones** que describen qué pasó (`{ tipo: "agregar", producto }`). El total no es estado: se calcula del carrito.

## Paso a paso

1. **Diseña la forma del estado.** El carrito es un arreglo de productos con su cantidad: `[{ id: 1, nombre: "Pizza", precio: 25, cantidad: 2 }]`.
2. **Escribe el reducer.** Recibe `(estado, accion)` y devuelve el estado nuevo. Un `switch` sobre `accion.tipo`:
   - **agregar**: si ya existe, `map` para crear una copia del item con `cantidad + 1`; si no, `[...estado, { ...producto, cantidad: 1 }]`.
   - **quitar**: `map` para restar 1 y `filter` para sacar los que quedaron en 0.
   - **vaciar**: `[]`.
   - **default**: lanza un error. Así un typo como `"agregr"` se nota de inmediato en vez de no hacer nada en silencio.
3. **Conecta con `useReducer`.** `const [carrito, dispatch] = useReducer(carritoReducer, [])`. `dispatch(accion)` llama al reducer con el estado actual y esa acción, guarda lo que devuelve y vuelve a renderizar.
4. **Calcula el total** con `reduce`, y muéstralo con `toFixed(2)` para tener siempre 2 decimales (`54.5` se ve `54.50`).
5. **Pinta** los botones de agregar, la lista con `key={item.id}` y el botón de quitar con `aria-label`, porque el `−` solo no dice qué quita.

```jsx
import { useReducer } from "react";

// Función pura: recibe el carrito y una acción, devuelve un carrito NUEVO.
export function carritoReducer(estado, accion) {
  switch (accion.tipo) {
    case "agregar": {
      const existe = estado.some((item) => item.id === accion.producto.id);
      if (existe) {
        return estado.map((item) =>
          item.id === accion.producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...estado, { ...accion.producto, cantidad: 1 }];
    }
    case "quitar":
      return estado
        .map((item) => (item.id === accion.id ? { ...item, cantidad: item.cantidad - 1 } : item))
        .filter((item) => item.cantidad > 0);
    case "vaciar":
      return [];
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`);
  }
}

export function Carrito({ productos }) {
  const [carrito, dispatch] = useReducer(carritoReducer, []);

  // El total no se guarda: se calcula del carrito.
  const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

  return (
    <div>
      {productos.map((producto) => (
        <button key={producto.id} onClick={() => dispatch({ tipo: "agregar", producto })}>
          Agregar {producto.nombre}
        </button>
      ))}

      <ul>
        {carrito.map((item) => (
          <li key={item.id}>
            {item.nombre} × {item.cantidad}
            <button
              aria-label={`Quitar ${item.nombre}`}
              onClick={() => dispatch({ tipo: "quitar", id: item.id })}
            >
              −
            </button>
          </li>
        ))}
      </ul>

      <p>Total: S/ {total.toFixed(2)}</p>
    </div>
  );
}
```

## Por qué funciona

Cada clic despacha una acción; el reducer devuelve un arreglo **nuevo** y React vuelve a renderizar con él:

| Acción | `carrito` después | `total` calculado | Se pinta |
|---|---|---|---|
| (al inicio) | `[]` | 0 | Total: S/ 0.00 |
| Agregar Pizza | `[Pizza ×1]` | 25 | Pizza × 1 · S/ 25.00 |
| Agregar Pizza | `[Pizza ×2]` | 50 | Pizza × 2 · S/ 50.00 |
| Agregar Gaseosa | `[Pizza ×2, Gaseosa ×1]` | 54.5 | ... · S/ 54.50 |
| Quitar Gaseosa | `[Pizza ×2]` (el `filter` sacó a Gaseosa en 0) | 50 | Pizza × 2 · S/ 50.00 |

React decide si volver a renderizar comparando **referencias**: si el reducer devolviera el mismo arreglo modificado, `estadoViejo === estadoNuevo` sería `true` y no se actualizaría la pantalla. Por eso cada caso devuelve un arreglo y objetos nuevos.

## Errores comunes

- **Mutar el estado en el reducer**: `estado.push(...)` o `item.cantidad++` y luego `return estado`. La pantalla no se actualiza (o se actualiza raro). Lo reconoces porque el test "sin mutar el arreglo" falla.
- **Copiar el arreglo pero no el objeto**: `[...estado]` y luego `copia[0].cantidad++` sigue modificando el objeto original, que es compartido. Copia también el item con `{ ...item, cantidad: ... }`.
- **Guardar el total en el estado** y sumarlo/restarlo en cada acción. Es fácil que se desincronice (por ejemplo, al vaciar). Calcúlalo con `reduce`.
- **Olvidar `toFixed(2)`**: verías `Total: S/ 54.5`. Ojo: `toFixed` devuelve un texto, úsalo solo para mostrar, no para seguir sumando.
- **Hacer efectos dentro del reducer** (llamar a una API, `localStorage`, `Math.random`). El reducer debe ser puro: mismo estado y misma acción, mismo resultado. React incluso puede llamarlo dos veces en modo estricto.

## Otra forma de resolverlo

Con **`useState`** y funciones dentro del componente:

```jsx
const [carrito, setCarrito] = useState([]);

function agregar(producto) {
  setCarrito((c) =>
    c.some((item) => item.id === producto.id)
      ? c.map((item) => (item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item))
      : [...c, { ...producto, cantidad: 1 }]
  );
}
```

**¿Cuándo conviene?** Con una o dos formas de cambiar el estado, `useState` es más directo. `useReducer` gana cuando hay **varias acciones** sobre el mismo estado (agregar, quitar, vaciar, aplicar cupón...), cuando quieres **probar la lógica sin renderizar** (como en los dos primeros tests) o cuando el siguiente estado depende de varias piezas a la vez. Es el mismo patrón que usa Redux.

## Cómo explicarlo en la entrevista

> "Como el carrito tiene varias formas de cambiar, uso `useReducer`: toda la lógica queda en una función pura que recibe el estado y una acción y devuelve el estado nuevo, y la puedo probar sin renderizar nada. Nunca muto el arreglo: para agregar uso spread, para cambiar una cantidad uso `map` creando un objeto nuevo, y para quitar uso `filter`. El total no lo guardo, lo calculo con `reduce`, así nunca queda desincronizado. Y en el `default` lanzo un error para detectar acciones mal escritas."

## Conceptos

- **`useReducer(reducer, inicial)`**: devuelve `[estado, dispatch]`; `dispatch(accion)` aplica el reducer.
- **Reducer**: función pura `(estado, accion) => nuevoEstado`.
- **Acción**: objeto que describe qué pasó, con un `tipo` y los datos necesarios.
- **Inmutabilidad**: `map`, `filter` y spread (`...`) crean copias en vez de modificar.
- **Comparación por referencia**: React re-renderiza si el estado nuevo es otro objeto.
- **Estado derivado**: el total se calcula con `reduce`.
- **`toFixed(2)`**: formatea un número con 2 decimales (devuelve texto).
- **`aria-label`**: da nombre a un botón cuyo contenido es solo un símbolo.
