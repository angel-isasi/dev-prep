## Idea clave

`||` usa el valor por defecto cuando el lado izquierdo es **falsy**, y `0` es falsy. Por eso `0 || 10` da `10`: el producto agotado pasa a tener stock 10. El operador `??` (nullish coalescing) solo usa el valor por defecto con `null` o `undefined`, que es exactamente "el dato no llegó".

## Paso a paso

1. **Lee el síntoma.** Solo falla con stock `0`. Los productos con stock 3 o 50 se guardan bien. Cuando un error aparece solo con `0` (o con `""`), sospecha de un valor falsy.
2. **Reprodúcelo.** `crearProducto({ stock: 0 }).stock` da `10`.
3. **Aísla.** En la consola: `0 || 10` da `10`. Ahí está.
4. **Cambia `||` por `??` solo en el stock.** En `nombre` y `categoria`, `||` es lo correcto, porque un texto vacío también debe reemplazarse.

```js
stock: datos.stock ?? 10,
```

## Por qué funciona

| `datos.stock` | `datos.stock \|\| 10` | `datos.stock ?? 10` |
|---|---|---|
| `undefined` | `10` | `10` |
| `null` | `10` | `10` |
| `0` | `10` (0 es falsy) | `0` |
| `3` | `3` | `3` |

Elegir entre `||` y `??` es una decisión sobre **qué cuenta como vacío**: para un nombre, `""` es vacío; para un número, `0` casi nunca lo es.

## Errores comunes

- **Cambiar los tres `||` por `??`.** El stock queda bien, pero un nombre `""` ya no se reemplaza por "Sin nombre", y falla el test de textos vacíos.
- **Usar un valor por defecto en la desestructuración**: `const { stock = 10 } = datos`. Funciona con `undefined`, pero **no con `null`**: `stock` quedaría en `null`.
- **Comparar con `if (datos.stock == 0)`** para "proteger" el cero. Agregas un caso especial en vez de usar el operador correcto, y `==` trae sus propias sorpresas.

## Otra forma de resolverlo

Con una comparación explícita, que es lo que hace `??` por dentro:

```js
stock: datos.stock === undefined || datos.stock === null ? 10 : datos.stock,
```

O con `datos.stock != null ? datos.stock : 10`, uno de los pocos usos aceptados de `!=`: `x != null` es `true` para todo menos `null` y `undefined`.

## Cómo explicarlo en la entrevista

> "Solo fallaba con stock 0, así que pensé en valores falsy. `||` usa el valor por defecto con cualquier falsy, y el 0 lo es. Lo cambié por `??`, que solo actúa con `null` o `undefined`. Dejé `||` en el nombre y la categoría porque ahí un texto vacío sí debe reemplazarse. Para números y booleanos casi siempre uso `??`."

## Conceptos

- **Falsy**: `0`, `""`, `null`, `undefined`, `NaN` y `false`; cuentan como falso en una condición.
- **`||` (OR)**: devuelve el lado derecho si el izquierdo es falsy.
- **`??` (nullish coalescing)**: devuelve el lado derecho solo si el izquierdo es `null` o `undefined`.
- **Valor por defecto en desestructuración**: `{ x = 1 }` solo se aplica con `undefined`.
- **Nullish**: los valores `null` y `undefined`.
