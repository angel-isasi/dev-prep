Crea el hook **`useThrottle(valor, ms)`**. Recibe un valor que cambia muy seguido (la posición del scroll, lo que escribe el usuario) y devuelve una versión **limitada**: como máximo se actualiza **una vez cada `ms` milisegundos**.

## Reglas

- En el primer render devuelve `valor` tal cual.
- Si `valor` cambia y ya pasaron `ms` milisegundos (o más) desde la última actualización, el nuevo valor se aplica **al instante**.
- Si cambia antes de que pasen `ms` milisegundos, espera lo que falta y entonces aplica **el último** valor recibido (los intermedios se pierden).
- Si los cambios no paran, el valor devuelto igual se actualiza **cada `ms` milisegundos** (eso lo diferencia de un debounce).
- Limpia el temporizador pendiente si el valor vuelve a cambiar o el componente se desmonta.

## Ejemplo

Con `useThrottle(valor, 200)`:

| Tiempo | `valor` | Devuelve |
|---|---|---|
| 0 ms | `"a"` | `"a"` |
| 0 ms | `"b"`, luego `"c"` | `"a"` (todavía no pasan 200 ms) |
| 200 ms | `"c"` | `"c"` |
| 1500 ms | `"d"` (después de un rato quieto) | `"d"` al instante |

## Por qué importa

Eventos como `scroll`, `resize` o `mousemove` se disparan decenas de veces por segundo. Si cada uno actualiza el estado, la interfaz se pone lenta. "¿Cuál es la diferencia entre throttle y debounce?" es una pregunta clásica de entrevista frontend, y escribir uno con `useRef` demuestra que entiendes qué guardar en el estado y qué no.
