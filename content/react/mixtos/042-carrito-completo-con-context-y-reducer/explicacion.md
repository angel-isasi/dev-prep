## Idea clave

Tres piezas, tres trabajos: el **reducer** decide cómo cambia el carrito (función pura, sin React), el **Context** reparte el estado a quien lo necesite sin pasar props por cada nivel, y los **totales se derivan** de los items en vez de guardarse aparte.

## Paso a paso

1. **Escribe el reducer primero, sin React.** Es una función `(items, accion) => nuevaLista`. Con un `switch` sobre `accion.tipo`:
   - `agregar`: si la pizza ya está (`some`), `map` devuelve una copia con `cantidad + 1` solo para esa; si no, `[...items, { ...pizza, cantidad: 1 }]`.
   - `restar`: `map` resta 1 y luego `filter` quita las que quedaron en 0.
   - `vaciar`: `[]`.
   - `default`: `throw`. Así un error de tipeo (`"agregr"`) explota en vez de fallar en silencio.
2. **Crea el Context** con `createContext(null)`. El `null` sirve para detectar si alguien lo usa fuera del proveedor.
3. **El proveedor** llama a `useReducer(reducerCarrito, [])`, calcula `total` y `unidades` con `reduce` y entrega `{ items, total, unidades, despachar }` en `value`.
4. **`useMemo` sobre el `value`**: sin él, cada render del proveedor crea un objeto nuevo y **todos** los consumidores se vuelven a renderizar aunque `items` no haya cambiado.
5. **`useCarrito`** envuelve `useContext` y lanza un error claro si devuelve `null`. Los componentes nunca importan el Context directamente.
6. **Los componentes** solo leen y despachan: `Menu` manda `{ tipo: "agregar", pizza }`, `ResumenCarrito` muestra y manda `restar` o `vaciar`.

```jsx
import { createContext, useContext, useMemo, useReducer } from "react";

export function reducerCarrito(items, accion) {
  switch (accion.tipo) {
    case "agregar": {
      const existe = items.some((item) => item.id === accion.pizza.id);
      return existe
        ? items.map((item) =>
            item.id === accion.pizza.id ? { ...item, cantidad: item.cantidad + 1 } : item,
          )
        : [...items, { ...accion.pizza, cantidad: 1 }];
    }
    case "restar":
      return items
        .map((item) => (item.id === accion.id ? { ...item, cantidad: item.cantidad - 1 } : item))
        .filter((item) => item.cantidad > 0);
    case "vaciar":
      return [];
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`);
  }
}

const ContextoCarrito = createContext(null);

export function ProveedorCarrito({ children }) {
  const [items, despachar] = useReducer(reducerCarrito, []);

  const valor = useMemo(() => {
    const total = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    const unidades = items.reduce((suma, item) => suma + item.cantidad, 0);
    return { items, total, unidades, despachar };
  }, [items]);

  return <ContextoCarrito.Provider value={valor}>{children}</ContextoCarrito.Provider>;
}

export function useCarrito() {
  const contexto = useContext(ContextoCarrito);
  if (!contexto) throw new Error("useCarrito debe usarse dentro de ProveedorCarrito");
  return contexto;
}

export function Menu({ pizzas }) {
  const { despachar } = useCarrito();
  return pizzas.map((pizza) => (
    <button key={pizza.id} onClick={() => despachar({ tipo: "agregar", pizza })}>
      Agregar {pizza.nombre}
    </button>
  ));
}

export function ResumenCarrito() {
  const { items, total, unidades, despachar } = useCarrito();

  if (unidades === 0) return <p>Tu carrito está vacío.</p>;

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.nombre} x{item.cantidad}
            <button
              aria-label={`Quitar una ${item.nombre}`}
              onClick={() => despachar({ tipo: "restar", id: item.id })}
            >
              −
            </button>
          </li>
        ))}
      </ul>
      <p>
        {unidades} pizzas, total S/ {total}
      </p>
      <button onClick={() => despachar({ tipo: "vaciar" })}>Vaciar carrito</button>
    </div>
  );
}
```

## Por qué funciona

Recorrido con Margarita (S/ 28) y Pepperoni (S/ 32):

| Acción despachada | `items` después | `unidades` | `total` |
|---|---|---|---|
| (inicio) | `[]` | 0 | 0 |
| agregar Margarita | `[Margarita x1]` | 1 | 28 |
| agregar Margarita | `[Margarita x2]` (objeto **nuevo**) | 2 | 56 |
| agregar Pepperoni | `[Margarita x2, Pepperoni x1]` | 3 | 88 |
| restar id 2 | map da `Pepperoni x0`, filter la quita: `[Margarita x2]` | 2 | 56 |
| vaciar | `[]` | 0 | 0 |

En cada fila el reducer devuelve un arreglo **distinto** al anterior. React compara con `Object.is`: como la referencia cambió, vuelve a renderizar el proveedor, `useMemo` ve que `items` cambió y arma un `valor` nuevo, y todos los que usan `useCarrito` se actualizan. `Menu` y `ResumenCarrito` son hermanos y aun así comparten el mismo estado, sin pasarse props.

¿Por qué no se prueba en los tests el error de `useCarrito` fuera del proveedor? Porque en React 19 un error durante el render se reporta a través de la raíz y no siempre llega como excepción al `render` del test. Pero el `throw` sigue siendo valioso: si un compañero olvida el proveedor, ve un mensaje claro en vez de "Cannot destructure property 'despachar' of null".

## Errores comunes

- **Mutar en el reducer**: `item.cantidad++` o `items.push(...)` y devolver el mismo arreglo. React ve la misma referencia y **no re-renderiza**; lo reconoces porque haces clic y no pasa nada (o los tests de "sin mutar" fallan).
- **Guardar `total` en otro estado** y actualizarlo a mano en cada acción. Tarde o temprano se desincroniza (por ejemplo, al restar te olvidas de restar el total). Si se puede calcular, se calcula.
- **Olvidar el `filter` en `restar`**: quedan pizzas con `x0` en la lista.
- **`value={{ items, despachar }}` sin `useMemo`**: funciona, pero cada render del proveedor obliga a re-renderizar a todos los consumidores. En una app grande se nota.
- **No poner `default` en el `switch`**: un tipo mal escrito devuelve `undefined` y el carrito "desaparece" sin ningún error que te diga por qué.

## Otra forma de resolverlo

Guardar el carrito como **objeto indexado por id** en vez de arreglo. Agregar y restar ya no necesitan `map`:

```jsx
export function reducerCarrito(porId, accion) {
  switch (accion.tipo) {
    case "agregar": {
      const actual = porId[accion.pizza.id];
      return { ...porId, [accion.pizza.id]: { ...accion.pizza, cantidad: (actual?.cantidad ?? 0) + 1 } };
    }
    case "restar": {
      const { [accion.id]: item, ...resto } = porId;
      return item.cantidad > 1 ? { ...resto, [accion.id]: { ...item, cantidad: item.cantidad - 1 } } : resto;
    }
    case "vaciar":
      return {};
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`);
  }
}
// Para mostrar: Object.values(porId)
```

**¿Cuándo conviene?** Cuando el carrito es grande o actualizas mucho por id: el acceso es directo en vez de recorrer la lista. Para un carrito de pocas pizzas el arreglo es más simple y conserva el orden en que se agregaron, por eso es la versión principal.

Otra variante muy común es **separar dos contextos**: uno para el estado y otro solo para `despachar`. Así `Menu`, que solo despacha, no se re-renderiza cuando cambian los items.

## Cómo explicarlo en la entrevista

> "Separé la lógica en un reducer puro: recibe la lista y una acción y siempre devuelve una lista nueva, con spread y `map` o `filter`, nunca mutando, porque React detecta cambios por referencia. Eso además me permite probar el reducer sin renderizar nada. Para que el menú y el resumen compartan el carrito sin prop drilling, lo pongo en un Context, y expongo un hook `useCarrito` que lanza un error si alguien lo usa fuera del proveedor. El total y las unidades no los guardo: los derivo de los items con `reduce` dentro de un `useMemo`, que también estabiliza el objeto del contexto para no re-renderizar a todos los consumidores sin necesidad."

## Conceptos

- **`useReducer`**: estado manejado por una función `(estado, accion) => nuevoEstado`; ideal cuando hay varias formas de cambiarlo.
- **Función pura**: mismo resultado para la misma entrada y sin efectos secundarios (no muta, no llama a la red).
- **Inmutabilidad**: crear copias (`...`, `map`, `filter`) en vez de modificar; React compara referencias.
- **Context** (`createContext`, `Provider`, `useContext`): compartir datos con cualquier descendiente sin pasar props.
- **Hook personalizado** (`useCarrito`): encapsula el acceso al contexto y valida que exista el proveedor.
- **Estado derivado**: `total` y `unidades` se calculan, no se guardan.
- **`useMemo`**: memoriza el objeto del contexto para que su referencia solo cambie cuando cambian los items.
- **`reduce`**: acumular un arreglo en un solo valor (sumas).
