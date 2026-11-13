## Idea clave

Recorres la grilla. Cada vez que encuentras tierra **que todavía no visitaste**, es una isla nueva: la cuentas y la **hundes** entera con una búsqueda en profundidad (conviertes en agua esa celda y, recursivamente, todas las conectadas). Así nunca vuelves a contar la misma isla.

## Paso a paso

1. **La trampa obvia**: contar las celdas con `"1"`. El ejemplo tiene 7 celdas de tierra pero solo 3 islas. Lo que hay que contar son **grupos conectados**.
2. **La solución directa** (dila en voz alta): recorrer la grilla y, al encontrar tierra, explorar su isla marcando las celdas visitadas en un `Set` con claves como `"f,c"`. Antes de contar una celda, preguntas si ya está en el `Set`. Funciona y es O(filas × columnas), pero las claves de texto y el `Set` agregan memoria y código.
3. **Simplifica: hunde la isla.** En vez de un `Set` aparte, marca las celdas visitadas cambiándolas a `"0"`. Una celda hundida ya no parece tierra, así que el recorrido principal la ignora.
4. **Trabaja sobre una copia**: `grilla.map((fila) => [...fila])` copia cada fila. Si hundieras la grilla original, le borrarías los datos a quien te la pasó.
5. **La función `hundir(f, c)`** (búsqueda en profundidad, DFS):
   - Si `(f, c)` está fuera de la grilla, termina.
   - Si no es tierra, termina.
   - Si es tierra, conviértela en `"0"` y llama a `hundir` con sus 4 vecinas.
6. **El recorrido principal**: dos bucles por filas y columnas. Cuando `g[f][c] === "1"`, suma una isla y llama a `hundir(f, c)`.
7. **Costo**: cada celda se hunde como mucho una vez y se revisa unas pocas veces (desde sus vecinas): O(filas × columnas) de tiempo. La memoria es O(filas × columnas) por la copia y, en el peor caso, por la profundidad de la recursión.

```js
export function contarIslas(grilla) {
  if (grilla.length === 0) return 0;
  const filas = grilla.length;
  const columnas = grilla[0].length;
  const g = grilla.map((fila) => [...fila]);
  let islas = 0;

  function hundir(f, c) {
    if (f < 0 || c < 0 || f >= filas || c >= columnas) return;
    if (g[f][c] !== "1") return;
    g[f][c] = "0";
    hundir(f + 1, c);
    hundir(f - 1, c);
    hundir(f, c + 1);
    hundir(f, c - 1);
  }

  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (g[f][c] === "1") {
        islas++;
        hundir(f, c);
      }
    }
  }
  return islas;
}
```

## Por qué funciona

Recorrido con el ejemplo (filas y columnas desde 0):

```
    c0  c1  c2  c3  c4
f0  1   1   0   0   0
f1  1   1   0   0   0
f2  0   0   1   0   0
f3  0   0   0   1   1
```

| Celda que encuentra el recorrido | ¿Es `"1"`? | `islas` | Celdas que hunde `hundir` |
|---|---|---|---|
| (0, 0) | sí | **1** | (0, 0), (1, 0), (1, 1), (0, 1) |
| (0, 1) | no, ya hundida | 1 | |
| (1, 0), (1, 1) | no, ya hundidas | 1 | |
| (2, 2) | sí | **2** | (2, 2) (sus vecinas son agua) |
| (3, 3) | sí | **3** | (3, 3), (3, 4) |
| (3, 4) | no, ya hundida | 3 | |

Resultado: 3. El hundimiento de (0, 0) baja a (1, 0), de ahí a (1, 1) (su derecha), y de ahí sube a (0, 1): por eso la isla de 4 celdas se cuenta una sola vez. La isla en forma de U del test funciona igual: `hundir` la recorre entera aunque tenga curvas.

El (2, 2) y el (3, 3) se tocan solo en diagonal, y `hundir` nunca mira diagonales: son islas distintas.

## Errores comunes

- **Contar celdas de tierra en vez de islas.** El ejemplo daría 7. Lo reconoces en casi todos los tests.
- **No marcar las celdas visitadas.** `hundir` se llama entre dos vecinas para siempre: (0, 0) llama a (0, 1), que llama a (0, 0)... y aparece `Maximum call stack size exceeded`.
- **Revisar los límites después de leer la celda.** `g[-1][0]` es `undefined[0]` y lanza `TypeError`. Comprueba `f < 0 || c < 0 || f >= filas || c >= columnas` **antes** de leer.
- **Incluir diagonales** (8 vecinas). Unirías islas que no se tocan. Lo reconoces en el test de las diagonales.
- **Hundir la grilla original.** El conteo sale bien, pero quien llamó a la función recibe su grilla llena de agua. Lo reconoces en el test "no modifica la grilla original".
- **Comparar con el número `1`** en vez del texto `"1"`. `"1" === 1` es `false`: nunca encuentras tierra y devuelves 0.

## Otra forma de resolverlo

**Con un `Set` de visitados** (paso 2): no necesitas copiar la grilla, pero sí guardar cada celda visitada como `"f,c"`. Misma complejidad, un poco más de código.

**BFS con una cola (sin recursión)**: al encontrar tierra, la metes en una cola y procesas: sacas una celda, metes sus vecinas de tierra y las marcas como agua al meterlas. Así no dependes de la pila de llamadas, que con islas enormes (por ejemplo, una grilla de 1000 × 1000 toda de tierra) podría desbordarse:

```js
const cola = [[f, c]];
g[f][c] = "0";
while (cola.length > 0) {
  const [cf, cc] = cola.shift();
  for (const [df, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nf = cf + df;
    const nc = cc + dc;
    if (nf >= 0 && nc >= 0 && nf < filas && nc < columnas && g[nf][nc] === "1") {
      g[nf][nc] = "0";
      cola.push([nf, nc]);
    }
  }
}
```

**¿Cuál conviene?** La DFS recursiva: es la más corta y la que el entrevistador espera para empezar. Menciona la BFS como mejora si te preguntan por grillas muy grandes.

## Cómo explicarlo en la entrevista

> "Recorro la grilla. Cada vez que encuentro tierra sin visitar, cuento una isla nueva y la hundo con una búsqueda en profundidad: convierto en agua esa celda y, recursivamente, todas las conectadas en horizontal y vertical. Así no la vuelvo a contar. Trabajo sobre una copia para no modificar la entrada. Es O(filas por columnas) de tiempo, porque cada celda se hunde una sola vez, y O(filas por columnas) de memoria en el peor caso por la copia y la recursión. Si la grilla fuera enorme, usaría una cola en vez de recursión."

## Conceptos

- **Grilla como grafo**: cada celda es un nodo y sus vecinas horizontales y verticales son sus conexiones.
- **Componentes conectadas**: grupos de nodos que se alcanzan entre sí; contar islas es contar componentes.
- **DFS (búsqueda en profundidad)**: explorar todo lo alcanzable desde un punto, aquí con recursión.
- **Marcar visitados**: cambiar la celda (o usar un `Set`) para no procesarla dos veces y no entrar en bucles infinitos.
- **Copia de una matriz**: `grilla.map((fila) => [...fila])`; `[...grilla]` solo copiaría la lista de filas, no las filas.
- **Función dentro de función**: `hundir` usa `g`, `filas` y `columnas` de la función externa (closure).
