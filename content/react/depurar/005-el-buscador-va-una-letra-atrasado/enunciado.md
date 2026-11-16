## El problema

Un alumno reporta en el foro: "El buscador de cursos **va una letra atrasado**. Escribo 'rea' y me filtra como si hubiera escrito 're'. Y si borro todo, en vez de mostrarme todos los cursos, sigue filtrando por la última letra que borré".

En el input se ve bien lo que escribe.

## Qué debe hacer

`Buscador` es un input controlado de tipo `search`. Cada vez que cambia el texto, llama a `onBuscar(texto)` con el texto que hay **en ese momento** en el input.

| El usuario escribe | `onBuscar` recibe |
|---|---|
| `r` | `"r"` |
| `re` | `"re"` |
| `rea` | `"rea"` |
| borra todo | `""` |

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
