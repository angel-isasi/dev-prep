Escribe la función `recorridoPorNiveles(raiz)` que reciba la raíz de un **árbol binario** y devuelva sus valores **nivel por nivel**: un arreglo con un arreglo por cada nivel, de arriba hacia abajo y, dentro de cada nivel, de izquierda a derecha.

Cada nodo es un objeto con su valor y sus dos hijos. Un hijo que no existe puede venir como `null` o simplemente no estar:

```js
//       3
//      / \
//     9   20
//        /  \
//       15   7
const arbol = {
  val: 3,
  left: { val: 9 },
  right: { val: 20, left: { val: 15 }, right: { val: 7 } },
};
```

## Reglas

- Un árbol vacío (`null`) devuelve `[]`.
- Cada nivel es un arreglo aparte, aunque tenga un solo valor.
- Dentro de un nivel, el orden es de izquierda a derecha, aunque los nodos tengan padres distintos.
- No modifiques el árbol.

## Ejemplos

```js
recorridoPorNiveles(arbol);         // [[3], [9, 20], [15, 7]]
recorridoPorNiveles({ val: 1 });    // [[1]]
recorridoPorNiveles(null);          // []
```

## Reto extra

Visita cada nodo **una sola vez**, O(n), usando una **cola**. El truco está en saber dónde termina un nivel y empieza el siguiente.
