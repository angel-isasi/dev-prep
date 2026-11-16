## Idea clave

Cuando la entrada es **texto libre**, la cantidad de casos posibles es infinita. La técnica es la **partición de equivalencia** aplicada a textos: piensas en los **tipos de texto** que la función trata de forma especial (con mayúsculas, con signos, con letras no inglesas, con otros separadores, vacío) y pruebas **uno de cada tipo, aislado**. Además, como el resultado es un objeto, se compara con `toEqual`, que revisa todas las claves y valores sin importar el orden.

## Paso a paso

1. **Lista las reglas y conviértelas en tipos de texto.** Cada regla del enunciado ("no distingue mayúsculas", "ignora signos"...) define un grupo de textos que la función debe tratar de una forma.
2. **Un tipo por test.** `"Hola hola HOLA"` solo tiene el problema de las mayúsculas. `"¿hola? hola, hola."` solo tiene signos. Si mezclas, un mutante puede quedar escondido detrás de otro.
3. **Prueba lo que no es inglés.** En español hay tildes y ñ. La expresión `\w` solo reconoce `a-z`, `A-Z`, `0-9` y `_`, así que `"año"` se parte en `"a"` y `"o"`. Es un error muy común y solo lo ve un test con esas letras.
4. **Prueba otros separadores.** Un comentario escrito en un `<textarea>` trae saltos de línea. `"uno\ndos\ttres"` atrapa a quien hizo `split(" ")`.
5. **Prueba el vacío.** `"".split(/\s+/)` devuelve `[""]`, un arreglo con un texto vacío adentro. Si nadie lo filtra, la función cuenta una "palabra" vacía: `{ "": 1 }`.

## Por qué funciona

| Mutante | Qué rompe | Test que lo atrapa |
|---|---|---|
| Distingue mayúsculas | sin mayúsculas | `"Hola hola HOLA"` da `{ hola: 3 }` |
| No quita signos | ignora signos | `"¿hola? hola, hola."` da `{ hola: 3 }` |
| Usa `\w` | tildes y ñ | `"año está"` da `{ año: 1, está: 1 }` |
| Separa solo por espacios | cualquier espacio en blanco | `"uno\ndos\ttres"` da tres palabras |
| Cuenta cada palabra una vez | el conteo | `"el gato y el perro"` da `el: 2` |
| Cuenta una palabra vacía | texto vacío | `""` da `{}` |

`toEqual({})` es más estricto de lo que parece: falla si el objeto tiene **cualquier** clave, aunque sea `""`. Por eso atrapa al último mutante sin que tengas que saber qué clave rara aparece.

## Errores comunes

- **Revisar solo una clave.** `expect(resultado.hola).toBe(3)` no ve que además aparecieron `"hola,"` o `""`. Compara el objeto completo con `toEqual`.
- **Escribir el esperado con mayúsculas.** `toEqual({ Hola: 3 })` falla con la función correcta: la regla dice que la clave va en minúsculas.
- **Probar solo textos "de laboratorio".** `"a b c"` nunca falla. Los usuarios reales escriben `"¡Excelente artículo!\nGracias."`. Piensa en esos textos al elegir los casos.
- **Escribir el salto de línea mal en el test.** Dentro de comillas, `"uno\ndos"` es un salto de línea real. Si escribes `"uno\\ndos"`, es una barra y una `n`, y el test prueba otra cosa.

## Otra forma de resolverlo

Si un texto debe dar varias claves y solo te interesan algunas, `toMatchObject` revisa **solo las claves que indicas**:

```js
test("cuenta 'el' dos veces", () => {
  expect(contarPalabras("el gato y el perro")).toMatchObject({ el: 2 });
});
```

Es útil para textos largos, pero ten cuidado: `toMatchObject` no ve claves de más. Con `expect(contarPalabras("")).toMatchObject({})`, el mutante que devuelve `{ "": 1 }` sobrevive, porque ese objeto tiene todo lo que pide un objeto vacío (nada). Con `toEqual({})` cae.

## Cómo explicarlo en la entrevista

> "Como la entrada es texto libre, usé partición de equivalencia: un test por cada tipo de texto que la función trata especial, como mayúsculas, signos, tildes, saltos de línea y texto vacío, aislando cada caso. Incluí tildes y ñ a propósito, porque una expresión con `\w` las corta. Y comparé el objeto completo con `toEqual`, para detectar también claves que no deberían existir."

## Conceptos

- **Partición de equivalencia**: agrupar entradas que la función trata igual y probar una de cada grupo.
- **`toEqual` con objetos**: compara claves y valores, sin importar el orden de las claves; falla si sobra o falta una.
- **`toMatchObject`**: revisa solo las claves que le pasas; ignora las demás.
- **`\w` en expresiones regulares**: solo letras sin tilde, números y guion bajo; no incluye `á` ni `ñ`.
- **`\s`**: cualquier espacio en blanco, incluidos `\n` (salto de línea) y `\t` (tabulación).
