## Idea clave

`typeof` funciona bien para casi todo, pero dice `"object"` para `null` y para los arrays. La solución es atender esos dos casos **primero** y dejar que `typeof` resuelva el resto.

## Paso a paso

1. **Si es `null`**, devuelve `"null"`. Se compara con `===`, porque `null` es un valor único.
2. **Si es un array**, devuelve `"array"`. `Array.isArray(valor)` es la forma confiable de saberlo.
3. **Para todo lo demás**, devuelve `typeof valor`.

```js
export function tipoDe(valor) {
  if (valor === null) return "null";
  if (Array.isArray(valor)) return "array";
  return typeof valor;
}
```

## Por qué funciona

Cada `return` corta la función en ese punto, así que el orden de las preguntas importa:

| Llamada | `valor === null` | `Array.isArray` | Devuelve |
|---|---|---|---|
| `tipoDe(null)` | `true` | (no llega) | `"null"` |
| `tipoDe([1, 2])` | `false` | `true` | `"array"` |
| `tipoDe({})` | `false` | `false` | `typeof {}`, que es `"object"` |
| `tipoDe(NaN)` | `false` | `false` | `typeof NaN`, que es `"number"` |
| `tipoDe(() => 1)` | `false` | `false` | `"function"` |

¿Por qué `typeof null` es `"object"`? Es un error de la primera versión de JavaScript (1995) que nunca se corrigió para no romper páginas que ya existían. Y los arrays son objetos de verdad (con índices como claves), por eso `typeof` no los distingue.

## Errores comunes

- **Usar `typeof valor === "array"`.** Nunca es `true`: `typeof` jamás devuelve `"array"`. Lo reconoces porque el test de arrays recibe `"object"`.
- **Preguntar por `"object"` antes que por `null`.** Si escribes `if (typeof valor === "object") return "object"` al inicio, `null` y los arrays entran ahí y nunca llegas a sus casos.
- **Usar `valor == null`.** Con doble igual, `undefined == null` es `true`, así que `tipoDe(undefined)` devolvería `"null"`. Usa `===`.
- **Usar `!valor` para detectar `null`.** También atrapa `0`, `""`, `false` y `NaN`, que son falsy pero no son `null`.
- **Usar `valor instanceof Array`.** Funciona casi siempre, pero `Array.isArray` es el método recomendado y el que el entrevistador espera escuchar.

## Otra forma de resolverlo

Con `Object.prototype.toString`, que devuelve textos como `"[object Array]"` o `"[object Null]"`:

```js
export function tipoDe(valor) {
  const tipo = typeof valor;
  if (tipo !== "object") return tipo;
  return Object.prototype.toString.call(valor).slice(8, -1).toLowerCase();
}
```

Para `null` da `"null"`, para un array `"array"` y para `{}` `"object"`. Además distingue fechas (`"date"`) o expresiones regulares (`"regexp"`). Es un truco conocido, pero menos legible.

**¿Cuál conviene?** La primera. Es directa y cada línea se explica sola.

## Cómo explicarlo en la entrevista

> "`typeof` tiene dos trampas: `typeof null` da `"object"` por un error histórico del lenguaje, y los arrays también dan `"object"` porque son objetos. Así que primero pregunto por `null` con triple igual, después uso `Array.isArray` para los arrays, y para todo lo demás confío en `typeof`."

## Conceptos

- **Tipos primitivos**: `string`, `number`, `boolean`, `undefined`, `null`, `bigint` y `symbol`. Todo lo demás es un objeto.
- **`typeof`**: operador que devuelve el tipo como texto. Trampas: `null` da `"object"` y las funciones dan `"function"`.
- **`Array.isArray()`**: la forma confiable de saber si algo es un array.
- **`NaN`**: "Not a Number", pero su tipo es `number`. Es el resultado de una operación numérica inválida.
- **`return` temprano**: devolver apenas sabes la respuesta, para no anidar `if/else`.
