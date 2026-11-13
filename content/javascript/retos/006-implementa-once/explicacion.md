## Idea clave

Un closure guarda dos datos: una **bandera** que dice si ya se ejecutó y el **resultado** de esa primera vez. La función devuelta solo llama a `fn` si la bandera está apagada; en todos los casos devuelve el resultado guardado.

## Paso a paso

1. **Crea la bandera** `let hecho = false` y la variable `let resultado` dentro de `once`.
2. **Devuelve una `function (...args)`** para recibir los argumentos y respetar el `this`.
3. **Si no se ejecutó todavía**, prende la bandera y guarda `fn.apply(this, args)` en `resultado`.
4. **Devuelve `resultado`** siempre, haya ejecutado o no.

```js
export function once(fn) {
  let hecho = false;
  let resultado;

  return function (...args) {
    if (!hecho) {
      hecho = true;
      resultado = fn.apply(this, args);
    }
    return resultado;
  };
}
```

## Por qué funciona

Recorrido con ``const saludar = once((nombre) => `Hola, ${nombre}`)``:

| Llamada | `hecho` antes | ¿Ejecuta `fn`? | `resultado` | Devuelve |
|---|---|---|---|---|
| `saludar("Ana")` | `false` | sí | `"Hola, Ana"` | `"Hola, Ana"` |
| `saludar("Luis")` | `true` | no | `"Hola, Ana"` | `"Hola, Ana"` |

La bandera es independiente del resultado. Por eso funciona aunque `fn` devuelva `undefined`, `0` o `false`: lo que decide si se ejecuta es `hecho`, no el valor guardado.

Prender la bandera **antes** de llamar a `fn` tiene una ventaja: si `fn` se llamara a sí misma (directa o indirectamente), la segunda llamada ya vería `hecho = true` y no entraría en un bucle infinito.

## Errores comunes

- **Usar el resultado como bandera: `if (resultado === undefined)`.** Si `fn` devuelve `undefined`, se ejecuta en cada llamada. Lo reconoces porque el test de `undefined` recibe 2 llamadas.
- **Usar `if (!resultado)`.** Peor todavía: también falla con `0`, `""` o `false`.
- **Declarar `hecho` dentro de la función devuelta.** Se reinicia en cada llamada y `fn` se ejecuta siempre: `n` termina en 3.
- **Olvidar el `return resultado` fuera del `if`.** Las llamadas siguientes devuelven `undefined`. Lo reconoces porque `saludar("Luis")` da `undefined`.

## Otra forma de resolverlo

Soltando la referencia a `fn` después de usarla, para que el recolector de basura pueda liberarla:

```js
export function once(fn) {
  let resultado;

  return function (...args) {
    if (fn) {
      resultado = fn.apply(this, args);
      fn = null;
    }
    return resultado;
  };
}
```

Aquí la propia `fn` hace de bandera: después de la primera ejecución vale `null`. Conviene cuando `fn` guarda datos pesados en su propio closure, porque al soltarla esa memoria se libera. La versión con `hecho` es más explícita y más fácil de leer en voz alta.

## Cómo explicarlo en la entrevista

> "Guardo en un closure una bandera que dice si ya se ejecutó y el resultado de esa primera vez. Si la bandera está apagada, la prendo, ejecuto `fn` con `apply` para respetar el `this` y los argumentos, y guardo lo que devuelve. Después siempre devuelvo ese resultado. Uso una bandera separada para que funcione aunque `fn` devuelva `undefined`. Lo usaría para inicializaciones, como conectar a un servicio una sola vez aunque varios componentes lo pidan, o para evitar un doble clic en un botón de pago."

## Conceptos

- **Closure**: `hecho` y `resultado` sobreviven entre llamadas porque la función devuelta los recuerda.
- **Bandera (flag)**: variable booleana que marca si algo ya ocurrió.
- **Valores falsy**: `false`, `0`, `""`, `null`, `undefined` y `NaN`; no sirven como "no hay dato" si la función puede devolverlos.
- **`fn.apply(this, args)`**: ejecuta `fn` con un `this` concreto y un arreglo de argumentos.
- **Funciones de orden superior**: funciones que reciben o devuelven otras funciones.
