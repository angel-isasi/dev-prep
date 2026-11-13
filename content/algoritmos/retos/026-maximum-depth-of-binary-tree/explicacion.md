## Idea clave

Un árbol es un nodo con dos subárboles. Su profundidad es **1 (el nodo actual) más la mayor profundidad de sus dos hijos**. Un nodo vacío tiene profundidad 0. Con esas dos reglas, la recursión resuelve todo el árbol.

## Paso a paso

1. **Define el caso base.** El árbol más simple es el vacío: `null` (o `undefined`, si el hijo no existe). Su profundidad es 0. `if (!nodo) return 0` cubre los dos.
2. **Define el caso general.** Si el nodo existe, él aporta un nivel. Debajo, la rama más larga es la del hijo con más profundidad: `1 + Math.max(profundidad(izq), profundidad(der))`.
3. **Confía en la recursión.** No necesitas imaginar todo el árbol: asume que `profundidad(nodo.left)` ya devuelve el valor correcto para ese subárbol, y solo combina.
4. **Cada nodo se visita una vez**, así que el tiempo es O(n). La memoria es O(h), donde h es la altura del árbol, por las llamadas pendientes en la pila: en un árbol equilibrado es O(log n), pero en uno "en línea" llega a O(n).
5. **No hace falta tratar aparte las hojas.** Una hoja tiene sus dos hijos vacíos: `1 + Math.max(0, 0) = 1`.

```js
export function profundidad(nodo) {
  if (!nodo) return 0;
  return 1 + Math.max(profundidad(nodo.left), profundidad(nodo.right));
}
```

## Por qué funciona

Recorrido con el árbol del ejemplo:

```
       3
      / \
     9   20
        /  \
       15   7
```

Las llamadas se resuelven de abajo hacia arriba. Este es el orden en que **terminan**:

| Nodo | Profundidad izquierda | Profundidad derecha | Resultado `1 + max` |
|---|---|---|---|
| 9 | 0 (no tiene) | 0 (no tiene) | 1 + 0 = **1** |
| 15 | 0 | 0 | **1** |
| 7 | 0 | 0 | **1** |
| 20 | 1 (el 15) | 1 (el 7) | 1 + 1 = **2** |
| 3 | 1 (el 9) | 2 (el 20) | 1 + 2 = **3** |

La raíz devuelve 3. El camino más largo es 3, 20, 15 (o 3, 20, 7).

## Errores comunes

- **Olvidar el caso base o ponerlo mal.** Sin `if (!nodo) return 0`, la función intenta leer `nodo.left` de `null` y lanza `TypeError`. Lo reconoces en el test del árbol vacío.
- **Devolver 1 para `null`.** Cada hoja contaría un nivel de más: el ejemplo daría 4.
- **Olvidar el `1 +`.** Todo da 0, porque nunca se suma nada.
- **Usar `Math.min` en vez de `Math.max`.** Calculas la profundidad **mínima** (otro problema de LeetCode). En el test desbalanceado devolverías 2.
- **Revisar solo la rama izquierda** (o asumir que el árbol está balanceado). Lo reconoces en el test donde la rama larga está a la derecha.

## Otra forma de resolverlo

**Por niveles con una cola (BFS)**: procesas el árbol nivel por nivel y cuentas cuántos niveles hay. Es O(n) de tiempo y O(w) de memoria, donde w es el ancho máximo del árbol. No usa recursión, así que no hay riesgo de desbordar la pila con árboles muy profundos:

```js
if (!nodo) return 0;
let nivel = [nodo];
let niveles = 0;
while (nivel.length > 0) {
  niveles++;
  const siguiente = [];
  for (const actual of nivel) {
    if (actual.left) siguiente.push(actual.left);
    if (actual.right) siguiente.push(actual.right);
  }
  nivel = siguiente;
}
return niveles;
```

**¿Cuál conviene?** La recursiva: es corta, clara y muestra que piensas en términos de subproblemas. Menciona la de niveles si te preguntan por árboles enormes o por evitar recursión.

## Cómo explicarlo en la entrevista

> "Lo resuelvo recursivamente: la profundidad de un árbol es uno, por el nodo actual, más la mayor profundidad entre sus dos hijos. El caso base es un nodo vacío, que tiene profundidad cero. Visito cada nodo una vez, así que es O(n) de tiempo, y O(h) de memoria por la pila de llamadas, donde h es la altura. Si el árbol fuera muy profundo, lo haría por niveles con una cola para no depender de la recursión."

## Conceptos

- **Árbol binario**: cada nodo tiene como máximo dos hijos, `left` y `right`.
- **Recursión**: una función que se llama a sí misma con un problema más chico; siempre necesita un caso base.
- **Caso base**: la situación más simple, que se responde sin recursión (aquí, `null` da 0).
- **DFS (búsqueda en profundidad)**: bajar por una rama hasta el fondo antes de pasar a la siguiente; la recursión lo hace natural.
- **BFS (búsqueda por niveles)**: visitar el árbol nivel por nivel usando una cola.
- **Altura vs cantidad de nodos**: la memoria de la recursión depende de la altura, no del total.
