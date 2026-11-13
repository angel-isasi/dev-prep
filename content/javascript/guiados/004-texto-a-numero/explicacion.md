## Idea clave

`Number(texto)` convierte un texto en número y devuelve `NaN` si no puede. Pero tiene una trampa: el texto vacío lo convierte en `0`. Por eso primero descartas el vacío y después revisas si salió `NaN` con `Number.isNaN`.

## Paso a paso

1. **Quita los espacios** con `trim()`.
2. **Si quedó vacío**, devuelve `null`. Este paso va antes de convertir, porque `Number("")` y `Number("   ")` dan `0`.
3. **Convierte** con `Number(limpio)`.
4. **Si salió `NaN`**, devuelve `null`. Se pregunta con `Number.isNaN(numero)`.
5. **Devuelve** el número.

```js
export function aNumero(texto) {
  const limpio = texto.trim();
  if (limpio === "") return null;

  const numero = Number(limpio);
  if (Number.isNaN(numero)) return null;

  return numero;
}
```

## Por qué funciona

| `texto` | `limpio` | `Number(limpio)` | Devuelve |
|---|---|---|---|
| `"  15 "` | `"15"` | `15` | `15` |
| `"0"` | `"0"` | `0` | `0` |
| `"   "` | `""` | (no llega) | `null` |
| `"12abc"` | `"12abc"` | `NaN` | `null` |
| `"-7"` | `"-7"` | `-7` | `-7` |

`Number` exige que **todo** el texto sea un número válido. Por eso `"12abc"` da `NaN`. Fíjate también en `"0"`: devuelve `0` correctamente porque nunca preguntamos "¿es falsy?", sino "¿es vacío?" y "¿es NaN?". Si hubieras escrito `if (!numero) return null`, el `0` se habría perdido.

## Errores comunes

- **Comparar con `numero === NaN`.** Siempre es `false`: `NaN` es el único valor de JavaScript que no es igual a sí mismo. Usa `Number.isNaN(numero)`.
- **No atender el texto vacío.** `Number("")` es `0`, así que devuelves `0` en vez de `null`. Lo reconoces porque el test del vacío recibe `0`.
- **Usar `parseInt` o `parseFloat`.** Leen "hasta donde pueden": `parseInt("12abc")` da `12` y `parseInt("3.5")` da `3`. Aquí queremos rechazar `"12abc"`.
- **Usar `if (!numero)` para detectar el error.** También atrapa el `0`, que es un número válido.
- **Sumar sin convertir.** Si el texto llega de un input y haces `texto + 1`, con `"5"` obtienes `"51"`: el `+` con un string concatena.

## Otra forma de resolverlo

Con el `+` unario (convierte igual que `Number`) y la función global `isNaN`:

```js
export function aNumero(texto) {
  if (texto.trim() === "") return null;
  const numero = +texto;
  return isNaN(numero) ? null : numero;
}
```

`+texto` hace lo mismo que `Number(texto)` (y también ignora los espacios de los costados). La diferencia entre `isNaN` y `Number.isNaN`: la global primero convierte a número, así que `isNaN("hola")` es `true`; `Number.isNaN("hola")` es `false` porque `"hola"` no es el valor `NaN`. Aquí da igual porque ya convertimos antes, pero `Number.isNaN` es la versión precisa.

**¿Cuál conviene?** La primera: `Number(...)` y `Number.isNaN` dicen exactamente lo que hacen.

## Cómo explicarlo en la entrevista

> "Uso `Number` en lugar de `parseInt` porque `Number` exige que todo el texto sea numérico, y `parseInt` aceptaría `"12abc"` como 12. La trampa es que `Number` de un string vacío da 0, así que descarto el vacío antes. Para detectar el error uso `Number.isNaN`, porque `NaN` no es igual a nada, ni a sí mismo."

## Conceptos

- **Coerción**: conversión automática o explícita entre tipos. `Number(x)` y `+x` convierten a número.
- **`NaN`**: resultado de una conversión numérica fallida. `NaN === NaN` es `false`.
- **`Number.isNaN()`**: la forma correcta de saber si un valor es `NaN`.
- **`Number` vs `parseInt`**: `Number` exige todo el texto; `parseInt` lee hasta el primer carácter inválido y descarta decimales.
- **`trim()`**: quita espacios al inicio y al final.
- **`null` como "sin valor"**: se usa a propósito para indicar que no hay resultado.
