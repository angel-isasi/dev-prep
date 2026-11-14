## Idea clave

Cada fila se construye a partir de la anterior: empieza en 1, cada número del medio en la posición `j` es `anterior[j - 1] + anterior[j]`, y termina en 1. Vas guardando las filas en el resultado, así la fila de arriba siempre está disponible cuando armas la siguiente.

## Paso a paso

1. **Primero, entiende la forma.** La fila `i` (contando desde 0) tiene `i + 1` números. La fila 0 es `[1]`, la fila 1 es `[1, 1]` y desde la fila 2 aparecen números en el medio.
2. **Encuentra la regla con un ejemplo.** De `[1, 3, 3, 1]` sale `[1, 4, 6, 4, 1]`. El 4 en la posición 1 es 1 + 3 (posiciones 0 y 1 de arriba). El 6 en la posición 2 es 3 + 3 (posiciones 1 y 2 de arriba). En general: `fila[j] = anterior[j - 1] + anterior[j]`.
3. **Arma una fila.** Empieza con `[1]`. Con un bucle `j` de 1 hasta `i - 1` agrega los números del medio. Al final agrega otro `1`, salvo en la fila 0, que tiene un solo elemento.
4. **Guarda y repite.** Agrega la fila al `triangulo`. En la siguiente vuelta, `triangulo[i - 1]` es justo la fila que acabas de guardar.
5. **El caso de 0 filas sale solo**: el bucle no entra y devuelves `[]`.

```js
export function trianguloPascal(numFilas) {
  const triangulo = [];

  for (let i = 0; i < numFilas; i++) {
    const fila = [1];
    const anterior = triangulo[i - 1];
    for (let j = 1; j < i; j++) {
      fila.push(anterior[j - 1] + anterior[j]);
    }
    if (i > 0) fila.push(1);
    triangulo.push(fila);
  }

  return triangulo;
}
```

## Por qué funciona

Recorrido con `trianguloPascal(5)`:

| `i` | `anterior` | Números del medio (`j` de 1 a `i - 1`) | Fila |
|---|---|---|---|
| 0 | (no hay) | ninguno | `[1]` |
| 1 | `[1]` | ninguno (`j < 1` no entra) | `[1, 1]` |
| 2 | `[1, 1]` | j=1: 1 + 1 = 2 | `[1, 2, 1]` |
| 3 | `[1, 2, 1]` | j=1: 1 + 2 = 3, j=2: 2 + 1 = 3 | `[1, 3, 3, 1]` |
| 4 | `[1, 3, 3, 1]` | j=1: 4, j=2: 6, j=3: 4 | `[1, 4, 6, 4, 1]` |

En la fila 0, `triangulo[-1]` es `undefined`, pero no pasa nada porque el bucle del medio no entra y nunca se lee. El `if (i > 0)` evita que la fila 0 quede como `[1, 1]`.

## Errores comunes

- **Agregar el `1` final también en la fila 0.** Te queda `[[1, 1], ...]`. Lo reconoces en el test "una sola fila".
- **Leer fuera de la fila anterior.** Si el bucle del medio va hasta `j <= i`, lees `anterior[i]`, que no existe: `undefined + 1` da `NaN`. Los números del medio van de 1 a `i - 1`.
- **Guardar la misma fila y modificarla.** Si reutilizas un solo arreglo `fila` para todas las vueltas, todas las filas del triángulo apuntan al mismo arreglo y terminan iguales. Crea `const fila = [1]` **dentro** del bucle.
- **Devolver `[[1]]` cuando piden 0 filas.** Con el bucle normal no pasa; pasa cuando se agrega la primera fila "a mano" antes del bucle.
- **Confundir filas con índices.** `numFilas = 5` produce las filas 0 a 4; la última tiene 5 números, no 6.

## Otra forma de resolverlo

**Rellenar con ceros a los lados**: si a la fila anterior le pones un 0 a cada lado, cada número nuevo es la suma de dos vecinos, sin casos especiales para los extremos.

```js
const triangulo = [];
for (let i = 0; i < numFilas; i++) {
  if (i === 0) {
    triangulo.push([1]);
    continue;
  }
  const anterior = [0, ...triangulo[i - 1], 0];
  const fila = [];
  for (let j = 0; j < anterior.length - 1; j++) {
    fila.push(anterior[j] + anterior[j + 1]);
  }
  triangulo.push(fila);
}
return triangulo;
```

Es elegante, pero crea un arreglo extra por fila. También puedes escribir la fila con `map`.

**Fórmula combinatoria**: el número en la fila `n`, posición `k`, es C(n, k), y se puede calcular desde el anterior: `C(n, k) = C(n, k - 1) * (n - k + 1) / k`. Sirve si te piden **solo una fila** (Pascal's Triangle II) sin construir las demás.

**¿Cuál conviene?** La de la fila anterior: es la más clara y la que espera el entrevistador. Las tres son O(n²) de tiempo, porque el triángulo tiene unos n² / 2 números y hay que generarlos todos, y O(n²) de memoria por el resultado.

## Cómo explicarlo en la entrevista

> "Cada fila depende solo de la anterior. La armo empezando con 1, cada número del medio en la posición j es la suma de las posiciones j menos 1 y j de la fila de arriba, y termino con otro 1, salvo en la primera fila. Voy guardando las filas en el resultado para tener la anterior a mano. Es O(n²) de tiempo y de memoria, que es lo mínimo porque hay que devolver todos esos números. Es un ejemplo sencillo de programación dinámica: construyo la respuesta a partir de resultados ya calculados."

## Conceptos

- **Arreglo de arreglos**: `triangulo[i]` es una fila y `triangulo[i][j]` un número.
- **Construir a partir del paso anterior**: la idea base de la programación dinámica.
- **Límites de un bucle**: los números del medio van de 1 a `i - 1`.
- **Crear un arreglo nuevo en cada vuelta**: si reutilizas uno, todas las referencias apuntan al mismo.
- **Spread para rellenar**: `[0, ...fila, 0]`.
