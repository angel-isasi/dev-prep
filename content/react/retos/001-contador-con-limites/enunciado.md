Crea el componente `Contador` con tres botones: uno para restar, uno para sumar y uno para reiniciar. El valor nunca baja del mínimo ni pasa del máximo. Recibe dos props opcionales: `min` (por defecto `0`) y `max` (por defecto `10`).

## Reglas

- Muestra el valor en un párrafo con el texto exacto **`Valor: N`** (por ejemplo, `Valor: 0`).
- El valor empieza en `min`.
- Un botón con el texto **`-`** (guion) resta 1 y otro con el texto **`+`** suma 1.
- Un botón **`Reiniciar`** vuelve el valor a `min`.
- Cuando el valor llega a `max`, el botón `+` queda **deshabilitado** (`disabled`). Cuando está en `min`, el botón `-` queda deshabilitado.
- Aunque se haga clic muchas veces, el valor nunca sale del rango `[min, max]`.

## Ejemplo

```jsx
<Contador max={2} />
```

| Acción | Se ve |
|---|---|
| (inicio) | `Valor: 0`, el botón `-` deshabilitado |
| clic en `+` | `Valor: 1` |
| clic en `+` dos veces más | `Valor: 2`, el botón `+` deshabilitado |
| clic en `Reiniciar` | `Valor: 0` |

## Por qué importa

Es el "hola mundo" de React en entrevistas, y por eso lo usan para filtrar rápido: quieren ver si usas bien `useState`, si actualizas a partir del valor anterior con la forma funcional y si cuidas los límites en la interfaz, no solo en la lógica.
