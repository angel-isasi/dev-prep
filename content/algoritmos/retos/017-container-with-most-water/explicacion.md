## Idea clave

Empiezas con las dos líneas de los extremos, que dan el ancho máximo. El agua la limita la línea **más baja**, así que mover la alta nunca puede mejorar el área. En cada paso calculas el área y mueves hacia adentro el puntero de la línea más baja, con la esperanza de encontrar una más alta. Dos punteros, O(n).

## Paso a paso

1. **La solución directa** (dila en voz alta): probar todas las parejas `(i, j)` y quedarte con la mayor área. Es O(n²).

   ```js
   let mejor = 0;
   for (let i = 0; i < alturas.length; i++) {
     for (let j = i + 1; j < alturas.length; j++) {
       mejor = Math.max(mejor, Math.min(alturas[i], alturas[j]) * (j - i));
     }
   }
   return mejor;
   ```

2. **Empieza por los extremos.** `i = 0` y `j = n - 1` tienen la mayor distancia posible. Cualquier otra pareja será más angosta; para ganarle necesita ser más alta.
3. **¿Qué puntero mover?** Supón que `alturas[i] < alturas[j]`. Si movieras `j`, el ancho baja y la altura sigue siendo como mucho `alturas[i]` (la baja manda): el área **solo puede bajar**. En cambio, si mueves `i`, puede aparecer una línea más alta que compense la pérdida de ancho.
4. **Descarta la línea baja para siempre.** Al mover `i`, estás diciendo: "la línea `i` ya dio su mejor recipiente posible, que es justo con `j`, porque `j` es la pareja más lejana que le queda". No pierdes ninguna respuesta.
5. **Si son iguales**, puedes mover cualquiera; la solución mueve `j`.
6. **Repite mientras `i < j`**, calculando el área y guardando la mayor.

```js
export function maxAgua(alturas) {
  let i = 0;
  let j = alturas.length - 1;
  let mejor = 0;

  while (i < j) {
    const area = Math.min(alturas[i], alturas[j]) * (j - i);
    mejor = Math.max(mejor, area);
    if (alturas[i] < alturas[j]) i++;
    else j--;
  }

  return mejor;
}
```

## Por qué funciona

Recorrido con `maxAgua([1, 8, 6, 2, 5, 4, 8, 3, 7])`:

| `i` (altura) | `j` (altura) | Área = menor * ancho | `mejor` | Se mueve |
|---|---|---|---|---|
| 0 (1) | 8 (7) | 1 * 8 = 8 | 8 | `i` (1 < 7) |
| 1 (8) | 8 (7) | 7 * 7 = **49** | **49** | `j` (8 > 7) |
| 1 (8) | 7 (3) | 3 * 6 = 18 | 49 | `j` |
| 1 (8) | 6 (8) | 8 * 5 = 40 | 49 | `j` (iguales) |
| 1 (8) | 5 (4) | 4 * 4 = 16 | 49 | `j` |
| 1 (8) | 4 (5) | 5 * 3 = 15 | 49 | `j` |
| 1 (8) | 3 (2) | 2 * 2 = 4 | 49 | `j` |
| 1 (8) | 2 (6) | 6 * 1 = 6 | 49 | `j` |
| 1 | 1 | | | `i = j`: termina |

Solo 8 cálculos de área en lugar de 36 parejas. En la primera fila, mover `j` habría sido inútil: cualquier recipiente con la línea 0 (altura 1) guarda como mucho 1 * ancho, y el ancho solo baja.

## Errores comunes

- **Mover el puntero de la línea más alta.** Descartas recipientes buenos. Con el ejemplo, si en la primera fila mueves `j`, nunca evalúas la pareja (1, 8) y no llegas a 49.
- **Usar `Math.max` para la altura.** El agua se derrama por la línea más baja: la altura útil es `Math.min`.
- **Calcular el ancho como `j - i + 1`.** Las líneas no tienen grosor: entre la posición 1 y la 8 hay 7 de distancia.
- **Elegir las dos líneas más altas.** Con `[1, 2, 4, 3]`, las más altas (4 y 3) dan 3 * 1 = 3, pero la respuesta es 4 (alturas 2 y 3 a distancia 2). Lo reconoces en ese test.
- **Usar `i <= j`.** Cuando `i === j` el ancho es 0; no rompe el resultado, pero es una vuelta inútil y muestra que no pensaste el límite.

## Otra forma de resolverlo

**Todas las parejas** (paso 1): O(n²) de tiempo, O(1) de memoria. Correcta y fácil de verificar. Con 100 000 líneas son unos 5 000 millones de áreas.

**¿Cuál conviene?** La de dos punteros. Lo importante en la entrevista no es solo escribirla, sino **justificar** por qué mover la línea baja no pierde la respuesta: "la línea baja ya dio su mejor recipiente con la pareja más lejana; con cualquier otra, el ancho es menor y la altura sigue limitada por ella". Si no puedes justificarlo, escribe la O(n²) y explica que buscarías la mejora.

## Cómo explicarlo en la entrevista

> "La solución directa es probar todas las parejas, que es O(n²). Para mejorarlo uso dos punteros: empiezo con las dos líneas más lejanas, que dan el ancho máximo. El agua la limita la línea más baja, así que mover la alta nunca mejora el resultado: el ancho baja y la altura sigue limitada. Por eso muevo siempre la más baja hacia adentro, calculo el área en cada paso y guardo la mayor. Queda O(n) de tiempo y O(1) de memoria."

## Conceptos

- **Dos punteros desde los extremos**: empiezan en las puntas y se acercan; cada paso descarta una opción.
- **Razonamiento greedy (voraz)**: tomar la decisión localmente mejor y demostrar que no pierde la respuesta global.
- **El factor limitante**: cuando un resultado depende del mínimo de dos valores, mejorar el mayor no sirve.
- **Distancia entre índices**: `j - i`, sin `+ 1` cuando mides separación, no cantidad de elementos.
