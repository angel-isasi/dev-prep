## El problema

La diseñadora del equipo avisa: "El círculo del avatar en la barra de arriba sale **vacío**. Debería mostrar las iniciales del usuario, por ejemplo AT para Ana Torres. No sale ningún error en la consola".

## Qué debe hacer

`iniciales(nombreCompleto)` toma la primera letra de cada palabra, en mayúscula, y las une. Los espacios de más (al inicio, al final o entre palabras) no cuentan.

```js
iniciales("Ana Torres");          // "AT"
iniciales("maría elena quispe");  // "MEQ"
iniciales("  luis   paredes ");   // "LP"
iniciales("Rosa");                // "R"
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
