## Idea clave

El efecto corre **después** del render. Si guardas el valor en una ref dentro de un `useEffect` y devuelves `ref.current` durante el render, lo que devuelves es lo que se guardó en el render **anterior**.

## Paso a paso

1. **Crea la caja.** `const ref = useRef(undefined)`. Una ref conserva su `.current` entre renders y, a diferencia del estado, cambiarla **no** provoca un render.
2. **Guarda el valor en un efecto.** `useEffect(() => { ref.current = valor; }, [valor])`. Esto se ejecuta cuando React ya terminó de pintar.
3. **Devuelve lo que hay en la caja.** `return ref.current`. En ese momento el efecto de este render todavía no corrió, así que la caja tiene el valor viejo.

```jsx
import { useEffect, useRef } from "react";

export function usePrevio(valor) {
  // La ref guarda un valor entre renders sin provocar renders nuevos.
  const ref = useRef(undefined);

  // El efecto corre DESPUÉS del render: guarda el valor actual para el próximo.
  useEffect(() => {
    ref.current = valor;
  }, [valor]);

  // Durante el render, la ref todavía tiene el valor del render anterior.
  return ref.current;
}
```

## Por qué funciona

React siempre sigue este orden: **render** (ejecuta tu función) → **pinta** → **efectos**.

| Paso | `valor` | `ref.current` al leerla (render) | Devuelve | `ref.current` después del efecto |
|---|---|---|---|---|
| Render 1 | `1` | `undefined` | `undefined` | `1` |
| Render 2 | `2` | `1` | **`1`** | `2` |
| Render 3 | `3` | `2` | **`2`** | `3` |

En cada fila, la lectura ocurre antes de la escritura: por eso el hook va "un paso atrás".

¿Por qué una ref y no un estado? Si hicieras `setPrevio(valor)` en el efecto, eso provocaría **otro render**, en el que el "previo" ya sería igual al actual, y además tendrías un render extra cada vez. La ref cambia en silencio, que es justo lo que se necesita.

## Errores comunes

- **Actualizar la ref durante el render**: `const previo = ref.current; ref.current = valor; return previo;` sin efecto. Parece funcionar, pero React puede ejecutar el render más de una vez (en modo estricto en desarrollo, o con renders que se descartan) y la ref se adelanta. La regla de React: no escribas refs durante el render.
- **Devolver `ref.current` después de actualizarla** (escribir y luego leer en el mismo lugar): devuelves el valor actual, no el anterior. Falla "devuelve el valor del render anterior".
- **Usar `useState` para guardar el previo en un efecto.** Provoca un render extra y el valor "previo" queda igual al actual en ese segundo render.
- **Pensar que la ref provoca un render.** Cambiar `ref.current` no actualiza la pantalla: si el componente no se vuelve a renderizar por otra razón, no verás el cambio. Aquí no importa porque el valor se lee en el siguiente render.
- **Esperar algo distinto de `undefined` en el primer render.** No hay render anterior; quien use el hook debe manejar ese caso (`anterior !== undefined && ...`).

## Otra forma de resolverlo

La documentación de React propone guardar el valor anterior en **estado** y actualizarlo **durante el render** cuando detectas un cambio:

```jsx
import { useState } from "react";

export function usePrevio(valor) {
  const [actual, setActual] = useState(valor);
  const [previo, setPrevio] = useState(undefined);

  if (valor !== actual) {
    // React permite actualizar el estado del propio componente durante el render
    // si es condicional: descarta este render y repite con los valores nuevos.
    setPrevio(actual);
    setActual(valor);
  }

  return previo;
}
```

**¿Cuándo conviene?** Esta versión no lee refs durante el render (React lo desaconseja) y funciona bien con las funciones nuevas de React como las transiciones. Hay una diferencia sutil: devuelve el último valor **distinto**, no el del render anterior. Si el componente se renderiza dos veces con `2`, la versión con ref devuelve `2` y esta sigue devolviendo `1`. Para "¿subió o bajó el precio?" la versión con estado suele ser lo que quieres. La versión con ref es la clásica que te van a pedir para ver si entiendes el orden render → efecto.

## Cómo explicarlo en la entrevista

> "Uso una ref porque necesito recordar un valor entre renders sin provocar renders nuevos. Devuelvo `ref.current` durante el render y actualizo la ref en un `useEffect`. Como los efectos corren después del render, en el momento en que leo la ref todavía tiene el valor del render anterior; luego el efecto guarda el actual para la próxima vez. En el primer render devuelve `undefined`. Sé que React recomienda no leer refs durante el render, así que en código nuevo también podría hacerlo con estado, comparando y actualizando durante el render."

## Conceptos

- **`useRef`**: caja `{ current }` que persiste entre renders; modificarla no vuelve a renderizar.
- **Orden de React**: render (ejecutar el componente) → pintar el DOM → correr efectos.
- **`useEffect` con `[valor]`**: corre después del render cada vez que `valor` cambia.
- **Hook propio**: función que empieza con `use` y combina otros hooks.
- **`renderHook`**: utilidad de los tests para probar un hook sin escribir un componente; `rerender` simula un nuevo render con otras props.
- **Actualizar estado durante el render**: permitido solo de forma condicional y sobre el propio componente.
