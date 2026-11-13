Escribe dos funciones que crean un objeto **nuevo** a partir de otro, quedándose solo con algunas propiedades:

- `pick(obj, claves)`: copia **solo** las propiedades cuyas claves están en el arreglo `claves`.
- `omit(obj, claves)`: copia **todas menos** las que están en `claves`.

## Reglas

- Ninguna modifica el objeto original: las dos devuelven un objeto nuevo.
- En `pick`, si una clave pedida no existe en el objeto, se ignora (no aparece como `undefined`).
- En `omit`, si una clave a quitar no existe, no pasa nada.
- Si una propiedad existe con valor `undefined`, `null` o `0`, `pick` la copia igual.
- Es una copia de un solo nivel: los valores se copian tal cual.

## Ejemplos

```js
const u = { id: 1, nombre: "Ana", clave: "secreta" };

pick(u, ["id", "nombre"]);    // { id: 1, nombre: "Ana" }
pick(u, ["id", "edad"]);      // { id: 1 }  ("edad" no existe)

omit(u, ["clave"]);           // { id: 1, nombre: "Ana" }
omit(u, ["clave", "xyz"]);    // { id: 1, nombre: "Ana" }

u;                            // { id: 1, nombre: "Ana", clave: "secreta" } (intacto)
```

## Por qué importa

Son utilidades de todos los días: `omit` para no mandar la contraseña de un usuario al frontend o para quitar campos internos antes de enviar un formulario, y `pick` para quedarte solo con lo que una tabla necesita. En entrevistas muestran si manejas `Object.entries` y `Object.fromEntries` y si respetas la inmutabilidad.
