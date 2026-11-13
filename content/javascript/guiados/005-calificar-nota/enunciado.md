Escribe la función `calificar(nota)` que reciba una nota en escala vigesimal (de 0 a 20, como en Perú) y devuelva su calificación como texto.

## Reglas

| Nota | Devuelve |
|---|---|
| menor que 0 o mayor que 20 | `"nota inválida"` |
| de 0 a menos de 11 | `"desaprobado"` |
| de 11 a menos de 14 | `"aprobado"` |
| de 14 a menos de 18 | `"bueno"` |
| de 18 a 20 | `"excelente"` |

- La nota siempre es un número, pero puede tener decimales (por ejemplo, `10.5`).
- Los límites importan: `11` ya es `"aprobado"` y `18` ya es `"excelente"`.

## Ejemplos

```js
calificar(8);     // "desaprobado"
calificar(10.5);  // "desaprobado"
calificar(11);    // "aprobado"
calificar(15);    // "bueno"
calificar(20);    // "excelente"
calificar(25);    // "nota inválida"
```

## Por qué importa

Convertir un valor en una categoría (un precio en "barato/caro", un puntaje en un nivel, una edad en un rango) es la forma más común de `if/else`. Lo difícil no es la sintaxis, sino los **límites**: ¿el 11 entra o no? Los entrevistadores miran justo eso.
