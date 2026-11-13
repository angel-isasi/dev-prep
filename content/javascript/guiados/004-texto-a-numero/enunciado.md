Escribe la función `aNumero(texto)` que convierta un texto (por ejemplo, lo que el usuario escribió en un `<input>`) en un número. Si el texto no es un número válido, devuelve `null`.

## Reglas

- Los espacios a los costados no importan: `" 42 "` es `42`.
- Acepta negativos y decimales con punto: `"-7"` es `-7` y `"3.5"` es `3.5`.
- Si el texto está vacío o solo tiene espacios, devuelve `null` (**ojo:** `Number("")` da `0`, no `NaN`).
- Si el texto tiene letras u otros caracteres que lo hacen inválido, como `"12abc"`, devuelve `null`.

## Ejemplos

```js
aNumero("42");       // 42
aNumero(" 3.5 ");    // 3.5
aNumero("-7");       // -7
aNumero("");         // null
aNumero("   ");      // null
aNumero("12abc");    // null
aNumero("hola");     // null
```

## Por qué importa

Todo lo que llega de un formulario es texto, aunque el input sea de tipo `number`. Convertirlo bien y detectar lo inválido es trabajo diario en frontend, y es donde la coerción de JavaScript más sorprende: `"5" + 1` es `"51"`, `Number("")` es `0` y `NaN` no es igual ni a sí mismo.
