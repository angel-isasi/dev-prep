## Idea clave

Una promesa tiene dos caminos: `resolver` (todo salió bien) y `rechazar` (hubo un error). Un callback `(error, dato)` también tiene dos caminos. Promisificar es **conectar uno con otro**: tu callback recibe `(error, dato)` y, según lo que llegue, llama a `rechazar(error)` o a `resolver(dato)`.

## Paso a paso

1. **`promisificar(fn)` devuelve una función**, no una promesa. Esa función todavía no hace nada: espera a que la llames con argumentos.
2. **Esa función recibe cualquier cantidad de argumentos** con el parámetro rest `(...args)`. Por ejemplo, `leerAsync("notas.txt")` hace que `args` sea `["notas.txt"]`.
3. **Cada vez que la llamas, crea una promesa nueva** con `new Promise((resolver, rechazar) => ...)`.
4. **Dentro, llama a la función original** con los mismos argumentos más un callback al final: `fn(...args, callback)`. El spread `...args` "desarma" el arreglo en argumentos sueltos.
5. **El callback decide el camino**: si llegó `error`, `rechazar(error)`; si no, `resolver(dato)`.

```js
export function promisificar(fn) {
  return (...args) =>
    new Promise((resolver, rechazar) => {
      fn(...args, (error, dato) => {
        if (error) rechazar(error);
        else resolver(dato);
      });
    });
}
```

## Por qué funciona

Sigue `leerAsync("notas.txt")` paso a paso:

| Momento | Qué pasa |
|---|---|
| al crear | `promisificar(leer)` devuelve la flecha `(...args) => ...`. Esa flecha **recuerda** `fn = leer` gracias al closure. |
| t = 0 ms | `leerAsync("notas.txt")`: `args = ["notas.txt"]`. Se crea la promesa (pendiente). |
| t = 0 ms | Se ejecuta `leer("notas.txt", callback)`. `leer` programa su temporizador y termina. La promesa sigue pendiente. |
| t = 5 ms | `leer` llama a `callback(null, "contenido de notas.txt")`. Como `error` es `null`, se llama `resolver(dato)`. |
| t = 5 ms | La promesa se cumple y el `await` continúa con `"contenido de notas.txt"`. |

Con `leerAsync("")`, a los 5 ms `leer` llama a `callback(new Error("sin nombre"))`. Ahora `error` existe, así que se llama `rechazar(error)`, y el `await` lanza ese error (lo atrapas con `try/catch` o con `.catch`).

Fíjate que `resolver` y `rechazar` se pueden llamar **más tarde**, desde otro callback: no tienen que llamarse dentro del executor en ese mismo instante. Eso es justo lo que permite conectar el mundo de callbacks con el de promesas.

## Errores comunes

- **Devolver la promesa en vez de una función: `return new Promise(...)` directamente en `promisificar`.** No tienes los argumentos todavía. Lo reconoces porque el test "devuelve una función" falla con "expected 'object' to be 'function'".
- **Olvidar el spread al llamar: `fn(args, callback)`.** `leer` recibe un arreglo `["notas.txt"]` como nombre en vez del texto. Lo reconoces porque recibes "contenido de notas.txt" bien por casualidad (el arreglo se convierte a texto), pero con varios argumentos falla: `sumar(a, b, c, cb)` recibe `([1, 2, 3], callback)`, así que `a` es el arreglo, `b` es tu callback y `cb` queda `undefined`. Al final revienta con "cb is not a function".
- **Poner el callback al principio: `fn(callback, ...args)`.** La convención es que el callback va **al final**. La función original confunde los argumentos y nada funciona.
- **Resolver siempre: `(error, dato) => resolver(dato)`.** Los errores se pierden y la promesa se cumple con `undefined`. Lo reconoces porque el test de rechazo falla con "promise resolved instead of rejecting".
- **Usar `throw error` dentro del callback.** El callback corre más tarde, fuera del executor, así que el `throw` no rechaza la promesa: se convierte en un error no atrapado que puede tumbar el programa. Para rechazar desde un callback usa siempre `rechazar`.

## Otra forma de resolverlo

Con `function` normales y nombres más explícitos, para ver bien las dos capas:

```js
export function promisificar(fn) {
  return function versionConPromesa(...args) {
    return new Promise((resolver, rechazar) => {
      function alTerminar(error, dato) {
        if (error) {
          rechazar(error);
          return;
        }
        resolver(dato);
      }
      fn.call(this, ...args, alTerminar);
    });
  };
}
```

Usar `function` (y no flecha) para la función devuelta permite pasarle el `this` original con `fn.call(this, ...)`. Eso importa si promisificas un **método** de un objeto, como `cliente.consultar`, que usa `this` por dentro.

En Node no hace falta escribirlo: `import { promisify } from "node:util"` y `const leerAsync = promisify(leer)`.

**¿Cuál conviene?** La versión con flechas es más corta y suficiente para funciones sueltas. La versión con `function` y `this` es más robusta para métodos. En una entrevista, escribe la corta y menciona el caso de `this` como mejora.

## Cómo explicarlo en la entrevista

> "Promisificar es una función de orden superior: recibe una función con callback y devuelve otra que devuelve una promesa. La nueva función recoge los argumentos con rest, crea una promesa y llama a la original pasándole esos argumentos más un callback propio al final. Ese callback sigue la convención error primero: si llega un error, rechazo la promesa; si no, la resuelvo con el dato. Así puedo usar `await` y `try/catch` con código viejo. Node ya trae `util.promisify`, que hace lo mismo."

## Conceptos

- **Callback error primero**: convención de Node, `(error, dato)`; si `error` existe, falló, si no, `dato` trae el resultado.
- **`resolver` / `rechazar`**: las dos funciones que te da `new Promise`; llamas una para cumplir y otra para rechazar.
- **Parámetros rest `(...args)`**: juntan todos los argumentos recibidos en un arreglo.
- **Spread `fn(...args)`**: separa un arreglo en argumentos sueltos al llamar una función.
- **Función de orden superior**: función que recibe o devuelve otras funciones.
- **Closure**: la función devuelta recuerda `fn` aunque `promisificar` ya terminó.
- **`util.promisify`**: la versión oficial de Node de esta misma idea.
