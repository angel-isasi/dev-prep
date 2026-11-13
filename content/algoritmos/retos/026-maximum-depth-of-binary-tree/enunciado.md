Escribe la función `profundidad(nodo)` que reciba la raíz de un **árbol binario** y devuelva su **profundidad máxima**: la cantidad de nodos en el camino más largo desde la raíz hasta una hoja.

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

- Un árbol vacío (`null`) tiene profundidad 0.
- Un árbol de un solo nodo tiene profundidad 1.
- Se cuentan **nodos**, no aristas: el ejemplo de arriba tiene profundidad 3 (3, 20, 15).
- El árbol puede estar desbalanceado (una rama mucho más larga que la otra).

## Ejemplos

```js
profundidad(arbol);               // 3
profundidad(null);                // 0
profundidad({ val: 1 });          // 1
```

## Reto extra

La versión recursiva cabe en dos líneas. ¿Puedes escribir también una versión **sin recursión**, recorriendo el árbol nivel por nivel con una cola?
