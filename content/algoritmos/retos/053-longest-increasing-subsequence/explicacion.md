## Idea clave

Para cada posición `i` calculas `terminaEn[i]`: el largo de la subsecuencia creciente más larga que **termina en `nums[i]`**. Se obtiene mirando todos los números anteriores más chicos: `nums[i]` se puede pegar al final de cualquiera de ellas, así que vale 1 más la mejor. La respuesta es el **máximo de toda la tabla**.

## Paso a paso

1. **La solución directa** (dila en voz alta): generar todas las subsecuencias (cada elemento entra o no entra), quedarte con las crecientes y medir la más larga. Con n elementos hay 2ⁿ subsecuencias: con 30 números ya son más de mil millones. Inviable.
2. **Busca un subproblema más chico.** "La mejor subsecuencia de todo el arreglo" es difícil de construir por partes. Pero "la mejor subsecuencia que **termina exactamente en `nums[i]`**" sí: si conoces esa respuesta para cada posición anterior a `i`, puedes calcular la de `i`.
3. **La fórmula.** Una subsecuencia creciente que termina en `nums[i]` es: `nums[i]` solo (largo 1), o una subsecuencia que termina en algún `nums[j]` anterior **más chico**, con `nums[i]` agregado al final. Por eso:

   `terminaEn[i] = 1 + el mayor terminaEn[j], para los j < i con nums[j] < nums[i]` (o 1 si no hay ninguno).
4. **Llena la tabla de izquierda a derecha.** Empieza con todo en 1. Para cada `i`, recorre los `j` anteriores; cuando `nums[j] < nums[i]`, prueba `terminaEn[j] + 1`. Cuando llegas a `i`, todos los `terminaEn[j]` anteriores ya son definitivos: eso es programación dinámica.
5. **La respuesta no es la última casilla.** La mejor subsecuencia puede terminar en cualquier parte: en `[1, 2, 3, 0]` termina en el 3, no en el 0. Devuelve `Math.max(...terminaEn)`.
6. **Costo**: dos bucles anidados, O(n²) de tiempo, y O(n) de memoria por la tabla. No modificas `nums`.

```js
export function subsecuenciaCreciente(nums) {
  if (nums.length === 0) return 0;
  const terminaEn = new Array(nums.length).fill(1);

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        terminaEn[i] = Math.max(terminaEn[i], terminaEn[j] + 1);
      }
    }
  }

  return Math.max(...terminaEn);
}
```

## Por qué funciona

Recorrido con `subsecuenciaCreciente([10, 9, 2, 5, 3, 7, 101, 18])`:

| `i` | `nums[i]` | Anteriores más chicos (y su `terminaEn`) | `terminaEn[i]` | Una subsecuencia que termina ahí |
|---|---|---|---|---|
| 0 | 10 | ninguno | **1** | [10] |
| 1 | 9 | ninguno | **1** | [9] |
| 2 | 2 | ninguno | **1** | [2] |
| 3 | 5 | 2 (1) | 1 + 1 = **2** | [2, 5] |
| 4 | 3 | 2 (1) | 1 + 1 = **2** | [2, 3] |
| 5 | 7 | 2 (1), 5 (2), 3 (2) | 2 + 1 = **3** | [2, 5, 7] |
| 6 | 101 | todos; el mejor es 7 (3) | 3 + 1 = **4** | [2, 5, 7, 101] |
| 7 | 18 | 10 (1), 9 (1), 2 (1), 5 (2), 3 (2), 7 (3) | 3 + 1 = **4** | [2, 5, 7, 18] |

Tabla final: `[1, 1, 1, 2, 2, 3, 4, 4]`. El máximo es **4**.

Fíjate en `i = 5`: el 7 podría ir detrás del 2, del 5 o del 3. Detrás del 2 haría largo 2; detrás del 5 o del 3, largo 3. La tabla elige la mejor opción sin que tengas que adivinar cuál subsecuencia "seguir".

Con `[7, 7, 7, 7]`: como la comparación es `nums[j] < nums[i]` (estricta), ningún 7 se pega detrás de otro 7. Toda la tabla queda en 1.

## Errores comunes

- **Devolver `terminaEn[n - 1]`** en vez del máximo de la tabla. Lo reconoces en el test `[1, 2, 3, 0]`: das 1 en vez de 3.
- **Usar `<=` en vez de `<`.** Cuentas los iguales como crecientes. Lo reconoces en el test `[7, 7, 7, 7]`: das 4 en vez de 1.
- **Contar solo subidas seguidas** (como si fuera subcadena). Lo reconoces en el test `[1, 5, 2, 3, 4]`: das 3 (`2, 3, 4`) en vez de 4 (`1, 2, 3, 4`).
- **Inicializar la tabla en 0.** Un número solo ya es una subsecuencia de largo 1; con 0 todo sale uno menos.
- **Mirar solo el `j` inmediatamente anterior** (`terminaEn[i - 1]`). El número que conviene puede estar mucho más atrás: en el ejemplo, el 7 se pega detrás del 5, que está dos lugares antes.
- **`Math.max(...[])` con el arreglo vacío** da `-Infinity`. Por eso el `if (nums.length === 0) return 0` va al inicio.

## Otra forma de resolverlo

**Con búsqueda binaria, O(n log n)**: mantienes un arreglo `colas` donde `colas[k]` es el **menor final posible** de una subsecuencia creciente de largo `k + 1`. Para cada número, buscas con búsqueda binaria la primera posición de `colas` con un valor `>=` a él y lo reemplazas (o lo agregas al final si es mayor que todos). El largo de `colas` es la respuesta. Ojo: `colas` no es una subsecuencia real, solo guarda los mejores finales.

```js
const colas = [];
for (const x of nums) {
  let izq = 0;
  let der = colas.length;
  while (izq < der) {
    const medio = Math.floor((izq + der) / 2);
    if (colas[medio] < x) izq = medio + 1;
    else der = medio;
  }
  colas[izq] = x; // reemplaza, o agrega si izq === colas.length
}
return colas.length;
```

**¿Cuál conviene?** En una entrevista junior, la de O(n²): se explica con una tabla y es la que esperan. Menciona la de O(n log n) como mejora si te preguntan por arreglos muy grandes; es difícil de justificar en voz alta si no la practicaste.

## Cómo explicarlo en la entrevista

> "Probar todas las subsecuencias es exponencial. Uso programación dinámica: para cada posición calculo el largo de la subsecuencia creciente más larga que termina en ese número. Empieza en uno, el número solo, y para cada número anterior más chico pruebo pegarlo al final, o sea, su valor más uno, y me quedo con el máximo. La respuesta es el máximo de toda la tabla, porque la mejor subsecuencia puede terminar en cualquier parte. Son dos bucles anidados: O(n al cuadrado) de tiempo y O(n) de memoria. Existe una versión O(n log n) con búsqueda binaria si hiciera falta."

## Conceptos

- **Subsecuencia vs subcadena**: la subsecuencia puede saltarse elementos; la subcadena es un tramo seguido.
- **Programación dinámica**: llenar una tabla donde cada casilla se calcula con casillas ya resueltas.
- **"Termina en i"**: un truco muy usado en DP para definir subproblemas que sí se pueden combinar.
- **Estrictamente creciente**: cada elemento es mayor (`<`), no mayor o igual (`<=`).
- **`Math.max(...arreglo)`**: el spread pasa cada elemento como argumento; con un arreglo vacío da `-Infinity`.
- **Búsqueda binaria**: base de la versión O(n log n).
