## Idea clave

En vez de un `if` especial para el 15, **construyes el texto por partes**: si es múltiplo de 3 agregas `"Fizz"`, si es múltiplo de 5 agregas `"Buzz"`. El 15 recibe las dos y queda `"FizzBuzz"` solo. Si el texto queda vacío, usas el número.

## Paso a paso

1. **La solución directa** (dila en voz alta): una cadena de `if / else if` revisando **primero** el caso de 15.

   ```js
   for (let i = 1; i <= n; i++) {
     if (i % 15 === 0) resultado.push("FizzBuzz");
     else if (i % 3 === 0) resultado.push("Fizz");
     else if (i % 5 === 0) resultado.push("Buzz");
     else resultado.push(String(i));
   }
   ```

   Es correcta y O(n). El problema es que el orden importa (si revisas el 3 primero, el 15 se queda en "Fizz") y no escala: con un tercer divisor necesitarías casos para cada combinación.
2. **El operador `%` (módulo)** da el resto de la división: `9 % 3` es 0, así que 9 es múltiplo de 3. `10 % 3` es 1, así que no.
3. **Construye por partes.** Empieza cada vuelta con `texto = ""`. Dos `if` independientes (no `else if`) agregan `"Fizz"` y `"Buzz"`. Como son independientes, el 15 entra a los dos.
4. **Si no hubo ninguna palabra**, `texto` es `""`, que es falsy. `texto || String(i)` usa entonces el número convertido a texto.
5. **Bucle de 1 a `n` inclusive**: `for (let i = 1; i <= n; i++)`. Si `n` es 0, el bucle no entra y devuelves `[]`.

```js
export function fizzBuzz(n) {
  const resultado = [];
  for (let i = 1; i <= n; i++) {
    let texto = "";
    if (i % 3 === 0) texto += "Fizz";
    if (i % 5 === 0) texto += "Buzz";
    resultado.push(texto || String(i));
  }
  return resultado;
}
```

## Por qué funciona

Algunos valores de `i` y cómo se construye su texto:

| `i` | `i % 3` | `i % 5` | `texto` después de los dos `if` | Se agrega |
|---|---|---|---|---|
| 1 | 1 | 1 | `""` | `"1"` |
| 3 | **0** | 3 | `"Fizz"` | `"Fizz"` |
| 5 | 2 | **0** | `"Buzz"` | `"Buzz"` |
| 9 | **0** | 4 | `"Fizz"` | `"Fizz"` |
| 10 | 1 | **0** | `"Buzz"` | `"Buzz"` |
| 15 | **0** | **0** | `"Fizz"` y luego `"FizzBuzz"` | `"FizzBuzz"` |

Para el reto extra: con `if (i % 7 === 0) texto += "Bazz";` el 21 sería `"FizzBazz"`, el 35 `"BuzzBazz"` y el 105 `"FizzBuzzBazz"`, sin escribir ninguna combinación a mano.

## Errores comunes

- **Revisar el 3 antes que el 15 en una cadena de `else if`.** El 15 entra en el primer caso y queda `"Fizz"`. Lo reconoces porque el test del 1 al 15 falla en la última posición.
- **Agregar el número sin convertirlo**: `resultado.push(i)` mete `1` en vez de `"1"`. `toEqual` distingue números de textos. Lo reconoces en el test `fizzBuzz(2)`.
- **Empezar en `i = 0`.** El 0 es múltiplo de todo (`0 % 3 === 0`), así que el primer elemento sería `"FizzBuzz"` y todo queda corrido.
- **Usar `i < n`** en vez de `i <= n`: te falta el último número.
- **Usar `else if` en la versión por partes.** El 15 solo recibe `"Fizz"`.

## Otra forma de resolverlo

**Cadena de `if / else if` con el 15 primero** (paso 1): O(n) de tiempo y O(n) de memoria por el resultado. Es la versión más conocida y válida.

**Lista de reglas**: para el reto extra extremo, guardas las reglas en un arreglo y las recorres. Agregar una regla es agregar un elemento:

```js
const reglas = [[3, "Fizz"], [5, "Buzz"]];
for (let i = 1; i <= n; i++) {
  let texto = "";
  for (const [divisor, palabra] of reglas) {
    if (i % divisor === 0) texto += palabra;
  }
  resultado.push(texto || String(i));
}
```

**¿Cuál conviene?** La de construir por partes: igual de corta que la clásica, sin trampa de orden y fácil de extender. Si te piden "hazlo configurable", muestra la de la lista de reglas.

## Cómo explicarlo en la entrevista

> "Recorro del 1 a n. Para cada número armo el texto concatenando: si es múltiplo de 3 agrego Fizz y si es de 5 agrego Buzz, con dos if independientes. Así el caso del 15 sale solo, sin un if especial, y si mañana piden Bazz para el 7 solo agrego una línea. Si el texto quedó vacío, uso el número como string. Es O(n) de tiempo y O(n) de memoria por el arreglo de salida."

## Conceptos

- **Operador módulo `%`**: el resto de una división; `a % b === 0` significa que `a` es múltiplo de `b`.
- **`if` independientes vs `else if`**: los independientes se evalúan todos; con `else if` solo entra el primero que se cumple.
- **Concatenar con `+=`**: construir un texto por partes.
- **`String(i)`**: convierte un número en texto.
- **`||` como valor por defecto**: `"" || "7"` da `"7"`.
