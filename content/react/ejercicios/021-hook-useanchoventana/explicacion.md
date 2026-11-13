## Idea clave

Guarda el ancho en un **estado** y suscríbete al evento `"resize"` dentro de un **`useEffect`**. Todo listener que agregas en un efecto se quita en su **función de limpieza**, usando la misma función que registraste.

## Paso a paso

1. **Estado con inicialización perezosa.** `useState(() => window.innerWidth)` lee el ancho solo en el primer render. Si escribes `useState(window.innerWidth)`, también funciona, pero el valor se lee en cada render y se descarta.
2. **Efecto con `[]`.** La suscripción se hace una sola vez, al montar. No depende de ninguna prop ni estado.
3. **Función con nombre para el listener.** `function actualizar() { setAncho(window.innerWidth); }`. Necesitas guardarla en una variable porque `removeEventListener` solo quita un listener si le pasas **exactamente la misma función**.
4. **Suscríbete.** `window.addEventListener("resize", actualizar)`.
5. **Devuelve la limpieza.** `return () => window.removeEventListener("resize", actualizar);`. React la ejecuta cuando el componente se desmonta (y antes de volver a correr el efecto, si las dependencias cambiaran).
6. **Devuelve el dato.** Un hook propio no devuelve JSX: devuelve lo que el componente necesita, aquí el número.

```jsx
import { useEffect, useState } from "react";

export function useAnchoVentana() {
  // Inicialización perezosa: la función solo se ejecuta en el primer render.
  const [ancho, setAncho] = useState(() => window.innerWidth);

  useEffect(() => {
    function actualizar() {
      setAncho(window.innerWidth);
    }

    window.addEventListener("resize", actualizar);

    // Limpieza: React la llama al desmontar. Quita el MISMO listener.
    return () => window.removeEventListener("resize", actualizar);
  }, []); // [] = suscribirse una sola vez, al montar

  return ancho;
}
```

## Por qué funciona

| Momento | Qué pasa | Estado `ancho` | El hook devuelve |
|---|---|---|---|
| Primer render | `useState` lee `window.innerWidth` | `1024` | `1024` |
| Después de pintar | El efecto registra `actualizar` en `"resize"` | `1024` | `1024` |
| La ventana pasa a 500 px | El navegador llama a `actualizar`, que hace `setAncho(500)` | `500` | `500` (nuevo render) |
| Otro render cualquiera | `[]` no cambió: el efecto **no** se vuelve a registrar | igual | igual |
| Desmontaje | React llama a la limpieza: `removeEventListener("resize", actualizar)` | | ya no escucha |

Cada componente que usa el hook tiene **su propio** estado y su propio listener: los hooks propios reutilizan lógica, no comparten datos.

En el test se usa `act(...)` al disparar el evento: le dice a React "procesa las actualizaciones de estado que se generen aquí antes de seguir", para que `result.current` ya tenga el valor nuevo.

## Errores comunes

- **No devolver la limpieza.** El listener sigue vivo después de desmontar: cada vez que montas el componente se suma otro, y React intenta actualizar el estado de un componente que ya no existe. Lo reconoces porque falla el test "al desmontar quita el mismo listener".
- **Quitar una función distinta**: `removeEventListener("resize", () => setAncho(window.innerWidth))`. Es una función **nueva** (otra referencia), así que no quita nada. Por eso la función del listener se guarda en una variable.
- **Olvidar el `[]`.** Sin dependencias, el efecto corre en cada render: se quita y se vuelve a poner el listener cada vez que cambia el ancho. Funciona, pero es trabajo innecesario.
- **Leer `window.innerWidth` directamente sin estado** (`return window.innerWidth`). Devuelve el valor del momento del render, pero nada provoca un render nuevo cuando la ventana cambia: el componente se queda con el valor viejo.
- **Llamar al hook dentro de un `if` o un bucle.** Los hooks (también los tuyos) se llaman siempre en el mismo orden, en el nivel superior del componente.

## Otra forma de resolverlo

Un hook más general, `useEventoVentana(tipo, manejador)`, y construir `useAnchoVentana` encima:

```jsx
import { useEffect, useState } from "react";

function useEventoVentana(tipo, manejador) {
  useEffect(() => {
    window.addEventListener(tipo, manejador);
    return () => window.removeEventListener(tipo, manejador);
  }, [tipo, manejador]);
}

export function useAnchoVentana() {
  const [ancho, setAncho] = useState(() => window.innerWidth);
  useEventoVentana("resize", () => setAncho(window.innerWidth));
  return ancho;
}
```

Ojo: aquí la flecha `() => setAncho(...)` es una función nueva en cada render, así que el efecto se quita y se vuelve a poner cada vez. Para evitarlo habría que envolverla en `useCallback`. **¿Cuándo conviene?** Cuando escuchas varios eventos de `window` (`resize`, `scroll`, `keydown`) en distintos lugares; para un solo caso, la solución directa es más simple y clara.

## Cómo explicarlo en la entrevista

> "Guardo el ancho en un estado, inicializado de forma perezosa con `window.innerWidth`. En un `useEffect` con dependencias vacías registro un listener de `resize` que actualiza el estado, y devuelvo una función de limpieza que quita ese mismo listener al desmontar. Es importante pasarle a `removeEventListener` la misma referencia de función; si no, no quita nada y dejo listeners colgados. Lo empaqueto como hook propio para reutilizarlo en cualquier componente que necesite saber el ancho."

## Conceptos

- **Hook propio (custom hook)**: función que empieza con `use` y usa otros hooks para reutilizar lógica.
- **Función de limpieza**: lo que devuelve un efecto; React la ejecuta al desmontar o antes de repetir el efecto.
- **Inicialización perezosa**: `useState(() => valor)` calcula el valor inicial solo una vez.
- **`addEventListener` / `removeEventListener`**: para quitar un listener hay que pasar la misma función.
- **Dependencias `[]`**: el efecto corre solo al montar (y su limpieza al desmontar).
- **`act`**: en los tests, procesa las actualizaciones de React antes de comprobar el resultado.
