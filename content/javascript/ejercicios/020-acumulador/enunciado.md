Escribe la función `crearAcumulador()` que devuelva una función `sumar(n)`. Cada vez que llamas a `sumar`, le suma `n` a un total interno y **devuelve el total actualizado**.

El total empieza en `0` y nadie de afuera puede leerlo ni cambiarlo directamente: solo a través de la función.

## Reglas

- No uses variables globales (fuera de `crearAcumulador`) para guardar el total.
- Cada llamada a `crearAcumulador()` crea un acumulador **nuevo** que empieza en `0` y no comparte el total con otros.
- `n` puede ser negativo.

## Ejemplos

```js
const sumar = crearAcumulador();
sumar(10);               // 10
sumar(5);                // 15
sumar(-3);               // 12

crearAcumulador()(1);    // 1  (un acumulador nuevo empieza en 0)
```

## Por qué importa

Es el patrón base del **estado privado** con closures: una variable que sobrevive entre llamadas y que solo una función puede tocar. Es la misma idea que hay detrás de `useState` en React y de muchas preguntas de entrevista ("haz un contador sin usar variables globales").
