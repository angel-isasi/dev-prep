Escribe la función `ordenarPor(lista, clave)` que reciba un arreglo de objetos y el nombre de una propiedad, y devuelva un **arreglo nuevo** con los objetos ordenados **de menor a mayor** según esa propiedad.

## Reglas

- **No modifiques el arreglo original**: debe quedar en el mismo orden en que llegó. Este es el punto central del ejercicio.
- Siempre devuelve un arreglo nuevo, aunque la lista ya esté ordenada.
- La propiedad puede ser un **texto** (orden alfabético) o un **número** (orden numérico). Compara con `<` y `>`; no te preocupes por tildes ni por mayúsculas.
- Si la lista está vacía, devuelve `[]`.

## Ejemplos

```js
const alumnos = [
  { nombre: "Luz", nota: 15 },
  { nombre: "Ana", nota: 18 },
  { nombre: "Eva", nota: 8 },
];

ordenarPor(alumnos, "nombre");
// [{ nombre: "Ana", ... }, { nombre: "Eva", ... }, { nombre: "Luz", ... }]

ordenarPor(alumnos, "nota");
// [{ nombre: "Eva", nota: 8 }, { nombre: "Luz", nota: 15 }, { nombre: "Ana", nota: 18 }]

alumnos[0].nombre;   // "Luz"  (el original no cambió)
ordenarPor([], "nota");   // []
```

## Por qué importa

Ordenar tablas por columna es una tarea diaria en frontend. Y `sort` tiene dos trampas que los entrevistadores adoran: **modifica el arreglo original** y, sin función de comparación, **ordena todo como texto**. En React, modificar el estado original es un error clásico que hace que la pantalla no se actualice.
