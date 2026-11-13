Escribe la función `promiseAll(promesas)` que se comporte como `Promise.all`: recibe un arreglo de promesas (o valores normales) y devuelve **una sola promesa** que se cumple con todos los resultados, o se rechaza en cuanto una falle.

## Reglas

- Devuelve siempre una promesa.
- Se cumple con un arreglo de resultados **en el mismo orden del arreglo de entrada**, no en el orden en que terminaron.
- Los elementos que no son promesas (como `2`) se tratan como promesas ya cumplidas con ese valor.
- Si alguna se rechaza, la promesa devuelta se rechaza **de inmediato** con ese mismo error, sin esperar a las demás.
- Con un arreglo vacío, se cumple con `[]`.
- No uses `Promise.all`, `Promise.allSettled` ni similares: el reto es hacerlo a mano.

## Ejemplos

```js
const lenta = new Promise((r) => setTimeout(() => r("lenta"), 20));

await promiseAll([lenta, 2, Promise.resolve(3)]);   // ["lenta", 2, 3]
await promiseAll([]);                                // []

await promiseAll([1, Promise.reject(new Error("falló"))]);
// se rechaza con el error "falló"
```

## Por qué importa

`Promise.all` es lo que usas para cargar varias cosas a la vez (el perfil, los pedidos y las notificaciones de un usuario) y esperar a que todas lleguen. Implementarlo es una pregunta clásica de nivel alto: muestra si entiendes cómo se crea una promesa, cómo se combina asincronía y por qué el orden de los resultados no depende de quién termina primero.
