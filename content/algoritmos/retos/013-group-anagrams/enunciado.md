Escribe la función `agruparAnagramas(palabras)` que reciba un arreglo de palabras y devuelva un **arreglo de grupos**, donde cada grupo es un arreglo con las palabras que son anagramas entre sí (mismas letras, mismas cantidades, distinto orden).

## Reglas

- Las palabras vienen en minúsculas.
- Cada palabra aparece en exactamente un grupo. Si una palabra no tiene anagramas, forma un grupo ella sola.
- **El orden no importa**: ni el orden de los grupos ni el orden de las palabras dentro de cada grupo. Los tests ordenan tu resultado antes de comparar.
- Si una palabra se repite, aparece repetida en su grupo.
- Si el arreglo está vacío, devuelve `[]`.

## Ejemplos

```js
agruparAnagramas(["eat", "tea", "tan", "ate", "nat", "bat"]);
// [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]   (en cualquier orden)

agruparAnagramas(["ab", "abb", "ba"]);
// [["ab", "ba"], ["abb"]]   "abb" tiene una b de más

agruparAnagramas([]);
// []
```

## Reto extra

Comparar cada palabra con todos los grupos es O(n²). ¿Puedes encontrar una **clave** que sea igual para todos los anagramas, y agrupar en una sola pasada con un `Map`?
