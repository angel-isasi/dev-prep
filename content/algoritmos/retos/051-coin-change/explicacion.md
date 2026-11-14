## Idea clave

La menor cantidad de monedas para un monto `m` es **1 (la última moneda que usas) más la menor cantidad para lo que faltaba**, `m - moneda`, probando cada moneda. Ese "problema chico dentro del grande" se repite muchísimas veces, así que guardas la respuesta de cada monto en una tabla y la calculas una sola vez: eso es **programación dinámica**.

## Paso a paso

1. **Descarta la idea codiciosa.** Lo primero que se te ocurre es tomar siempre la moneda más grande que quepa. Con `[1, 3, 4]` y monto 6 tomas 4, luego 1 y 1: tres monedas. Pero 3 + 3 son dos. Con `[2, 5]` y monto 8 es peor: tomas 5, te quedan 3 y con monedas de 2 no sales, aunque 2 + 2 + 2 + 2 sí funciona. Hay que **probar opciones**, no elegir a ciegas.
2. **Piensa en la última moneda.** Cualquier forma de pagar `m` termina con alguna moneda. Si la última fue una de 5, antes pagaste `m - 5`, y lo ideal es haberlo pagado con la menor cantidad posible. Así que:

   `minimo(m) = 1 + el menor de minimo(m - moneda), para cada moneda que quepa`

   Con `minimo(0) = 0` como caso base (pagar 0 no requiere monedas).
3. **La solución directa** (dila en voz alta): escribir esa fórmula como recursión. Es correcta, pero lentísima:

   ```js
   function minimo(m) {
     if (m === 0) return 0;
     if (m < 0) return Infinity; // me pasé: este camino no sirve
     let mejor = Infinity;
     for (const moneda of monedas) {
       mejor = Math.min(mejor, minimo(m - moneda) + 1);
     }
     return mejor;
   }
   ```

   Con `[1, 2, 5]` y monto 11, `minimo(11)` llama a `minimo(10)`, `minimo(9)` y `minimo(6)`. Pero `minimo(10)` vuelve a llamar a `minimo(9)`, y los dos terminan llamando a `minimo(8)`, `minimo(7)`... El mismo monto se calcula cientos de veces: el tiempo crece de forma exponencial.
4. **Qué es programación dinámica.** Cuando una recursión resuelve **los mismos subproblemas una y otra vez**, guardas cada respuesta la primera vez que la calculas. Hay dos formas:
   - **De arriba hacia abajo (memoización)**: la misma recursión, pero con un `Map` donde anotas `minimo(m)` y lo consultas antes de calcular.
   - **De abajo hacia arriba (tabla)**: llenas un arreglo desde el monto 0 hasta el monto pedido. Cuando calculas `minimo[m]`, todos los montos menores ya están listos.
5. **Arma la tabla.** `minimo` tiene `monto + 1` casillas (de 0 a `monto`). Empiezan en `Infinity`, que significa "no sé formarlo". `minimo[0] = 0`. ¿Por qué `Infinity`? Porque `Infinity + 1` sigue siendo `Infinity` y nunca gana un `Math.min`: un monto imposible no contamina a los demás.
6. **Llénala.** Para cada `m` de 1 a `monto`, y para cada moneda que no sea más grande que `m`, el candidato es `minimo[m - moneda] + 1`. Te quedas con el menor.
7. **Responde.** Si `minimo[monto]` sigue en `Infinity`, no hay forma: `-1`. Si no, ese número.
8. **Costo**: la tabla tiene `monto + 1` casillas y en cada una pruebas todas las monedas: O(monto × k) de tiempo, con k la cantidad de monedas. O(monto) de memoria por la tabla.

```js
export function cambioMonedas(monedas, monto) {
  const minimo = new Array(monto + 1).fill(Infinity);
  minimo[0] = 0;

  for (let m = 1; m <= monto; m++) {
    for (const moneda of monedas) {
      if (moneda > m) continue;
      const usandoEsta = minimo[m - moneda] + 1;
      if (usandoEsta < minimo[m]) minimo[m] = usandoEsta;
    }
  }

  return minimo[monto] === Infinity ? -1 : minimo[monto];
}
```

## Por qué funciona

Recorrido con `cambioMonedas([1, 3, 4], 6)`, el caso donde la moneda más grande engaña. Cada fila calcula una casilla usando casillas que ya están llenas:

| `m` | Con moneda 1: `minimo[m-1] + 1` | Con moneda 3: `minimo[m-3] + 1` | Con moneda 4: `minimo[m-4] + 1` | `minimo[m]` |
|---|---|---|---|---|
| 0 | | | | **0** (caso base) |
| 1 | `minimo[0] + 1` = 1 | no cabe | no cabe | **1** |
| 2 | `minimo[1] + 1` = 2 | no cabe | no cabe | **2** |
| 3 | `minimo[2] + 1` = 3 | `minimo[0] + 1` = 1 | no cabe | **1** |
| 4 | `minimo[3] + 1` = 2 | `minimo[1] + 1` = 2 | `minimo[0] + 1` = 1 | **1** |
| 5 | `minimo[4] + 1` = 2 | `minimo[2] + 1` = 3 | `minimo[1] + 1` = 2 | **2** |
| 6 | `minimo[5] + 1` = 3 | `minimo[3] + 1` = **2** | `minimo[2] + 1` = 3 | **2** |

Resultado: 2. En `m = 6` la opción "última moneda 4" da 3 (porque `minimo[2]` es 2), pero la opción "última moneda 3" da 2 (porque `minimo[3]` es 1). La tabla **compara todas las opciones**, por eso no cae en la trampa de la moneda grande.

Con `cambioMonedas([2], 3)`: `minimo[1]` queda en `Infinity` (la moneda 2 no cabe), `minimo[2] = 1` y `minimo[3] = minimo[1] + 1 = Infinity`. Devuelve -1.

## Errores comunes

- **Tomar siempre la moneda más grande (codicioso).** Funciona con las monedas del sol peruano, pero no en general. Lo reconoces en el test de `[1, 3, 4]` con 6 (das 3) y en el de `[2, 5]` con 8 (das -1).
- **Inicializar la tabla con 0 en vez de `Infinity`.** Todos los `Math.min` dan 0 o 1 y la respuesta sale demasiado chica. Tampoco puedes detectar los montos imposibles.
- **Olvidar `minimo[0] = 0`.** Todo queda en `Infinity` y siempre devuelves -1.
- **Tabla de largo `monto` en vez de `monto + 1`.** La casilla `minimo[monto]` no existe y lees `undefined`.
- **No revisar que la moneda quepa.** `minimo[m - moneda]` con índice negativo es `undefined`, y `undefined + 1` es `NaN`, que rompe las comparaciones.
- **Devolver `Infinity` en vez de `-1`.** El enunciado pide -1 cuando no se puede. Lo reconoces en el test de "imposible".

## Otra forma de resolverlo

**Recursión con memoización (de arriba hacia abajo)**: es la recursión del paso 3 más un `Map` que guarda cada monto ya resuelto. Misma complejidad, O(monto × k) de tiempo y O(monto) de memoria (más la pila de llamadas):

```js
export function cambioMonedas(monedas, monto) {
  const memo = new Map();
  function minimo(m) {
    if (m === 0) return 0;
    if (m < 0) return Infinity;
    if (memo.has(m)) return memo.get(m);
    let mejor = Infinity;
    for (const moneda of monedas) {
      mejor = Math.min(mejor, minimo(m - moneda) + 1);
    }
    memo.set(m, mejor);
    return mejor;
  }
  const r = minimo(monto);
  return r === Infinity ? -1 : r;
}
```

**BFS por niveles**: cada monto es un nodo y cada moneda una arista. El primer nivel en el que llegas a `monto` es la respuesta. También es O(monto × k), pero es más código.

**¿Cuál conviene?** En la entrevista, empieza explicando la recursión (muestra que entiendes el problema), agrega memoización y, si te sobra tiempo, pásala a tabla. La tabla es la más clara y no depende de la pila de llamadas, así que no se desborda con montos grandes.

## Cómo explicarlo en la entrevista

> "Primero aclaro que tomar siempre la moneda más grande no funciona; por ejemplo, con monedas 1, 3 y 4 para formar 6, lo codicioso da tres monedas y lo correcto es dos. Pienso en la última moneda: la respuesta para un monto es uno más la mejor respuesta para el monto menos esa moneda, probando todas. Como en la recursión los mismos montos se repiten, uso programación dinámica: una tabla de 0 al monto, inicializada en infinito, con cero en la posición 0, y la lleno de menor a mayor. Si al final la casilla sigue en infinito, devuelvo menos uno. Es O(monto por cantidad de monedas) de tiempo y O(monto) de memoria."

## Conceptos

- **Programación dinámica**: resolver un problema combinando respuestas de subproblemas más chicos, guardando cada una para no recalcularla.
- **Subproblemas repetidos**: la señal de que conviene DP; la recursión pura recalcula lo mismo muchas veces.
- **Memoización vs tabla**: guardar resultados dentro de la recursión (arriba hacia abajo) o llenar un arreglo desde el caso base (abajo hacia arriba).
- **Algoritmo codicioso**: elegir lo que parece mejor en cada paso sin mirar atrás; a veces falla, como aquí.
- **`Infinity` como "imposible"**: nunca gana un `Math.min` y `Infinity + 1` sigue siendo `Infinity`.
- **`new Array(n).fill(valor)`**: crea un arreglo de largo n con todas las casillas iguales.
