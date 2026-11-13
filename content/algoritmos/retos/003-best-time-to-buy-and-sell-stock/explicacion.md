## Idea clave

Para cada día, la mejor venta posible es vender hoy habiendo comprado en el día **más barato anterior**. Si mientras recorres vas guardando el precio mínimo visto, puedes calcular la ganancia de vender hoy en O(1) y quedarte con la mayor.

## Paso a paso

1. **La trampa obvia**: `Math.max(...precios) - Math.min(...precios)`. Con `[3, 8, 1, 4]` da 8 - 1 = 7, pero el 1 está **después** del 8: no puedes comprar en el futuro. La respuesta real es 5.
2. **La solución directa correcta** (dila en voz alta): dos bucles, `i` para el día de compra y `j > i` para el de venta. Prueba todas las parejas: O(n²).

   ```js
   let mejor = 0;
   for (let i = 0; i < precios.length; i++) {
     for (let j = i + 1; j < precios.length; j++) {
       mejor = Math.max(mejor, precios[j] - precios[i]);
     }
   }
   return mejor;
   ```

3. **Mira el bucle interno al revés.** Para un día de venta `j`, de todos los días de compra anteriores solo te interesa uno: el más barato. No necesitas recordarlos todos, solo el mínimo.
4. **Una sola pasada.** Lleva `minimo` (empieza en `Infinity` para que el primer precio siempre lo reemplace) y `mejor` (empieza en `0`, que es la respuesta si nunca se gana).
5. **En cada día**: primero actualizas `minimo`, después calculas `precio - minimo`. Si el día de hoy es el nuevo mínimo, la ganancia sale 0 (comprar y vender el mismo día), lo que no cambia `mejor`. Por eso el orden no rompe nada.

```js
export function maxGanancia(precios) {
  let minimo = Infinity;
  let mejor = 0;

  for (const precio of precios) {
    minimo = Math.min(minimo, precio);
    mejor = Math.max(mejor, precio - minimo);
  }

  return mejor;
}
```

## Por qué funciona

Recorrido con `maxGanancia([7, 1, 5, 3, 6, 4])`:

| Día | `precio` | `minimo` después | Ganancia si vendo hoy | `mejor` |
|---|---|---|---|---|
| 0 | 7 | 7 | 7 - 7 = 0 | 0 |
| 1 | 1 | **1** | 1 - 1 = 0 | 0 |
| 2 | 5 | 1 | 5 - 1 = 4 | 4 |
| 3 | 3 | 1 | 3 - 1 = 2 | 4 |
| 4 | 6 | 1 | 6 - 1 = **5** | **5** |
| 5 | 4 | 1 | 4 - 1 = 3 | 5 |

Ahora el caso trampa `[3, 8, 1, 4]`: en el día 1 la ganancia es 8 - 3 = 5. En el día 2 el mínimo baja a 1, pero eso solo sirve para ventas **posteriores**: el día 3 da 4 - 1 = 3. Nunca se calcula 8 - 1, porque cuando llegó el 1 el 8 ya había pasado. Resultado: 5.

Un arreglo vacío o de un día nunca supera el `mejor = 0` inicial, así que devuelve 0 sin casos especiales.

## Errores comunes

- **Restar el máximo global menos el mínimo global.** Ignora el orden de los días. Lo reconoces en el test `[3, 8, 1, 4]`: devuelves 7 en vez de 5.
- **Empezar `minimo` en 0.** Ningún precio es menor que 0, así que el mínimo se queda en 0 y la ganancia sería el precio más alto. Usa `Infinity` o `precios[0]`.
- **Empezar `mejor` en `-Infinity` o en un valor negativo.** Con precios que solo bajan devolverías una pérdida en vez de 0.
- **Buscar primero el día más barato y vender después de él.** Con `[2, 9, 1, 3]` el más barato es el 1 y después solo queda el 3: ganas 2, pero comprando a 2 y vendiendo a 9 ganas 7. El mínimo global no siempre es el mejor día de compra.
- **Usar `precios[0]` sin revisar si el arreglo está vacío.** `precios[0]` sería `undefined` y la resta daría `NaN`.

## Otra forma de resolverlo

Los **dos bucles** del paso 2: O(n²) de tiempo y O(1) de memoria. Es correcta y fácil de escribir, pero con 100 000 días son unos 5 000 millones de comparaciones.

Otra variante, que aparece en libros, es pensarlo como **Kadane** sobre las diferencias diarias (`precios[i] - precios[i - 1]`): la máxima ganancia es la suma máxima de un tramo de diferencias. Funciona, pero es más difícil de explicar.

**¿Cuál conviene?** Menciona los dos bucles como punto de partida y escribe la del mínimo acumulado: es O(n) de tiempo, O(1) de memoria y se explica en una frase.

## Cómo explicarlo en la entrevista

> "La solución directa es probar todos los pares de compra y venta con dos bucles, que es O(n²). Pero si fijo el día de venta, la mejor compra siempre es el día más barato anterior. Entonces recorro una sola vez, guardo el precio mínimo visto hasta ahora y en cada día calculo cuánto ganaría vendiendo hoy. Me quedo con la mayor ganancia. Queda en O(n) de tiempo y O(1) de memoria, y si los precios solo bajan devuelvo 0 porque así inicializo la mejor ganancia."

## Conceptos

- **Mínimo acumulado**: guardar el mejor valor visto "hasta ahora" para no volver a recorrer lo anterior.
- **`Infinity`**: valor inicial cómodo para un mínimo, porque cualquier número es menor.
- **`Math.min` y `Math.max`**: comparan y devuelven el menor o el mayor.
- **Una pasada**: recorrer los datos una sola vez, O(n).
- **Restricción de orden**: muchos problemas de arreglos dependen de que algo pase "antes" de otra cosa; ignorarlo es el error más común.
