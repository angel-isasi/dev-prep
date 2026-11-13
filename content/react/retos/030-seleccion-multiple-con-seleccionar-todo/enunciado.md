Crea el componente `SeleccionMultiple` que muestra una lista de items con un checkbox cada uno, y arriba un checkbox **"Seleccionar todo"**, como en Gmail. Recibe la prop `items`, un arreglo de objetos `{ id, nombre }`.

## Reglas

- Un checkbox con la etiqueta **"Seleccionar todo"**.
- Un checkbox por item, con el `nombre` del item como etiqueta (por ejemplo, `Noticia A`). Usa `<label>` envolviendo el `<input type="checkbox">` y el texto.
- Debajo, el texto exacto **"N seleccionados"** (por ejemplo, `0 seleccionados`, `2 seleccionados`).
- "Seleccionar todo" está:
  - **marcado** si todos los items están marcados;
  - **desmarcado** si ninguno lo está;
  - **indeterminado** (la rayita "-") si solo algunos están marcados. Es la propiedad `indeterminate` del input.
- Clic en "Seleccionar todo": si todos estaban marcados, los desmarca todos; si no, los marca todos.
- Marcar todos los items uno por uno también deja marcado "Seleccionar todo".

## Ejemplo

```jsx
<SeleccionMultiple items={[{ id: 1, nombre: "Noticia A" }, { id: 2, nombre: "Noticia B" }]} />
```

| Acción | "Seleccionar todo" | Texto |
|---|---|---|
| (inicio) | desmarcado | 0 seleccionados |
| Marca Noticia A | indeterminado | 1 seleccionados |
| Clic en Seleccionar todo | marcado | 2 seleccionados |
| Clic en Seleccionar todo | desmarcado | 0 seleccionados |

## Por qué importa

Tablas de administración, bandejas de correo, carritos: la selección múltiple está en todas partes. Evalúan cómo guardas una colección en el estado sin mutarla, qué calculas en vez de guardar, y si conoces el caso raro del checkbox **indeterminado**, que solo se puede manejar con un `ref`.
