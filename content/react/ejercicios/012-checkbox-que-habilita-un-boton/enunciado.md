Crea el componente `Terminos`: una casilla "Acepto los términos" y un botón "Confirmar pedido" que solo se puede presionar cuando la casilla está marcada.

## Reglas

- Exporta la función `Terminos`. No recibe props.
- Un `<input type="checkbox">` con la etiqueta **"Acepto los términos"**. La forma más simple es poner el input **dentro** del `<label>`: `<label><input type="checkbox" /> Acepto los términos</label>`.
- Un `<button>` con el texto **"Confirmar pedido"**.
- Al inicio la casilla está desmarcada y el botón **deshabilitado** (`disabled`).
- Al marcar la casilla, el botón se habilita. Al desmarcarla, se vuelve a deshabilitar.
- La casilla es **controlada**: su estado marcado vive en un `useState`.

## Ejemplo

```jsx
<Terminos />
```

| Acción | Casilla | Botón "Confirmar pedido" |
|---|---|---|
| (al inicio) | desmarcada | deshabilitado |
| clic en la casilla | marcada | habilitado |
| otro clic en la casilla | desmarcada | deshabilitado |

## Por qué importa

Habilitar o deshabilitar un botón según el estado del formulario es algo que harás en todo trabajo frontend (aceptar términos, completar campos obligatorios). Además, los checkbox tienen una trampa en React: se leen con `checked`, no con `value`.
