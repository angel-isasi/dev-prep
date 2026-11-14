Escribe la función `esArbolDeBusqueda(raiz)` que reciba la raíz de un **árbol binario** y devuelva `true` si es un **árbol binario de búsqueda** (BST) válido, o `false` si no.

Un árbol binario de búsqueda cumple, en **todos** sus nodos:

- Todos los valores del subárbol **izquierdo** son **menores** que el valor del nodo.
- Todos los valores del subárbol **derecho** son **mayores** que el valor del nodo.

Ojo: dice "todos los valores del subárbol", no solo el hijo directo. Cada nodo es `{ val, left, right }`, y un hijo ausente puede ser `null` o no estar.

```js
//     5                5
//    / \              / \
//   4   6            4   6
//                       / \
//                      3   7
//   válido          inválido: el 3 está a la derecha del 5
```

## Reglas

- Un árbol vacío (`null`) es válido.
- Los valores repetidos **no** están permitidos: si un hijo es igual a su padre, el árbol no es válido.
- Los valores son números enteros (pueden ser negativos).

## Ejemplos

```js
esArbolDeBusqueda({ val: 2, left: { val: 1 }, right: { val: 3 } });   // true
esArbolDeBusqueda({ val: 5, left: { val: 1 }, right: { val: 4, left: { val: 3 }, right: { val: 6 } } });   // false: 4 < 5 y está a la derecha
esArbolDeBusqueda({ val: 5, left: { val: 4 }, right: { val: 6, left: { val: 3 }, right: { val: 7 } } });   // false: el dibujo de la derecha
esArbolDeBusqueda(null);   // true
```

## Reto extra

Visita cada nodo **una sola vez**: O(n). Pista para pensarlo: cada nodo tiene un **rango** de valores permitidos que hereda de sus ancestros.
