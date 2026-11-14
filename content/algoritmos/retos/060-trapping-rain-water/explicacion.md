## Idea clave

El agua encima de una columna llega hasta la **más baja** de dos paredes: la más alta a su izquierda y la más alta a su derecha. Esa columna aporta `Math.min(maxIzquierda, maxDerecha) - altura`. Con **dos punteros** que avanzan desde los extremos, moviendo siempre el lado más bajo, sabes en cada paso cuál de las dos paredes manda, sin calcular las dos para cada columna: O(n) de tiempo y O(1) de memoria.

## Paso a paso

1. **Piensa en una columna, no en el total.** En `[4, 2, 0, 3, 2, 5]`, mira la columna 2 (altura 0). A su izquierda la pared más alta mide 4; a su derecha, 5. El agua sube hasta 4 (por encima, se escaparía por la izquierda). Como la columna mide 0, guarda `4 - 0 = 4` unidades. El total es la suma de lo que guarda cada columna.
2. **La fórmula**: `agua[i] = Math.min(maxIzq[i], maxDer[i]) - alturas[i]`, donde los máximos **incluyen** la propia columna. Así nunca da negativo: si la columna es la más alta de su lado, el mínimo es ella misma y aporta 0.
3. **La solución directa** (dila en voz alta): para cada columna, recorrer hacia la izquierda buscando el máximo y hacia la derecha buscando el otro. Correcta, pero O(n²): cada columna recorre todo el arreglo.
4. **Primera mejora: precalcular los máximos.** Un arreglo `maxIzq` que se llena de izquierda a derecha (`maxIzq[i] = Math.max(maxIzq[i - 1], alturas[i])`) y otro `maxDer` de derecha a izquierda. Luego una pasada suma el agua. O(n) de tiempo, O(n) de memoria. Con `[4, 2, 0, 3, 2, 5]`:

   | `i` | 0 | 1 | 2 | 3 | 4 | 5 |
   |---|---|---|---|---|---|---|
   | `alturas` | 4 | 2 | 0 | 3 | 2 | 5 |
   | `maxIzq` | 4 | 4 | 4 | 4 | 4 | 5 |
   | `maxDer` | 5 | 5 | 5 | 5 | 5 | 5 |
   | `min - altura` | 0 | 2 | 4 | 1 | 2 | 0 |

   Total: 9.
5. **Segunda mejora: dos punteros.** ¿Necesitas conocer los **dos** máximos? No: solo el **menor** de ellos. Pon `izq` al inicio y `der` al final, con `maxIzq` y `maxDer` (lo más alto visto desde cada lado).
6. **Mueve siempre el lado más bajo.** Si `alturas[izq] < alturas[der]`, a la derecha de `izq` existe una pared (`der`) más alta que todo lo que viste por la izquierda. Entonces el límite de la columna `izq` es seguro `maxIzq`, aunque no conozcas todavía el máximo real de la derecha: ese máximo es por lo menos `alturas[der]`, y eso ya le gana a `maxIzq`. Actualiza `maxIzq`, suma `maxIzq - alturas[izq]` y avanza `izq`. Si no, haces lo mismo por la derecha.
7. **Termina cuando se cruzan** (`izq < der`). La columna donde se encuentran es la más alta vista, y sobre ella no hay agua.
8. **Casos borde gratis**: con `[]`, `der = -1` y el bucle no entra. Con 1 o 2 columnas, ninguna tiene paredes a los dos lados y suma 0.
9. **Costo**: cada paso mueve un puntero, O(n) de tiempo. Solo cinco variables: O(1) de memoria.

```js
export function aguaAtrapada(alturas) {
  let izq = 0;
  let der = alturas.length - 1;
  let maxIzq = 0;
  let maxDer = 0;
  let agua = 0;

  while (izq < der) {
    if (alturas[izq] < alturas[der]) {
      maxIzq = Math.max(maxIzq, alturas[izq]);
      agua += maxIzq - alturas[izq];
      izq++;
    } else {
      maxDer = Math.max(maxDer, alturas[der]);
      agua += maxDer - alturas[der];
      der--;
    }
  }

  return agua;
}
```

## Por qué funciona

Recorrido con el ejemplo clásico `[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]` (posiciones 0 a 11):

| `izq` | `der` | `alturas[izq]` | `alturas[der]` | Lado que mueve | Máximo de ese lado | Agua sumada | `agua` |
|---|---|---|---|---|---|---|---|
| 0 | 11 | 0 | 1 | izquierda | `maxIzq` = 0 | 0 - 0 = 0 | 0 |
| 1 | 11 | 1 | 1 | derecha (no es menor) | `maxDer` = 1 | 1 - 1 = 0 | 0 |
| 1 | 10 | 1 | 2 | izquierda | `maxIzq` = 1 | 1 - 1 = 0 | 0 |
| 2 | 10 | 0 | 2 | izquierda | `maxIzq` = 1 | 1 - 0 = **1** | 1 |
| 3 | 10 | 2 | 2 | derecha | `maxDer` = 2 | 2 - 2 = 0 | 1 |
| 3 | 9 | 2 | 1 | derecha | `maxDer` = 2 | 2 - 1 = **1** | 2 |
| 3 | 8 | 2 | 2 | derecha | `maxDer` = 2 | 2 - 2 = 0 | 2 |
| 3 | 7 | 2 | 3 | izquierda | `maxIzq` = 2 | 2 - 2 = 0 | 2 |
| 4 | 7 | 1 | 3 | izquierda | `maxIzq` = 2 | 2 - 1 = **1** | 3 |
| 5 | 7 | 0 | 3 | izquierda | `maxIzq` = 2 | 2 - 0 = **2** | 5 |
| 6 | 7 | 1 | 3 | izquierda | `maxIzq` = 2 | 2 - 1 = **1** | 6 |
| 7 | 7 | | | se cruzan: termina | | | **6** |

Devuelve 6. Fíjate en la fila de `izq = 5`: la columna mide 0 y `maxIzq` es 2. No sabes cuál es la pared más alta a la derecha, pero sabes que hay una de altura 3 (en `der = 7`), y 3 > 2. Así que el agua llega a 2, sin importar qué haya más allá.

## Errores comunes

- **Usar `Math.max` en vez de `Math.min`** de las dos paredes. El agua se escapa por la más baja, no por la más alta. Lo reconoces en el test `[3, 0, 0, 2, 0, 4]`: das más de 10.
- **Calcular los máximos sin incluir la propia columna** y no cortar en 0. Una columna más alta que sus vecinas aportaría agua negativa. Lo reconoces en el test de las escaleras: das -7 en vez de 0.
- **Mover el lado más alto** en los dos punteros. Calculas el agua con un máximo que no es el que manda. Lo reconoces en el ejemplo clásico: das 14 en vez de 6.
- **Restar con la altura de la columna vecina** en vez de con `maxIzq` o `maxDer`. La pared que retiene el agua es la más alta vista hasta ahí, no la de al lado. Lo reconoces en casi todos los tests: sumas menos agua de la que hay.
- **Buscar solo la pared más alta de todo el arreglo** y llenar todo hasta ella. Del lado de la pared más baja el agua se escapa. Lo reconoces en `[2, 0, 5, 0, 3]`: das 10 en vez de 5.
- **Contar agua sobre la primera y la última columna.** Por los extremos siempre se escapa; con dos punteros no pasa porque `maxIzq` empieza en la propia columna.

## Otra forma de resolverlo

**Máximos precalculados (paso 4)**: dos arreglos auxiliares y tres pasadas. O(n) de tiempo y O(n) de memoria. Más fácil de explicar que los dos punteros, porque aplica la fórmula tal cual:

```js
const n = alturas.length;
const maxIzq = new Array(n);
const maxDer = new Array(n);
for (let i = 0; i < n; i++) {
  maxIzq[i] = Math.max(alturas[i], i > 0 ? maxIzq[i - 1] : 0);
}
for (let i = n - 1; i >= 0; i--) {
  maxDer[i] = Math.max(alturas[i], i < n - 1 ? maxDer[i + 1] : 0);
}
let agua = 0;
for (let i = 0; i < n; i++) {
  agua += Math.min(maxIzq[i], maxDer[i]) - alturas[i];
}
return agua;
```

**Fuerza bruta (paso 3)**: O(n²) de tiempo y O(1) de memoria. Sirve para arrancar en voz alta.

**¿Cuál conviene?** En la entrevista, explica primero la fórmula por columna, luego los máximos precalculados (O(n) y fácil de defender) y, si el entrevistador pide O(1) de memoria, pasa a dos punteros explicando por qué siempre mueves el lado más bajo. Si te pones nervioso, la de los arreglos es igual de rápida y más difícil de equivocar.

## Cómo explicarlo en la entrevista

> "Pienso columna por columna: el agua encima de una columna llega hasta la menor entre la pared más alta a su izquierda y la más alta a su derecha, menos su propia altura. Calcular esos máximos para cada columna sería O(n al cuadrado); puedo precalcularlos en dos arreglos y queda O(n). Para bajar la memoria a O(1) uso dos punteros desde los extremos con el máximo visto de cada lado. Siempre muevo el lado más bajo: si la izquierda es más baja, sé que a la derecha hay una pared más alta, así que el agua de esa columna la decide el máximo de la izquierda. Sumo, avanzo y repito hasta que se crucen. Es O(n) de tiempo y O(1) de memoria."

## Conceptos

- **Pensar por elemento**: descomponer el total en lo que aporta cada posición.
- **Máximos de prefijo y de sufijo**: arreglos donde cada casilla guarda el máximo hasta ahí, desde la izquierda o desde la derecha.
- **Dos punteros desde los extremos**: como en Container With Most Water; se mueve el lado que limita.
- **`Math.min` como cuello de botella**: el agua (como la capacidad de un recipiente) la decide la pared más baja.
- **Cambiar memoria por tiempo**: los arreglos auxiliares bajan de O(n²) a O(n); los dos punteros además ahorran la memoria.
