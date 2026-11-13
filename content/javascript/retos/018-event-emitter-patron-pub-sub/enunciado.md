Escribe la clase `Emisor`, un **emisor de eventos**: permite que partes del código se suscriban a un evento por su nombre y que otras lo disparen, sin conocerse entre sí.

## Reglas

- `on(evento, fn)`: suscribe la función `fn` al evento. **Devuelve una función** que, al llamarla, cancela esa suscripción.
- `off(evento, fn)`: quita la función `fn` de ese evento. Las demás suscripciones siguen.
- `emit(evento, ...args)`: llama a **todas** las funciones suscritas a ese evento, en el orden en que se suscribieron, pasándoles todos los argumentos.
- Emitir un evento sin suscriptores no hace nada (no lanza error).
- Cada evento tiene su propia lista: emitir `"voto"` no llama a las suscritas a `"comentario"`.
- Cada `new Emisor()` es independiente.

## Ejemplos

```js
const e = new Emisor();
const recibidos = [];

const quitar = e.on("voto", (corto) => recibidos.push(corto));
e.emit("voto", "Drama");     // recibidos: ["Drama"]
quitar();
e.emit("voto", "Terror");    // nadie escucha: recibidos sigue igual

e.on("puntaje", (corto, nota) => console.log(corto, nota));
e.emit("puntaje", "Drama", 9);   // imprime: Drama 9
```

## Por qué importa

Es el patrón detrás de `addEventListener` en el DOM, de los eventos de Node.js y de muchas librerías de estado. Que `on` devuelva una función para desuscribirse es exactamente lo que haces en la limpieza de un `useEffect` en React. En entrevistas lo piden para ver si sabes organizar datos con objetos y arreglos y si piensas en la limpieza.
