Este ejercicio no es de escribir una función: es de **predecir**. Abajo hay 4 fragmentos de código que llaman a `log("X")`. Para cada uno, escribe en tu archivo el arreglo con el **orden en que se imprimen las letras** y expórtalo como `prediccion1`, `prediccion2`, `prediccion3` y `prediccion4`.

Los tests ejecutan de verdad cada fragmento y comparan el orden real con tu predicción. **Hazlo sin ejecutar el código**: razona con lápiz y papel, como en una entrevista.

## Reglas

- Cada predicción es un arreglo de textos, por ejemplo `["A", "B", "C"]`.
- Cada letra aparece una sola vez y todas tienen que estar.
- Para razonar, separa en tres grupos: **código síncrono**, **microtareas** (`.then`, lo que viene después de un `await`) y **macrotareas** (`setTimeout`).

## Los fragmentos

```js
// Fragmento 1
log("A");
setTimeout(() => log("B"), 0);
Promise.resolve().then(() => log("C"));
log("D");
```

```js
// Fragmento 2
async function principal() {
  log("A");
  setTimeout(() => log("B"), 0);
  Promise.resolve().then(() => log("C"));
  await null;
  log("D");
}
principal();
log("E");
```

```js
// Fragmento 3
log("A");
const promesa = new Promise((resolver) => {
  log("B");
  resolver();
  log("C");
});
promesa.then(() => log("D")).then(() => log("E"));
setTimeout(() => log("F"), 0);
Promise.resolve().then(() => log("G"));
log("H");
```

```js
// Fragmento 4
setTimeout(() => {
  log("A");
  Promise.resolve().then(() => log("B"));
}, 0);
setTimeout(() => log("C"), 0);
log("D");
```

## Ejemplo de respuesta

Para este fragmento:

```js
log("X");
setTimeout(() => log("Y"), 0);
log("Z");
```

escribirías:

```js
export const prediccion = ["X", "Z", "Y"];
```

porque `setTimeout`, aunque sea con 0 ms, siempre espera a que termine todo el código síncrono.

## Por qué importa

"¿En qué orden se imprime esto?" es una de las preguntas más comunes en entrevistas de JavaScript. No la hacen por el truco: quieren ver si entiendes el **event loop**, que es lo que explica por qué tu código asíncrono hace lo que hace.
