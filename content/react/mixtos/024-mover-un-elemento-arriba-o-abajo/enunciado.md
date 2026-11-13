El pizzero ordena los pasos de una receta con botones "Subir" y "Bajar". Escribe la función que **mueve un elemento una posición** sin mutar la lista, y úsala en un componente.

Exporta:

- `mover(lista, indice, direccion)`: `direccion` es `-1` (subir) o `+1` (bajar). Intercambia el elemento de `indice` con su vecino.
- `ListaPasos({ pasosIniciales })`: lista con botones para reordenar.

## Reglas

- `mover` devuelve un arreglo **nuevo** con los dos elementos intercambiados. No modifica la lista recibida (llega congelada).
- Si el movimiento se sale de la lista (subir el primero o bajar el último), devuelve **la misma lista** (misma referencia), sin copiar.
- `ListaPasos`:
  - Una `<ol>` con un `<li>` por paso. Dentro: un `<span>` con el texto del paso y dos botones, `Subir` y `Bajar`, con `aria-label="Subir {paso}"` y `aria-label="Bajar {paso}"`.
  - El botón `Subir` del primer paso y el `Bajar` del último están deshabilitados.

## Ejemplo

```js
const pasos = ["masa", "salsa", "queso"];

mover(pasos, 2, -1); // ["masa", "queso", "salsa"]
mover(pasos, 0, +1); // ["salsa", "masa", "queso"]
mover(pasos, 0, -1); // pasos (la misma referencia: no hay nada que mover)
```

## Por qué importa

Reordenar listas (prioridades, playlists, pasos) es muy común, y la función tiene un detalle fino: **devolver la misma referencia cuando no hay cambio**. Si devuelves una copia igual, React igual tiene que re-renderizar porque la referencia cambió; si devuelves la misma, React se salta el render. Es un ejemplo concreto de cómo la inmutabilidad y las referencias afectan el rendimiento.
