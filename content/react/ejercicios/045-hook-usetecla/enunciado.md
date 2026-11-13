Crea el hook propio `useTecla(tecla, accion)` para **atajos de teclado**: ejecuta una acción cuando el usuario presiona una tecla, esté donde esté el foco. Luego úsalo en un componente `Ayuda` que muestra u oculta la lista de atajos con la tecla **`?`**, como en GitHub o Gmail.

## Reglas

- `useTecla(tecla, accion)`:
  - Escucha el evento **`keydown`** en el `document`.
  - Si `evento.key` es igual a `tecla`, llama a `accion(evento)`. Con cualquier otra tecla, no hace nada.
  - Al desmontar, **quita** el listener.
- `Ayuda()`:
  - Al inicio no muestra nada (`return null` está bien).
  - Cada vez que se presiona `?`, **alterna**: si estaba oculto muestra un `<p>` con **"Atajos de teclado"**, y si estaba visible lo oculta.
  - Usa `useCallback` para que la función que le pasas a `useTecla` sea estable.

## Ejemplo

```jsx
<Ayuda />
```

| Tecla presionada | Se ve |
|---|---|
| (inicio) | (nada) |
| `?` | Atajos de teclado |
| `a` | Atajos de teclado (no cambia) |
| `?` | (nada) |

## Por qué importa

Los atajos de teclado son comunes en aplicaciones web (buscar con `/`, cerrar con `Escape`). Este ejercicio junta varias cosas que se preguntan en entrevistas: eventos globales con limpieza, hooks propios reutilizables y **por qué `useCallback` importa** cuando una función es dependencia de un efecto.
