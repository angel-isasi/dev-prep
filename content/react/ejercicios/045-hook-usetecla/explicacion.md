## Idea clave

Un atajo de teclado es un listener de `keydown` en el `document`, puesto en un `useEffect` y quitado en su limpieza. El hook compara `evento.key` con la tecla buscada. Como `accion` es dependencia del efecto, quien usa el hook debe pasar una función **estable** (con `useCallback`) para que el listener no se quite y se vuelva a poner en cada render.

## Paso a paso

1. **En `useTecla`, un `useEffect`** que define `manejar(evento)` y lo registra con `document.addEventListener("keydown", manejar)`.
2. **Compara la tecla**: `evento.key` trae el carácter o nombre de la tecla (`"?"`, `"a"`, `"Escape"`, `"Enter"`, `"ArrowUp"`). Si coincide, llama a `accion(evento)`; pasarle el evento permite, por ejemplo, hacer `evento.preventDefault()`.
3. **Limpieza** con `removeEventListener("keydown", manejar)`, usando la misma función.
4. **Dependencias `[tecla, accion]`**: si cambia la tecla o la acción, el efecto se rehace con los valores nuevos.
5. **En `Ayuda`**, el estado `visible` y una función `alternar` creada con `useCallback(..., [])` y la forma funcional `(v) => !v`, así no depende de nada y es la misma en todos los renders.
6. **Renderiza** `<p>Atajos de teclado</p>` o `null`.

```jsx
import { useCallback, useEffect, useState } from "react";

export function useTecla(tecla, accion) {
  useEffect(() => {
    function manejar(evento) {
      if (evento.key === tecla) accion(evento);
    }

    document.addEventListener("keydown", manejar);
    return () => document.removeEventListener("keydown", manejar);
  }, [tecla, accion]);
}

export function Ayuda() {
  const [visible, setVisible] = useState(false);

  // Estable entre renders: el efecto de useTecla no se rehace en cada render.
  const alternar = useCallback(() => setVisible((v) => !v), []);
  useTecla("?", alternar);

  return visible ? <p>Atajos de teclado</p> : null;
}
```

## Por qué funciona

| Tecla | `evento.key === "?"` | Estado `visible` | Se pinta |
|---|---|---|---|
| (inicio) | | `false` | nada |
| `?` | sí, llama `alternar()` | `true` | Atajos de teclado |
| `a` | no | `true` | Atajos de teclado |
| `?` | sí | `false` | nada |

Cuando `visible` cambia, `Ayuda` se vuelve a renderizar y llama otra vez a `useTecla("?", alternar)`. Como `alternar` es **la misma función** (gracias a `useCallback` con `[]`) y `"?"` es el mismo texto, las dependencias no cambiaron: React **no** rehace el efecto y el listener original sigue puesto.

Sin `useCallback`, `alternar` sería una función nueva en cada render. El efecto vería una dependencia distinta, ejecutaría la limpieza (quitar el listener) y volvería a agregar uno nuevo, en cada render. Funcionaría, pero haciendo trabajo de más; en hooks más complejos (que, por ejemplo, abren una conexión) eso sí sería un problema.

## Errores comunes

- **No quitar el listener.** Cada montaje suma uno y los viejos siguen llamando a acciones de componentes desmontados. Falla el test "al desmontar".
- **Usar `evento.keyCode`** o `evento.which`. Están obsoletos; usa `evento.key`.
- **Comparar con `"Shift+/"` o con el código de la tecla.** `?` se escribe con Shift, pero `evento.key` ya entrega el carácter resultante, `"?"`.
- **`setVisible(!visible)` dentro de un `useCallback` con `[]`.** La función se queda con el `visible` del primer render (closure viejo) y siempre lo pone en `true`: el segundo `?` no lo oculta.
- **Atajos que se disparan mientras el usuario escribe.** Si hay un input en la página, escribir "?" en él también abriría la ayuda. En apps reales se ignora el atajo si `evento.target` es un `input` o `textarea` (mira "Otra forma").

## Otra forma de resolverlo

Un hook más robusto: ignora las teclas escritas dentro de campos de texto y guarda la acción en un ref, para que funcione aunque quien lo use **no** use `useCallback`:

```jsx
import { useEffect, useRef } from "react";

export function useTecla(tecla, accion) {
  const ultimaAccion = useRef(accion);
  useEffect(() => {
    ultimaAccion.current = accion;
  });

  useEffect(() => {
    function manejar(evento) {
      const escribiendo = evento.target.closest?.("input, textarea, [contenteditable]");
      if (evento.key === tecla && !escribiendo) ultimaAccion.current(evento);
    }
    document.addEventListener("keydown", manejar);
    return () => document.removeEventListener("keydown", manejar);
  }, [tecla]);
}
```

**¿Cuándo conviene?** En una app real con formularios, ignorar los campos de texto es casi obligatorio. El ref hace el hook más fácil de usar (no obliga a recordar `useCallback`). La versión simple es la que se espera en una entrevista; esta es un buen "y además..." para mostrar experiencia.

## Cómo explicarlo en la entrevista

> "El hook agrega un listener de `keydown` al `document` en un `useEffect` y lo quita en la limpieza. En el manejador comparo `evento.key` con la tecla y, si coincide, llamo a la acción pasándole el evento. Las dependencias son la tecla y la acción, por eso en el componente envuelvo la acción en `useCallback` con la forma funcional del setter: así es estable y el listener no se rehace en cada render. En producción ignoraría las teclas que se escriben dentro de inputs."

## Conceptos

- **Eventos de teclado**: `keydown`, y `evento.key` para saber qué tecla fue.
- **Listeners globales en `document`** con su limpieza.
- **Dependencias de `useEffect`**: si cambian, se ejecuta la limpieza y el efecto otra vez.
- **`useCallback`**: función estable para no rehacer efectos sin necesidad.
- **Forma funcional del setter**: evita closures viejos dentro de `useCallback`.
- **Hook propio reutilizable**: un mismo hook para `?`, `Escape`, `/`...
- **`closest`**: saber si el evento ocurrió dentro de un campo de texto.
