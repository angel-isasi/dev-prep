## El problema

Un profesor reporta: "En la libreta virtual, el promedio de **todos** mis alumnos aparece como `NaN`. Solo los alumnos que todavía no tienen notas muestran 0, que es lo correcto".

## Qué debe hacer

`promedio(notas)` recibe un arreglo de notas y devuelve la suma dividida entre la cantidad. Si el arreglo está vacío, devuelve `0`.

```js
promedio([14, 16, 18]); // 16
promedio([10, 11]);     // 10.5
promedio([11]);         // 11
promedio([]);           // 0
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
