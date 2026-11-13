## Idea clave

Cada vez que `valor` cambia, el efecto **programa** un temporizador que actualizará el valor retrasado. Si `valor` cambia otra vez antes de tiempo, React ejecuta la **limpieza** del efecto anterior, que **cancela** ese temporizador. Así solo llega a ejecutarse el temporizador del último cambio.

## Paso a paso

1. **Un estado para el valor retrasado.** `useState(valor)`: en el primer render, el retrasado es igual al valor.
2. **Un efecto que depende de `valor` y `ms`.** Cada vez que alguno cambia, React corre el efecto después del render.
3. **Programar la actualización.** `setTimeout(() => setRetrasado(valor), ms)` guarda el id del temporizador.
4. **Cancelar en la limpieza.** `return () => clearTimeout(id)`. React ejecuta esta función **antes** de correr el efecto de nuevo (y también al desmontar).
5. **Devolver el valor retrasado.** Un hook puede devolver lo que quieras: aquí, un valor.

```jsx
import { useEffect, useState } from "react";

export function useDebounce(valor, ms = 300) {
  const [retrasado, setRetrasado] = useState(valor);

  useEffect(() => {
    // Programa la actualización para dentro de `ms`.
    const id = setTimeout(() => setRetrasado(valor), ms);
    // Si `valor` cambia antes, React ejecuta esta limpieza y cancela el temporizador.
    return () => clearTimeout(id);
  }, [valor, ms]);

  return retrasado;
}
```

## Por qué funciona

Recorrido escribiendo rápido `a`, `ab`, `abc` con `ms = 300`:

| Tiempo | Pasa | Temporizadores vivos | `retrasado` |
|---|---|---|---|
| 0 ms | render con `"a"`, corre el efecto | T1 (a los 300 ms pondrá `"a"`) | `"a"` |
| 50 ms | render con `"ab"`: limpieza cancela T1, nuevo efecto | T2 (a los 350 ms pondrá `"ab"`) | `"a"` |
| 100 ms | render con `"abc"`: limpieza cancela T2, nuevo efecto | T3 (a los 400 ms pondrá `"abc"`) | `"a"` |
| 400 ms | T3 se ejecuta: `setRetrasado("abc")` | ninguno | `"abc"` |

Cuando T3 actualiza el estado, el componente que usa el hook se vuelve a renderizar con `"abc"`. Como `valor` no cambió en ese render, el efecto no vuelve a correr.

Fíjate que cada temporizador "recuerda" el `valor` de su render gracias al **closure**: T3 se creó cuando `valor` era `"abc"`.

## Errores comunes

- **Olvidar la limpieza.** Sin `clearTimeout`, los tres temporizadores se ejecutan: el valor pasa por `"a"`, `"ab"` y `"abc"` con retraso, que es justo lo que querías evitar. Lo reconoces porque el buscador sigue haciendo una petición por letra, solo que más tarde.
- **Dependencias incompletas:** `useEffect(..., [])`. El efecto solo corre al montar y el valor retrasado nunca se actualiza. Pon `valor` y `ms`.
- **Guardar el id en una variable normal fuera del efecto** (`let id;` en el cuerpo del hook). En cada render se crea una variable nueva y pierdes el id anterior. Si lo necesitas fuera del efecto, usa `useRef`; aquí basta con la variable dentro del efecto.
- **Confundir debounce con throttle.** Debounce espera a que **dejes** de escribir; throttle ejecuta como máximo una vez cada X ms aunque sigas escribiendo.
- **Llamar al hook dentro de un `if` o un bucle.** Los hooks siempre se llaman en el nivel superior del componente, en el mismo orden en cada render.

## Otra forma de resolverlo

**Debounce de una función** en vez de un valor: útil cuando lo que quieres retrasar es una acción (por ejemplo, guardar un borrador), no un valor que se muestra.

```jsx
import { useEffect, useRef } from "react";

export function useFuncionDebounced(funcion, ms = 300) {
  const temporizador = useRef(null);

  useEffect(() => () => clearTimeout(temporizador.current), []); // limpia al desmontar

  return (...argumentos) => {
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => funcion(...argumentos), ms);
  };
}

// Uso: const guardar = useFuncionDebounced((texto) => api.guardar(texto), 500);
```

**¿Cuándo conviene?** El hook de **valor** (`useDebounce`) es ideal para buscadores: el input se ve al instante y solo la búsqueda se retrasa. El de **función** sirve cuando reaccionas a eventos (guardar, redimensionar la ventana). Aquí el id va en un `useRef` porque debe sobrevivir entre renders sin provocar uno nuevo.

## Cómo explicarlo en la entrevista

> "Guardo el valor retrasado en un estado y uso un efecto que depende del valor. Cada vez que el valor cambia, programo un `setTimeout` que lo actualizará. La clave es la limpieza: si el valor vuelve a cambiar antes de tiempo, React ejecuta la limpieza del efecto anterior y cancela ese temporizador, así solo sobrevive el último. Lo uso en buscadores para no lanzar una petición al servidor por cada tecla."

## Conceptos

- **Hook personalizado**: función que empieza con `use` y usa otros hooks para reutilizar lógica.
- **`useEffect` con dependencias**: corre cuando cambia algo de la lista.
- **Función de limpieza**: corre antes del siguiente efecto y al desmontar.
- **`setTimeout` / `clearTimeout`**: programar y cancelar una tarea.
- **Closure**: cada temporizador recuerda el `valor` de su render.
- **Debounce vs. throttle**: esperar a que termine vs. limitar la frecuencia.
- **`useRef`**: guardar un valor entre renders sin volver a renderizar.
- **Reglas de los hooks**: siempre en el nivel superior, nunca dentro de `if`.
