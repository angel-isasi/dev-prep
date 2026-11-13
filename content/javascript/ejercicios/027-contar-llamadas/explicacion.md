## Idea clave

Las funciones son objetos y pueden tener propiedades. Creas una función `envuelta` que hace dos cosas: aumenta su propia propiedad `veces` y llama a la función original con los mismos argumentos. Por fuera se usa igual que `fn`, pero además lleva la cuenta.

## Paso a paso

1. **Crea la función envoltorio** y guárdala en una constante `envuelta`. Recibe todos los argumentos con `(...args)`.
2. **Dentro, aumenta el contador**: `envuelta.veces++`.
3. **Llama a la original y devuelve su resultado**: `return fn(...args)`.
4. **Fuera, inicializa la propiedad**: `envuelta.veces = 0`. Esto se ejecuta una sola vez, al crearla.
5. **Devuelve** `envuelta`.

```js
export function contarLlamadas(fn) {
  const envuelta = (...args) => {
    envuelta.veces++;
    return fn(...args);
  };

  envuelta.veces = 0;
  return envuelta;
}
```

## Por qué funciona

Recorrido con `const sumar = contarLlamadas((a, b) => a + b)`:

| Momento | Qué pasa | `sumar.veces` | Devuelve |
|---|---|---|---|
| `contarLlamadas(...)` | se crea `envuelta` y se le pone `veces = 0` | `0` | la función `envuelta` |
| `sumar(1, 2)` | `veces++`, luego `fn(1, 2)` | `1` | `3` |
| `sumar(2, 3)` | `veces++`, luego `fn(2, 3)` | `2` | `5` |

**¿Cómo puede `envuelta` usarse a sí misma por dentro?** El cuerpo de la función no se ejecuta cuando la creas, sino cuando la llamas. Para entonces, la constante `envuelta` ya existe y ya tiene `veces = 0`. Además, el nombre `envuelta` queda recordado por el closure.

**¿Por qué cada función tiene su cuenta?** Cada llamada a `contarLlamadas` crea una función nueva, y cada función es un objeto distinto con su propia propiedad `veces`. `doble.veces` y `triple.veces` son propiedades de objetos diferentes.

A diferencia de los ejercicios con estado privado, aquí el contador es **público** a propósito: la idea es que quien usa la función pueda leer `veces`.

## Errores comunes

- **Inicializar `veces` dentro de la función envuelta.** Se reinicia en cada llamada y siempre queda en 1. Lo reconoces porque recibes `1` en vez de `2`, y el test "la cuenta empieza en 0" recibe `undefined`.
- **No devolver el resultado de `fn`: `fn(...args);` sin `return`.** Cuenta bien, pero `sumar(2, 3)` devuelve `undefined` en vez de `5`.
- **Usar una variable con `let veces = 0` en vez de la propiedad.** El conteo funciona por dentro, pero `sumar.veces` es `undefined` porque nunca creaste la propiedad. Todos los tests que leen `veces` fallan con "expected undefined to be 2".
- **Usar `this.veces` dentro de la arrow function.** Las arrow functions no tienen su propio `this`; no apunta a la función. Obtienes `NaN` o un error.
- **No reenviar los argumentos: `fn()`.** La suma recibe `undefined + undefined` y devuelve `NaN`.

## Otra forma de resolverlo

Llevar la cuenta en el closure y exponerla con un **getter**, para que se pueda leer pero no modificar desde afuera:

```js
export function contarLlamadas(fn) {
  let veces = 0;
  const envuelta = (...args) => {
    veces++;
    return fn(...args);
  };
  Object.defineProperty(envuelta, "veces", { get: () => veces });
  return envuelta;
}
```

Con `Object.defineProperty` defines la propiedad `veces` con un `get`: cada vez que alguien lee `envuelta.veces`, se ejecuta esa función y devuelve el valor del closure. Si alguien intenta `sumar.veces = 100`, no cambia nada.

**¿Cuál conviene?** La primera es la directa y la que se espera en una entrevista junior. La del getter es más robusta porque nadie puede falsear la cuenta; mencionarla muestra que conoces la diferencia entre estado público y privado.

## Cómo explicarlo en la entrevista

> "Aprovecho que en JavaScript las funciones son objetos. Creo una función envoltorio que recibe cualquier cantidad de argumentos, aumenta su propia propiedad `veces` y llama a la original con esos mismos argumentos, devolviendo su resultado. Fuera de ella inicializo `veces` en 0 y la devuelvo. Es el mismo principio que usan los espías de los frameworks de tests, como `vi.fn()`, para saber cuántas veces se llamó una función."

## Conceptos

- **Funciones como objetos**: una función puede tener propiedades (`fn.veces`, `fn.name`, `fn.length`).
- **Wrapper (envoltorio)**: una función que llama a otra y le agrega comportamiento, sin modificarla.
- **Rest y spread (`...args`)**: recibir todos los argumentos y reenviarlos tal cual.
- **Closure**: la función envuelta recuerda `fn` y su propio nombre `envuelta`.
- **Arrow functions y `this`**: las arrow functions no tienen `this` propio.
- **Getter con `Object.defineProperty`**: propiedad que se calcula al leerla y no se puede sobrescribir si no defines un `set`.
