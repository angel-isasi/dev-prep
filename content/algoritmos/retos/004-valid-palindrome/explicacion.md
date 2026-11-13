## Idea clave

Primero **normalizas** la frase (minúsculas y solo letras y dígitos) y después la comparas consigo misma desde los dos extremos: el primer carácter con el último, el segundo con el penúltimo, y así hasta el centro. Si algún par no coincide, no es palíndromo.

## Paso a paso

1. **Normaliza.** `s.toLowerCase()` convierte todo a minúsculas. Después `replace(/[^a-z0-9]/g, "")` borra todo lo que no sea letra o dígito:
   - `[a-z0-9]` es "una letra de la a a la z o un dígito".
   - El `^` al inicio de los corchetes lo niega: "cualquier cosa que **no** sea eso".
   - La `g` (global) hace que se reemplacen **todas** las apariciones, no solo la primera.
2. **La solución directa** (dila en voz alta): invertir la cadena limpia y comparar. Es O(n) y se escribe en una línea, pero crea un arreglo y otra cadena, y siempre recorre todo aunque el primer carácter ya no coincida.

   ```js
   return limpio === [...limpio].reverse().join("");
   ```

3. **Mejora con dos punteros.** `i` empieza en 0 y `j` en el último índice. Mientras `i < j`, compara `limpio[i]` con `limpio[j]`. Si son distintos, devuelve `false` en ese momento.
4. **Acerca los punteros**: `i++` y `j--`. Cuando se cruzan, ya revisaste todos los pares.
5. **Los casos borde salen solos.** Si `limpio` queda vacío, `j` vale -1 y el `while` ni empieza: devuelve `true`. Con un solo carácter, `i` y `j` valen 0 y tampoco entra.

```js
export function esPalindromo(s) {
  const limpio = s.toLowerCase().replace(/[^a-z0-9]/g, "");

  let i = 0;
  let j = limpio.length - 1;
  while (i < j) {
    if (limpio[i] !== limpio[j]) return false;
    i++;
    j--;
  }

  return true;
}
```

## Por qué funciona

Recorrido con `esPalindromo("race a car")`. Después de limpiar queda `"raceacar"` (8 caracteres, índices 0 a 7):

| `i` | `j` | `limpio[i]` | `limpio[j]` | ¿Iguales? |
|---|---|---|---|---|
| 0 | 7 | `r` | `r` | sí |
| 1 | 6 | `a` | `a` | sí |
| 2 | 5 | `c` | `c` | sí |
| 3 | 4 | `e` | `a` | **no**: devuelve `false` |

Con `"Anita lava la tina"` la cadena limpia es `"anitalavalatina"` (15 caracteres). Los pares (0, 14), (1, 13)... hasta (6, 8) coinciden; el índice 7 queda solo en el centro y no necesita compararse con nadie. Devuelve `true`.

## Errores comunes

- **Olvidar la `g` en la expresión regular.** `replace(/[^a-z0-9]/, "")` solo borra el **primer** carácter inválido. Lo reconoces porque "A man, a plan..." da `false`.
- **Limpiar antes de pasar a minúsculas.** Si haces el `replace` primero, `/[^a-z0-9]/` borra las mayúsculas (`A`, `P`), y la frase pierde letras.
- **Quitar también los dígitos** con `/[^a-z]/g`. Entonces `"0P"` queda `"p"` y dices que es palíndromo. Falla el test de los dígitos.
- **Usar `i <= j`.** No da un resultado incorrecto (compara el centro consigo mismo), pero hace una vuelta de más; con `i < j` basta.
- **Invertir con `limpio.reverse()`.** Las cadenas no tienen `reverse`; primero conviértela en arreglo: `[...limpio].reverse().join("")`.

## Otra forma de resolverlo

**Comparar con la cadena invertida** (paso 2). Es O(n) de tiempo y O(n) de memoria, igual que la de punteros en el peor caso, y es la más corta. En una entrevista es válida si la explicas, pero el entrevistador casi siempre te pedirá la de dos punteros.

**Dos punteros sin limpiar** (el reto extra): los punteros recorren la cadena original y se saltan los caracteres que no cuentan. Así la memoria extra es O(1):

```js
const valido = (c) => /[a-z0-9]/i.test(c);
let i = 0;
let j = s.length - 1;
while (i < j) {
  if (!valido(s[i])) { i++; continue; }
  if (!valido(s[j])) { j--; continue; }
  if (s[i].toLowerCase() !== s[j].toLowerCase()) return false;
  i++;
  j--;
}
return true;
```

**¿Cuál conviene?** Para empezar, la de limpiar y usar dos punteros: es clara y fácil de defender. Si te preguntan por la memoria, propón la versión sin limpiar.

## Cómo explicarlo en la entrevista

> "Primero normalizo: paso a minúsculas y quito todo lo que no sea letra o número con una expresión regular. Luego uso dos punteros, uno al inicio y otro al final, y voy comparando hacia el centro; si un par no coincide, devuelvo false de inmediato. Es O(n) de tiempo y O(n) de memoria por la cadena limpia. Si necesitara O(1) de memoria, haría que los punteros se salten los caracteres inválidos sobre la cadena original, sin crear una nueva."

## Conceptos

- **Dos punteros**: dos índices que se mueven desde los extremos hacia el centro.
- **Expresiones regulares**: `[^...]` niega un grupo de caracteres y la bandera `g` reemplaza todas las coincidencias.
- **`toLowerCase()`**: devuelve una cadena nueva en minúsculas (las cadenas en JavaScript son inmutables).
- **Normalizar la entrada**: limpiar los datos antes de procesarlos simplifica el algoritmo.
- **Salida temprana**: devolver `false` en el primer par distinto, sin recorrer el resto.
