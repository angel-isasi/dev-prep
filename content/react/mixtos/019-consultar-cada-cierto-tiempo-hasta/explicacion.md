## Idea clave

El efecto **depende del estado**. Mientras no sea el final, crea un intervalo que consulta; cuando el estado cambia, React limpia el intervalo viejo y vuelve a correr el efecto. Si el estado nuevo es `"entregado"`, el efecto sale antes (`return`) y **ya no crea otro**: así se detiene el polling.

## Paso a paso

1. **Estado** `estado`, empieza en `"preparando"`.
2. **Condición de parada al inicio del efecto**: `if (estado === "entregado") return;`. Sin intervalo, no hay nada que limpiar.
3. **Intervalo**: `setInterval(callback, cada)`. El callback es `async` para poder usar `await consultar()`.
4. **`try/catch` en el callback**: si la consulta falla, no se actualiza nada y en la siguiente vuelta se intenta de nuevo. Sin `catch`, el error quedaría como "unhandled rejection".
5. **Limpieza**: `return () => clearInterval(id)`. React la ejecuta cuando cambian las dependencias y al desmontar.
6. **Dependencias**: `[estado, consultar, cada]`. Incluir `estado` es lo que hace que el efecto "se entere" del final.

```jsx
import { useEffect, useState } from "react";

const ESTADO_FINAL = "entregado";

export function EstadoPedido({ consultar, cada = 1000 }) {
  const [estado, setEstado] = useState("preparando");

  useEffect(() => {
    if (estado === ESTADO_FINAL) return;

    const id = setInterval(async () => {
      try {
        setEstado(await consultar());
      } catch {
        // se reintenta en la siguiente vuelta
      }
    }, cada);

    return () => clearInterval(id);
  }, [estado, consultar, cada]);

  return <p>Tu pedido está: {estado}</p>;
}
```

## Por qué funciona

Recorrido con `consultar` que devuelve `"en camino"` y luego `"entregado"`:

| Tiempo | Qué pasa | Intervalos vivos | Se ve |
|---|---|---|---|
| 0 ms | render 1, efecto con `"preparando"`: crea el intervalo A | A | `preparando` |
| 1000 ms | A consulta: `"en camino"`, `setEstado` | A | |
| | render 2. Cambió `estado`: limpieza de A, efecto con `"en camino"`: crea B | B | `en camino` |
| 2000 ms | B consulta: `"entregado"`, `setEstado` | B | |
| | render 3. Limpieza de B, efecto con `"entregado"`: `return` sin crear nada | ninguno | `entregado` |
| 7000 ms | nada | ninguno | `entregado` |

Por eso `consultar` se llama exactamente 2 veces y `vi.getTimerCount()` termina en 0.

Si una consulta devuelve **el mismo estado** que ya había (por ejemplo, `"en camino"` otra vez), React no re-renderiza, el efecto no se repite y el mismo intervalo sigue preguntando. Exactamente lo que queremos.

## Errores comunes

- **Dependencias `[]`.** El efecto corre una sola vez y nunca "ve" el estado final: el intervalo consulta para siempre. Además, dentro del intervalo `estado` sería siempre `"preparando"` (closure viejo).
- **Revisar el estado final dentro del callback del intervalo** (`if (estado === "entregado") clearInterval(id)`). Con `[]`, el callback ve el `estado` del primer render: nunca se cumple.
- **Olvidar la limpieza.** Cada cambio de estado crearía un intervalo más sin borrar el anterior: consultas duplicadas que se multiplican.
- **No manejar el error en el callback async.** Un fallo de red deja una promesa rechazada sin manejar en cada vuelta.
- **Consultar al montar sin que lo pidan.** El enunciado dice que la primera consulta es a los `cada` ms; `setInterval` ya funciona así.

## Otra forma de resolverlo

Con un **bucle async** que espera, consulta y repite, y una bandera para cancelarlo:

```jsx
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

useEffect(() => {
  let activo = true;

  async function sondear() {
    let actual = "preparando";
    while (activo && actual !== ESTADO_FINAL) {
      await esperar(cada);
      if (!activo) return;
      try {
        actual = await consultar();
        if (activo) setEstado(actual);
      } catch {
        // se reintenta en la siguiente vuelta
      }
    }
  }

  sondear();
  return () => {
    activo = false;
  };
}, [consultar, cada]);
```

**¿Cuándo conviene?** Cuando la consulta puede tardar **más** que el intervalo. Con `setInterval`, si el servidor tarda 3 s y preguntas cada 1 s, se acumulan consultas en paralelo. En el bucle, la siguiente espera empieza recién cuando la consulta anterior terminó: nunca hay dos a la vez. A cambio, la bandera `activo` no cancela la espera en curso (el temporizador sigue hasta que vence, aunque ya no haga nada). Para un caso simple como este, `setInterval` con el estado en las dependencias es más corto y fácil de explicar.

## Cómo explicarlo en la entrevista

> "Hago polling con un `setInterval` dentro de un `useEffect` que depende del estado. Cada vez que el estado cambia, React limpia el intervalo anterior y vuelve a correr el efecto; al inicio del efecto pregunto si ya es el estado final y, si lo es, salgo sin crear otro intervalo. Así la parada queda expresada en las dependencias y no dentro del callback, donde tendría un closure viejo. El callback es async, con try/catch para que un fallo de red no rompa nada, y limpio el intervalo al desmontar."

## Conceptos

- **Polling**: consultar periódicamente hasta obtener un resultado.
- **Condición de parada en el efecto**: un `return` temprano evita crear el intervalo.
- **Dependencias como disparador**: si cambia una dependencia, se limpia y se repite el efecto.
- **Limpieza de intervalos**: `clearInterval` en el `return` del efecto.
- **Callback async en un temporizador**: necesita su propio `try/catch`.
- **`setInterval` vs `setTimeout` encadenado**: frecuencia fija vs esperar a que termine la anterior.
- **Temporizadores falsos asíncronos**: `vi.advanceTimersByTimeAsync` también resuelve las promesas.
