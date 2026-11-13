## Idea clave

Un **ref** recuerda la hora de la última actualización sin provocar renders. Con esa hora, cada cambio decide: si ya pasó el plazo, se aplica ya; si no, se programa para el momento exacto en que se cumpla, y si llega otro cambio antes, se reprograma con el valor más nuevo.

## Paso a paso

1. **Estado para lo que se muestra.** `const [limitado, setLimitado] = useState(valor)`: es lo que devuelve el hook y lo que hace que el componente se vuelva a pintar.
2. **Ref para la hora.** `const ultimo = useRef(0)`. Empieza en 0 (el año 1970 para `Date.now()`), así el primer cambio siempre encuentra el plazo cumplido.
3. **Un efecto por cada cambio.** Con dependencias `[valor, ms]`, el efecto corre cada vez que llega un valor nuevo.
4. **Calcular cuánto falta.** `Date.now() - ultimo.current` es el tiempo transcurrido; `ms` menos eso es lo que falta.
5. **Decidir.** Si `falta <= 0`, llama a `aplicar()` en el acto. Si no, `setTimeout(aplicar, falta)`.
6. **Limpiar.** Devuelve `() => clearTimeout(id)`. Si llega otro valor antes de que se dispare, React ejecuta esta limpieza, cancela el temporizador viejo y el efecto nuevo programa otro con el valor más reciente y el tiempo que **todavía** falta.

```jsx
import { useEffect, useRef, useState } from "react";

export function useThrottle(valor, ms) {
  const [limitado, setLimitado] = useState(valor);
  const ultimo = useRef(0);

  useEffect(() => {
    const aplicar = () => {
      ultimo.current = Date.now();
      setLimitado(valor);
    };

    const falta = ms - (Date.now() - ultimo.current);

    if (falta <= 0) {
      aplicar();
      return;
    }

    const id = setTimeout(aplicar, falta);
    return () => clearTimeout(id);
  }, [valor, ms]);

  return limitado;
}
```

## Por qué funciona

Recorrido con `ms = 200`, cambios cada 100 ms (tomamos el montaje como t = 0):

| t | Llega | `ultimo` | `falta` | Acción | Devuelve |
|---|---|---|---|---|---|
| 0 | `"0"` (montaje) | 1970 → 0 ms | negativo | aplica ya | `"0"` |
| 0 | `"1"` | 0 ms | 200 | programa para t=200 | `"0"` |
| 100 | `"2"` | 0 ms | 100 | cancela el anterior, programa para t=200 | `"0"` |
| 200 | (se dispara) | 200 ms | | `setLimitado("2")` | `"2"` |
| 200 | `"3"` | 200 ms | 200 | programa para t=400 | `"2"` |
| 300 | `"4"` | 200 ms | 100 | reprograma para t=400 | `"2"` |
| 400 | (se dispara) | 400 ms | | `setLimitado("4")` | `"4"` |

Fíjate en la fila de t=100: el temporizador nuevo **no** espera 200 ms desde cero, solo los 100 que faltan. Por eso, aunque los cambios no paren, hay una actualización cada 200 ms. El `"1"` y el `"3"` nunca se muestran: es lo esperado, interesa el más reciente.

Por qué `ultimo` es un ref y no estado: si fuera estado, actualizarlo provocaría otro render que no muestra nada nuevo. El ref guarda el dato "por detrás" y su valor sobrevive entre renders.

## Errores comunes

- **Confundirlo con debounce.** Si siempre esperas `ms` completos desde el último cambio, con cambios continuos el valor **nunca** se actualiza. Lo reconoces porque falla el test "si los cambios no paran".
- **Guardar la hora en `useState`.** Provoca renders extra y, si la lees dentro del efecto sin ponerla en las dependencias, ves un valor viejo.
- **No limpiar el `setTimeout`.** Se acumulan temporizadores y se aplican valores viejos después de los nuevos, o se actualiza el estado de un componente desmontado.
- **Programar siempre `ms` en vez de lo que `falta`.** Funciona a medias: las actualizaciones se atrasan y con cambios continuos se parece a un debounce.
- **Ignorar el primer render.** Si `useState` empieza en `undefined` o `null`, el componente muestra un hueco hasta que pase el primer plazo.

## Otra forma de resolverlo

Throttle "clásico" de JavaScript, sin React, que limita **llamadas a funciones** en lugar de valores. Es lo que se escribe en una pregunta de JS puro:

```js
function throttle(fn, ms) {
  let ultimo = 0;
  let pendiente = null;
  return (...args) => {
    const falta = ms - (Date.now() - ultimo);
    clearTimeout(pendiente);
    if (falta <= 0) {
      ultimo = Date.now();
      fn(...args);
    } else {
      pendiente = setTimeout(() => {
        ultimo = Date.now();
        fn(...args);
      }, falta);
    }
  };
}

window.addEventListener("scroll", throttle(() => console.log(window.scrollY), 200));
```

**¿Cuándo conviene?** Cuando controlas el manejador del evento (scroll, resize): limitas la función antes de que llegue a React. El hook conviene cuando el valor ya está en el estado o llega por props y solo quieres que lo derivado (un cálculo, una petición) se actualice con menos frecuencia.

## Cómo explicarlo en la entrevista

> "Throttle limita a una actualización cada cierto tiempo; debounce espera a que los cambios se detengan. Lo implementé con un estado para el valor que se muestra y un ref para la hora de la última actualización, porque esa hora no se pinta y no quiero renders extra. En un efecto calculo cuánto falta para cumplir el plazo: si ya se cumplió, actualizo al instante; si no, programo un `setTimeout` con lo que falta. La limpieza cancela el temporizador cuando llega otro valor, y así siempre se aplica el más reciente. Lo usaría para el scroll o el tamaño de la ventana."

## Conceptos

- **Throttle**: como máximo una ejecución cada `ms`, aunque los eventos sigan llegando.
- **Debounce**: una sola ejecución cuando los eventos se detienen por `ms`.
- **`useRef`**: guarda un valor entre renders sin provocar renders al cambiarlo.
- **`Date.now()`**: milisegundos desde 1970; sirve para medir tiempo transcurrido.
- **`setTimeout` / `clearTimeout`**: programar y cancelar una tarea.
- **Limpieza de `useEffect`**: se ejecuta antes del siguiente efecto y al desmontar.
- **Custom hook**: función que empieza con `use` y combina otros hooks para reutilizar lógica.
