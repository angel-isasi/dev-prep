Crea un buscador que se sienta **fluido** aunque la lista de resultados sea pesada de dibujar: el input responde al instante y la lista se actualiza **cuando React tenga tiempo**. Para eso usa `useDeferredValue`.

Exporta dos componentes:

- `ListaPesada({ texto, items })`: filtra y pinta los resultados. Imagina que es lenta (miles de items).
- `BuscadorFluido({ items })`: el input y la lista.

## Reglas

- `ListaPesada`:
  - Muestra en un `<ul>` un `<li>` por cada item que contenga `texto`, **sin distinguir mayúsculas** e ignorando espacios al inicio y al final.
  - Si ninguno coincide, en vez de la lista muestra **"Sin resultados"**.
  - Debe estar envuelta en **`memo`**, para que React pueda saltarse su render cuando sus props no cambian.
- `BuscadorFluido`:
  - Un input con `aria-label="Buscar"`, controlado con un estado `texto`.
  - Pasa a `ListaPesada` **la versión diferida** del texto: `useDeferredValue(texto)`.
  - Opcional: mientras la lista va atrasada respecto al input (texto distinto del diferido), muéstrala semitransparente.

## Ejemplo

```jsx
<BuscadorFluido items={["margarita", "marinara", "hawaiana"]} />
```

| Escribes | Input | Lista (cuando se pone al día) |
|---|---|---|
| (nada) | | margarita, marinara, hawaiana |
| `mar` | `mar` (al instante) | margarita, marinara |
| `MAR` | `MAR` | margarita, marinara |
| `xyz` | `xyz` | Sin resultados |

## Por qué importa

Si cada tecla obliga a redibujar miles de elementos, el input "se traba". `useDeferredValue` es una de las herramientas de **renderizado concurrente** de React 18 y 19: separa lo **urgente** (lo que escribes) de lo que **puede esperar** (los resultados). Es tema de entrevistas de nivel intermedio y senior.
