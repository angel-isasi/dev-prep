## Idea clave

En React **los datos bajan** por props (del padre al hijo) y **los avisos suben** por funciones: el padre le pasa al hijo una función (un *callback*) y el hijo la llama cuando pasa algo. El estado vive en el componente que lo necesita mostrar: aquí, la `Tienda`.

## Paso a paso

1. **Decide dónde vive el estado.** La última pizza se muestra en la `Tienda`, así que ahí va `useState(null)`. `null` significa "todavía nada".
2. **El hijo recibe una función por props.** `BotonAgregar` recibe `onAgregar`. El nombre empieza con `on` por convención: indica que es un aviso de evento, como `onClick`.
3. **El hijo la llama con el dato.** `onClick={() => onAgregar(pizza)}`: al hacer clic, ejecuta la función del padre pasándole su pizza. El hijo no sabe qué hará el padre con ella, y no le importa.
4. **El padre le pasa su setter.** `onAgregar={setUltima}`. Cuando el hijo llama `onAgregar("Pepperoni")`, en realidad se ejecuta `setUltima("Pepperoni")`.
5. **Muestra el mensaje solo si hay algo.** `{ultima && <p>Agregaste {ultima}</p>}`: con `null` no se pinta nada; con un texto, se pinta el párrafo.

```jsx
import { useState } from "react";

// Hijo: no sabe qué hará el padre, solo avisa qué pizza se eligió.
export function BotonAgregar({ pizza, onAgregar }) {
  return <button onClick={() => onAgregar(pizza)}>Agregar {pizza}</button>;
}

// Padre: dueño del estado. Le pasa al hijo la función que lo actualiza.
export function Tienda() {
  const [ultima, setUltima] = useState(null);

  return (
    <div>
      <BotonAgregar pizza="Margarita" onAgregar={setUltima} />
      <BotonAgregar pizza="Pepperoni" onAgregar={setUltima} />
      {ultima && <p>Agregaste {ultima}</p>}
    </div>
  );
}
```

## Por qué funciona

Recorrido haciendo clic en "Agregar Margarita" y luego en "Agregar Pepperoni":

| Acción | Qué llama el hijo | Estado `ultima` | Se pinta |
|---|---|---|---|
| Primer render | (nada) | `null` | solo los dos botones |
| Clic en Margarita | `onAgregar("Margarita")` = `setUltima("Margarita")` | `"Margarita"` | Agregaste Margarita |
| Clic en Pepperoni | `onAgregar("Pepperoni")` = `setUltima("Pepperoni")` | `"Pepperoni"` | Agregaste Pepperoni |

El hijo nunca toca el estado del padre directamente: solo ejecuta la función que recibió. Al cambiar el estado de la `Tienda`, React vuelve a renderizar la `Tienda` y sus hijos con los datos nuevos.

## Errores comunes

- **Poner el estado en el botón.** El botón sabría qué se agregó, pero la `Tienda` no, y no podría mostrar el mensaje. Si un dato se muestra en el padre, el estado va en el padre.
- **Escribir `onClick={onAgregar(pizza)}`** sin la flecha. Se ejecuta en cada render en vez de en el clic, y como cambia el estado, React entra en un bucle ("Too many re-renders").
- **Escribir `onClick={onAgregar}`** directamente. Así el hijo le pasa al padre el **evento del clic**, no la pizza, y el mensaje queda raro o da error.
- **Olvidar exportar `BotonAgregar`.** Los tests lo importan por separado y fallan con "is not a function" o "undefined".
- **Usar `&&` con valores que pueden ser `0`.** Aquí no pasa porque es texto o `null`, pero con números `{0 && ...}` pinta un 0. Para números, compara explícitamente.

## Otra forma de resolverlo

Que el padre pase su propia función en vez del setter directo. Útil cuando, además de guardar, quiere hacer algo más:

```jsx
export function Tienda() {
  const [ultima, setUltima] = useState(null);
  const [total, setTotal] = useState(0);

  function agregar(pizza) {
    setUltima(pizza);
    setTotal((t) => t + 1);
  }

  return (
    <div>
      <BotonAgregar pizza="Margarita" onAgregar={agregar} />
      <BotonAgregar pizza="Pepperoni" onAgregar={agregar} />
      {ultima && <p>Agregaste {ultima}</p>}
      <p>Pizzas agregadas: {total}</p>
    </div>
  );
}
```

**¿Cuándo conviene?** Cuando el aviso del hijo debe disparar varias cosas (guardar, contar, llamar a una API). Pasar el setter directo es más corto y está bien si solo necesitas guardar el valor.

## Cómo explicarlo en la entrevista

> "En React el flujo de datos es de una sola dirección: el padre le pasa datos al hijo por props. Para que el hijo se comunique con el padre, el padre le pasa una función callback, aquí `onAgregar`, y el hijo la llama con el dato. El estado lo pongo en la `Tienda` porque es quien muestra la última pizza; el botón queda sin estado y reutilizable. Esto se conoce como subir el estado al ancestro común."

## Conceptos

- **Flujo de datos unidireccional**: los datos bajan por props; el hijo no modifica las props.
- **Callback por props**: una función que el padre pasa para que el hijo la llame (`onAgregar`).
- **Subir el estado** (*lifting state up*): poner el estado en el padre que lo necesita.
- **Componente sin estado**: `BotonAgregar` solo recibe props y avisa; es fácil de reutilizar.
- **Renderizado condicional con `&&`**: pinta el elemento solo si la condición es verdadera.
- **`vi.fn()`**: en los tests, una función espía que recuerda con qué argumentos la llamaron.
