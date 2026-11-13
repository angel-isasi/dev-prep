Crea el hook propio `useFormulario` que maneja **todos los campos de un formulario con un solo estado y un solo manejador**, en vez de un `useState` por campo.

```jsx
const { valores, cambiar, reiniciar } = useFormulario(inicial);
```

## Reglas

- Recibe un objeto con los valores iniciales, por ejemplo `{ nombre: "", promo: false }`.
- Devuelve un objeto con:
  - `valores`: el objeto con los valores actuales de todos los campos.
  - `cambiar(evento)`: el manejador para el `onChange` de **cualquier** campo. Lee del `evento.target`:
    - `name`: qué campo cambió (cada input debe tener su atributo `name`).
    - Si `type` es `"checkbox"`, guarda `checked` (un booleano).
    - Si no, guarda `value` (un texto).
  - `reiniciar()`: vuelve a los valores iniciales.
- Cambiar un campo **no debe borrar** los demás.

## Ejemplo

```jsx
function Pedido() {
  const { valores, cambiar } = useFormulario({ nombre: "", promo: false });
  return (
    <form>
      <input name="nombre" value={valores.nombre} onChange={cambiar} />
      <input name="promo" type="checkbox" checked={valores.promo} onChange={cambiar} />
    </form>
  );
}
```

| Acción | `valores` |
|---|---|
| (inicio) | `{ nombre: "", promo: false }` |
| Escribe "Ana" en `nombre` | `{ nombre: "Ana", promo: false }` |
| Marca `promo` | `{ nombre: "Ana", promo: true }` |
| `reiniciar()` | `{ nombre: "", promo: false }` |

## Por qué importa

Un formulario con 10 campos y 10 `useState` es difícil de mantener. Este patrón (un objeto y un manejador genérico que usa `name`) es el que usan por dentro librerías como React Hook Form o Formik, y es pregunta clásica en entrevistas.
