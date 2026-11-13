## Idea clave

Cuando un valor aparece donde se espera un booleano (un `if`, un `!`, un `&&`), JavaScript lo convierte a `true` o `false`. Solo hay **8 valores falsy**: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` y `NaN`. Todo lo demás es truthy. Así que basta con preguntar `!valor` por cada elemento.

## Paso a paso

1. **Crea un contador** con `let contador = 0`. Es `let` porque lo vas a reasignar.
2. **Recorre el array** con `for...of`, que te da cada valor.
3. **Pregunta `!valor`**: el `!` convierte el valor a booleano y lo invierte. Si el valor es falsy, `!valor` es `true` y sumas 1.
4. **Devuelve** el contador.

```js
export function contarFalsy(valores) {
  let contador = 0;

  for (const valor of valores) {
    if (!valor) contador++;
  }

  return contador;
}
```

## Por qué funciona

Con `contarFalsy([0, 1, "", "hola", null, { a: 1 }, NaN])`:

| `valor` | `Boolean(valor)` | `!valor` | `contador` |
|---|---|---|---|
| `0` | `false` | `true` | 1 |
| `1` | `true` | `false` | 1 |
| `""` | `false` | `true` | 2 |
| `"hola"` | `true` | `false` | 2 |
| `null` | `false` | `true` | 3 |
| `{ a: 1 }` | `true` | `false` | 3 |
| `NaN` | `false` | `true` | 4 |

Los que engañan son los del segundo test: `"0"`, `"false"` y `" "` son textos **no vacíos**, así que son truthy. `[]` y `{}` son objetos, y **todo objeto es truthy**, aunque esté vacío.

## Errores comunes

- **Comparar con `== false`.** `[] == false` es `true` (por la coerción del doble igual), pero `[]` es truthy. Y `null == false` es `false`, aunque `null` sea falsy. El `==` no sigue la regla de truthy/falsy: usa `!valor` o `Boolean(valor)`.
- **Hacer una lista a mano y olvidar alguno.** Si escribes `valor === 0 || valor === "" || valor === null...`, es fácil olvidar `NaN` (que además no es igual a nada, ni a sí mismo: `NaN === NaN` es `false`).
- **Creer que `[]` o `{}` son falsy.** Lo reconoces porque el test de "parecen falsos" recibe 1 o 2 en lugar de 0.
- **Declarar el contador con `const`.** Al hacer `contador++` salta `TypeError: Assignment to constant variable`.

## Otra forma de resolverlo

Con `filter`, quedándote con los falsy y contando cuántos quedaron:

```js
export function contarFalsy(valores) {
  return valores.filter((valor) => !valor).length;
}
```

`filter` crea un array nuevo (no toca el original) con los elementos para los que la función devuelve `true`. Es el mismo truco que `filter(Boolean)`, pero al revés.

**¿Cuál conviene?** Las dos están bien. El bucle muestra que entiendes el paso a paso; `filter` es más corto. En una entrevista puedes escribir el bucle y mencionar la versión con `filter`.

## Cómo explicarlo en la entrevista

> "En JavaScript hay ocho valores falsy: `false`, `0`, `-0`, `0n`, el string vacío, `null`, `undefined` y `NaN`. Todo lo demás es truthy, incluidos los arrays y objetos vacíos y strings como `"0"`. Entonces recorro el array y sumo 1 cada vez que `!valor` es verdadero. No comparo con `== false` porque el doble igual tiene sus propias reglas de coerción."

## Conceptos

- **Truthy y falsy**: cómo se comporta un valor cuando JavaScript lo convierte a booleano.
- **Los 8 falsy**: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`.
- **Operador `!`**: convierte a booleano y lo invierte. `!!valor` es igual a `Boolean(valor)`.
- **`let` vs `const`**: `let` para lo que reasignas (un contador), `const` para lo demás.
- **`for...of`**: recorre los valores de un array.
- **`filter`**: devuelve un array nuevo con los elementos que cumplen una condición.
