Crea el **hook propio** `usePrevio(valor)`, que devuelve el valor que tenía `valor` **en el render anterior**. Sirve para comparar "antes y ahora", por ejemplo para mostrar si un precio subió o bajó.

## Reglas

- Exporta la función `usePrevio(valor)`.
- En el **primer render** no hay valor anterior: devuelve `undefined`.
- En cada render siguiente, devuelve el `valor` que recibió en el render anterior.
- Funciona con cualquier tipo de dato: números, textos, objetos.
- Usa **`useRef`** para recordar el valor (no `useState`) y **`useEffect`** para actualizarlo.

## Ejemplo

```jsx
function Precio({ monto }) {
  const anterior = usePrevio(monto);
  return (
    <p>
      S/ {monto} {anterior !== undefined && monto > anterior && "(subió)"}
    </p>
  );
}
```

| Render | `valor` que recibe | `usePrevio(valor)` devuelve |
|---|---|---|
| 1.º | `1` | `undefined` |
| 2.º | `2` | `1` |
| 3.º | `3` | `2` |

## Por qué importa

Este hook es una pregunta típica para ver si entiendes el **orden** en que React hace las cosas: primero ejecuta el componente (render), después pinta y al final corre los efectos. Y la diferencia entre `useRef` (recordar sin provocar render) y `useState` (recordar y volver a pintar).
