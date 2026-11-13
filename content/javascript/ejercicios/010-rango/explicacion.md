## Idea clave

Un `for` clásico que arranca en `inicio`, avanza de `paso` en `paso` y se detiene cuando se pasa de `fin`. El **parámetro por defecto** `paso = 1` resuelve el caso en que no te pasan el paso, sin necesidad de un `if`.

## Paso a paso

1. **Declara el valor por defecto** en la firma: `paso = 1`. Si quien llama no pasa el tercer argumento (o pasa `undefined`), `paso` vale `1`.
2. **Crea el arreglo vacío** `resultado`.
3. **Arma el `for`**:
   - Empieza en `let i = inicio`.
   - Sigue **mientras** `i <= fin` (con `<=`, porque `fin` está incluido).
   - Al final de cada vuelta, avanza: `i += paso`.
4. **En cada vuelta** agrega `i` con `push`.
5. **Devuelve** `resultado`.

```js
export function rango(inicio, fin, paso = 1) {
  const resultado = [];
  for (let i = inicio; i <= fin; i += paso) {
    resultado.push(i);
  }
  return resultado;
}
```

## Por qué funciona

Recorrido con `rango(1, 10, 3)`:

| Vuelta | `i` | `i <= 10` | `resultado` después de la vuelta |
|---|---|---|---|
| 1 | `1` | `true` | `[1]` |
| 2 | `4` | `true` | `[1, 4]` |
| 3 | `7` | `true` | `[1, 4, 7]` |
| 4 | `10` | `true` | `[1, 4, 7, 10]` |
| (fin) | `13` | `false` | el bucle termina |

Con `rango(0, 10, 4)`: `0`, `4`, `8`, y luego `12 <= 10` es falso, así que el `10` no entra. El bucle nunca "fuerza" el fin.

Con `rango(5, 1)`: la primera comprobación ya es `5 <= 1`, falsa, así que no hay vueltas y se devuelve `[]`.

Con `rango(1, 3)`: no hay tercer argumento, así que `paso` es `1` y el resultado es `[1, 2, 3]`.

## Errores comunes

- **Usar `<` en vez de `<=`.** El fin nunca entra. Lo reconoces porque `rango(1, 10, 3)` da `[1, 4, 7]` y `rango(5, 5)` da `[]`.
- **No darle valor por defecto a `paso`.** Con `rango(1, 3)`, `paso` es `undefined` y `i += undefined` da `NaN`. Como `NaN <= 3` es falso, el bucle se corta: recibes `[1]`.
- **Escribir `i + paso` en vez de `i += paso`.** No cambias `i`, así que la condición siempre es verdadera y el bucle **nunca termina**: los tests se quedan colgados. Si pasa, guarda el archivo corregido y vuelve a correr.
- **Usar `paso || 1`** dentro de la función: funciona aquí, pero trata `0` como "no me lo pasaron". El parámetro por defecto solo actúa con `undefined`, que es lo correcto.
- **Agregar el `fin` a mano al final** "por si acaso". Con `rango(0, 10, 4)` recibes `[0, 4, 8, 10]`, que no es parte de la secuencia.

## Otra forma de resolverlo

Calculando primero cuántos números habrá y generándolos con `Array.from`:

```js
export function rango(inicio, fin, paso = 1) {
  if (inicio > fin) return [];
  const cantidad = Math.floor((fin - inicio) / paso) + 1;
  return Array.from({ length: cantidad }, (_, i) => inicio + i * paso);
}
```

`Array.from({ length: n }, fn)` crea un arreglo de `n` posiciones y llena cada una con lo que devuelve `fn(valor, indice)`. Con `rango(1, 10, 3)`: `(10 - 1) / 3 = 3`, más 1, son 4 números: `1, 4, 7, 10`.

**¿Cuál conviene?** El `for` es más claro y es lo que se espera en una entrevista junior. `Array.from` es útil cuando ya sabes la cantidad (por ejemplo, "dame 5 páginas"), pero aquí el cálculo con `Math.floor` es fácil de equivocar. Ambas son O(n) sobre la cantidad de números generados.

## Cómo explicarlo en la entrevista

> "Uso un `for` que empieza en el inicio, avanza de paso en paso y sigue mientras sea menor o igual al fin, porque el fin está incluido. Para el paso uso un parámetro por defecto de 1, así no necesito un `if` si no me lo pasan. Si el inicio es mayor que el fin, el bucle no da ninguna vuelta y devuelvo un arreglo vacío. Asumo que el paso es positivo; si pudiera ser cero o negativo, validaría eso primero para no caer en un bucle infinito."

## Conceptos

- **Parámetro por defecto**: `paso = 1` en la firma da un valor cuando el argumento llega como `undefined`.
- **`for` clásico**: tiene tres partes, inicio, condición y avance: `for (let i = a; i <= b; i += p)`.
- **`+=`**: suma y asigna, `i += paso` es `i = i + paso`.
- **Bucle infinito**: ocurre cuando la condición nunca se vuelve falsa; por eso el avance es obligatorio.
- **`push`**: agrega un elemento al final del arreglo.
- **`Array.from({ length: n }, fn)`**: crea un arreglo de `n` elementos calculados por `fn`.
