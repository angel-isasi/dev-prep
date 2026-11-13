## Idea clave

En JavaScript una función puede **devolver otra función**. Y la función devuelta **recuerda** las variables del lugar donde fue creada, aunque esa función externa ya haya terminado. Eso es un **closure** (en español, "clausura"): la función interna se lleva consigo el `factor`.

## Paso a paso

1. **Recibe el `factor`** como parámetro de `crearMultiplicador`.
2. **Devuelve una función nueva** que recibe `n`.
3. **Dentro de esa función usa `factor`**: como fue escrita dentro de `crearMultiplicador`, tiene acceso a sus variables.
4. Quien llame a `crearMultiplicador(3)` recibe esa función y puede usarla cuando quiera.

```js
export function crearMultiplicador(factor) {
  return (n) => n * factor;
}
```

## Por qué funciona

Sigue lo que pasa con este código:

```js
const doble = crearMultiplicador(2);
const triple = crearMultiplicador(3);
doble(5);
triple(5);
```

| Paso | Qué pasa | `factor` que ve la función |
|---|---|---|
| `crearMultiplicador(2)` | se crea un `factor = 2` y una función que lo usa; `crearMultiplicador` termina | `doble` guarda el suyo: `2` |
| `crearMultiplicador(3)` | se crea **otro** `factor = 3` y otra función | `triple` guarda el suyo: `3` |
| `doble(5)` | `5 * factor` con su `factor` | `5 * 2 = 10` |
| `triple(5)` | `5 * factor` con su `factor` | `5 * 3 = 15` |

**¿Qué variable queda recordada?** El parámetro `factor`. **¿Por qué sobrevive?** Normalmente, cuando una función termina, sus variables se descartan. Pero aquí la función interna todavía las usa, y como alguien guardó esa función en `triple`, JavaScript mantiene vivo ese `factor` mientras `triple` exista.

Cada llamada a `crearMultiplicador` crea su propio `factor`, por eso `doble` y `triple` no se mezclan.

## Errores comunes

- **Multiplicar en vez de devolver una función: `return factor * n`.** Dentro de `crearMultiplicador` no existe `n` y JavaScript lanza "ReferenceError: n is not defined". Todos los tests fallan con ese mensaje.
- **Recibir los dos números en la misma función: `crearMultiplicador(factor, n)`.** Al llamar `crearMultiplicador(3)`, `n` es `undefined` y obtienes `NaN`, no una función. El test "devuelve una función" falla: recibe `"number"` en vez de `"function"`.
- **Olvidar el `return` antes de la arrow function.** La función se crea pero no se devuelve: `triple` es `undefined` y el test falla con "triple is not a function".
- **Usar llaves en la arrow function sin `return`: `(n) => { n * factor }`.** Con llaves, la arrow function ya no devuelve sola: devuelve `undefined`. Recibes `undefined` en vez de `15`.
- **Guardar el factor en una variable global.** Si haces `let factorActual` afuera y lo pisas en cada llamada, `doble` empieza a multiplicar por 3 después de crear `triple`. Lo reconoces en el test "cada función fabricada recuerda su propio factor".

## Otra forma de resolverlo

Con `function` normal en vez de arrow function, o todo en una línea como arrow function:

```js
// Con function: más explícito
export function crearMultiplicador(factor) {
  return function (n) {
    return n * factor;
  };
}

// Todo con arrows: más corto
export const crearMultiplicador = (factor) => (n) => n * factor;
```

La versión con `function` deja muy claro que hay **dos** funciones, una dentro de otra. La de doble flecha se lee "recibe `factor` y devuelve una función que recibe `n`".

**¿Cuál conviene?** Para aprender y para explicar en una entrevista, la de `function` es la más clara. La de doble flecha es la que verás en código real y en React (por ejemplo, `onClick={() => borrar(id)}` usa la misma idea).

## Cómo explicarlo en la entrevista

> "`crearMultiplicador` es una fábrica de funciones: no multiplica, devuelve una función nueva. Esa función interna usa `factor`, que es una variable de la función externa. Gracias al closure, aunque `crearMultiplicador` ya terminó, la función devuelta sigue teniendo acceso a su `factor`. Y como cada llamada crea su propio `factor`, `doble` y `triple` son independientes."

## Conceptos

- **Closure**: una función que recuerda las variables del lugar donde fue creada, aunque ese lugar ya terminó de ejecutarse.
- **Fábrica de funciones**: una función cuyo trabajo es crear y devolver otras funciones.
- **Funciones como valores**: en JavaScript puedes guardar una función en una variable, pasarla o devolverla.
- **Arrow function**: `(n) => n * factor` devuelve el resultado sin escribir `return` si no usas llaves.
- **Scope (alcance)**: las funciones internas pueden ver las variables de las funciones que las contienen, pero no al revés.
