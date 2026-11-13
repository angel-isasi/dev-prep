Escribe y exporta dos funciones:

- `fibonacci()`: una **función generadora** que produce la sucesión de Fibonacci **sin fin**: `0, 1, 1, 2, 3, 5, 8, 13, ...`. Cada número es la suma de los dos anteriores.
- `tomar(iterable, cantidad)`: recorre cualquier iterable (un generador, un arreglo...) y devuelve un arreglo con sus primeros `cantidad` valores.

## Reglas

**`fibonacci()`**

- Los dos primeros valores son `0` y `1`. Desde ahí, cada valor es la suma de los dos anteriores.
- Es infinita: nunca termina por sí sola. Solo calcula un número cuando alguien se lo pide.
- Al llamar `fibonacci()` obtienes un generador; con `.next()` le pides el siguiente valor: `{ value: 0, done: false }`, luego `{ value: 1, done: false }`, etc.

**`tomar(iterable, cantidad)`**

- Devuelve un arreglo con los primeros `cantidad` valores, en orden.
- Si `cantidad` es `0`, devuelve `[]`.
- Si el iterable tiene menos valores que `cantidad`, devuelve todos los que tenga.
- Debe dejar de pedir valores apenas tenga los que necesita (si no, con `fibonacci()` nunca terminaría).

## Ejemplos

```js
tomar(fibonacci(), 8);       // [0, 1, 1, 2, 3, 5, 8, 13]
tomar(fibonacci(), 0);       // []
tomar([10, 20, 30], 2);      // [10, 20]
tomar([10, 20], 5);          // [10, 20]

const gen = fibonacci();
gen.next();                  // { value: 0, done: false }
gen.next();                  // { value: 1, done: false }
gen.next();                  // { value: 1, done: false }
```

## Por qué importa

Los generadores producen valores **bajo demanda**: puedes representar una lista infinita sin llenar la memoria, o leer un archivo enorme por partes. Fibonacci es el ejemplo clásico para mostrarlo, y `tomar` te obliga a entender cómo `for...of` le pide valores a un generador y cómo cortarlo con `break`.
