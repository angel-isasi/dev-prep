## Idea clave

Cada ejecución del efecto crea su **propio** `AbortController`. La **limpieza** del efecto, que React ejecuta justo antes de correrlo con el texto nuevo, aborta el controlador anterior. Así una respuesta vieja nunca llega a pisar a la nueva.

## Paso a paso

1. **Estado** `items`, empieza en `[]`.
2. **Efecto con `[texto, buscar]`**: se ejecuta al montar y cada vez que cambia el texto.
3. **Controlador nuevo** en cada ejecución: `const control = new AbortController()`. Su `control.signal` es una "antena" que avisa cuando alguien llama a `control.abort()`.
4. **Pasa el signal** a `buscar(texto, control.signal)`. Con `fetch` real sería `fetch(url, { signal })`.
5. **`.then(setItems)`** guarda los resultados. Es lo mismo que `.then((lista) => setItems(lista))`.
6. **`.catch`** filtra: si `error.name === "AbortError"` es una cancelación que provocamos nosotros, no un fallo; no se toca el estado. Cualquier otro error deja la lista vacía.
7. **Limpieza** `return () => control.abort()`: gracias al closure, cada limpieza aborta **su** controlador.

```jsx
import { useEffect, useState } from "react";

export function Resultados({ texto, buscar }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const control = new AbortController();

    buscar(texto, control.signal)
      .then(setItems)
      .catch((error) => {
        if (error.name !== "AbortError") setItems([]);
      });

    return () => control.abort();
  }, [texto, buscar]);

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
```

## Por qué funciona

Recorrido del primer test ("ma" tarda 40 ms, "mar" 5 ms):

| Tiempo | Qué pasa |
|---|---|
| 0 ms | render con `ma`. Efecto 1: `control1`, `buscar("ma", signal1)` |
| 0 ms | rerender con `mar`. React ejecuta la **limpieza del efecto 1**: `control1.abort()`. La promesa de `ma` se rechaza con `AbortError` |
| 0 ms | efecto 2: `control2`, `buscar("mar", signal2)` |
| 0 ms | el `.catch` de `ma` ve `AbortError` y no hace nada |
| 5 ms | llega `["resultado de mar"]`, `setItems`, se pinta |
| 40 ms | no pasa nada: el temporizador de `ma` se limpió al abortar |

**Sin** cancelar, a los 40 ms llegaría `["resultado de ma"]`, `setItems` lo pondría y el usuario vería el resultado de algo que ya no está buscando.

Orden que garantiza React cuando cambian las dependencias: **limpieza del efecto anterior → efecto nuevo**. Por eso el test puede comprobar que `signal1.aborted` es `true` justo después del `rerender`.

## Errores comunes

- **Crear el `AbortController` fuera del efecto** (en el cuerpo del componente o en un ref compartido). Si es el mismo para todas las búsquedas, una vez abortado queda abortado para siempre y las nuevas búsquedas fallan al instante.
- **No ignorar el `AbortError`.** Lo tratarías como un fallo real: la lista se vacía o aparece un mensaje de error cada vez que el usuario escribe rápido.
- **Olvidar pasar el `signal`.** Llamas a `abort()` pero nadie lo escucha: la petición sigue y su respuesta pisa a la nueva.
- **Olvidar la limpieza.** Sin `return () => control.abort()`, no se cancela nada.
- **Comparar con `error.message`.** El mensaje cambia según el navegador; lo estándar es `error.name === "AbortError"`.

## Otra forma de resolverlo

Con la bandera `vigente` (también llamada `ignorar`), que **ignora** la respuesta vieja pero no la cancela:

```jsx
useEffect(() => {
  let vigente = true;
  buscar(texto)
    .then((lista) => {
      if (vigente) setItems(lista);
    })
    .catch(() => {
      if (vigente) setItems([]);
    });
  return () => {
    vigente = false;
  };
}, [texto, buscar]);
```

**¿Cuándo conviene?** Cuando la función asíncrona no acepta un `signal` (una librería que no lo soporta, por ejemplo). Evita el bug visual igual que `AbortController`, pero la petición vieja **sigue viajando** por la red y gastando datos. `AbortController` es mejor porque además libera recursos. En una búsqueda real se combina con un **debounce** para no lanzar una petición por cada tecla.

## Cómo explicarlo en la entrevista

> "Esto evita una condición de carrera: si una respuesta vieja llega tarde, pisaría a la nueva. En el efecto creo un `AbortController` nuevo y paso su `signal` a la búsqueda. En la limpieza llamo a `abort()`. React ejecuta la limpieza del efecto anterior antes de correr el nuevo cuando cambia el texto, así que cada búsqueda nueva cancela la anterior; y al desmontar también se cancela. En el catch ignoro el `AbortError`, porque una cancelación provocada por mí no es un error para el usuario."

## Conceptos

- **Condición de carrera**: el resultado depende del orden en que llegan respuestas asíncronas.
- **`AbortController` y `AbortSignal`**: API estándar para cancelar operaciones como `fetch`.
- **`AbortError`**: el error con el que se rechaza una operación cancelada.
- **Limpieza de `useEffect`**: corre antes del siguiente efecto y al desmontar.
- **Closures por ejecución**: cada efecto tiene su propio `control`.
- **Bandera `vigente`**: alternativa que ignora respuestas viejas sin cancelarlas.
- **Debounce**: esperar a que el usuario deje de escribir antes de buscar.
