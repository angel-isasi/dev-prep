## Idea clave

El estado es **la hora actual**, que se refresca cada segundo con un intervalo. El tiempo restante (y sus días, horas, minutos y segundos) es **estado derivado**: se calcula restando la fecha meta menos la hora actual en cada render.

## Paso a paso

1. **Estado: la hora actual.** `useState(() => Date.now())`. `Date.now()` devuelve los milisegundos desde 1970; con la función, solo se llama en el primer render.
2. **Intervalo con limpieza.** Un `useEffect` con `[]` (solo al montar) crea `setInterval(() => setAhora(Date.now()), 1000)` y devuelve `() => clearInterval(id)` para borrarlo al desmontar. Aquí no hace falta la forma funcional: no sumamos al valor anterior, preguntamos la hora de nuevo.
3. **Restante.** `new Date(hasta).getTime()` convierte el texto ISO a milisegundos. `Math.max(0, meta - ahora)` da lo que falta, y 0 si ya pasó.
4. **Caso "ya llegó".** Si el restante es 0, devuelve `<p>¡Ya empezó!</p>`.
5. **Separar en unidades** con división entera (`Math.floor`) y módulo (`%`):
   - `totalSegundos = Math.floor(restanteMs / 1000)`
   - `dias = Math.floor(totalSegundos / 86400)` (86400 = 24 × 60 × 60)
   - `horas = Math.floor((totalSegundos % 86400) / 3600)`: lo que sobra después de quitar los días, en horas.
   - `minutos = Math.floor((totalSegundos % 3600) / 60)`
   - `segundos = totalSegundos % 60`
6. **Pintar** con un template string para que el `<p>` tenga un solo texto.

```jsx
import { useEffect, useState } from "react";

export function CuentaRegresiva({ hasta }) {
  // Solo guardamos "qué hora es ahora"; lo que falta se calcula.
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const meta = new Date(hasta).getTime();
  const restanteMs = Math.max(0, meta - ahora);

  if (restanteMs === 0) {
    return <p>¡Ya empezó!</p>;
  }

  const totalSegundos = Math.floor(restanteMs / 1000);
  const dias = Math.floor(totalSegundos / 86400); // 60 * 60 * 24
  const horas = Math.floor((totalSegundos % 86400) / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  return <p>{`${dias}d ${horas}h ${minutos}m ${segundos}s`}</p>;
}
```

## Por qué funciona

Con `hasta = 17 nov 12:00:00` y la hora actual `15 nov 10:30:15`, faltan 178 185 segundos:

| Cálculo | Resultado |
|---|---|
| `178185 / 86400` → `floor` | **2** días (sobran `178185 % 86400 = 5385` s) |
| `5385 / 3600` → `floor` | **1** hora (y `178185 % 3600 = 1785` s que no llegan a una hora) |
| `1785 / 60` → `floor` | **29** minutos |
| `178185 % 60` | **45** segundos |

Resultado: `2d 1h 29m 45s`. Y así avanza en el tiempo:

| Momento | `ahora` | `restanteMs` | Se pinta |
|---|---|---|---|
| render inicial (11:59:58) | 11:59:58 | 2000 | 0d 0h 0m 2s |
| pasa 1 s, el intervalo llama a `setAhora` | 11:59:59 | 1000 | 0d 0h 0m 1s |
| pasa otro segundo | 12:00:00 | 0 | ¡Ya empezó! |

Como siempre se compara contra la **hora real**, aunque el navegador retrase el intervalo (pasa con pestañas en segundo plano) el número mostrado es correcto en cuanto se vuelve a pintar.

## Errores comunes

- **Guardar los segundos restantes y restar 1 en cada tick.** Si el intervalo se atrasa (pestaña en segundo plano, computadora lenta), la cuenta se desfasa y nunca se corrige. Compara siempre contra `Date.now()`.
- **Olvidar la limpieza** del intervalo. Al desmontar, sigue llamando a `setAhora` sobre un componente que ya no existe. Lo detecta el test de "temporizadores vivos".
- **Mezclar unidades**: restar fechas da **milisegundos**. Dividir directo entre 86400 sin pasar antes a segundos da números absurdos.
- **Calcular horas como `Math.floor(totalSegundos / 3600)`** sin el módulo: con 2 días mostrarías `2d 49h ...`. Cada unidad debe quedarse con lo que sobra de la mayor.
- **Mostrar negativos** cuando la fecha ya pasó. `Math.max(0, ...)` lo evita.

## Otra forma de resolverlo

Guardar directamente el **restante** en el estado, pero recalculándolo desde la hora real (no restando 1), y parar el intervalo al llegar a 0:

```jsx
export function CuentaRegresiva({ hasta }) {
  const meta = new Date(hasta).getTime();
  const calcular = () => Math.max(0, meta - Date.now());
  const [restanteMs, setRestanteMs] = useState(calcular);
  const terminado = restanteMs === 0;

  useEffect(() => {
    if (terminado) return; // ya no hace falta el intervalo
    const id = setInterval(() => setRestanteMs(Math.max(0, meta - Date.now())), 1000);
    return () => clearInterval(id);
  }, [meta, terminado]);

  // ...mismo formateo
}
```

**¿Cuándo conviene?** Cuando quieres **detener** el intervalo al terminar para no gastar recursos. A cambio el efecto es más difícil de leer. Para una cuenta regresiva de una página, la versión con `ahora` es más simple. Si la usaras en Next.js, ojo: la hora del servidor y la del navegador no coinciden, y conviene calcular la hora solo en el cliente para evitar errores de hidratación.

## Cómo explicarlo en la entrevista

> "Guardo solo la hora actual y la actualizo cada segundo con un `setInterval` dentro de un `useEffect`, con su limpieza para no dejar el intervalo vivo al desmontar. Lo que falta lo calculo restando la fecha meta menos la hora actual, y lo separo en días, horas, minutos y segundos con división entera y módulo. No resto un segundo a un contador porque los intervalos se atrasan; comparar contra la hora real siempre es exacto. Si la fecha ya pasó, muestro el mensaje final."

## Conceptos

- **`Date.now()`**: milisegundos actuales desde 1970.
- **`new Date(texto).getTime()`**: convierte una fecha ISO a milisegundos.
- **Estado derivado**: días, horas, minutos y segundos se calculan, no se guardan.
- **`setInterval` + limpieza en `useEffect`**: repetir algo y detenerlo al desmontar.
- **División entera y módulo**: `Math.floor(a / b)` y `a % b` para separar unidades.
- **`Math.max(0, x)`**: evita valores negativos.
- **Template string**: arma un texto con valores dentro, como `` `${dias}d` ``.
