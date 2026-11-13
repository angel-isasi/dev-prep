Escribe la función `memoize(fn)` que reciba una función y devuelva una **nueva versión** que recuerda sus resultados: si la llamas otra vez con los **mismos argumentos**, devuelve el resultado guardado sin volver a ejecutar `fn`.

## Reglas

- La primera vez que llega una combinación de argumentos, ejecuta `fn`, guarda el resultado y lo devuelve.
- Las siguientes veces con los mismos argumentos, devuelve lo guardado **sin llamar a `fn`**.
- Debe funcionar con funciones de **varios argumentos**: `(2, 3)` y `(3, 2)` son combinaciones distintas.
- También debe recordar resultados "falsy" como `0`, `""` o `undefined`.
- Cada función memoizada tiene **su propia** caché.
- Los argumentos serán números, textos o booleanos.

## Ejemplos

```js
let veces = 0;
const cuadrado = memoize((n) => {
  veces++;
  return n * n;
});

cuadrado(4);   // 16  (calcula)
cuadrado(4);   // 16  (lo saca de la caché)
veces;         // 1

const sumar = memoize((a, b) => a + b);
sumar(2, 3);   // 5
sumar(3, 2);   // 5, pero es otra combinación: vuelve a calcular
```

## Por qué importa

Memoizar es cambiar memoria por velocidad: es la base de `useMemo` y `React.memo` en React, de las cachés de peticiones y de la programación dinámica en algoritmos. En entrevistas lo piden para ver si sabes usar un closure con un `Map` y si conoces los límites de la técnica.
