## Idea clave

Recorres el árbol **a lo ancho** (BFS) con una **cola**: el primer nodo que entra es el primero que sale. Al atender un nodo, metes a sus hijos al final. Para separar los niveles, al empezar cada vuelta miras **cuántos nodos hay en la cola**: esos son exactamente los del nivel actual, y los procesas juntos.

## Paso a paso

1. **Por qué no sirve la recursión "normal".** Una recursión como la de la profundidad máxima (DFS) baja por la izquierda hasta el fondo antes de mirar la derecha. En el árbol completo `1` (hijos `2` y `3`, nietos `4, 5, 6, 7`) visitaría 1, 2, 4, 5, 3, 6, 7: el 4 aparece antes que el 3, aunque está un nivel más abajo. Necesitas visitar **por pisos**.
2. **Qué es una cola.** Una fila de banco: entras por el final y sales por el frente (FIFO, "primero en entrar, primero en salir"). En JavaScript, un arreglo con `push` (entra al final) y `shift` (sale del inicio).
3. **BFS (búsqueda a lo ancho).** Mete la raíz en la cola. Mientras la cola no esté vacía: saca el primero, anota su valor y mete sus hijos al final. Como los hijos siempre entran **detrás** de los nodos que ya esperaban, todo el nivel 1 sale antes que cualquier nodo del nivel 2. Eso te da el orden 3, 9, 20, 15, 7.
4. **Separar los niveles.** Falta agruparlos. El truco: al empezar cada vuelta del `while`, la cola tiene **solo** los nodos de un nivel (los del nivel anterior ya salieron y sus hijos son justo este nivel). Guarda `tamano = cola.length` y saca exactamente `tamano` nodos con un `for`. Los hijos que metes en ese `for` quedan esperando para la vuelta siguiente.
5. **Guarda `tamano` antes del `for`.** Si escribes `for (let i = 0; i < cola.length; i++)`, el límite cambia mientras metes hijos y mezclas niveles.
6. **El árbol vacío** se resuelve al inicio: `if (!raiz) return []`. Sin eso, meterías `null` en la cola y `null.val` lanza `TypeError`.
7. **Costo**: cada nodo entra y sale de la cola una vez: O(n) visitas. La memoria es O(w), con w el nivel más ancho (en un árbol completo, la mitad de los nodos están en el último nivel). Un detalle: `shift` mueve todos los elementos del arreglo, así que en árboles enormes conviene la versión de la sección "Otra forma".

```js
export function recorridoPorNiveles(raiz) {
  if (!raiz) return [];
  const niveles = [];
  const cola = [raiz];

  while (cola.length > 0) {
    const tamano = cola.length;
    const nivel = [];
    for (let i = 0; i < tamano; i++) {
      const nodo = cola.shift();
      nivel.push(nodo.val);
      if (nodo.left) cola.push(nodo.left);
      if (nodo.right) cola.push(nodo.right);
    }
    niveles.push(nivel);
  }

  return niveles;
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

| Vuelta del `while` | Cola al empezar | `tamano` | Nodos que saca | Hijos que mete | `nivel` | Cola al terminar |
|---|---|---|---|---|---|---|
| 1 | [3] | 1 | 3 | 9, 20 | [3] | [9, 20] |
| 2 | [9, 20] | 2 | 9, 20 | (9 no tiene), 15, 7 | [9, 20] | [15, 7] |
| 3 | [15, 7] | 2 | 15, 7 | (no tienen) | [15, 7] | [] |

La cola queda vacía y el `while` termina. Resultado: `[[3], [9, 20], [15, 7]]`.

En la vuelta 2, el 15 y el 7 entran a la cola **mientras** sacas el 20, pero no se procesan en esa vuelta porque el `for` solo saca `tamano = 2` nodos. Así, cada vuelta es exactamente un nivel.

Con el test de los primos (`2` tiene solo hijo derecho `4`, y `3` tiene solo hijo izquierdo `5`): el 4 entra primero porque su padre (2) sale antes que el 3. Por eso el nivel queda `[4, 5]`, de izquierda a derecha, aunque sean de padres distintos.

## Errores comunes

- **Usar `cola.length` como límite del `for`.** Cambia en cada `shift` y en cada `push`, así que los cortes de nivel caen en cualquier parte. Lo reconoces en el ejemplo: das `[[3, 9], [20, 15], [7]]`.
- **Usar `pop` en vez de `shift`.** Sacas el último que entró (eso es una **pila**, no una cola): el orden dentro del nivel se invierte y se cuelan nodos del nivel siguiente. Lo reconoces en el test del árbol completo.
- **Meter hijos `null` a la cola.** Al sacarlos, `nodo.val` lanza `TypeError`. Revisa `if (nodo.left)` antes del `push`.
- **No manejar `raiz === null`.** Devuelves `[[...]]` con basura o lanzas error. Lo reconoces en el test del árbol vacío.
- **Devolver todos los valores en un solo arreglo plano** (`[3, 9, 20, 15, 7]`). El enunciado pide un arreglo por nivel.

## Otra forma de resolverlo

**Con dos arreglos (nivel actual y siguiente)**: en vez de una cola con `shift`, recorres el arreglo del nivel actual con `for...of` y vas armando el del siguiente. No usa `shift`, así que cada nodo cuesta O(1) de verdad. O(n) de tiempo y O(w) de memoria:

```js
if (!raiz) return [];
const niveles = [];
let actual = [raiz];
while (actual.length > 0) {
  niveles.push(actual.map((nodo) => nodo.val));
  const siguiente = [];
  for (const nodo of actual) {
    if (nodo.left) siguiente.push(nodo.left);
    if (nodo.right) siguiente.push(nodo.right);
  }
  actual = siguiente;
}
return niveles;
```

**DFS recursivo con la profundidad como parámetro**: bajas recursivamente pasando en qué nivel estás, y agregas cada valor a `niveles[profundidad]`. Como visitas la izquierda antes que la derecha, el orden dentro de cada nivel sale correcto. O(n) de tiempo y O(h) de pila, con h la altura:

```js
const niveles = [];
function visitar(nodo, profundidad) {
  if (!nodo) return;
  if (!niveles[profundidad]) niveles[profundidad] = [];
  niveles[profundidad].push(nodo.val);
  visitar(nodo.left, profundidad + 1);
  visitar(nodo.right, profundidad + 1);
}
visitar(raiz, 0);
return niveles;
```

**¿Cuál conviene?** La de la cola con `tamano`: es el patrón BFS que se reutiliza en muchos problemas (vista derecha del árbol, promedio por nivel, camino más corto en una grilla). La de dos arreglos es igual de buena y evita el costo de `shift`. La recursiva funciona, pero suena raro resolver "por niveles" bajando en profundidad.

## Cómo explicarlo en la entrevista

> "Hago un recorrido a lo ancho con una cola. Empiezo con la raíz; mientras la cola tenga nodos, guardo cuántos hay en ese momento, porque esos son exactamente los del nivel actual. Saco esa cantidad de nodos, anoto sus valores en el arreglo del nivel y meto sus hijos al final de la cola, que quedan para la siguiente vuelta. Cada nodo entra y sale una vez, así que es O(n) de tiempo y O(w) de memoria, donde w es el ancho máximo del árbol. Si el árbol es vacío devuelvo un arreglo vacío."

## Conceptos

- **Cola (FIFO)**: el primero en entrar es el primero en salir; `push` + `shift` en un arreglo.
- **Pila (LIFO)**: el último en entrar es el primero en salir; `push` + `pop`. No sirve para recorrer por niveles.
- **BFS (búsqueda a lo ancho)**: visitar todos los nodos de un nivel antes de bajar al siguiente.
- **DFS (búsqueda en profundidad)**: bajar por una rama hasta el fondo; lo que hace la recursión.
- **Tamaño del nivel**: guardar `cola.length` antes del bucle interno para saber dónde termina el nivel.
- **Costo de `shift`**: mueve todo el arreglo, O(n); en problemas grandes se evita con un índice o con dos arreglos.
