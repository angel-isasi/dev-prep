## Idea clave

En vez de mover los ceros, **junta los no ceros al inicio**. Un puntero `escribir` marca dónde va el próximo número distinto de cero; cada vez que encuentras uno, lo intercambias con esa posición. Los ceros terminan empujados al final solos.

## Paso a paso

1. **La solución directa** (dila en voz alta): filtrar los no ceros y rellenar con ceros. Es O(n) y clara, pero **crea un arreglo nuevo**, y el enunciado pide modificar el original.

   ```js
   const sinCeros = nums.filter((n) => n !== 0);
   const ceros = nums.length - sinCeros.length;
   return [...sinCeros, ...Array(ceros).fill(0)];
   ```

   Se puede "arreglar" copiando el resultado de vuelta en `nums`, pero sigue usando O(n) de memoria extra.
2. **Dos punteros sobre el mismo arreglo.** `i` recorre todo el arreglo. `escribir` empieza en 0 y solo avanza cuando colocas un no cero.
3. **Cuando `nums[i]` no es cero**, intercambia `nums[escribir]` con `nums[i]` y avanza `escribir`. Como `escribir` nunca va por delante de `i`, lo que había en `nums[escribir]` era un cero (o el mismo número, si aún no apareció ningún cero).
4. **El intercambio con desestructuración**: `[a, b] = [b, a]` cambia dos valores sin variable temporal. Con arreglos: `[nums[escribir], nums[i]] = [nums[i], nums[escribir]]`.
5. **El orden se conserva** porque los no ceros se colocan en las posiciones 0, 1, 2... en el mismo orden en que `i` los encuentra.

```js
export function moverCeros(nums) {
  let escribir = 0;

  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      [nums[escribir], nums[i]] = [nums[i], nums[escribir]];
      escribir++;
    }
  }

  return nums;
}
```

## Por qué funciona

Recorrido con `moverCeros([0, 1, 0, 3, 12])`:

| `i` | `nums[i]` | Acción | `nums` después | `escribir` |
|---|---|---|---|---|
| 0 | 0 | nada | `[0, 1, 0, 3, 12]` | 0 |
| 1 | 1 | intercambia posiciones 0 y 1 | `[1, 0, 0, 3, 12]` | 1 |
| 2 | 0 | nada | `[1, 0, 0, 3, 12]` | 1 |
| 3 | 3 | intercambia posiciones 1 y 3 | `[1, 3, 0, 0, 12]` | 2 |
| 4 | 12 | intercambia posiciones 2 y 4 | `[1, 3, 12, 0, 0]` | 3 |

Todo lo que está antes de `escribir` son no ceros en su orden original; todo lo que está entre `escribir` e `i` son ceros. Esa es la regla que se mantiene en cada vuelta.

Si no hay ceros, `escribir` e `i` siempre valen lo mismo y cada "intercambio" es un número consigo mismo: no cambia nada.

## Errores comunes

- **Usar `splice` dentro de un `for` que avanza.** Al borrar `nums[i]`, todos se corren una posición a la izquierda y el `i++` se salta el siguiente. Con `[0, 0, 1]` el segundo cero nunca se revisa. Además, cada `splice` es O(n): el total es O(n²).
- **Devolver un arreglo nuevo** (con `filter` y `concat`). El resultado se ve bien, pero el original no cambió. Lo reconoces en el test "modifica el mismo arreglo".
- **Ordenar** con `nums.sort((a, b) => (a === 0) - (b === 0))`. Funciona porque `sort` es estable, pero es O(n log n) y difícil de defender.
- **Intercambiar en dos líneas sin variable temporal**: `nums[escribir] = nums[i]; nums[i] = nums[escribir];` copia el mismo valor dos veces y pierdes el cero. Usa una variable temporal o `[a, b] = [b, a]`.
- **Comparar con `if (nums[i])`** en vez de `!== 0`. Para números funciona, pero si alguna vez llega `NaN` o `null`, se trataría como cero.

## Otra forma de resolverlo

**Dos pasadas sin intercambios**: primero copias cada no cero a `nums[escribir++]`; después rellenas con ceros desde `escribir` hasta el final. También es O(n) y O(1) de memoria, y algunos la encuentran más fácil de leer:

```js
let escribir = 0;
for (const n of nums) {
  if (n !== 0) nums[escribir++] = n;
}
for (let i = escribir; i < nums.length; i++) nums[i] = 0;
return nums;
```

**`filter` y relleno** (paso 1): O(n) de tiempo pero O(n) de memoria. Válida si el problema permitiera devolver un arreglo nuevo.

**¿Cuál conviene?** Cualquiera de las dos versiones con puntero de escritura. La de intercambios hace todo en una pasada; la de dos pasadas hace menos escrituras cuando hay muchos ceros.

## Cómo explicarlo en la entrevista

> "Como tengo que modificar el arreglo en el lugar, no quiero crear uno nuevo con filter. Uso dos punteros: uno recorre el arreglo y otro marca dónde debe ir el siguiente número distinto de cero. Cada vez que encuentro un no cero, lo intercambio con la posición de escritura y avanzo ese puntero. Así los no ceros quedan al inicio en su orden original y los ceros terminan al final. Es O(n) de tiempo y O(1) de memoria."

## Conceptos

- **Dos punteros (lectura y escritura)**: uno recorre y otro marca dónde colocar lo que sirve.
- **Modificar en el lugar (in place)**: cambiar el arreglo recibido sin crear otro.
- **Intercambio con desestructuración**: `[a, b] = [b, a]`.
- **Estabilidad**: conservar el orden relativo de los elementos que no se mueven.
- **`splice` es O(n)**: borra y desplaza todos los elementos siguientes.
