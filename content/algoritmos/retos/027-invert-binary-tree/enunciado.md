Escribe la función `invertirArbol(nodo)` que reciba la raíz de un **árbol binario** y lo convierta en su **espejo**: en **todos** los nodos, el hijo izquierdo pasa a la derecha y el derecho a la izquierda. Devuelve la raíz.

Cada nodo es `{ val, left, right }`, y un hijo vacío es `null`.

```js
//      4                 4
//     / \               / \
//    2   7     ->      7   2
//   / \                   / \
//  1   3                 3   1
```

## Reglas

- Modifica el árbol recibido (cambia los `left` y `right` de los mismos nodos) y devuelve **la misma raíz**.
- El espejo es completo: no basta con intercambiar los hijos de la raíz, también los de cada subárbol.
- Si el árbol está vacío (`null`), devuelve `null`.

## Ejemplos

```js
const arbol = n(4, n(2, n(1), n(3)), n(7));
invertirArbol(arbol);   // n(4, n(7), n(2, n(3), n(1)))

invertirArbol(null);    // null
invertirArbol(n(1));    // n(1)
```

(En los tests, `n(val, left, right)` es una función que crea un nodo con `left` y `right` en `null` por defecto).

## Reto extra

Resuélvelo de forma recursiva y luego **sin recursión**, recorriendo los nodos con una cola o una pila.
