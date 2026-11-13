Escribe la función `rango(inicio, fin, paso)` que devuelva un arreglo con los números desde `inicio` hasta `fin` (**incluido**), avanzando de `paso` en `paso`.

## Reglas

- `paso` es **opcional**: si no lo pasan, vale `1`.
- `fin` está incluido solo si "cae" en la secuencia. `rango(0, 10, 4)` da `[0, 4, 8]`, porque el siguiente sería `12` y ya se pasa.
- Si `inicio` es mayor que `fin`, devuelve `[]`.
- `paso` siempre es un número positivo (no tienes que manejar `0` ni negativos).

## Ejemplos

```js
rango(1, 10, 3);   // [1, 4, 7, 10]
rango(1, 3);       // [1, 2, 3]
rango(0, 10, 4);   // [0, 4, 8]
rango(5, 5);       // [5]
rango(5, 1);       // []
```

## Por qué importa

Generar secuencias aparece en paginación (`[1, 2, 3, 4, 5]` para los botones de página), en calendarios y en datos de prueba. Además practicas los **parámetros por defecto**, que usarás todo el tiempo en funciones y componentes de React.
