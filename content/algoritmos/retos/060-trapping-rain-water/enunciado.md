Escribe la función `aguaAtrapada(alturas)` que reciba un arreglo con las **alturas de unas columnas** (cada columna mide 1 de ancho) y devuelva **cuántas unidades de agua** quedan atrapadas entre ellas después de llover.

El agua se queda encima de una columna solo si tiene una pared más alta **a la izquierda y a la derecha**. Por los extremos el agua se escapa.

```
alturas = [4, 2, 0, 3, 2, 5]

          █
█ ~ ~ ~ ~ █        Cada ~ es una unidad de agua.
█ ~ ~ █ ~ █        Encima de las columnas 1, 2, 3 y 4
█ █ ~ █ █ █        se quedan 2 + 4 + 1 + 2 = 9 unidades.
█ █ ~ █ █ █
4 2 0 3 2 5
```

## Reglas

- Las alturas son enteros mayores o iguales a 0.
- Si hay menos de 3 columnas, no se puede atrapar agua: devuelve `0`.
- Devuelve el total de agua (un número).
- No modifiques el arreglo que recibes.

## Ejemplos

```js
aguaAtrapada([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]);   // 6
aguaAtrapada([4, 2, 0, 3, 2, 5]);                     // 9
aguaAtrapada([3, 0, 3]);                              // 3
aguaAtrapada([1, 2, 3, 4]);                           // 0: una escalera no atrapa agua
aguaAtrapada([]);                                     // 0
```

## Reto extra

Para cada columna, el agua depende de la pared más alta a su izquierda y la más alta a su derecha. Calcularlas desde cero para cada columna es O(n²). Resuélvelo en **O(n)**, y si puedes, con **dos punteros** y memoria **O(1)**.
