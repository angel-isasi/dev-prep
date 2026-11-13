Escribe la función `throttle(fn, ms)` que reciba una función y un intervalo en milisegundos, y devuelva una **nueva función** que ejecuta `fn` **como máximo una vez cada `ms` milisegundos**.

## Reglas

- La primera llamada se ejecuta **al instante**.
- Las llamadas que lleguen antes de que pasen `ms` milisegundos desde la última ejecución se **ignoran** (no se guardan para después).
- Cuando ya pasaron `ms` milisegundos o más, la siguiente llamada vuelve a ejecutarse al instante.
- `fn` recibe los argumentos de la llamada que se ejecuta y el mismo `this`.
- Usa `Date.now()` para saber cuánto tiempo pasó.

## Ejemplos

```js
const registrar = throttle((x) => console.log(x), 50);

registrar(1);   // imprime 1 (primera llamada, al instante)
registrar(2);   // ignorada: no pasaron 50 ms
registrar(3);   // ignorada
// ... 60 ms después ...
registrar(4);   // imprime 4
```

## Por qué importa

Eventos como `scroll`, `resize` o `mousemove` se disparan decenas de veces por segundo. Con throttle limitas cuántas veces reaccionas (por ejemplo, para cargar más resultados al llegar al final de la página). En entrevistas casi siempre lo piden junto con debounce, para ver si entiendes la diferencia.
