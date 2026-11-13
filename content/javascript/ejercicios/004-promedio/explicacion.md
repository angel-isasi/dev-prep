## Idea clave

Promedio = **suma / cantidad**. Lo único delicado es el arreglo vacío: `0 / 0` en JavaScript no lanza error, devuelve `NaN`. Cuida siempre la división entre cero revisando ese caso antes de dividir.

## Paso a paso

1. **Revisa el caso vacío primero**: si `nums.length === 0`, devuelve `0` y termina. A esto se le llama *guard clause* (cláusula de guarda): sales temprano y el resto del código ya no tiene que preocuparse por ese caso.
2. **Suma todos los números** con `reduce` y valor inicial `0`.
3. **Divide la suma entre `nums.length`** y devuelve el resultado.

```js
export function promedio(nums) {
  if (nums.length === 0) return 0;

  const suma = nums.reduce((total, n) => total + n, 0);
  return suma / nums.length;
}
```

## Por qué funciona

Recorrido con `promedio([12, 15, 18])`:

- `nums.length` es `3`, no es `0`, así que sigue.
- `reduce`: `0 + 12 = 12`, `12 + 15 = 27`, `27 + 18 = 45`. La suma es `45`.
- `45 / 3` es `15`.

| Entrada | `suma` | `nums.length` | Resultado |
|---|---|---|---|
| `[12, 15, 18]` | `45` | `3` | `15` |
| `[1, 2]` | `3` | `2` | `1.5` |
| `[-4, 4, 6]` | `6` | `3` | `2` |
| `[17]` | `17` | `1` | `17` |
| `[]` | (no se calcula) | `0` | `0`, por la guarda |

Sin la guarda, con `[]` la suma sería `0` y `0 / 0` daría `NaN`.

## Errores comunes

- **No cuidar el arreglo vacío.** Lo reconoces porque el test "un arreglo vacío devuelve 0 y no NaN" recibe `NaN`.
- **Dividir entre un número fijo** (por ejemplo `/ 3`) porque el primer ejemplo tiene 3 elementos. Pasa el primer test y falla los demás. Usa siempre `nums.length`.
- **Redondear** con `Math.round` o `Math.floor`. Lo reconoces porque `promedio([1, 2])` da `2` o `1` en vez de `1.5`.
- **Olvidar el valor inicial del `reduce`**: si además quitaste la guarda, `[].reduce(...)` lanza **TypeError: Reduce of empty array with no initial value**.
- **Comparar con `if (nums.length = 0)`**: con un solo `=` asignas en vez de comparar: vacías el arreglo y todos los tests reciben `NaN`. Usa `===`.

## Otra forma de resolverlo

En una sola expresión con el operador ternario, como en la solución original:

```js
export function promedio(nums) {
  return nums.length ? nums.reduce((t, n) => t + n, 0) / nums.length : 0;
}
```

Aquí `nums.length ? ... : 0` aprovecha que `0` es "falsy": si la longitud es 0, devuelve `0`; si no, calcula el promedio.

**¿Cuál conviene?** Las dos hacen lo mismo. La versión con `if` es más fácil de leer y de explicar, y separa claramente el caso borde. La del ternario es compacta, pero con lógica más larga se vuelve difícil de leer. En una entrevista, prefiere la clara.

## Cómo explicarlo en la entrevista

> "El promedio es la suma entre la cantidad. Antes de nada reviso el caso vacío, porque en JavaScript cero entre cero no da error sino `NaN`, y eso se propagaría sin avisar. Si está vacío devuelvo cero; si no, sumo con `reduce` y divido entre la longitud. Es O(n) por la suma."

## Conceptos

- **Cláusula de guarda**: un `if` al inicio que resuelve un caso especial y sale con `return`.
- **`NaN`**: "Not a Number"; resultado de operaciones numéricas inválidas como `0 / 0`. No lanza error, por eso es peligroso.
- **`length`**: cantidad de elementos de un arreglo.
- **`reduce` con valor inicial**: suma segura incluso con arreglos vacíos.
- **Operador ternario**: `condición ? siEsVerdad : siEsFalso`, un `if/else` que devuelve un valor.
- **Valores "falsy"**: `0`, `""`, `null`, `undefined`, `NaN` y `false` cuentan como falso en una condición.
