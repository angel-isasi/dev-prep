## Idea clave

Un **booleano** en el estado (`visible`) decide dos cosas en el render: el `type` del input y el texto del botón. No guardas el `type` ni el texto: los derivas del booleano con un ternario.

## Paso a paso

1. **Estado booleano.** `const [visible, setVisible] = useState(false)`: al inicio la contraseña está oculta.
2. **Alternar.** `setVisible((anterior) => !anterior)` invierte el valor. Se usa la forma funcional porque el nuevo valor depende del anterior.
3. **El `type` depende del estado.** `type={visible ? "text" : "password"}`. React actualiza solo ese atributo del mismo `<input>`; no crea uno nuevo, por eso lo escrito se mantiene.
4. **El texto del botón también.** `{visible ? "Ocultar" : "Mostrar"}`: el botón dice lo que **va a hacer** si lo pulsas.
5. **Detalles que suman puntos:**
   - `type="button"`: dentro de un `<form>`, un `<button>` sin `type` es `submit` por defecto y enviaría el formulario.
   - `<label htmlFor="clave">` + `id="clave"` conectan la etiqueta con el input (y hacen que `getByLabelText` lo encuentre).
   - `aria-pressed={visible}` le dice al lector de pantalla que es un botón que se queda "presionado" o no.

```jsx
import { useState } from "react";

export function CampoClave() {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor="clave">Contraseña</label>
      <input id="clave" type={visible ? "text" : "password"} />
      <button
        type="button"
        aria-pressed={visible}
        onClick={() => setVisible((anterior) => !anterior)}
      >
        {visible ? "Ocultar" : "Mostrar"}
      </button>
    </div>
  );
}
```

## Por qué funciona

| Acción | Estado `visible` | Lo que se pinta |
|---|---|---|
| (primer render) | `false` | `<input type="password">`, botón `Mostrar`, `aria-pressed="false"` |
| clic en `Mostrar` | `true` | `<input type="text">`, botón `Ocultar`, `aria-pressed="true"` |
| clic en `Ocultar` | `false` | vuelve al primer render |

En cada clic React vuelve a ejecutar `CampoClave`. Compara el JSX nuevo con el anterior, ve que el `<input>` sigue en el mismo lugar y solo cambia su atributo `type`. Como el elemento del DOM es el mismo, su valor (lo que escribiste) no se toca.

## Errores comunes

- **Olvidar `type="button"`.** Dentro de un formulario de login, pulsar "Mostrar" enviaría el formulario. Lo reconoces porque la página se recarga o se dispara el `onSubmit` sin querer.
- **Cambiar el DOM a mano** (`document.getElementById("clave").type = "text"`) en vez de derivarlo del estado. React no se entera del cambio: el texto del botón no se actualiza y, en el siguiente render, React puede volver a poner el `type` que dice el JSX. En React, la interfaz sale del estado, no al revés.
- **Guardar el texto del botón en otro estado** (`const [texto, setTexto] = useState("Mostrar")`). Es estado derivado: tendrías que actualizar dos estados en cada clic y es fácil que se desincronicen.
- **Usar un `<span>` con `onClick` en vez de un `<button>`.** No se puede usar con teclado (Tab y Enter) y el lector de pantalla no lo anuncia como botón.
- **Poner la etiqueta como texto suelto** (`<p>Contraseña</p>`) sin conectarla. No es accesible y `getByLabelText` no encuentra el input.

## Otra forma de resolverlo

Con un `<label>` que envuelve al input y un `aria-label` fijo en el botón, por si el botón muestra un ícono en vez de texto:

```jsx
import { useState } from "react";

export function CampoClave() {
  const [visible, setVisible] = useState(false);

  return (
    <label>
      Contraseña
      <input type={visible ? "text" : "password"} />
      <button type="button" aria-pressed={visible} onClick={() => setVisible((v) => !v)}>
        {visible ? "Ocultar" : "Mostrar"}
      </button>
    </label>
  );
}
```

**¿Cuándo conviene?** Envolver con `<label>` evita inventar un `id`, útil si el componente aparece varias veces en la página (dos `id="clave"` serían un error). Para generar ids únicos de forma segura, React tiene el hook `useId`.

## Cómo explicarlo en la entrevista

> "Guardo un solo booleano, `visible`. A partir de él decido el `type` del input y el texto del botón con un ternario, así no tengo estados duplicados. Cambio solo el atributo del mismo input, por eso no se pierde lo que el usuario escribió. El botón es `type='button'` para que no envíe el formulario de login, el input tiene su `label` conectado y uso `aria-pressed` para que un lector de pantalla sepa si la contraseña se está mostrando."

## Conceptos

- **Estado booleano** y alternarlo con `setX((v) => !v)`.
- **Ternario en JSX** para elegir atributos y textos.
- **Estado derivado**: el `type` y el texto del botón no se guardan.
- **`type="button"`**: un `<button>` dentro de un `<form>` es `submit` por defecto.
- **`<label htmlFor>`**: conecta la etiqueta con su input.
- **`aria-pressed`**: indica si un botón de tipo interruptor está activo.
- **Reconciliación**: React reutiliza el mismo elemento del DOM si el tipo y la posición no cambian.
