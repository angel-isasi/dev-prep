Crea el hook propio `useHistorial(inicial)`: funciona como un estado normal, pero **recuerda los valores anteriores** para poder **deshacer** (Ctrl + Z) y **rehacer** (Ctrl + Y).

```jsx
const { valor, fijar, deshacer, rehacer, puedeDeshacer, puedeRehacer } = useHistorial("margarita");
```

## Reglas

- Devuelve un objeto con:
  - `valor`: el valor actual (el "presente").
  - `fijar(nuevo)`: cambia el valor y guarda el anterior en el historial. **Borra el futuro**: después de fijar algo nuevo, ya no se puede rehacer lo que habías deshecho.
  - `deshacer()`: vuelve al valor anterior. Si no hay nada que deshacer, no hace nada.
  - `rehacer()`: vuelve a aplicar lo último que deshiciste. Si no hay nada que rehacer, no hace nada.
  - `puedeDeshacer` y `puedeRehacer`: booleanos para habilitar o deshabilitar botones.
- Si llamas a `deshacer()` dos veces seguidas en el mismo evento, debe retroceder **dos** pasos.

## Ejemplo

```jsx
const h = useHistorial("margarita");
```

| Acción | `valor` | `puedeDeshacer` | `puedeRehacer` |
|---|---|---|---|
| (inicio) | margarita | `false` | `false` |
| `fijar("pepperoni")` | pepperoni | `true` | `false` |
| `fijar("hawaiana")` | hawaiana | `true` | `false` |
| `deshacer()` | pepperoni | `true` | `true` |
| `rehacer()` | hawaiana | `true` | `false` |
| `deshacer()` y luego `fijar("vegana")` | vegana | `true` | `false` (se borró hawaiana del futuro) |

## Por qué importa

Deshacer y rehacer existe en editores, formularios y herramientas de diseño. Es un buen ejercicio de **estado inmutable** con varias partes que cambian juntas, y la estructura (pasado, presente, futuro) es una pregunta de diseño que gusta en entrevistas.
