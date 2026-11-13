## Idea clave

Un generador recuerda dónde se quedó: cada `next()` continúa desde el último `yield`. Lo guardas en un `useRef` para que sobreviva entre renders, y pides el id en el **manejador** del clic, porque la función que le pasas a `setMesas` debe ser pura (React puede llamarla más de una vez).

## Paso a paso

1. **La función generadora.** Se declara con `function*`. Al llamarla **no** ejecuta su cuerpo: devuelve un objeto generador.
2. **`yield` pausa y entrega.** Cada `next()` ejecuta hasta el siguiente `yield` y devuelve `{ value, done }`. Como hay un `while (true)`, `done` siempre es `false` y nunca se acaba; no se cuelga porque entre `next()` y `next()` el generador está detenido.
3. **Guardarlo en un ref.** `const ids = useRef(null)` y luego `ids.current ??= generarIds("mesa")`. La primera vez `ids.current` es `null` y se crea; en los renders siguientes ya tiene el generador y `??=` no hace nada.
4. **Pedir el id en el manejador.** En `agregar`, `const id = ids.current.next().value` avanza el generador una sola vez por clic.
5. **Actualizar sin mutar.** `setMesas((lista) => [...lista, id])` crea un arreglo nuevo con el id al final. Esta función solo usa sus datos de entrada: es pura.
6. **Pintar con `key`.** Cada `<li>` usa el id como `key`: es único y no cambia aunque la lista crezca.

```jsx
import { useRef, useState } from "react";

export function* generarIds(prefijo) {
  let n = 1;
  while (true) {
    yield `${prefijo}-${n}`;
    n++;
  }
}

export function Mesas() {
  const ids = useRef(null);
  ids.current ??= generarIds("mesa");

  const [mesas, setMesas] = useState([]);

  function agregar() {
    const id = ids.current.next().value;
    setMesas((lista) => [...lista, id]);
  }

  return (
    <div>
      <button onClick={agregar}>Agregar mesa</button>
      <ul>
        {mesas.map((mesa) => (
          <li key={mesa}>{mesa}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Por qué funciona

Lo que pasa dentro del generador con cada `next()`:

| Llamada | Dónde estaba pausado | Qué ejecuta | Devuelve |
|---|---|---|---|
| (crear) | no empezó | nada | el objeto generador |
| `next()` 1 | al inicio | `n = 1`, entra al `while`, llega al `yield` | `{ value: "mesa-1", done: false }` |
| `next()` 2 | en el `yield` | `n++` (2), vuelve al `yield` | `{ value: "mesa-2", done: false }` |
| `next()` 3 | en el `yield` | `n++` (3), vuelve al `yield` | `{ value: "mesa-3", done: false }` |

Y en el componente, con dos clics:

| Render | `ids.current` | `mesas` |
|---|---|---|
| 1 (montaje) | se crea el generador | `[]` |
| clic 1 | el mismo generador, entrega `"mesa-1"` | `["mesa-1"]` |
| clic 2 | el mismo, entrega `"mesa-2"` | `["mesa-1", "mesa-2"]` |

**¿Por qué no pedir el id dentro de `setMesas`?** Si escribes `setMesas((lista) => [...lista, ids.current.next().value])`, la función ya no es pura: cada vez que se ejecuta cambia el generador. En desarrollo con `<StrictMode>`, React llama dos veces a esas funciones para detectar justo este problema, y te saltarías ids (`mesa-1`, `mesa-3`, ...).

## Errores comunes

- **Crear el generador en el cuerpo sin ref:** `const ids = generarIds("mesa")`. Cada render crea uno nuevo que empieza en 1, así que todas las mesas serían `mesa-1` y las `key` se repetirían (React avisa "Encountered two children with the same key").
- **`useRef(generarIds("mesa"))`.** Funciona, pero llama a `generarIds` en **cada** render y descarta el resultado. Con `??=` solo se crea una vez.
- **Pedir el id dentro del updater** de `setMesas`. Rompe la pureza; con StrictMode se saltan ids.
- **Olvidar `.value`.** `next()` devuelve un objeto `{ value, done }`; si lo guardas entero verás `[object Object]`.
- **Usar el índice como `key`.** Funciona aquí porque solo se agregan al final, pero si luego borras mesas, los índices cambian y React confunde los elementos.

## Otra forma de resolverlo

Sin generador, con un contador en un ref:

```jsx
export function Mesas() {
  const siguiente = useRef(1);
  const [mesas, setMesas] = useState([]);

  function agregar() {
    const id = `mesa-${siguiente.current}`;
    siguiente.current++;
    setMesas((lista) => [...lista, id]);
  }
  // ... mismo JSX
}
```

**¿Cuándo conviene?** Para un id sencillo, el contador es más directo y es lo que la mayoría escribiría en una entrevista. El generador conviene cuando la secuencia tiene lógica propia (saltar números, reiniciar por día, combinar prefijos) y quieres encapsularla fuera del componente. Para ids que deben ser únicos de verdad (se guardan en un servidor), usa `crypto.randomUUID()`. Y para enlazar un `<label>` con su `<input>`, React trae `useId()`.

## Cómo explicarlo en la entrevista

> "Usé una función generadora con un `while (true)`: no se cuelga porque se pausa en cada `yield` y solo avanza con `next()`. En el componente guardo el generador en un `useRef` para que no se cree de nuevo en cada render, y pido el id en el manejador del clic, no dentro del updater de `setMesas`, porque esa función debe ser pura; React en modo estricto la llama dos veces y me saltaría ids. Luego uso el id como `key`, que es único y estable."

## Conceptos

- **Función generadora `function*`**: devuelve un iterador que produce valores bajo demanda.
- **`yield`**: entrega un valor y pausa la función hasta el siguiente `next()`.
- **`next()`**: avanza el generador y devuelve `{ value, done }`.
- **`useRef`**: guarda un valor que sobrevive entre renders sin provocarlos.
- **`??=`**: asigna solo si el valor actual es `null` o `undefined` (inicialización perezosa).
- **Función de actualización pura**: `setX((previo) => nuevo)` no debe tener efectos secundarios.
- **StrictMode**: en desarrollo ejecuta dos veces ciertas funciones para detectar impurezas.
- **`key` estable**: identifica a cada elemento de la lista entre renders.
