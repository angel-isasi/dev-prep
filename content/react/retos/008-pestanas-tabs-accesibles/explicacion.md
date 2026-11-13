## Idea clave

El estado es solo el **índice de la pestaña activa**. Todo lo demás (qué panel se ve, `aria-selected`, `tabIndex`) se deriva comparando cada índice con el activo. Las flechas mueven ese índice con **aritmética modular** para que dé la vuelta.

## Paso a paso

1. **Índice activo.** `useState(0)`: al inicio, la primera pestaña.
2. **Ids únicos con `useId`.** `useId()` devuelve un id único por instancia del componente (algo como `:r1:`). Con él armas `${id}-tab-0`, `${id}-tab-1`... y `${id}-panel`. Si hubiera dos componentes `Pestanas` en la página, sus ids no chocan.
3. **Los roles ARIA.**
   - `role="tablist"` en el contenedor: "esto es un grupo de pestañas".
   - `role="tab"` en cada botón, con `aria-selected` (si es la activa) y `aria-controls` (qué panel controla).
   - `role="tabpanel"` en el panel, con `aria-labelledby` apuntando a la pestaña que lo titula.
4. **Foco con `tabIndex`.** Solo la pestaña activa tiene `tabIndex={0}`; las demás `-1`. Así, al usar Tab, el teclado entra al grupo una sola vez (en la activa) y sale al siguiente elemento de la página. Dentro del grupo se navega con flechas. Este patrón se llama *roving tabindex*.
5. **Flechas con módulo.**
   - Siguiente: `(i + 1) % total`. Con 3 pestañas: 0 → 1 → 2 → 0.
   - Anterior: `(i - 1 + total) % total`. Se suma `total` antes del módulo porque en JavaScript `-1 % 3` es `-1`, no `2`.
6. **El panel** muestra `pestanas[activa].contenido`.

```jsx
import { useId, useState } from "react";

export function Pestanas({ pestanas }) {
  const [activa, setActiva] = useState(0); // índice de la pestaña activa
  const id = useId();
  const total = pestanas.length;

  function alPresionarTecla(evento) {
    if (evento.key === "ArrowRight") setActiva((i) => (i + 1) % total);
    if (evento.key === "ArrowLeft") setActiva((i) => (i - 1 + total) % total);
  }

  return (
    <div>
      <div role="tablist">
        {pestanas.map((pestana, i) => (
          <button
            key={pestana.titulo}
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={activa === i}
            aria-controls={`${id}-panel`}
            tabIndex={activa === i ? 0 : -1}
            onClick={() => setActiva(i)}
            onKeyDown={alPresionarTecla}
          >
            {pestana.titulo}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${activa}`}>
        {pestanas[activa].contenido}
      </div>
    </div>
  );
}
```

## Por qué funciona

Con 3 pestañas (Drama, Terror, Comedia), `total = 3`:

| Acción | Cálculo | `activa` | Lo que se pinta |
|---|---|---|---|
| (inicio) | | `0` | Drama seleccionada, `Cortos de drama` |
| clic en Terror | `setActiva(1)` | `1` | Terror seleccionada, `Cortos de terror` |
| `ArrowRight` | `(1 + 1) % 3` | `2` | Comedia, `Cortos de comedia` |
| `ArrowRight` | `(2 + 1) % 3` | `0` | Drama otra vez |
| `ArrowLeft` | `(0 - 1 + 3) % 3` | `2` | Comedia |

En cada render, el `map` vuelve a calcular `activa === i` para cada botón, así que `aria-selected` y `tabIndex` siempre están sincronizados con el estado sin que tengas que tocarlos a mano.

## Errores comunes

- **Usar `<div onClick>` en vez de `<button>`.** No recibe foco ni responde a Enter o Espacio. Con `<button role="tab">` tienes el teclado gratis.
- **Olvidar los roles.** Visualmente se ve igual, pero un lector de pantalla anuncia "botón, botón, botón" en vez de "pestaña 1 de 3, seleccionada". Lo reconoces porque `getByRole("tab")` no encuentra nada.
- **`(i - 1) % total` para ir hacia atrás.** Desde 0 da `-1` y `pestanas[-1]` es `undefined`: el componente se rompe. Suma `total` antes del módulo.
- **Ids fijos** como `id="panel"`. Con dos componentes en la página habría ids repetidos y `aria-labelledby` apuntaría al equivocado. Usa `useId`.
- **Guardar el contenido activo en el estado** (`useState(pestanas[0].contenido)`). Es derivado del índice; si cambian las props, quedaría desactualizado.

## Otra forma de resolverlo

Un panel por pestaña, ocultando los inactivos con el atributo `hidden`. Además se **mueve el foco** a la nueva pestaña al usar las flechas, que es el comportamiento completo del patrón ARIA:

```jsx
import { useId, useRef, useState } from "react";

export function Pestanas({ pestanas }) {
  const [activa, setActiva] = useState(0);
  const id = useId();
  const botones = useRef([]);

  function mover(nuevo) {
    setActiva(nuevo);
    botones.current[nuevo]?.focus();
  }

  return (
    <div>
      <div role="tablist">
        {pestanas.map((p, i) => (
          <button
            key={p.titulo}
            ref={(el) => (botones.current[i] = el)}
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={activa === i}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={activa === i ? 0 : -1}
            onClick={() => setActiva(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") mover((i + 1) % pestanas.length);
              if (e.key === "ArrowLeft") mover((i - 1 + pestanas.length) % pestanas.length);
            }}
          >
            {p.titulo}
          </button>
        ))}
      </div>
      {pestanas.map((p, i) => (
        <div key={p.titulo} role="tabpanel" id={`${id}-panel-${i}`} aria-labelledby={`${id}-tab-${i}`} hidden={activa !== i}>
          {p.contenido}
        </div>
      ))}
    </div>
  );
}
```

**¿Cuándo conviene?** Cuando los paneles tienen estado propio (un formulario a medio llenar, un video): con `hidden` no se desmontan y no pierden lo que tenían. Con un solo panel, el contenido se vuelve a crear en cada cambio. Mover el foco con un `ref` es lo que recomiendan las pautas ARIA.

## Cómo explicarlo en la entrevista

> "Guardo solo el índice de la pestaña activa; el panel, `aria-selected` y `tabIndex` los derivo de él. Uso los roles `tablist`, `tab` y `tabpanel` para que un lector de pantalla lo anuncie como pestañas, y las conecto con `aria-controls` y `aria-labelledby` usando ids de `useId`, que son únicos aunque haya varias instancias. Con las flechas muevo el índice usando módulo para que dé la vuelta; al ir hacia atrás sumo el total para no obtener un número negativo. Solo la pestaña activa es enfocable con Tab, que es el patrón recomendado."

## Conceptos

- **Estado mínimo**: un índice; todo lo demás se deriva.
- **Roles ARIA**: `tablist`, `tab`, `tabpanel`.
- **`aria-selected`, `aria-controls`, `aria-labelledby`**.
- **`useId`**: ids únicos por instancia del componente.
- **Roving tabindex**: `tabIndex` 0 en el activo y -1 en los demás.
- **Aritmética modular** para navegar en círculo: `(i + 1) % n` y `(i - 1 + n) % n`.
- **`onKeyDown`** y `evento.key`.
- **`useRef`** para mover el foco a un elemento.
