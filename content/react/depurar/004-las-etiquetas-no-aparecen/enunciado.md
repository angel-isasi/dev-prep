## El problema

En el formulario para publicar un artículo, un usuario reporta: "Hago clic en las etiquetas sugeridas y **no pasa nada**: sigue diciendo 'Elegidas: ninguna'. Lo raro es que si después cambio cualquier otra cosa de la página, **aparecen de golpe** todas las que había elegido".

No hay errores en la consola.

## Qué debe hacer

`Etiquetas` recibe `sugerencias` (un arreglo de textos) y muestra un botón por cada una. Al hacer clic en un botón, esa etiqueta se agrega al final de las elegidas, y el texto se actualiza **en ese mismo momento**.

| Clics | Se ve |
|---|---|
| ninguno | Elegidas: ninguna |
| CSS | Elegidas: CSS |
| TypeScript, React | Elegidas: TypeScript, React |

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
