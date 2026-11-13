Crea el componente `Nombre`: un campo de texto donde el cliente escribe su nombre y, debajo, un mensaje que se actualiza **con cada tecla**.

## Reglas

- Un `<label>` con el texto exacto **"Tu nombre"** unido al `<input>` (con `htmlFor` en el label y el mismo `id` en el input). Así, al hacer clic en el texto se enfoca el campo, y los tests lo encuentran con `getByLabelText("Tu nombre")`.
- El input es **controlado**: su valor vive en el estado (`value` + `onChange`).
- Debajo, un `<p>`:
  - Si el nombre está vacío: **"Escribe tu nombre"**.
  - Si hay algo escrito: **"Pedido a nombre de {nombre}"**.

## Ejemplo

```jsx
<Nombre />
```

| El usuario escribe | Se ve debajo |
|---|---|
| (nada) | Escribe tu nombre |
| `Angel` | Pedido a nombre de Angel |
| borra todo | Escribe tu nombre |

## Por qué importa

El **input controlado** es la base de todos los formularios en React: buscadores, logins, filtros. Te lo van a pedir en casi cualquier ejercicio en vivo, y es común que pregunten la diferencia entre input controlado y no controlado.
