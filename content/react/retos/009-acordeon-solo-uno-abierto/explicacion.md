## Idea clave

Para que las secciones se **coordinen** (abrir una cierra la otra), el estado no puede estar repartido en cada sección: vive en el **padre**, que guarda **qué índice** está abierto (o `null`). Cada sección solo pregunta "¿soy yo la abierta?".

## Paso a paso

1. **Un solo estado en el padre.** `useState(null)`: `null` significa "ninguna abierta". Si guardas un número, es el índice de la abierta.
2. **Alternar.** `setAbierto((actual) => (actual === i ? null : i))`. Si haces clic en la que ya está abierta, se cierra; si no, pasa a ser la abierta (y la anterior se cierra sola, porque solo cabe un número en el estado).
3. **Mostrar la respuesta.** `{abierto === i && <p>{item.respuesta}</p>}`. Si la condición es `false`, React no pinta nada: la respuesta **no existe** en el DOM.
4. **Accesibilidad.** Cada pregunta es un `<button>` (se enfoca con Tab y se abre con Enter o Espacio) dentro de un `<h3>` (para que los lectores de pantalla puedan saltar entre preguntas). `aria-expanded` anuncia si está abierta o cerrada.

```jsx
import { useState } from "react";

export function Acordeon({ items }) {
  // Índice del item abierto, o null si ninguno lo está.
  const [abierto, setAbierto] = useState(null);

  function alternar(i) {
    setAbierto((actual) => (actual === i ? null : i));
  }

  return (
    <div>
      {items.map((item, i) => (
        <section key={item.pregunta}>
          <h3>
            <button aria-expanded={abierto === i} onClick={() => alternar(i)}>
              {item.pregunta}
            </button>
          </h3>
          {abierto === i && <p>{item.respuesta}</p>}
        </section>
      ))}
    </div>
  );
}
```

## Por qué funciona

Con 2 preguntas:

| Acción | `abierto` | Lo que se pinta |
|---|---|---|
| (inicio) | `null` | 2 botones, ninguna respuesta, ambos `aria-expanded="false"` |
| clic en la pregunta 0 | `0` | respuesta 0 visible |
| clic en la pregunta 1 | `1` | respuesta 1 visible; la 0 desaparece porque `abierto === 0` ya es `false` |
| clic en la pregunta 1 | `null` (`actual === 1`) | ninguna respuesta |

Nadie "cierra" la sección anterior a mano: como el estado solo puede tener un valor, cerrar la anterior es automático. Ese es el poder de modelar bien el estado.

## Errores comunes

- **Un `useState` dentro de cada sección.** Cada una se abre y cierra sola, pero varias pueden quedar abiertas a la vez: no hay forma de que una cierre a otra. La solución es **levantar el estado** al padre.
- **Usar `false` en vez de `null` y luego comparar con `if (abierto)`.** El índice `0` es "falsy": `if (0)` es `false`, así que la primera pregunta parece cerrada aunque esté abierta. Compara siempre con `abierto === i`.
- **Ocultar con CSS (`display: none`) sin decirle al lector de pantalla.** Si prefieres no desmontar la respuesta, usa el atributo `hidden`, que oculta visualmente y para la accesibilidad.
- **Poner `onClick` en el `<h3>` o en un `<div>`.** No se puede usar con teclado. El elemento interactivo debe ser un `<button>`.
- **Usar `pregunta` como `key` si puede repetirse.** Aquí asumimos que son únicas; si vinieran de una base de datos, usa su `id`.

## Otra forma de resolverlo

Con los elementos nativos **`<details>` y `<summary>`**, que ya traen abrir y cerrar sin JavaScript. Para que solo uno esté abierto, los navegadores modernos aceptan el atributo `name`: todos los `<details>` con el mismo `name` forman un grupo exclusivo.

```jsx
export function Acordeon({ items }) {
  return (
    <div>
      {items.map((item) => (
        <details key={item.pregunta} name="faq">
          <summary>{item.pregunta}</summary>
          <p>{item.respuesta}</p>
        </details>
      ))}
    </div>
  );
}
```

**¿Cuándo conviene?** Para una página de preguntas frecuentes simple es perfecto: accesible y sin estado. Pero si necesitas **controlar** desde React cuál está abierta (abrir una desde un enlace, guardar cuál abrió el usuario, animaciones), vuelve a la versión con estado. En la entrevista, mencionar `<details>` muestra que conoces HTML, no solo React.

## Cómo explicarlo en la entrevista

> "Si cada sección tuviera su propio estado, no podrían saber que otra se abrió. Por eso levanto el estado al padre: guardo el índice de la abierta, o `null` si ninguna. Al hacer clic, si era la abierta pongo `null`, y si no, pongo su índice; así abrir una cierra la anterior automáticamente, porque el estado solo tiene un valor. Comparo con `abierto === i` para no tener problemas con el índice 0. Uso botones con `aria-expanded` para que funcione con teclado y lector de pantalla."

## Conceptos

- **Levantar el estado** (*lifting state up*): el estado compartido vive en el ancestro común.
- **`null` como "ninguno"** y comparación estricta `===` (cuidado con el `0`).
- **Renderizado condicional con `&&`**.
- **`aria-expanded`**: indica si un elemento desplegable está abierto.
- **Botones dentro de encabezados** para acordeones accesibles.
- **`<details>` y `<summary>`**: acordeón nativo de HTML.
