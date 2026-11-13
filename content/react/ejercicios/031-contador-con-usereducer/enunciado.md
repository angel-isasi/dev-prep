Crea un contador usando **`useReducer`** en lugar de `useState`. Exporta dos cosas: la función `reducer` (pura, fácil de probar sola) y el componente `Contador` que la usa.

## Reglas

- `reducer(estado, accion)`:
  - El estado tiene la forma `{ cuenta: número }`.
  - Acción `{ tipo: "sumar", paso }`: devuelve `{ cuenta: cuenta + paso }`. Si no viene `paso`, suma **1**.
  - Acción `{ tipo: "reiniciar" }`: devuelve `{ cuenta: 0 }`.
  - Con cualquier otro `tipo`, **lanza un error** que mencione el tipo desconocido.
  - Debe ser **pura**: no modifica el estado que recibe, devuelve uno nuevo.
- `Contador()`:
  - Estado inicial `{ cuenta: 0 }`.
  - Un `<p>` con **"Cuenta: N"**.
  - Un botón **"+5"** que despacha `{ tipo: "sumar", paso: 5 }`.
  - Un botón **"Reiniciar"** que despacha `{ tipo: "reiniciar" }`.

## Ejemplo

```jsx
reducer({ cuenta: 2 }, { tipo: "sumar", paso: 5 }); // { cuenta: 7 }
reducer({ cuenta: 2 }, { tipo: "sumar" });          // { cuenta: 3 }
reducer({ cuenta: 2 }, { tipo: "reiniciar" });      // { cuenta: 0 }
reducer({ cuenta: 2 }, { tipo: "volar" });          // Error: Acción desconocida: volar
```

| Acción en la pantalla | Se ve |
|---|---|
| (inicio) | Cuenta: 0 |
| Clic en "+5" | Cuenta: 5 |
| Clic en "+5" | Cuenta: 10 |
| Clic en "Reiniciar" | Cuenta: 0 |

## Por qué importa

`useReducer` aparece en entrevistas como "¿cuándo usarías `useReducer` en vez de `useState`?". Concentra en una sola función todas las formas en que cambia el estado, y esa función se puede probar sin React. Es el mismo patrón que usa Redux.
