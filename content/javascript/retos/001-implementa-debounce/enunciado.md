Escribe la función `debounce(fn, ms)` que reciba una función y un tiempo en milisegundos, y devuelva una **nueva función**. Esa nueva función solo ejecuta `fn` cuando pasan `ms` milisegundos **sin que nadie la vuelva a llamar**.

## Reglas

- Si la llamas varias veces seguidas, solo se ejecuta la **última** llamada, `ms` milisegundos después de ella.
- Cada nueva llamada **reinicia** la cuenta: la espera vuelve a empezar desde cero.
- `fn` recibe los argumentos de esa última llamada.
- Si la función devuelta se usa como método de un objeto, `fn` debe recibir el mismo `this`.
- `debounce` no devuelve nada útil al llamar: la ejecución ocurre después, dentro de un `setTimeout`.

## Ejemplos

```js
const buscar = debounce((texto) => console.log("Buscando:", texto), 300);

buscar("j");
buscar("ja");
buscar("jav");
// ... 300 ms sin más llamadas ...
// Imprime una sola vez: "Buscando: jav"

buscar("react");
// 100 ms después, otra llamada reinicia la espera:
buscar("react hooks");
// 300 ms después: "Buscando: react hooks"
```

## Por qué importa

Es el truco que evita que un buscador mande una petición al servidor por cada tecla: espera a que el usuario deje de escribir. Es una de las preguntas de "impleméntalo a mano" más frecuentes en entrevistas frontend, porque junta closures, temporizadores y `this` en pocas líneas.
