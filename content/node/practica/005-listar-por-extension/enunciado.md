Estás haciendo un generador de blog: los artículos son archivos `.md` dentro de una carpeta, mezclados con imágenes, otros archivos y subcarpetas. Escribe dos funciones **asíncronas**:

1. `listarPorExtension(carpeta, extension)`: devuelve un arreglo con los **nombres** de los archivos de esa carpeta que tienen esa extensión, ordenados alfabéticamente.
2. `contarPorExtension(carpeta)`: devuelve un objeto que cuenta cuántos archivos hay de cada extensión.

Solo miras la carpeta indicada, no entras a las subcarpetas.

## Lo que necesitas de Node

`readdir` de `node:fs/promises` lista lo que hay en una carpeta. Con la opción `withFileTypes: true` no devuelve solo nombres, sino objetos que te dicen **qué es** cada cosa:

```js
import { readdir } from "node:fs/promises";

const entradas = await readdir("blog", { withFileTypes: true });
for (const e of entradas) {
  e.name;          // "hola.md"
  e.isFile();      // true si es un archivo
  e.isDirectory(); // true si es una carpeta
}
```

## Reglas

- Ignora las **carpetas**, aunque su nombre parezca un archivo (una carpeta llamada `borradores.md` no cuenta).
- `extension` llega con punto y en minúsculas, por ejemplo `".md"`. La extensión de los archivos no distingue mayúsculas: `LEEME.MD` cuenta como `.md`.
- En `contarPorExtension`, las claves son las extensiones en minúsculas con el punto. Los archivos sin extensión se cuentan en la clave `"(sin extensión)"`.
- Una carpeta vacía da `[]` y `{}`.

## Ejemplos

```js
// blog/ contiene: hola.md, LEEME.MD, foto.png, app.js, Makefile, borradores.md/ (carpeta)

await listarPorExtension("blog", ".md");
// ["LEEME.MD", "hola.md"]

await contarPorExtension("blog");
// { ".md": 2, ".png": 1, ".js": 1, "(sin extensión)": 1 }
```

El orden alfabético es el de `sort()`: las mayúsculas van antes que las minúsculas.
