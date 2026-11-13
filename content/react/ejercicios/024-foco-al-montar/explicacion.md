## Idea clave

`useRef` te da acceso al **elemento real del DOM**: pones `ref={campo}` en el `<input>` y React guarda el elemento en `campo.current`. Como ese elemento solo existe después de pintar, lo enfocas dentro de un `useEffect` con `[]`, que corre una vez, al montar.

## Paso a paso

1. **Crea la ref.** `const campo = useRef(null)` devuelve un objeto `{ current: null }` que se mantiene igual entre renders.
2. **Conéctala al input.** `<input ref={campo} ... />`. Cuando React crea el `<input>` en el DOM, hace `campo.current = elemento`. Al desmontar, lo vuelve a poner en `null`.
3. **Enfoca en un efecto.** `useEffect(() => { campo.current.focus(); }, [])`. El efecto corre **después** de que React pintó, así que `campo.current` ya es el input.
4. **Solo al montar.** Las dependencias `[]` hacen que el efecto no se repita en los siguientes renders.
5. **Nombre accesible.** `aria-label="Buscar pizza"` le da nombre al campo (no hay `<label>` visible).

```jsx
import { useEffect, useRef } from "react";

export function Buscador() {
  // `campo.current` será el <input> real del DOM después del primer render.
  const campo = useRef(null);

  useEffect(() => {
    campo.current.focus();
  }, []); // [] = solo al montar

  return <input ref={campo} type="search" aria-label="Buscar pizza" />;
}
```

## Por qué funciona

| Momento | `campo.current` | ¿Corre el efecto? | Foco |
|---|---|---|---|
| React ejecuta `Buscador()` (primer render) | `null` (todavía no hay input) | todavía no | donde estaba |
| React pinta el `<input>` | el `<input>` | | donde estaba |
| Después de pintar | el `<input>` | **sí** (montaje) | en "Buscar pizza" |
| El usuario enfoca otro botón | el `<input>` | | en el botón |
| Nuevo render (el padre se actualiza) | el mismo `<input>` | **no** (`[]` no cambió) | sigue en el botón |
| Se desmonta y vuelve a aparecer | nuevo `<input>` | **sí** (es otro montaje) | en "Buscar pizza" |

¿Por qué no `campo.current.focus()` en el cuerpo del componente? Porque en el primer render `campo.current` todavía es `null` (el input no existe) y daría error. El cuerpo calcula qué pintar; los efectos actúan **sobre** lo pintado.

Una ref, a diferencia del estado, **no provoca un render** cuando cambia su `.current`. Es una caja donde guardas algo que necesitas entre renders pero que no se muestra.

## Errores comunes

- **Llamar a `focus()` durante el render**: `campo.current.focus()` fuera del efecto. En el primer render `campo.current` es `null` y salta "Cannot read properties of null (reading 'focus')".
- **Olvidar el `[]`.** El efecto corre en cada render y vuelve a enfocar el input aunque el usuario esté en otro sitio. Lo reconoces porque falla "no roba el foco si el componente se vuelve a renderizar".
- **Olvidar `ref={campo}` en el input.** `campo.current` se queda en `null` y `focus()` da error.
- **Usar `document.querySelector("input")`.** Funciona a veces, pero encuentra el primer input de **toda** la página, no el de este componente (si hay dos buscadores, enfoca el equivocado). La ref apunta siempre al tuyo.
- **Guardar el elemento en `useState`.** Provoca un render extra y no hace falta: para referencias al DOM está `useRef`.

## Otra forma de resolverlo

Con el atributo **`autoFocus`**:

```jsx
export function Buscador() {
  return <input autoFocus type="search" aria-label="Buscar pizza" />;
}
```

React llama a `focus()` por ti cuando monta el elemento. **¿Cuándo conviene?** Para el caso simple de "enfocar al aparecer", `autoFocus` es lo más corto. Pero `useRef` es lo que te van a preguntar, porque sirve para todo lo demás: enfocar cuando ocurre algo (al abrir un modal, al detectar un error en el formulario), medir el tamaño de un elemento, hacer scroll hasta él o integrar librerías que necesitan un nodo del DOM. Úsalo con cuidado: robar el foco al cargar la página puede desorientar a quien usa un lector de pantalla.

## Cómo explicarlo en la entrevista

> "Creo una ref con `useRef(null)` y la conecto al input con `ref={campo}`; React pone el elemento real en `campo.current` cuando lo pinta. Como el elemento no existe durante el render, hago el `focus()` en un `useEffect`, que corre después de pintar, con dependencias vacías para que sea solo al montar y no le robe el foco al usuario en renders posteriores. Para este caso también serviría `autoFocus`, pero la ref me sirve cuando necesito enfocar en respuesta a un evento."

## Conceptos

- **`useRef`**: objeto `{ current }` que se conserva entre renders; cambiarlo no provoca un render.
- **Atributo `ref`**: React guarda en `ref.current` el elemento del DOM al montarlo.
- **`useEffect` con `[]`**: corre una sola vez, después del primer pintado.
- **`focus()` y `document.activeElement`**: método para enfocar un elemento y propiedad que indica cuál tiene el foco.
- **`autoFocus`**: atributo que enfoca el elemento al montarse.
- **Montaje**: la primera vez que un componente aparece en pantalla.
