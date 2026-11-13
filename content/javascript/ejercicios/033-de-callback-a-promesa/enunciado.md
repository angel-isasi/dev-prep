Muchas funciones antiguas (sobre todo en Node) no devuelven promesas: reciben como **último argumento** un callback con la forma `(error, dato)`. Escribe `promisificar(fn)` que reciba una de esas funciones y devuelva una **nueva función** que haga lo mismo pero devuelva una promesa.

## Reglas

- `promisificar(fn)` devuelve una función. Esa función recibe los mismos argumentos que `fn`, **sin** el callback.
- Al llamarla, ejecuta `fn` con esos argumentos y agrega al final un callback tuyo.
- Si el callback recibe un `error` (el primer argumento trae un `Error`), la promesa se **rechaza** con ese error.
- Si no hay error (el primer argumento es `null`), la promesa se **cumple** con `dato`.
- Debe funcionar con cualquier cantidad de argumentos.

## Ejemplos

```js
// Una función al estilo callback: avisa con cb(error, dato)
function leer(nombre, cb) {
  setTimeout(() => {
    if (!nombre) cb(new Error("sin nombre"));
    else cb(null, `contenido de ${nombre}`);
  }, 5);
}

const leerAsync = promisificar(leer);

await leerAsync("notas.txt");    // "contenido de notas.txt"

try {
  await leerAsync("");
} catch (e) {
  e.message;                     // "sin nombre"
}

// Con varios argumentos
const sumar = (a, b, cb) => cb(null, a + b);
await promisificar(sumar)(2, 3); // 5
```

## Por qué importa

Todavía vas a encontrar librerías y código viejo con callbacks. Convertirlos a promesas te permite usar `await` y manejar errores con `try/catch`. Node trae `util.promisify`, que hace justo esto; en entrevistas a veces piden escribirlo a mano para ver si entiendes `resolve`, `reject` y los parámetros rest.
