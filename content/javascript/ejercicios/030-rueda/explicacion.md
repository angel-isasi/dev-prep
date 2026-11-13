## Idea clave

Un contador privado `i` que solo crece, y el operador `%` para convertirlo en una posición válida que da la vuelta. `i % valores.length` siempre es un número entre `0` y `valores.length - 1`, así que al pasarse del final vuelve a `0` sola.

## Paso a paso

1. **Junta los valores** en un array con el rest parameter `...valores`. Con `rueda("X", "O")`, `valores` es `["X", "O"]`.
2. **Crea el contador** `let i = 0` dentro de `rueda`.
3. **Devuelve una función** que, en cada llamada:
   - lee el valor en la posición `i % valores.length`,
   - aumenta `i`,
   - devuelve el valor que leyó.

```js
export function rueda(...valores) {
  let i = 0;

  return () => {
    const valor = valores[i % valores.length];
    i++;
    return valor;
  };
}
```

## Por qué funciona

El operador `%` da el **resto** de una división entera. Recorrido con `rueda("verde", "amarillo", "rojo")` (`valores.length` es 3):

| Llamada | `i` | `i % 3` | Devuelve |
|---|---|---|---|
| 1 | `0` | `0` | `"verde"` |
| 2 | `1` | `1` | `"amarillo"` |
| 3 | `2` | `2` | `"rojo"` |
| 4 | `3` | `0` | `"verde"` |
| 5 | `4` | `1` | `"amarillo"` |

Fíjate que el resto de dividir entre 3 solo puede ser 0, 1 o 2: justo los índices válidos del array. Por eso nunca te sales.

Con un solo valor, `i % 1` es siempre `0`, así que siempre devuelve el mismo.

**¿Qué variables quedan recordadas?** `i` y `valores`. **¿Por qué sobreviven?** La función devuelta las usa y está guardada en `turno` (o `semaforo`). Aunque `rueda` ya terminó, JavaScript mantiene vivas esas variables mientras exista la función. Cada llamada a `rueda` crea su propio `i`, por eso dos ruedas no se mezclan.

## Errores comunes

- **No usar `%`: `valores[i]`.** Funciona hasta el final de la lista y después devuelve `undefined`. El primer test recibe `["X", "O", undefined]`.
- **Aumentar antes de leer.** Si haces `i++` primero, la primera llamada devuelve el segundo valor: recibes `["O", "X", "O"]` en vez de `["X", "O", "X"]`.
- **Declarar `i` dentro de la función devuelta.** Se reinicia en cada llamada y siempre devuelves el primer valor: `["X", "X", "X"]`.
- **Olvidar los tres puntos en la firma: `function rueda(valores)`.** Con `rueda("X", "O")`, `valores` sería solo el primer argumento, el texto `"X"`, y recorrerías sus letras: siempre `"X"`. El primer test recibe `["X", "X", "X"]`. Los `...` son los que juntan todos los argumentos en un array.
- **Restar mal el índice: `valores[i % valores.length - 1]`.** El `%` se calcula antes que la resta, así que cuando el resto es 0 pides `valores[-1]`, que es `undefined`.

## Otra forma de resolverlo

Reiniciar el índice manualmente con un `if`, en vez de dejarlo crecer:

```js
export function rueda(...valores) {
  let i = 0;
  return () => {
    const valor = valores[i];
    i++;
    if (i === valores.length) i = 0;
    return valor;
  };
}
```

O la versión corta de la fuente original, usando que `i++` devuelve el valor de antes de aumentar:

```js
export function rueda(...valores) {
  let i = 0;
  return () => valores[i++ % valores.length];
}
```

**¿Cuál conviene?** La del `if` es la más fácil de entender si todavía no te sientes cómodo con `%`. La del módulo es la que se espera en una entrevista: es más corta y el truco de `%` para "dar la vuelta" se usa en carruseles, calendarios y relojes. La de una línea es elegante, pero explícala en voz alta para que se note que entiendes el `i++`.

## Cómo explicarlo en la entrevista

> "Junto los valores con rest parameters y uso un closure con un índice privado. En cada llamada devuelvo el valor en la posición `i` módulo el largo del array y aumento `i`. El módulo hace que el índice dé la vuelta: con 3 valores, solo puede ser 0, 1 o 2. Cada rueda tiene su propio índice. Es lo mismo que usaría para un carrusel de imágenes que vuelve al inicio."

## Conceptos

- **Operador `%` (módulo)**: devuelve el resto de una división; `7 % 3` es `1`. Sirve para que un índice "dé la vuelta".
- **Rest parameters (`...valores`)**: juntan todos los argumentos en un array.
- **Closure**: la función devuelta recuerda `i` y `valores`.
- **Estado privado**: el índice solo avanza al llamar a la función.
- **`i++`**: devuelve el valor actual y después suma 1.
