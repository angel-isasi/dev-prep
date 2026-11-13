## Idea clave

Los textos no se pueden invertir directamente, pero los arreglos sí. Así que: **texto → arreglo de caracteres → `reverse()` → `join("")` → texto**. Para separar usa `[...texto]`, que respeta los emojis mejor que `split("")`.

## Paso a paso

1. **Separa el texto en caracteres** con `[...texto]`. El operador spread (`...`) recorre el texto carácter por carácter y mete cada uno en un arreglo: `[..."Rimay"]` da `["R", "i", "m", "a", "y"]`.
2. **Invierte el arreglo** con `reverse()`: `["y", "a", "m", "i", "R"]`.
3. **Únelo** con `join("")`. El `""` indica que no se pone nada entre los caracteres: `"yamiR"`.

```js
export function invertir(texto) {
  return [...texto].reverse().join("");
}
```

`reverse()` sí modifica el arreglo sobre el que se llama, pero aquí ese arreglo es una copia recién creada por `[...texto]`. Los textos en JavaScript son inmutables: el `texto` original nunca cambia.

## Por qué funciona

| Paso | Valor con `"Rimay"` | Valor con `"ab😀"` |
|---|---|---|
| `[...texto]` | `["R", "i", "m", "a", "y"]` | `["a", "b", "😀"]` |
| `.reverse()` | `["y", "a", "m", "i", "R"]` | `["😀", "b", "a"]` |
| `.join("")` | `"yamiR"` | `"😀ba"` |

**¿Y por qué no `split("")`?** Internamente, JavaScript guarda muchos emojis como **dos piezas** (dos "unidades de código"). `split("")` corta por piezas, así que parte el emoji en dos mitades; al invertir, esas mitades quedan en orden incorrecto y se ven como `"��"`. El spread `[...texto]` recorre por caracteres completos y mantiene el emoji entero.

Con `""`, `[...""]` es `[]`, `reverse()` da `[]` y `join("")` da `""`.

## Errores comunes

- **Usar `split("")` en vez de `[...texto]`.** Pasan casi todos los tests, pero falla "respeta los emojis": recibes símbolos rotos en vez de `"😀ba"`.
- **Llamar `reverse()` sobre el texto**: `texto.reverse()` lanza **TypeError: texto.reverse is not a function**, porque `reverse` es de los arreglos, no de los textos.
- **Usar `join()` sin argumento.** Por defecto une con comas: recibes `"y,a,m,i,R"`.
- **Olvidar el `join`.** Devuelves un arreglo `["y", "a", "m", "i", "R"]` en vez de un texto, y el test muestra que esperaba un string.

## Otra forma de resolverlo

Con un bucle que recorre el texto y va armando el resultado:

```js
export function invertir(texto) {
  let resultado = "";
  for (const caracter of texto) {
    resultado = caracter + resultado;
  }
  return resultado;
}
```

Cada carácter se pone **delante** de lo que ya tienes, así el último termina primero. `for...of` también recorre por caracteres completos, así que respeta los emojis.

**¿Cuál conviene?** La versión `[...texto].reverse().join("")` es la respuesta estándar y la más legible. El bucle sirve cuando te piden "sin métodos de array" y demuestra que entiendes la lógica. Ambas son O(n).

## Cómo explicarlo en la entrevista

> "Como los strings no tienen `reverse`, convierto el texto en un arreglo de caracteres, lo invierto y lo vuelvo a unir. Para separar uso el spread en vez de `split` con texto vacío, porque `split` corta los emojis por la mitad y el spread los mantiene enteros. Es O(n) en tiempo y en memoria, porque creo un arreglo del tamaño del texto."

## Conceptos

- **Spread `...` sobre un texto**: separa el texto en un arreglo de caracteres completos.
- **`reverse()`**: invierte el orden de un arreglo (modifica ese arreglo).
- **`join(separador)`**: une los elementos de un arreglo en un texto; con `""` no pone nada entre ellos.
- **Strings inmutables**: ningún método cambia un texto; todos devuelven uno nuevo.
- **Encadenar métodos**: llamar un método sobre el resultado del anterior, `a().b().c()`.
- **Emojis y `split("")`**: algunos caracteres ocupan dos unidades internas y `split("")` los parte.
