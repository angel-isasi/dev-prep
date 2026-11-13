## Idea clave

El único estado es **el texto**. Los caracteres restantes y si el botón está habilitado son **estado derivado**: se calculan en cada render. El límite real lo pone el navegador con `maxLength`, no tu código.

## Paso a paso

1. **Textarea controlado.** `useState("")` y `value={texto}` + `onChange={(e) => setTexto(e.target.value)}`.
2. **Etiqueta accesible.** `<label htmlFor={id}>` y el mismo `id` en el textarea. `useId()` genera un id único aunque haya varios comentarios en la página.
3. **Calcula lo derivado:** `restantes = max - texto.length` y `vacio = texto.trim() === ""`.
4. **Límite real:** `maxLength={max}` hace que el navegador no deje escribir más (también al pegar texto).
5. **Botón:** `disabled={vacio}`. Con `trim()`, un texto de puros espacios cuenta como vacío.
6. **Detalles de UX:** `aria-live="polite"` para que el lector de pantalla anuncie el contador, y color rojo cuando quedan menos de 10.

```jsx
import { useId, useState } from "react";

export function Comentario({ max = 140 }) {
  const [texto, setTexto] = useState("");
  const id = useId();

  // Estado derivado: se calcula en cada render, no se guarda.
  const restantes = max - texto.length;
  const vacio = texto.trim() === "";

  return (
    <div>
      <label htmlFor={id}>Comentario</label>
      <textarea
        id={id}
        value={texto}
        maxLength={max}
        onChange={(evento) => setTexto(evento.target.value)}
      />
      <p aria-live="polite" style={{ color: restantes < 10 ? "crimson" : "inherit" }}>
        {restantes} caracteres restantes
      </p>
      <button type="button" disabled={vacio}>
        Publicar
      </button>
    </div>
  );
}
```

## Por qué funciona

Con `max = 20`:

| El usuario escribe | `texto` | `restantes` | `vacio` | Se pinta |
|---|---|---|---|---|
| (nada) | `""` | 20 | true | 20 caracteres restantes, Publicar deshabilitado |
| `Gran corto` | `"Gran corto"` | 10 | false | 10 caracteres restantes, Publicar habilitado |
| `"   "` | `"   "` | 17 | true (`trim()` da `""`) | 17 caracteres restantes, Publicar deshabilitado |

Cada tecla dispara `onChange`, React guarda el texto nuevo, vuelve a ejecutar `Comentario` y recalcula todo. Como los valores derivados salen siempre del mismo texto, **nunca** pueden quedar desincronizados.

`max = 140` en la desestructuración es un **valor por defecto**: si no pasas la prop, vale 140.

## Errores comunes

- **Guardar `restantes` en otro `useState`** y actualizarlo en el `onChange` o en un `useEffect`. Es estado duplicado: más código y riesgo de que no coincidan.
- **Limitar solo con JavaScript** (`if (valor.length <= max) setTexto(valor)`). Funciona, pero `maxLength` ya lo hace el navegador, incluso al pegar, y lo comunica a tecnologías de asistencia.
- **Olvidar `trim()`** en la validación del botón. Un comentario de puros espacios se podría publicar. Falla el test de "solo espacios".
- **Poner el `id` fijo** (`id="comentario"`) en un componente que se repite. Dos elementos con el mismo id rompen la asociación del label. `useId` lo evita.
- **Label sin asociar** (un `<p>Comentario</p>` suelto). Se ve igual, pero un lector de pantalla no sabe qué es el textarea y `getByLabelText` no lo encuentra.

## Otra forma de resolverlo

Si no necesitas el `id`, puedes **envolver** el textarea con el label:

```jsx
<label>
  Comentario
  <textarea value={texto} maxLength={max} onChange={(e) => setTexto(e.target.value)} />
</label>
```

**¿Cuándo conviene?** Cuando el label y el campo van juntos en el diseño: es más corto y no necesita ids. Si el label va en otro lugar del layout (por ejemplo, en otra columna), usa `htmlFor` + `id`.

Otra variante: contar caracteres "visuales" con `[...texto].length` en vez de `texto.length`, porque algunos emojis ocupan 2 unidades en un string de JavaScript (`"😀".length` es 2).

## Cómo explicarlo en la entrevista

> "El único estado es el texto, con un textarea controlado. Los caracteres restantes y si el botón está habilitado los calculo en cada render, porque son estado derivado; guardarlos aparte sería duplicar información. El límite real lo pone `maxLength`, que funciona incluso al pegar. El botón se deshabilita si el texto está vacío o solo tiene espacios, gracias a `trim()`. Asocio el label con `useId` para que sea accesible aunque haya varios comentarios en la página."

## Conceptos

- **Estado derivado**: lo que se calcula de otro estado no se guarda.
- **Textarea controlado**: `value` + `onChange`, igual que un input.
- **`maxLength`**: límite nativo del navegador.
- **`trim()`**: quita espacios al inicio y al final.
- **Valores por defecto** en props: `{ max = 140 }`.
- **`useId`**: genera ids únicos y estables para asociar label y campo.
- **`aria-live="polite"`**: anuncia cambios sin interrumpir.
