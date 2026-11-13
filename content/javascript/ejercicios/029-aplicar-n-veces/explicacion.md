## Idea clave

El resultado de una vuelta es la entrada de la siguiente. Guardas el valor en una variable y, en cada vuelta del bucle, la reemplazas por `fn` aplicada sobre ella. Después de `veces` vueltas, esa variable tiene el resultado final.

## Paso a paso

1. **Crea la variable que va cambiando**: `let resultado = valor`.
2. **Repite `veces` veces** con un `for` que va de `0` mientras `i < veces`.
3. **En cada vuelta**, reemplaza: `resultado = fn(resultado)`.
4. **Devuelve** `resultado`.

```js
export function aplicarVeces(fn, veces, valor) {
  let resultado = valor;

  for (let i = 0; i < veces; i++) {
    resultado = fn(resultado);
  }

  return resultado;
}
```

## Por qué funciona

Recorrido con `aplicarVeces((n) => n * 2, 3, 1)`:

| Vuelta | `i` | `resultado` que entra | `fn(resultado)` |
|---|---|---|---|
| antes del bucle | | | `1` (el valor inicial) |
| 1 | `0` | `1` | `2` |
| 2 | `1` | `2` | `4` |
| 3 | `2` | `4` | `8` |
| sale | `3` | `3 < 3` es falso | devuelve `8` |

El bucle con `i = 0` y `i < veces` da **exactamente** `veces` vueltas: con `veces = 3`, los valores de `i` son 0, 1 y 2.

Con `veces = 0`, la condición `0 < 0` es falsa desde el inicio: el bucle no da ninguna vuelta, `fn` no se llama y devuelves `valor` sin tocar. Por eso no necesitas un `if` especial para ese caso.

## Errores comunes

- **No reasignar: `fn(resultado)` sin `resultado = ...`.** El valor nunca cambia. Recibes `1` en vez de `8`.
- **Aplicar `fn` siempre sobre el valor original: `resultado = fn(valor)`.** Cada vuelta empieza de cero y solo cuenta la última. Recibes `2` en vez de `8`, y `"hola!"` en vez de `"hola!!"`.
- **Usar `i <= veces`.** Das una vuelta de más: recibes `16` en vez de `8`, y con `veces = 0` igual se aplica una vez (`"hola!"` en vez de `"hola"`).
- **Empezar con `let resultado;` sin valor.** La primera vuelta hace `fn(undefined)`: `undefined * 2` es `NaN`.
- **Declarar `const resultado`.** Al reasignar, JavaScript lanza "TypeError: Assignment to constant variable.".

## Otra forma de resolverlo

Con **recursión**: una función que se llama a sí misma con un problema más pequeño.

```js
export function aplicarVeces(fn, veces, valor) {
  if (veces === 0) return valor;
  return aplicarVeces(fn, veces - 1, fn(valor));
}
```

La idea: aplicar `fn` 3 veces sobre `1` es lo mismo que aplicarla 2 veces sobre `fn(1)`. Cada llamada baja `veces` en 1, hasta llegar al **caso base** `veces === 0`, donde se devuelve el valor acumulado.

**¿Cuál conviene?** El bucle es más simple, más rápido y no tiene límite. La recursión es elegante y te la pueden pedir para ver si la entiendes, pero con números muy grandes (por ejemplo `veces = 100000`) puede reventar con "Maximum call stack size exceeded". Para el día a día, usa el bucle.

## Cómo explicarlo en la entrevista

> "Guardo el valor en una variable y uso un bucle que da exactamente `veces` vueltas. En cada vuelta reemplazo la variable por el resultado de aplicarle `fn`, así la salida de una vuelta es la entrada de la siguiente. Si `veces` es 0, el bucle no corre y devuelvo el valor original sin casos especiales. También se puede hacer recursivo, bajando `veces` en 1 hasta llegar a 0, pero el bucle evita el riesgo de desbordar la pila."

## Conceptos

- **Encadenar resultados**: usar la salida de un paso como entrada del siguiente.
- **`for` con `i < veces`**: da exactamente `veces` vueltas empezando en 0.
- **Reasignación con `let`**: actualizar una variable en cada vuelta.
- **Recursión**: una función que se llama a sí misma con un caso más pequeño hasta llegar al caso base.
- **Caso base**: la condición que detiene la recursión.
- **Pila de llamadas (call stack)**: donde JavaScript guarda las llamadas pendientes; tiene un límite.
