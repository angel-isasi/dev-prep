Escribe la función `once(fn)` que reciba una función y devuelva una **nueva versión que solo se ejecuta la primera vez**. Las llamadas siguientes no vuelven a ejecutar `fn`: devuelven el mismo resultado de la primera.

## Reglas

- La primera llamada ejecuta `fn` con sus argumentos y devuelve el resultado.
- Las siguientes llamadas **no** ejecutan `fn` y devuelven el resultado guardado, aunque les pases otros argumentos.
- Aunque `fn` devuelva `undefined`, igual se ejecuta una sola vez.
- Cada `once(...)` es independiente.

## Ejemplos

```js
let n = 0;
const iniciar = once(() => ++n);

iniciar();   // 1
iniciar();   // 1 (no se ejecuta otra vez)
iniciar();   // 1
n;           // 1

const saludar = once((nombre) => `Hola, ${nombre}`);
saludar("Ana");    // "Hola, Ana"
saludar("Luis");   // "Hola, Ana" (se ignoran los nuevos argumentos)
```

## Por qué importa

Sirve para inicializaciones que no deben repetirse: conectar a un servicio, cargar una librería, registrar un evento de analítica o evitar que un botón "Pagar" procese dos veces. En entrevistas es un calentamiento típico de closures antes de pedirte `memoize` o `debounce`.
