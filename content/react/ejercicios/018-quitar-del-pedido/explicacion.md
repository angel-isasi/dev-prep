## Idea clave

Para quitar un elemento de una lista en el estado, **no lo borras del arreglo existente**: creas un arreglo nuevo sin él con `filter` y se lo das a `setItems`. React detecta que el arreglo es otro y vuelve a renderizar.

## Paso a paso

1. **Copia la prop al estado.** `useState(inicial)` usa `inicial` solo en el primer render. A partir de ahí la lista es del componente y puede cambiar.
2. **Pinta la lista.** `items.map(...)` devuelve un `<li>` por pizza. La `key` es `item.id`: única y estable, aunque la lista cambie.
3. **Pon un botón con nombre accesible.** El botón solo muestra `×`, que no dice nada a un lector de pantalla. `` aria-label={`Quitar ${item.nombre}`} `` le da un nombre claro, y es lo que busca `getByLabelText` en los tests.
4. **Quita con `filter`.** Al hacer clic llamas a `quitar(item.id)`, que hace `setItems((actuales) => actuales.filter((item) => item.id !== id))`: te quedas con todas menos la del id.

```jsx
import { useState } from "react";

export function Carrito({ inicial }) {
  // `inicial` solo se usa en el primer render para llenar el estado.
  const [items, setItems] = useState(inicial);

  function quitar(id) {
    // filter devuelve un arreglo NUEVO sin la pizza de ese id.
    setItems((actuales) => actuales.filter((item) => item.id !== id));
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.nombre}
          <button aria-label={`Quitar ${item.nombre}`} onClick={() => quitar(item.id)}>
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
```

## Por qué funciona

Con `inicial = [Margarita (id 1), Hawaiana (id 2)]`:

| Acción | Estado `items` | Se pinta |
|---|---|---|
| Primer render | `[Margarita, Hawaiana]` | 2 `<li>` |
| Clic en "Quitar Margarita" | `filter(item => item.id !== 1)` da `[Hawaiana]` | 1 `<li>` |
| Clic en "Quitar Hawaiana" | `[]` | `<ul>` vacía |

`filter` nunca toca el arreglo original: recorre y arma uno nuevo. Por eso el arreglo `inicial` que te pasó el padre sigue con sus 2 pizzas (el último test lo comprueba). Y como `setItems` recibe un arreglo distinto (otra referencia), React sabe que algo cambió y vuelve a llamar a `Carrito`.

Usar la forma funcional `setItems((actuales) => ...)` garantiza que filtras sobre la versión más reciente del estado, aunque haya varios cambios seguidos.

## Errores comunes

- **Mutar el arreglo con `splice`** y luego `setItems(items)`. Es el mismo arreglo (misma referencia), así que React cree que no cambió nada y **no vuelve a pintar**. Además modificas el arreglo `inicial` del padre: falla el test "no modifica el arreglo inicial".
- **Quitar por índice** (`filter((_, i) => i !== indice)`) cuando la lista puede cambiar de orden. Funciona aquí, pero el id es más seguro: siempre identifica a la misma pizza.
- **Usar el índice como `key`.** Al quitar el primer elemento, todos los índices se corren y React puede confundir qué `<li>` es cuál (se nota cuando los `<li>` tienen inputs o estado propio).
- **Escribir `onClick={quitar(item.id)}`** sin la función flecha. Eso **llama** a `quitar` mientras se pinta, no al hacer clic, y provoca un bucle de renders ("Too many re-renders").
- **Usar la prop `inicial` directamente para pintar**, sin estado. Las props son de solo lectura: no tienes cómo "quitarle" algo al padre desde aquí.

## Otra forma de resolverlo

Que el **padre** sea el dueño de la lista y el carrito solo avise qué quitar:

```jsx
export function CarritoControlado({ items, onQuitar }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.nombre}
          <button aria-label={`Quitar ${item.nombre}`} onClick={() => onQuitar(item.id)}>
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
```

**¿Cuándo conviene?** Cuando otras partes de la app necesitan la misma lista (por ejemplo, un contador de items en el encabezado o el total a pagar). Entonces el estado "sube" al padre común y este componente solo muestra y avisa. Si solo el carrito usa la lista, tenerla dentro como en la solución es más simple.

## Cómo explicarlo en la entrevista

> "Guardo la lista en el estado, inicializada con la prop `inicial`. Para quitar una pizza no muto el arreglo: uso `filter` para crear uno nuevo sin el id que quiero quitar, con la forma funcional de `setItems` para partir siempre del valor más reciente. Si mutara con `splice`, React vería la misma referencia y no volvería a renderizar, y encima modificaría los datos del padre. Uso el id como `key` y le pongo `aria-label` al botón porque una × sola no es accesible."

## Conceptos

- **Inmutabilidad**: en React no se modifica el estado; se reemplaza por una copia nueva.
- **`filter`**: devuelve un arreglo nuevo con los elementos que cumplen la condición.
- **Forma funcional de `setState`**: `setItems((actual) => nuevo)` parte del valor más reciente.
- **Estado inicial desde props**: `useState(inicial)` solo usa la prop en el primer render.
- **`key`**: identifica cada elemento de una lista entre renders; usa un id estable.
- **`aria-label`**: nombre accesible para botones que solo tienen un icono o símbolo.
