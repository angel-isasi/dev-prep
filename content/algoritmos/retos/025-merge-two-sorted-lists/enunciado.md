Escribe la función `unir(a, b)` que reciba las cabezas de dos **listas enlazadas ordenadas** de menor a mayor y devuelva la cabeza de **una sola lista ordenada** con todos sus nodos.

Cada nodo es un objeto `{ val, next }`, y el último tiene `next: null`. Una lista vacía es `null`.

```js
// La lista 1 -> 2 -> 4 se ve así:
{ val: 1, next: { val: 2, next: { val: 4, next: null } } }
```

## Reglas

- Las dos listas vienen ordenadas de menor a mayor.
- **Reutiliza los nodos** de las listas de entrada: engánchalos cambiando sus `next`, no copies los valores en nodos nuevos.
- Cualquiera de las dos (o ambas) puede estar vacía.
- Puede haber valores repetidos y negativos. Si dos nodos tienen el mismo valor, va primero el de `a`.

## Ejemplos

```js
// 1 -> 2 -> 4   y   1 -> 3 -> 4
unir(lista([1, 2, 4]), lista([1, 3, 4]));   // 1 -> 1 -> 2 -> 3 -> 4 -> 4
unir(null, lista([0]));                     // 0
unir(null, null);                           // null
```

## Reto extra

Hazlo en una sola pasada, O(n + m), y con **O(1) de memoria extra**. Un truco muy usado: empezar con un **nodo ficticio** para no tratar aparte el primer elemento.
