## Idea clave

Es un error **off-by-one** (uno de más): el bucle usa `i <= notas.length`, así que da una vuelta extra con `i = notas.length`. Esa posición no existe, `notas[i]` vale `undefined`, y `suma + undefined` es `NaN`. Un solo `NaN` contagia toda la cuenta.

## Paso a paso

1. **Lee el síntoma con cuidado.** El arreglo vacío funciona (sale 0) y todos los demás fallan. Eso descarta la división y apunta a la parte que solo corre cuando hay notas: el bucle.
2. **Reprodúcelo con el caso más chico.** `promedio([11])` debería dar `11` y da `NaN`. Con un solo elemento es fácil seguir el bucle a mano.
3. **Sigue el bucle.** `i = 0`: `suma = 0 + 11 = 11`. ¿`1 <= 1`? Sí, otra vuelta: `suma = 11 + notas[1]`, o sea `11 + undefined`, que es `NaN`.
4. **Corrige la condición.** El último índice válido es `length - 1`, así que el bucle debe seguir mientras `i < notas.length`.

```js
for (let i = 0; i < notas.length; i++) {
  suma += notas[i];
}
```

## Por qué funciona

Con `[14, 16, 18]` (`length` 3):

| `i` | ¿`i < 3`? | `notas[i]` | `suma` |
|---|---|---|---|
| 0 | sí | 14 | 14 |
| 1 | sí | 16 | 30 |
| 2 | sí | 18 | 48 |
| 3 | no, termina | | |

`48 / 3 = 16`. Con `<=` habría una cuarta vuelta con `notas[3] = undefined`, y `48 + undefined = NaN`.

Leer una posición que no existe en un arreglo **no lanza error** en JavaScript: devuelve `undefined` en silencio. Por eso el bug no avisa y solo se nota en el resultado.

## Errores comunes

- **"Arreglar" el resultado con `|| 0`**: `return (suma / notas.length) || 0`. Ya no sale `NaN`, pero ahora sale `0` para todos: escondes el síntoma y el promedio sigue mal.
- **Saltarse los `undefined` con un `if`**: `if (notas[i] !== undefined) suma += notas[i]`. Funciona, pero el bucle sigue dando una vuelta de más. La causa es la condición, no los datos.
- **Dividir entre `notas.length + 1`**: no tiene sentido, la cantidad de notas es `length`. Este tipo de "ajuste" suele salir de probar números hasta que algo cuadra.

## Otra forma de resolverlo

Sin índices no hay forma de equivocarse con el límite. Con `reduce`:

```js
export function promedio(notas) {
  if (notas.length === 0) return 0;
  const suma = notas.reduce((acc, nota) => acc + nota, 0);
  return suma / notas.length;
}
```

`for...of` también evita el problema: recorre los valores, no las posiciones.

## Cómo explicarlo en la entrevista

> "El caso vacío funcionaba, así que el problema estaba en el bucle. Lo seguí a mano con una sola nota y vi que daba una vuelta de más: con `<=` llega a `i = length`, que no existe, y sumar `undefined` da `NaN`. Lo corregí con `<`. Si fuera mi código, usaría `reduce` o `for...of`, que no dependen de índices."

## Conceptos

- **Off-by-one**: equivocarse por uno en un límite (empezar o terminar una vuelta antes o después).
- **Índices**: un arreglo de `length` n tiene posiciones de `0` a `n - 1`.
- **`undefined`**: lo que devuelve leer una posición que no existe; no lanza error.
- **`NaN`**: "no es un número". Cualquier operación con `NaN` da `NaN`, por eso se propaga.
- **`reduce`**: recorre el arreglo acumulando un valor, sin manejar índices a mano.
