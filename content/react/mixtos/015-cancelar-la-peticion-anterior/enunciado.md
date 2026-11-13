En un buscador, el usuario escribe `ma` y luego `mar`. Se lanzan dos peticiones. Si la de `ma` es más lenta y llega **después**, pisa los resultados de `mar` y el usuario ve resultados que no corresponden a lo que escribió. Es una **condición de carrera**.

Crea el componente `Resultados` que **cancela la petición anterior** cada vez que cambia el texto.

## Reglas

- Exporta `Resultados({ texto, buscar })`.
- `buscar(texto, signal)` devuelve una promesa con un arreglo de textos. Recibe un `AbortSignal`: cuando ese signal se aborta, la promesa se rechaza con un error cuyo `name` es `"AbortError"`.
- Cada vez que cambia `texto` (y al montar), llama a `buscar` con un `AbortController` **nuevo**.
- Antes de lanzar una búsqueda nueva, y al desmontar, **aborta** la anterior.
- Muestra una `<ul>` con un `<li>` por resultado.
- Si la búsqueda falla por cancelación (`AbortError`), **no hagas nada**. Si falla por otra razón, deja la lista vacía.

## Ejemplo

```jsx
const { rerender } = render(<Resultados texto="ma" buscar={buscar} />);
rerender(<Resultados texto="mar" buscar={buscar} />);
```

| Momento | Pasa |
|---|---|
| texto = `ma` | se lanza `buscar("ma", signal1)` (lenta) |
| texto = `mar` | se aborta `signal1` y se lanza `buscar("mar", signal2)` |
| llega `mar` | se ve `resultado de mar` |
| (la de `ma` fue cancelada) | nunca se ve `resultado de ma` |

## Por qué importa

Las condiciones de carrera en búsquedas son un bug muy real y una pregunta de entrevista de nivel junior-alto. La solución usa la **función de limpieza** de `useEffect` (que corre antes del siguiente efecto) junto con `AbortController`, la API estándar para cancelar `fetch`.
