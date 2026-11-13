## Idea clave

Guardas el temporizador pendiente en un **closure**. Cada llamada cancela el temporizador anterior y programa uno nuevo. Solo el último temporizador llega a cumplirse, y eso pasa cuando nadie vuelve a llamar durante `ms` milisegundos.

## Paso a paso

1. **Declara `temporizador`** dentro de `debounce`, pero fuera de la función que vas a devolver. Así todas las llamadas comparten la misma variable.
2. **Devuelve una función** que recibe cualquier cantidad de argumentos con `...args`.
3. **Cancela lo pendiente** con `clearTimeout(temporizador)`. La primera vez `temporizador` es `undefined` y `clearTimeout(undefined)` no hace nada, así que no necesitas un `if`.
4. **Programa la ejecución** con `setTimeout` y guarda su id en `temporizador`.
5. **Dentro del `setTimeout`**, llama a `fn.apply(this, args)`. La flecha del `setTimeout` no tiene `this` propio, así que usa el `this` de la función devuelta: el objeto que la llamó.

```js
export function debounce(fn, ms) {
  let temporizador;

  return function (...args) {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn.apply(this, args), ms);
  };
}
```

## Por qué funciona

Línea de tiempo con `const d = debounce(fn, 30)`:

| Tiempo | Qué pasa | `temporizador` pendiente |
|---|---|---|
| 0 ms | `d(1)`: no hay nada que cancelar, programa `fn(1)` para los 30 ms | id A (vence a los 30) |
| 0 ms | `d(2)`: cancela A, programa `fn(2)` | id B (vence a los 30) |
| 0 ms | `d(3)`: cancela B, programa `fn(3)` | id C (vence a los 30) |
| 30 ms | vence C y se ejecuta `fn(3)` | ninguno |

Y si las llamadas están separadas: `d("a")` a los 0 ms programa para los 30; `d("b")` a los 20 ms cancela eso y programa para los 50. A los 40 ms todavía no pasó nada; a los 50 ms se ejecuta `fn("b")`. Por eso se dice que cada llamada **reinicia** la cuenta.

La variable `temporizador` sigue viva entre llamadas porque la función devuelta la "recuerda": eso es un closure. Cada `debounce(...)` que crees tiene su propio `temporizador`, así que dos buscadores distintos no se pisan.

## Errores comunes

- **Declarar `temporizador` dentro de la función devuelta.** Cada llamada tendría su propia variable nueva y nunca cancelarías el temporizador anterior: se ejecutan todas. Lo reconoces porque el test de la ráfaga recibe 3 llamadas en vez de 1.
- **Olvidar `clearTimeout`.** Mismo síntoma: `fn` se ejecuta una vez por cada llamada, solo que con retraso.
- **Ejecutar `fn` en vez de pasarla: `setTimeout(fn(...args), ms)`.** Eso llama a `fn` al instante y le pasa su resultado a `setTimeout`. Lo reconoces porque `fn` se ejecuta antes de avanzar el reloj.
- **Usar una flecha como función devuelta: `return (...args) => {...}`.** La flecha no tiene `this` propio y toma el del módulo (`undefined`). Lo reconoces porque el test del `this` falla con "Cannot read properties of undefined".
- **Olvidar el `return` de la función interna.** `debounce` devuelve `undefined` y la primera llamada `d(1)` falla con "d is not a function".

## Otra forma de resolverlo

Con una versión que además permite **cancelar** lo pendiente, algo que piden a veces como pregunta de seguimiento (por ejemplo, al desmontar un componente de React):

```js
export function debounce(fn, ms) {
  let temporizador;

  function conDebounce(...args) {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn.apply(this, args), ms);
  }

  conDebounce.cancelar = () => clearTimeout(temporizador);
  return conDebounce;
}
```

Las funciones son objetos, así que puedes colgarles propiedades como `cancelar`. Conviene cuando el componente que usaba el debounce desaparece y no quieres que se ejecute una búsqueda "huérfana". Librerías como Lodash ofrecen justo eso (`.cancel()` y `.flush()`).

## Cómo explicarlo en la entrevista

> "Guardo el id del temporizador en un closure, fuera de la función que devuelvo. Cada vez que me llaman, cancelo el temporizador anterior con `clearTimeout` y creo uno nuevo, así `fn` solo se ejecuta cuando pasan `ms` milisegundos sin llamadas. Devuelvo una `function` normal y uso `apply` para respetar el `this` y los argumentos originales. Lo uso en buscadores para no mandar una petición por cada tecla. Si me piden ejecutar como máximo cada cierto tiempo mientras el usuario sigue, eso ya no es debounce sino throttle."

## Conceptos

- **Closure**: una función que recuerda las variables del lugar donde fue creada, aunque ese lugar ya terminó.
- **`setTimeout(fn, ms)`**: programa `fn` para dentro de `ms` milisegundos y devuelve un id.
- **`clearTimeout(id)`**: cancela un temporizador pendiente; con un id inválido o `undefined` no hace nada.
- **Parámetros rest `...args`**: juntan todos los argumentos en un arreglo.
- **`fn.apply(this, args)`**: ejecuta `fn` con un `this` concreto y los argumentos en un arreglo.
- **Funciones flecha y `this`**: la flecha usa el `this` del lugar donde se escribió.
- **Debounce vs throttle**: debounce espera a que paren las llamadas; throttle limita la frecuencia mientras siguen.
