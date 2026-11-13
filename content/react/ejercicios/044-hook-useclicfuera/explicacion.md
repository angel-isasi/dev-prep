## Idea clave

Para detectar un clic **fuera** de un elemento, escuchas `mousedown` en todo el `document` y, en cada clic, preguntas con `contains` si el elemento clicado está dentro de tu caja. El listener se pone en un `useEffect` y se quita en su limpieza. El `ref` te da acceso al elemento real del DOM.

## Paso a paso

1. **`useRef(null)` + `<div ref={ref}>`** en el componente: después de montar, `ref.current` es el `<div>` real del DOM.
2. **En el hook, un `useEffect`** que agrega el listener al `document` con `addEventListener("mousedown", manejar)`.
3. **`manejar(evento)`**: `evento.target` es el elemento exacto donde se hizo clic. `ref.current.contains(evento.target)` devuelve `true` si ese elemento es la caja o cualquier descendiente suyo, por profundo que esté.
4. **Si no lo contiene, avisa**: `alHacerClicFuera()`. El `ref.current &&` evita errores si el elemento todavía no existe.
5. **Limpieza**: devuelve `() => document.removeEventListener("mousedown", manejar)`. Debe ser **la misma función** `manejar` que agregaste, por eso se define dentro del efecto.
6. **`Desplegable`** guarda `abierto` (empieza en `true`) y pasa `() => setAbierto(false)` como callback.

```jsx
import { useEffect, useRef, useState } from "react";

export function useClicFuera(ref, alHacerClicFuera) {
  useEffect(() => {
    function manejar(evento) {
      // contains: ¿el elemento clicado está dentro de ref.current (o es él mismo)?
      if (ref.current && !ref.current.contains(evento.target)) {
        alHacerClicFuera();
      }
    }

    document.addEventListener("mousedown", manejar);
    // Limpieza: quita el listener al desmontar (o antes de volver a ponerlo).
    return () => document.removeEventListener("mousedown", manejar);
  }, [ref, alHacerClicFuera]);
}

export function Desplegable() {
  const [abierto, setAbierto] = useState(true);
  const ref = useRef(null);

  useClicFuera(ref, () => setAbierto(false));

  return <div ref={ref}>{abierto ? <p>Opciones</p> : <p>Cerrado</p>}</div>;
}
```

## Por qué funciona

| Acción | `evento.target` | `ref.current.contains(target)` | Estado `abierto` | Se pinta |
|---|---|---|---|---|
| Primer render | | | `true` | Opciones |
| mousedown en "Opciones" | el `<p>` de adentro | `true` | `true` | Opciones |
| mousedown en "Afuera" | el `<button>` hermano | `false`, así que llama `setAbierto(false)` | `false` | Cerrado |

¿Por qué `mousedown` y no `click`? El `click` se dispara al **soltar** el botón del mouse. Si el usuario presiona dentro del menú y suelta fuera (por ejemplo, al seleccionar texto), `click` podría cerrarlo sin querer. Además, `mousedown` responde antes, lo que se siente más ágil. Para pantallas táctiles se suele agregar también `touchstart` (o usar `pointerdown`, que cubre ambos).

Detalle de las dependencias: como `() => setAbierto(false)` es una función nueva en cada render, el efecto quita y vuelve a poner el listener en cada render. Funciona bien (por eso cada limpieza importa), aunque se puede optimizar (mira "Otra forma").

## Errores comunes

- **No quitar el listener.** Cada vez que el componente se monta, se suma otro listener al `document` y nunca se van: fuga de memoria y callbacks de componentes que ya no existen. Falla el test "al desmontar".
- **Pasar una función distinta a `removeEventListener`** (por ejemplo, una flecha nueva). `removeEventListener` solo quita la **misma** referencia que agregaste; si no coincide, no quita nada.
- **Comparar `evento.target === ref.current`.** Solo detecta clics sobre el `<div>` exacto, no sobre sus hijos: clicar el texto de adentro cerraría el menú. Para eso existe `contains`. Falla el test del hijo anidado.
- **Usar `onMouseDown` en el propio componente.** Solo te enteras de los clics de adentro; los de afuera nunca llegan a tu elemento.
- **Leer `ref.current` durante el render** para decidir algo. Durante el primer render todavía es `null`; los refs al DOM se leen en efectos o en manejadores de eventos.

## Otra forma de resolverlo

Guardar el callback en un **ref** (como en `useIntervalo`) para registrar el listener **una sola vez**, aunque el callback cambie en cada render:

```jsx
import { useEffect, useRef } from "react";

export function useClicFuera(ref, alHacerClicFuera) {
  const ultimo = useRef(alHacerClicFuera);
  useEffect(() => {
    ultimo.current = alHacerClicFuera;
  });

  useEffect(() => {
    function manejar(evento) {
      if (ref.current && !ref.current.contains(evento.target)) ultimo.current();
    }
    document.addEventListener("pointerdown", manejar);
    return () => document.removeEventListener("pointerdown", manejar);
  }, [ref]);
}
```

**¿Cuándo conviene?** Cuando el componente se renderiza muy seguido (por ejemplo, mientras el usuario escribe dentro del desplegable): te ahorras quitar y poner el listener cada vez. Usa `pointerdown`, que cubre mouse, toque y lápiz. Ojo: si cambias a `pointerdown`, en los tests se dispara con `fireEvent.pointerDown`.

## Cómo explicarlo en la entrevista

> "Pongo un `ref` en el contenedor y, en un `useEffect`, agrego un listener de `mousedown` al `document`. En cada clic uso `ref.current.contains(evento.target)`: si el elemento clicado no está dentro, llamo al callback. Uso `mousedown` para que no se cierre si el usuario presiona dentro y suelta fuera. En la limpieza del efecto quito el listener con la misma función, para no tener fugas de memoria. Si el callback cambia en cada render, lo guardaría en un ref para no re-suscribirme."

## Conceptos

- **`useRef` para el DOM**: `ref.current` apunta al elemento real después de montar.
- **`document.addEventListener` / `removeEventListener`**: escuchar eventos globales; quitar con la misma referencia.
- **`Node.contains(otro)`**: ¿`otro` es este nodo o un descendiente?
- **`evento.target`**: el elemento donde ocurrió el evento.
- **Limpieza de efectos**: evitar fugas de memoria y listeners duplicados.
- **`mousedown` vs `click` vs `pointerdown`**: cuándo se dispara cada uno.
- **Hook propio reutilizable**: la misma lógica sirve para menús, popovers y modales.
