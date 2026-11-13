Crea el hook propio `useContador` que maneja un número con **límites opcionales** (mínimo y máximo), útil para cantidades en un carrito, paginación o un selector de personas.

```jsx
const { cuenta, sumar, restar, reiniciar } = useContador({ inicial, min, max });
```

## Reglas

- Recibe **un objeto de opciones** (todas opcionales):
  - `inicial`: valor de arranque. Por defecto `0`.
  - `min`: el menor valor permitido. Por defecto sin límite (`-Infinity`).
  - `max`: el mayor valor permitido. Por defecto sin límite (`Infinity`).
- También debe funcionar sin argumentos: `useContador()`.
- Devuelve **un objeto** con:
  - `cuenta`: el número actual.
  - `sumar()`: suma 1, pero nunca pasa de `max`.
  - `restar()`: resta 1, pero nunca baja de `min`.
  - `reiniciar()`: vuelve al valor `inicial`.
- Si llamas a `sumar()` dos veces en el mismo evento, deben contar **las dos**.

## Ejemplo

```jsx
function Cantidad() {
  const { cuenta, sumar, restar } = useContador({ inicial: 1, min: 1, max: 10 });
  return (
    <div>
      <button onClick={restar}>-</button>
      <span>{cuenta}</span>
      <button onClick={sumar}>+</button>
    </div>
  );
}
```

Con `useContador({ inicial: 1, min: 1, max: 2 })`:

| Acción | `cuenta` |
|---|---|
| (inicio) | `1` |
| `sumar()` | `2` |
| `sumar()` otra vez | `2` (ya está en el máximo) |
| `restar()` | `1` |
| `restar()` otra vez | `1` (ya está en el mínimo) |
| `reiniciar()` | `1` |

## Por qué importa

Practicas dos ideas que se repiten en entrevistas: **opciones con valores por defecto** usando desestructuración, y devolver **un objeto** para que quien use el hook tome solo lo que necesita y por nombre.
