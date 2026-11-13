Escribe la función `topK(nums, k)` que reciba un arreglo de números y un entero `k`, y devuelva un arreglo con los **`k` números que más veces aparecen**.

## Reglas

- `k` está entre 1 y la cantidad de números distintos.
- La respuesta es única: no habrá empates que dejen dudas sobre cuáles entran.
- **El orden de la respuesta no importa**: `[1, 2]` y `[2, 1]` son igual de válidos. Los tests la ordenan antes de comparar.
- Devuelve números, no textos: `[1, 2]`, no `["1", "2"]`.
- Puede haber negativos.

## Ejemplos

```js
topK([1, 1, 1, 2, 2, 3], 2);   // [1, 2]   el 1 aparece 3 veces y el 2, 2 veces
topK([1], 1);                  // [1]
topK([4, 4, 5], 2);            // [4, 5]
```

## Reto extra

Contar y luego ordenar por frecuencia es O(n log n). Como ninguna frecuencia puede ser mayor que `n`, ¿puedes evitar el ordenamiento y hacerlo en **O(n)**? Busca la idea de **cubetas** (bucket sort).
