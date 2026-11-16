## Idea clave

`==` (igualdad **débil**) convierte los valores a un mismo tipo antes de comparar. Al comparar un texto con un número, convierte el texto a número, y `Number("")` es `0`. Por eso `"" == 0` es `true` y cada celda vacía se cuenta como agotada. `===` (igualdad **estricta**) no convierte nada: si los tipos son distintos, da `false`.

## Paso a paso

1. **Lee el síntoma.** El número sube "cuando hay productos sin stock registrado". El dato sospechoso es la celda vacía, `""`.
2. **Reprodúcelo.** `contarAgotados(["", 3])` debería dar `0` y da `1`. Ya tienes el caso mínimo.
3. **Aísla la comparación.** En la consola: `"" == 0` da `true`. Ahí está.
4. **Cambia `==` por `===`.**

```js
if (stock === 0) agotados++;
```

## Por qué funciona

| Valor de `stock` | `stock == 0` | `stock === 0` |
|---|---|---|
| `0` | `true` | `true` |
| `5` | `false` | `false` |
| `""` | `true` (convierte `""` a `0`) | `false` (texto contra número) |

Con `===`, solo un número `0` cuenta. El `""` es un `string`, así que nunca es estrictamente igual al número `0`.

Otras sorpresas de `==` que salen en entrevistas: `"0" == false` es `true`, `" " == 0` es `true` y `null == 0` es `false`. Nadie las recuerda todas: por eso la regla es usar siempre `===`.

## Errores comunes

- **Filtrar los vacíos antes con `filter(Boolean)`.** Elimina también los `0`, porque `0` es falsy. El resultado pasa a ser siempre `0`.
- **Convertir todo a número con `Number(stock) === 0`.** Es el mismo problema: `Number("")` es `0`, así que vuelves a contar las celdas vacías.
- **Agregar un caso especial `if (stock !== "")`.** Funciona con `""`, pero si mañana llega `" "` o `"0"` desde la hoja, vuelve a fallar. La causa es la conversión de `==`, no el valor `""`.

## Otra forma de resolverlo

Con `filter` y `length`, que se lee como la frase "cuántos son exactamente 0":

```js
export function contarAgotados(stocks) {
  return stocks.filter((stock) => stock === 0).length;
}
```

## Cómo explicarlo en la entrevista

> "El conteo subía con las celdas vacías. Probé `"" == 0` y da `true`, porque `==` convierte el texto a número y un texto vacío vale 0. Lo cambié por `===`, que compara tipo y valor sin convertir. En general uso siempre `===`; la única excepción aceptada es `x == null` para atrapar `null` y `undefined` a la vez."

## Conceptos

- **Igualdad débil (`==`)**: compara después de convertir los tipos (coerción).
- **Igualdad estricta (`===`)**: compara tipo y valor, sin convertir.
- **Coerción**: conversión automática de un tipo a otro que hace JavaScript.
- **Falsy**: valores que cuentan como `false` en un `if`: `0`, `""`, `null`, `undefined`, `NaN` y `false`.
- **`for...of`**: recorre los valores de un arreglo uno por uno.
