## Idea clave

El closure guarda dos datos privados: `usos` (cuántas veces ya se ejecutó `fn`) y `ultimo` (lo que devolvió la última vez). Mientras queden usos, ejecutas `fn` y actualizas `ultimo`. Cuando se acaban, ya no ejecutas nada y solo devuelves `ultimo`. Es la generalización de `once`.

## Paso a paso

1. **Crea el estado privado**: `let usos = 0` y `let ultimo` (empieza como `undefined`).
2. **Devuelve una función** que recibe `(...args)`.
3. **Si todavía quedan usos** (`usos < max`): suma 1 a `usos` y guarda el resultado de `fn(...args)` en `ultimo`.
4. **Devuelve `ultimo`** siempre, fuera del `if`. Así, cuando se acaban los usos, se repite el último resultado.

```js
export function limitar(fn, max) {
  let usos = 0;
  let ultimo;

  return (...args) => {
    if (usos < max) {
      usos++;
      ultimo = fn(...args);
    }
    return ultimo;
  };
}
```

## Por qué funciona

Recorrido con este código:

```js
const saludar = limitar((nombre) => `Hola, ${nombre}`, 2);
```

| Llamada | `usos < 2` | ¿Se ejecuta `fn`? | `usos` | `ultimo` | Devuelve |
|---|---|---|---|---|---|
| `saludar("Ana")` | `0 < 2` → sí | sí | `1` | `"Hola, Ana"` | `"Hola, Ana"` |
| `saludar("Luis")` | `1 < 2` → sí | sí | `2` | `"Hola, Luis"` | `"Hola, Luis"` |
| `saludar("Rosa")` | `2 < 2` → no | no | `2` | `"Hola, Luis"` | `"Hola, Luis"` |

**¿Qué variables quedan recordadas?** `usos` y `ultimo` (además de `fn` y `max`). **¿Por qué sobreviven?** `limitar` ya terminó, pero la función devuelta, guardada en `saludar`, sigue usándolas. JavaScript no las borra mientras `saludar` exista. Y como cada llamada a `limitar` crea variables nuevas, cada función limitada tiene su propia cuenta.

Fíjate que el `return ultimo` está **fuera** del `if`: esa es la clave para que, después del límite, se siga devolviendo algo útil en vez de `undefined`.

## Errores comunes

- **Poner el `return` dentro del `if`.** Después del límite la función devuelve `undefined`. Lo reconoces en el test "después del límite devuelve el último resultado": recibes `undefined` en vez de `1`.
- **No guardar el resultado: `fn(...args)` sin `ultimo = ...`.** No tienes qué devolver después. El test de saludos recibe `undefined`.
- **Usar `usos <= max`.** Ejecutas una vez de más. Con `max = 2`, `vi.fn()` registra 3 llamadas y el test "ejecuta exactamente 2 veces" falla.
- **Olvidar reenviar los argumentos: `fn()`.** El saludo sale `"Hola, undefined"`.
- **Declarar `usos` fuera de `limitar`.** Todas las funciones limitadas comparten la misma cuenta. Lo reconoces en el test "cada función limitada lleva su propia cuenta": `b()` devuelve `undefined` porque `a` ya gastó los usos.

## Otra forma de resolverlo

La versión `once` clásica (solo para `max = 1`), con una bandera booleana:

```js
export function once(fn) {
  let yaSeEjecuto = false;
  let resultado;
  return (...args) => {
    if (!yaSeEjecuto) {
      yaSeEjecuto = true;
      resultado = fn(...args);
    }
    return resultado;
  };
}
```

Y con `limitar` ya hecho, `once` sale gratis: `const once = (fn) => limitar(fn, 1);`.

**¿Cuál conviene?** Si te piden `once` en la entrevista, la versión con bandera es la más directa. Si te piden "N veces", usa el contador. Mencionar que `once` es un caso particular de `limitar` muestra que piensas en generalizar.

## Cómo explicarlo en la entrevista

> "Uso un closure con dos variables privadas: cuántas veces ya ejecuté la función y el último resultado. Mientras no llegue al máximo, ejecuto `fn` con los argumentos que me pasan, aumento el contador y guardo el resultado. Después del límite ya no ejecuto nada y devuelvo el último resultado. Es como `once`, pero con N usos. Un caso real es evitar que un botón de pagar dispare el cobro dos veces."

## Conceptos

- **Closure**: la función devuelta recuerda `usos` y `ultimo` entre llamadas.
- **`once`**: patrón para que una función solo se ejecute una vez.
- **Rest y spread (`...args`)**: juntar todos los argumentos en un array y volver a esparcirlos al llamar a `fn`.
- **Variable sin inicializar**: `let ultimo;` vale `undefined` hasta que le asignas algo.
- **Función envoltorio (wrapper)**: controla cuándo se ejecuta la función original sin modificarla.
