## Idea clave

Un debounce funciona porque **todas las llamadas comparten una misma variable** con el id del temporizador pendiente: la llamada nueva la lee y cancela el anterior. Esa variable tiene que estar fuera de la función que se devuelve, en `debounce`, para que el closure la guarde entre llamadas. Declarada adentro, cada llamada crea una variable nueva que vale `undefined`, y `clearTimeout(undefined)` no cancela nada.

## Paso a paso

1. **Lee el síntoma.** Hay una petición por letra: el debounce espera, pero **no cancela**. El problema está en la cancelación, no en la espera.
2. **Reprodúcelo.** Llama tres veces seguidas y avanza el tiempo: `fn` corre tres veces.
3. **Aísla.** Pon `console.log(temporizador)` justo antes del `clearTimeout`: imprime `undefined` en **todas** las llamadas. Nunca llega el id anterior.
4. **Mira dónde está declarada.** `let temporizador` está dentro de `function (...args)`, así que nace y muere con cada llamada.
5. **Muévela afuera.**

```js
export function debounce(fn, ms) {
  let temporizador;
  return function (...args) {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn(...args), ms);
  };
}
```

## Por qué funciona

`debounce(buscar, 300)` se ejecuta **una vez** y crea una sola variable `temporizador`. La función que devuelve la recuerda (closure). Escribiendo "c", "ca" y "casa":

| Llamada | `temporizador` antes | Qué hace |
|---|---|---|
| `"c"` | `undefined` | no cancela nada, programa la búsqueda 1 |
| `"ca"` | id 1 | cancela la 1, programa la 2 |
| `"casa"` | id 2 | cancela la 2, programa la 3 |
| 300 ms después | id 3 | corre `buscar("casa")` |

Con la variable adentro, la columna "antes" sería `undefined` en todas las filas, y las tres búsquedas correrían.

## Errores comunes

- **Usar `var` en vez de `let` dentro de la función.** `var` también es local a la función interna: cada llamada sigue teniendo la suya.
- **Guardar el id en una variable global** (fuera de `debounce`). Funciona con un solo buscador, pero si creas dos funciones con debounce, se cancelan entre ellas.
- **Cambiar `setTimeout` por `setInterval`.** Repite la búsqueda cada 300 ms para siempre; no tiene nada que ver con cancelar.

## Otra forma de resolverlo

Guardar el temporizador como propiedad de la función devuelta. Funciona igual, pero el closure es lo idiomático:

```js
export function debounce(fn, ms) {
  const conEspera = (...args) => {
    clearTimeout(conEspera.temporizador);
    conEspera.temporizador = setTimeout(() => fn(...args), ms);
  };
  return conEspera;
}
```

## Cómo explicarlo en la entrevista

> "El debounce esperaba pero no cancelaba: cada letra disparaba una petición. El `clearTimeout` recibía siempre `undefined`, porque la variable del temporizador estaba declarada dentro de la función devuelta, y cada llamada creaba una nueva. La moví a la función de afuera para que el closure la comparta entre llamadas; así cada llamada cancela el temporizador de la anterior. Un debounce es justo un ejemplo de closure guardando estado privado."

## Conceptos

- **Debounce**: ejecutar una función solo después de que dejen de llamarla durante un tiempo.
- **Closure**: la función devuelta recuerda las variables de `debounce` aunque `debounce` ya terminó.
- **Estado privado**: `temporizador` solo lo ven las llamadas de esa función, nadie más.
- **`setTimeout` y `clearTimeout`**: programar una función y cancelar esa programación con su id.
- **Parámetros rest (`...args`)**: juntan todos los argumentos para pasarlos tal cual a `fn`.
