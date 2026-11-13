Escribe y exporta la función `crearIterador(lista)`, que recibe un arreglo y devuelve un **iterador**: un objeto con un método `siguiente()` que entrega los elementos **uno por uno**, cada vez que lo llamas.

## Reglas

- Cada llamada a `siguiente()` devuelve un objeto `{ valor, listo }`:
  - Mientras queden elementos: `{ valor: <el elemento que toca>, listo: false }`.
  - Cuando ya no quedan: `{ valor: undefined, listo: true }`.
- Si sigues llamando `siguiente()` después de terminar, sigue devolviendo `{ valor: undefined, listo: true }`.
- Cada iterador recuerda **su propia posición**: dos iteradores creados por separado no se afectan entre sí.
- No modifiques el arreglo original.

## Ejemplos

```js
const it = crearIterador(["a", "b"]);

it.siguiente();  // { valor: "a", listo: false }
it.siguiente();  // { valor: "b", listo: false }
it.siguiente();  // { valor: undefined, listo: true }
it.siguiente();  // { valor: undefined, listo: true }

crearIterador([]).siguiente();  // { valor: undefined, listo: true }
```

## Por qué importa

Así funciona por dentro el `for...of`: le pide a la colección un iterador y llama a su método (que en JavaScript se llama `next`, y devuelve `{ value, done }`) hasta que `done` es `true`. Construirlo a mano con nombres en español te deja ver el mecanismo sin magia, y es un uso clásico de **closures**, un tema que siempre sale en entrevistas.
