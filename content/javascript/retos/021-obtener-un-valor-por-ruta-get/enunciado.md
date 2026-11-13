Escribe la función `obtener(obj, ruta, porDefecto)` que lea un valor **anidado** de un objeto usando una ruta en texto, como `"a.b.0.c"`. Si en algún punto el camino no existe, devuelve `porDefecto` en lugar de lanzar un error.

## Reglas

- Las partes de la ruta se separan con puntos: `"usuario.direccion.ciudad"`.
- Los índices de arreglos se pueden escribir con punto (`"a.b.0.c"`) o con corchetes (`"a.b[0].c"`).
- Si al bajar encuentras `null` o `undefined` antes de terminar la ruta, devuelve `porDefecto`.
- Si el valor final es `undefined`, devuelve `porDefecto`.
- Si el valor final existe pero es "falsy" (`0`, `""`, `false`, `null`), devuélvelo tal cual: **no** es lo mismo que no existir.
- Si no te pasan `porDefecto`, devuelve `undefined` cuando no encuentres el valor.

## Ejemplos

```js
const datos = { a: { b: [{ c: 5 }] } };

obtener(datos, "a.b.0.c");           // 5
obtener(datos, "a.b[0].c");          // 5
obtener(datos, "a.x.y", "nada");     // "nada"
obtener(datos, "a.x.y");             // undefined

obtener({ stock: 0 }, "stock", 10);  // 0 (existe, aunque sea 0)
```

## Por qué importa

Las respuestas de las APIs vienen muy anidadas y a veces les faltan partes; leer `respuesta.data.usuario.perfil.foto` sin cuidado rompe la pantalla con "Cannot read properties of undefined". Esta función es la `_.get` de Lodash, muy usada en formularios y tablas configurables donde la ruta del campo viene como texto.
