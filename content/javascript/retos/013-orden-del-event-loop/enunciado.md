Predice **en qué orden** se registran los mensajes en cada fragmento. En cada uno, `registrar(texto)` agrega el texto al final de una lista. Exporta cuatro constantes, `prediccion1` a `prediccion4`, cada una con el arreglo de textos en el orden en que crees que quedan.

Los tests ejecutan estos mismos fragmentos de verdad y comparan con tu predicción. **Piénsalo antes de ejecutar nada**: el objetivo es que puedas hacerlo de cabeza en una entrevista.

**Fragmento 1**

```js
registrar("1 síncrono");
setTimeout(() => registrar("macrotarea (setTimeout)"), 0);
Promise.resolve().then(() => registrar("microtarea (promesa)"));
registrar("2 síncrono");
```

**Fragmento 2**

```js
async function tarea() {
  registrar("B");
  await null;
  registrar("D");
}
registrar("A");
tarea();
registrar("C");
```

**Fragmento 3**

```js
registrar("A");
new Promise((resolver) => {
  registrar("B");
  resolver();
}).then(() => registrar("D"));
registrar("C");
```

**Fragmento 4**

```js
setTimeout(() => {
  registrar("T1");
  Promise.resolve().then(() => registrar("M dentro de T1"));
}, 0);
setTimeout(() => registrar("T2"), 0);
Promise.resolve().then(() => registrar("M1"));
```

## Reglas

- Cada predicción es un arreglo con **todos** los textos del fragmento, exactamente como están escritos.
- Recuerda el orden del event loop: primero todo el código síncrono, luego **todas** las microtareas (`.then`, lo que viene después de un `await`) y recién después **una** macrotarea (`setTimeout`). Después de cada macrotarea se vuelven a vaciar las microtareas.

## Ejemplos

```js
// Un fragmento que no está en el reto:
setTimeout(() => registrar("X"), 0);
registrar("Y");
// Su predicción sería:
export const prediccionEjemplo = ["Y", "X"];
```

## Por qué importa

"¿Qué imprime este código?" con `setTimeout` y promesas mezclados es una pregunta fija en entrevistas frontend. Entender el event loop también explica problemas reales: por qué la interfaz se congela con un bucle pesado o por qué un dato "todavía no está" justo después de pedirlo.
