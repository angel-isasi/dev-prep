Escribe la función `partir(arr, tam)` que divida un arreglo en **grupos de `tam` elementos** y devuelva un arreglo con esos grupos.

## Reglas

- Los grupos mantienen el orden original.
- Todos los grupos tienen `tam` elementos, menos quizás el **último**, que puede quedar más chico con lo que sobre.
- Si `tam` es mayor que el largo del arreglo, devuelve un solo grupo con todo.
- Un arreglo vacío devuelve `[]`.
- No modifiques el arreglo original.
- `tam` siempre será un entero mayor que 0.

## Ejemplos

```js
partir([1, 2, 3, 4, 5], 2);     // [[1, 2], [3, 4], [5]]
partir([1, 2, 3, 4, 5, 6], 3);  // [[1, 2, 3], [4, 5, 6]]
partir([1, 2], 5);              // [[1, 2]]
partir([], 3);                  // []
```

## Por qué importa

Partir en grupos sirve para paginar resultados, mostrar productos en filas de 4 o mandar datos a una API en lotes de 100 para no saturarla. Es un ejercicio de calentamiento frecuente en entrevistas: corto, pero muestra si manejas bien los índices y los bordes.
