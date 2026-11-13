Escribe la función `limitar(fn, max)` que devuelva una función nueva que solo puede ejecutar `fn` **como máximo `max` veces**. Después de eso, ya no llama a `fn`: devuelve el **último resultado** que obtuvo.

## Reglas

- Las primeras `max` llamadas ejecutan `fn` con los argumentos recibidos y devuelven su resultado.
- Desde la llamada `max + 1`, no se ejecuta `fn` y se devuelve el último resultado guardado.
- Cada función creada con `limitar` lleva su propia cuenta.

## Ejemplos

```js
let votos = 0;
const votar = limitar(() => ++votos, 1);
votar();   // 1
votar();   // 1  (no vuelve a votar, devuelve el último resultado)
votar();   // 1
votos;     // 1

const saludar = limitar((nombre) => `Hola, ${nombre}`, 2);
saludar("Ana");    // "Hola, Ana"
saludar("Luis");   // "Hola, Luis"
saludar("Rosa");   // "Hola, Luis"  (ya se usó 2 veces)
```

## Por qué importa

Con `max = 1` esto es la famosa función `once`, que aparece mucho en entrevistas: evitar que un botón de "Pagar" cobre dos veces, inicializar algo una sola vez, registrar un evento solo la primera vez. Aquí la generalizas a N usos.
