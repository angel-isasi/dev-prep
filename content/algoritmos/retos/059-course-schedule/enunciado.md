Escribe la función `puedeTerminarCursos(numCursos, prerrequisitos)` que diga si es posible **llevar todos los cursos** de una carrera.

Los cursos se numeran de `0` a `numCursos - 1`. Cada elemento de `prerrequisitos` es un par `[curso, requisito]`: para llevar `curso`, antes tienes que haber aprobado `requisito`. Devuelve `true` si existe algún orden para llevarlos todos, o `false` si no.

¿Cuándo es imposible? Cuando los requisitos forman un **círculo**: si para llevar el curso 0 necesitas el 1, y para llevar el 1 necesitas el 0, nunca podrás empezar ninguno.

## Reglas

- Puedes llevar los cursos en el orden que quieras, uno por vez, siempre que ya tengas sus requisitos.
- Un curso puede tener varios requisitos, y un curso puede ser requisito de varios.
- Puede haber cursos sin requisitos y sin relación con ningún otro.
- No hay pares repetidos, pero un curso podría pedirse a sí mismo como requisito (eso lo hace imposible).

## Ejemplos

```js
puedeTerminarCursos(2, [[1, 0]]);            // true: llevas 0 y luego 1
puedeTerminarCursos(2, [[1, 0], [0, 1]]);    // false: 0 pide 1 y 1 pide 0
puedeTerminarCursos(3, []);                  // true: ningún curso tiene requisitos
puedeTerminarCursos(3, [[1, 0], [2, 1]]);    // true: 0, luego 1, luego 2
```

## Reto extra

Modela los cursos como un **grafo** y resuélvelo en **O(cursos + prerrequisitos)**: cada curso y cada requisito se procesan una sola vez.
