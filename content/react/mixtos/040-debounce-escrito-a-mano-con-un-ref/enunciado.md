Crea el componente **`BuscadorConEspera`** con un input de búsqueda que avisa al padre **solo cuando el usuario deja de escribir**.

Props:

- `onBuscar(texto)`: función que se llama con el texto a buscar.
- `espera`: milisegundos sin escribir antes de avisar. Por defecto, `300`.

## Reglas

- Un `<input>` con `aria-label="Buscar"`, controlado: muestra lo que escribes **al instante**.
- Cada vez que el texto cambia, se reinicia la cuenta. `onBuscar` se llama una sola vez, `espera` ms después de la **última** tecla, con el texto final.
- Si escribes `m`, `ma`, `mar` seguido, `onBuscar` se llama **una vez** con `"mar"`.
- Guarda el id del temporizador en un **`useRef`** (no en el estado).
- Si el componente se desmonta con una búsqueda pendiente, se cancela: `onBuscar` no se llama.

## Ejemplo

```jsx
<BuscadorConEspera onBuscar={(texto) => console.log("Buscar", texto)} />
```

| Tiempo | El usuario escribe | `onBuscar` |
|---|---|---|
| 0 ms | `m` | |
| 50 ms | `ma` | |
| 100 ms | `mar` | |
| 399 ms | | (todavía no) |
| 400 ms | | `onBuscar("mar")` |

## Por qué importa

Un buscador que pide datos al servidor en cada tecla satura la API y muestra resultados desordenados. El debounce es la solución estándar y "escribe un debounce" es una de las preguntas más típicas de entrevista frontend. Hacerlo con `useRef` muestra que sabes qué datos deben provocar renders y cuáles no.
