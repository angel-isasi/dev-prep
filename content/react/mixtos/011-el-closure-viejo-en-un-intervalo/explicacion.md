## Idea clave

El callback del intervalo se creó en el **primer render** y "recuerda" el `segundos` de ese render (0) para siempre: es un **closure viejo**. La forma funcional `setSegundos((s) => s + 1)` no lee esa variable; React le pasa el valor actual.

## Paso a paso

1. **Un solo intervalo.** `useEffect(..., [])` corre una vez al montar y crea el `setInterval`. Está bien: no queremos un intervalo nuevo cada segundo.
2. **No leas el estado desde el closure.** En lugar de `setSegundos(segundos + 1)`, usa `setSegundos((s) => s + 1)`.
3. **Limpia.** El `return () => clearInterval(id)` se ejecuta al desmontar. Sin él, el intervalo seguiría vivo y llamaría a `setSegundos` en un componente que ya no existe.

```jsx
import { useEffect, useState } from "react";

export function Segundero() {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return <p>{segundos} s</p>;
}
```

## Por qué funciona

Cada render es una llamada nueva a `Segundero`, con **su propia** constante `segundos`. Las funciones creadas en un render ven las variables de ese render.

Con el código del inicio (`setSegundos(segundos + 1)`):

| Momento | Render | `segundos` del render | El intervalo ejecuta | Resultado |
|---|---|---|---|---|
| montaje | 1 | `0` | | se crea el intervalo con el closure del render 1 |
| 1 s | 2 | `1` | `setSegundos(0 + 1)` | 1 |
| 2 s | (no cambia) | | `setSegundos(0 + 1)` | 1 otra vez, React no re-renderiza |
| 3 s | (no cambia) | | `setSegundos(0 + 1)` | 1 |

El intervalo **nunca** se volvió a crear (dependencias `[]`), así que siempre usa el `segundos` del render 1, que vale 0.

Con la forma funcional (`setSegundos((s) => s + 1)`):

| Momento | El intervalo ejecuta | React llama a la función con | Nuevo estado |
|---|---|---|---|
| 1 s | `setSegundos(fn)` | `fn(0)` | 1 |
| 2 s | `setSegundos(fn)` | `fn(1)` | 2 |
| 3 s | `setSegundos(fn)` | `fn(2)` | 3 |

La función no lee nada del closure: el valor actual se lo da React.

## Errores comunes

- **"Arreglarlo" agregando `[segundos]` a las dependencias.** Funciona, pero cada segundo se destruye el intervalo y se crea otro. Es más trabajo y, con intervalos cortos, puede desfasarse. Es un parche, no la solución.
- **Quitar el arreglo de dependencias.** El efecto se ejecuta en **cada** render y creas intervalos en cadena.
- **Olvidar la limpieza.** El intervalo sigue corriendo al desmontar: fugas de memoria y avisos. En desarrollo con `StrictMode`, React monta, desmonta y vuelve a montar: sin limpieza tendrías **dos** intervalos y contaría de 2 en 2.
- **Usar una variable normal** (`let segundos = 0`) en vez de estado. Cambiarla no provoca un render.
- **Usar `setTimeout` recursivo sin limpieza.** Mismo problema de closure y de fuga.

## Otra forma de resolverlo

Con un **ref** que siempre tiene el valor actual (útil cuando necesitas leer el estado dentro del intervalo para algo más que actualizarlo):

```jsx
import { useEffect, useRef, useState } from "react";

export function Segundero() {
  const [segundos, setSegundos] = useState(0);
  const segundosRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      segundosRef.current += 1;
      setSegundos(segundosRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <p>{segundos} s</p>;
}
```

**¿Cuándo conviene?** Cuando dentro del callback necesitas **leer** el valor actual para decidir algo (por ejemplo, detenerte al llegar a 60 o enviarlo a una API). Un ref es una "caja" mutable que es la misma en todos los renders, así que el closure siempre ve su contenido actualizado. Para solo incrementar, la forma funcional es más simple y es la respuesta esperada.

## Cómo explicarlo en la entrevista

> "El bug es un closure viejo. El efecto corre una sola vez porque sus dependencias son `[]`, así que la función del intervalo se crea en el primer render y queda atrapada con `segundos = 0`. Cada segundo hace `setSegundos(0 + 1)`, y se queda en 1. Lo arreglo con la forma funcional, `setSegundos(s => s + 1)`, que recibe el valor actual del estado sin depender del closure. Así mantengo un solo intervalo y lo limpio en el return del efecto al desmontar."

## Conceptos

- **Closure**: una función recuerda las variables del lugar donde se creó.
- **Closure viejo (stale closure)**: la función sigue viendo valores de un render anterior.
- **Actualización funcional**: `setEstado((anterior) => nuevo)` usa el valor actual.
- **Cada render tiene sus propias props y estado**: son constantes de esa llamada.
- **`useEffect` con `[]`**: se ejecuta al montar y su limpieza al desmontar.
- **`clearInterval`**: detiene un intervalo; va en la función de limpieza.
- **`useRef`**: caja mutable que persiste entre renders sin provocar uno nuevo.
- **Temporizadores falsos** (`vi.useFakeTimers`): en los tests, adelantan el reloj sin esperar de verdad.
