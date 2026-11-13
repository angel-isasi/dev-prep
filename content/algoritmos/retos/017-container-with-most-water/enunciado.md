Escribe la función `maxAgua(alturas)` que reciba un arreglo donde `alturas[i]` es la altura de una línea vertical colocada en la posición `i`. Elige **dos líneas** que, junto con el suelo, formen el recipiente que guarde **la mayor cantidad de agua**, y devuelve esa cantidad.

El agua que cabe entre las líneas `i` y `j` es:

```
área = (altura de la línea MÁS BAJA) * (distancia entre ellas)
     = Math.min(alturas[i], alturas[j]) * (j - i)
```

El agua se derrama por la línea más baja, por eso manda la menor.

## Reglas

- Hay al menos 2 líneas.
- Las alturas son enteros mayores o iguales a 0.
- No puedes inclinar el recipiente ni usar las líneas de en medio como paredes: solo cuentan las dos elegidas.

## Ejemplos

```js
maxAgua([1, 8, 6, 2, 5, 4, 8, 3, 7]);   // 49  líneas en 1 (altura 8) y 8 (altura 7): 7 * 7
maxAgua([1, 1]);                        // 1
maxAgua([4, 3, 2, 1, 4]);               // 16  los dos extremos: 4 * 4
```

## Reto extra

Probar todas las parejas es O(n²). Con **dos punteros** que empiezan en los extremos y se acercan, se resuelve en O(n). La clave es saber **cuál de los dos mover** en cada paso.
