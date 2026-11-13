## Idea clave

Pedir datos es un **efecto**: va en un `useEffect` que corre después del render. El hook guarda el resultado en el estado (`null` mientras tanto) y usa una bandera `vigente` en la **limpieza** del efecto para ignorar respuestas que llegan tarde. El componente no sabe de dónde vienen los datos: solo usa el hook.

## Paso a paso

1. **Estado inicial `null`**: significa "todavía no hay pizza". El componente lo usa para mostrar el mensaje de carga.
2. **`useEffect` con `[obtener]`**: corre después del primer render y se repite solo si llega otra función `obtener`.
3. **Llama a `obtener().then(...)`** y, cuando resuelve, guarda los datos con `setPizza`.
4. **Bandera `vigente`**: una variable local del efecto que empieza en `true`. La función que devuelves (la **limpieza**) la pone en `false`. React ejecuta esa limpieza al desmontar el componente **y antes de volver a correr el efecto**.
5. **Solo guarda si sigue vigente**: `if (vigente) setPizza(datos)`. Una respuesta de un efecto ya limpiado se ignora.
6. **El componente**: llama al hook y elige qué pintar con un `if` temprano.

```jsx
import { useEffect, useState } from "react";

export function usePizzaDelDia(obtener) {
  const [pizza, setPizza] = useState(null);

  useEffect(() => {
    // Bandera de "esta petición todavía importa".
    let vigente = true;

    obtener().then((datos) => {
      if (vigente) setPizza(datos);
    });

    // Limpieza: corre al desmontar o antes de repetir el efecto
    // (cuando cambia `obtener`). Marca la petición vieja como obsoleta.
    return () => {
      vigente = false;
    };
  }, [obtener]);

  return pizza;
}

export function PizzaDelDia({ obtener }) {
  const pizza = usePizzaDelDia(obtener);

  if (!pizza) return <p>Cargando la pizza del día…</p>;
  return <h2>Hoy: {pizza.nombre}</h2>;
}
```

## Por qué funciona

Caso normal:

| Momento | `pizza` | Se pinta |
|---|---|---|
| Primer render | `null` | Cargando la pizza del día… |
| Después del render corre el efecto y llama a `obtener()` | `null` | (igual) |
| La promesa resuelve, `vigente` es `true`, `setPizza(datos)` | `{ nombre: "Cuatro quesos" }` | Hoy: Cuatro quesos |

Caso de carrera (cambia `obtener` antes de que llegue la primera respuesta):

| Momento | Efecto 1 (`vigente1`) | Efecto 2 (`vigente2`) | Se pinta |
|---|---|---|---|
| Monta con `obtenerVieja` | `true`, esperando | | Cargando… |
| Re-render con `obtenerNueva`: React limpia el efecto 1 | `false` | `true`, esperando | Cargando… |
| Llega la respuesta nueva | | `setPizza(Pepperoni)` | Hoy: Pepperoni |
| Llega tarde la respuesta vieja | `vigente1` es `false`: se ignora | | Hoy: Pepperoni |

Cada ejecución del efecto tiene **su propia** variable `vigente` gracias al closure: la limpieza del efecto 1 apaga solo la bandera del efecto 1.

## Errores comunes

- **Llamar a `obtener()` directamente en el cuerpo del componente** (fuera de `useEffect`). Se llamaría en cada render, y como `setPizza` provoca otro render, entras en un bucle infinito.
- **Olvidar el arreglo de dependencias.** Sin `[obtener]`, el efecto corre después de cada render: otra vez pedidos sin fin.
- **Hacer el callback del efecto `async`** (`useEffect(async () => ...)`). Una función `async` devuelve una promesa, y React espera que el efecto devuelva una función de limpieza o nada. Si quieres `await`, crea una función async **dentro** del efecto y llámala.
- **No ignorar respuestas viejas.** Si la vieja llega después que la nueva, pisa los datos correctos. Lo reconoces porque falla el test de "respuesta vieja".
- **Usar `pizza.nombre` sin comprobar `null`** antes. En el primer render `pizza` es `null` y explota con "Cannot read properties of null".

## Otra forma de resolverlo

Con **`AbortController`**, que además **cancela** la petición de red (útil cuando `obtener` usa `fetch`):

```jsx
import { useEffect, useState } from "react";

export function usePizzaDelDia(obtener) {
  const [pizza, setPizza] = useState(null);

  useEffect(() => {
    const controlador = new AbortController();
    obtener({ signal: controlador.signal })
      .then(setPizza)
      .catch((error) => {
        if (error.name !== "AbortError") throw error;
      });
    return () => controlador.abort();
  }, [obtener]);

  return pizza;
}

// Con fetch, obtener sería algo como:
// const obtener = ({ signal }) => fetch("/api/pizza-del-dia", { signal }).then((r) => r.json());
```

**¿Cuándo conviene?** Cuando la petición es un `fetch` real: además de ignorar la respuesta, el navegador deja de descargarla. La bandera `vigente` es más simple y funciona con cualquier promesa. En proyectos grandes se usan librerías como TanStack Query, que resuelven esto, el caché y los reintentos.

## Cómo explicarlo en la entrevista

> "Pedir datos es un efecto, así que lo hago en un `useEffect` con la función `obtener` como dependencia. Guardo el resultado en un estado que empieza en `null`, y el componente muestra 'Cargando' mientras sea `null`. Para evitar condiciones de carrera uso una bandera local `vigente` que la limpieza del efecto pone en `false`; React ejecuta esa limpieza antes de repetir el efecto o al desmontar, así una respuesta vieja nunca pisa a la nueva. Lo saco a un hook para que el componente solo se preocupe de qué pintar."

## Conceptos

- **`useEffect`**: código que corre después del render (pedir datos, suscripciones, timers).
- **Arreglo de dependencias**: el efecto se repite solo si cambia algo de la lista.
- **Función de limpieza**: lo que devuelve el efecto; corre antes de repetirlo y al desmontar.
- **Condición de carrera**: respuestas que llegan en un orden distinto al que se pidieron.
- **Closure**: cada ejecución del efecto recuerda su propia variable `vigente`.
- **Hook propio**: separa la lógica de datos de la presentación.
- **Renderizado condicional** con retorno temprano (`if (!pizza) return ...`).
- **`AbortController`**: cancela peticiones `fetch`.
