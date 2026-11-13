## Idea clave

Un **solo estado con `fase`** describe dónde está la carga (`cargando`, `error`, `listo`), y una **sola función `intentar`** sirve tanto para la carga inicial (desde el efecto) como para el botón. `useCallback` mantiene estable esa función para que el efecto no se repita sin motivo.

## Paso a paso

1. **Estado único**: `{ fase: "cargando" }`. Cuando llegue el dato, `{ fase: "listo", dato }`; si falla, `{ fase: "error" }`.
2. **`intentar`**: pone la fase en `cargando`, llama a `cargar()` y usa `.then(siCumple, siFalla)`, la forma de `then` con dos funciones: la segunda hace de `catch`.
3. **`useCallback(intentar, [cargar])`**: devuelve **la misma función** entre renders mientras `cargar` no cambie.
4. **Efecto**: `useEffect(() => { intentar(); }, [intentar])` carga al montar. Como `intentar` es estable, no se vuelve a ejecutar en cada render.
5. **Render por fase**: un `if` por caso. En `error`, el botón llama a la misma `intentar`.

```jsx
import { useCallback, useEffect, useState } from "react";

export function Carga({ cargar }) {
  const [estado, setEstado] = useState({ fase: "cargando" });

  const intentar = useCallback(() => {
    setEstado({ fase: "cargando" });
    cargar().then(
      (dato) => setEstado({ fase: "listo", dato }),
      () => setEstado({ fase: "error" })
    );
  }, [cargar]);

  useEffect(() => {
    intentar();
  }, [intentar]);

  if (estado.fase === "cargando") return <p>Cargando…</p>;

  if (estado.fase === "error") {
    return (
      <div>
        <p role="alert">No se pudo cargar el menú</p>
        <button onClick={intentar}>Reintentar</button>
      </div>
    );
  }

  return <p>{estado.dato}</p>;
}
```

## Por qué funciona

Recorrido con `cargar` que falla la primera vez y luego devuelve `"Menú listo"`:

| Paso | `estado` | Se ve |
|---|---|---|
| render 1 | `{ fase: "cargando" }` | `Cargando…` |
| efecto: `intentar()`, la promesa falla | `{ fase: "error" }` | alerta + `Reintentar` |
| clic: `intentar()` | `{ fase: "cargando" }` | `Cargando…` |
| la promesa se cumple | `{ fase: "listo", dato: "Menú listo" }` | `Menú listo` |

¿Por qué `fase` y no tres estados? Con `cargando`, `error` y `dato` por separado hay 8 combinaciones posibles (2 x 2 x 2), y la mayoría no tienen sentido: `cargando = true` y `error = true` a la vez. Si al reintentar te olvidas de limpiar `error`, ves el spinner **y** el mensaje de error. Con `fase`, el estado solo puede ser uno de tres valores válidos.

¿Por qué `useCallback`? Sin él, `intentar` sería una función nueva en cada render. El efecto depende de `intentar`, así que se ejecutaría en cada render: cargar → `setEstado` → render → función nueva → efecto → cargar... un bucle infinito.

## Errores comunes

- **Quitar `useCallback` y dejar `[intentar]`** en las dependencias: bucle infinito de peticiones. Lo reconoces porque `cargar` se llama cientos de veces.
- **Dejar el efecto con `[]` y llamar a una `intentar` sin `useCallback`.** Funciona, pero el linter de React avisa de la dependencia faltante y, si `cargar` cambiara, no se volvería a cargar.
- **Tres booleanos sueltos** y olvidar resetear uno al reintentar: estados imposibles en pantalla.
- **No volver a `cargando` al reintentar.** El usuario hace clic y no ve ninguna reacción hasta que llega la respuesta.
- **Olvidar el manejo del rechazo.** Una promesa rechazada sin manejar no cambia la fase y además ensucia la consola.

## Otra forma de resolverlo

Con un **contador de intentos** como dependencia del efecto: el botón no llama a la carga, solo incrementa el contador.

```jsx
export function Carga({ cargar }) {
  const [estado, setEstado] = useState({ fase: "cargando" });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setEstado({ fase: "cargando" });
    cargar().then(
      (dato) => vigente && setEstado({ fase: "listo", dato }),
      () => vigente && setEstado({ fase: "error" })
    );
    return () => {
      vigente = false;
    };
  }, [cargar, intento]);

  // ... en el error:
  // <button onClick={() => setIntento((n) => n + 1)}>Reintentar</button>
}
```

**¿Cuándo conviene?** Cuando quieres que **toda** la lógica de carga viva dentro del efecto, incluida la limpieza con `vigente` (si el componente se desmonta mientras carga). Es un patrón muy usado: "cambiar una dependencia para volver a ejecutar el efecto". La versión con `useCallback` es más directa de leer.

## Cómo explicarlo en la entrevista

> "Modelo la carga con un solo estado que tiene una `fase`: cargando, error o listo, así evito estados imposibles como estar cargando y con error a la vez. Escribo una función `intentar` que pone la fase en cargando, llama a `cargar` y guarda el dato o el error. La uso en el `useEffect` para la carga inicial y en el botón Reintentar. La envuelvo en `useCallback` con `cargar` como dependencia, porque es dependencia del efecto: si fuera una función nueva en cada render, el efecto entraría en un bucle infinito."

## Conceptos

- **Máquina de estados simple**: un campo `fase` con valores fijos.
- **Estados imposibles**: combinaciones de booleanos que no deberían existir.
- **`useCallback`**: memoriza una función para que sea la misma entre renders.
- **Dependencias de `useEffect`**: si una función es dependencia, debe ser estable.
- **`.then(siCumple, siFalla)`**: manejar éxito y error en una sola llamada.
- **Reintento**: reutilizar la misma lógica para la carga inicial y la manual.
- **`role="alert"`**: mensaje que los lectores de pantalla anuncian.
