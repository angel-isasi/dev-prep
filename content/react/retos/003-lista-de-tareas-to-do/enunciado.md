Crea el componente `Tareas`: una lista de pendientes donde puedes **agregar** tareas, **marcarlas** como hechas y **eliminarlas**. No recibe props.

## Reglas

- Un `<input>` con la etiqueta **"Nueva tarea"** (usa `aria-label="Nueva tarea"`) y un botón **`Agregar`**, dentro de un `<form>`: así también se agrega al presionar Enter.
- Al agregar, el texto se guarda **sin espacios al inicio ni al final**. Si queda vacío (por ejemplo, solo espacios), no se agrega nada.
- Después de agregar, el input se limpia.
- Cada tarea es un `<li>` dentro de una `<ul>` y tiene:
  - un `<input type="checkbox">` para marcarla como hecha,
  - el texto de la tarea,
  - un botón para eliminarla con `aria-label` **`Eliminar <texto>`** (por ejemplo, `Eliminar Estudiar React`).
- Debajo de la lista, un párrafo con el texto **`N pendientes`**: cuántas tareas **no** están marcadas (por ejemplo, `0 pendientes`, `2 pendientes`).

## Ejemplo

```jsx
<Tareas />
```

| Acción | Se ve |
|---|---|
| (inicio) | lista vacía, `0 pendientes` |
| escribir `Estudiar React` y clic en `Agregar` | 1 tarea, `1 pendientes`, el input vacío |
| escribir `   ` y clic en `Agregar` | nada cambia |
| marcar el checkbox | la tarea tachada, `0 pendientes` |
| clic en el botón `Eliminar Estudiar React` | lista vacía |

## Por qué importa

La lista de tareas es el clásico de las pruebas técnicas junior. Con un solo componente evalúan si actualizas arreglos **sin mutarlos** (agregar con spread, cambiar con `map`, quitar con `filter`), si usas una `key` estable y si sabes manejar un formulario.
