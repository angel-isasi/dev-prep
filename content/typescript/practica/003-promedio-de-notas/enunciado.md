En el portal de notas de un instituto, cada curso muestra el promedio del alumno. Escribe `promedio(notas)` que reciba un **array de números** (notas de 0 a 20) y devuelva su promedio.

El caso importante: un curso que recién empieza **no tiene notas**. Ahí no hay promedio, y la función debe decirlo con `null`, no con `0` (un 0 parecería que el alumno jaló todo).

## Reglas

- El parámetro es `notas: number[]`.
- El tipo de retorno es `number | null`.
- Si el array está vacío, devuelve `null`.
- Si no, devuelve la suma dividida entre la cantidad de notas, **sin redondear**.
- No modifiques el array que recibes.
- Pasar un array de textos (`["14", "16"]`) debe ser un **error de tipos**.

## Ejemplos

```ts
promedio([14, 16, 18]);   // 16
promedio([11, 12]);       // 11.5
promedio([20]);           // 20
promedio([0, 0, 0]);      // 0      (sí hay notas, son ceros)
promedio([]);             // null   (no hay notas)

promedio(["14", "16"]);   // error de TypeScript
```

## Reto extra

Como el resultado puede ser `null`, TypeScript **no te deja** usarlo como número sin revisarlo primero. Prueba en VS Code: `const p = promedio(notas); p.toFixed(1);` y mira el error. Luego arréglalo con `if (p !== null)` o con `p ?? 0`.
