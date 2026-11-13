## Idea clave

El espejo de un árbol es: la raíz con sus dos hijos intercambiados, donde **cada hijo también es el espejo de su subárbol**. Recursión: inviertes los dos subárboles y los asignas cruzados. El caso base es el árbol vacío.

## Paso a paso

1. **Caso base**: si el nodo es `null`, no hay nada que invertir. Devuelve `null`.
2. **Caso general**: para un nodo con hijos `left` y `right`:
   - el nuevo `left` es el espejo del viejo `right`,
   - el nuevo `right` es el espejo del viejo `left`.
3. **Asígnalos al mismo tiempo** con desestructuración: `[nodo.left, nodo.right] = [invertirArbol(nodo.right), invertirArbol(nodo.left)]`. JavaScript evalúa primero todo el lado derecho (con los valores viejos) y recién después asigna. Así no pisas un valor que todavía necesitas.
4. **Devuelve el mismo nodo**: modificaste sus hijos, pero es el mismo objeto. Así la llamada del padre recibe el subárbol ya invertido.
5. **Costo**: cada nodo se visita una vez, O(n) de tiempo; la memoria es O(h), la altura del árbol, por la pila de llamadas.

```js
export function invertirArbol(nodo) {
  if (!nodo) return null;
  [nodo.left, nodo.right] = [invertirArbol(nodo.right), invertirArbol(nodo.left)];
  return nodo;
}
```

## Por qué funciona

Recorrido con `n(4, n(2, n(1), n(3)), n(7))`. Las llamadas terminan de abajo hacia arriba:

| Llamada | Derecho invertido (va a `left`) | Izquierdo invertido (va a `right`) | Nodo resultante |
|---|---|---|---|
| nodo 7 | `null` | `null` | `7` (hoja, igual) |
| nodo 3 | `null` | `null` | `3` |
| nodo 1 | `null` | `null` | `1` |
| nodo 2 | `3` | `1` | `2` con left = 3, right = 1 |
| nodo 4 | `7` | `2 (3, 1)` | `4` con left = 7, right = 2 (3, 1) |

Resultado:

```
      4
     / \
    7   2
       / \
      3   1
```

Los hijos de la raíz se intercambiaron **y** también los del nodo 2: por eso es un espejo completo.

## Errores comunes

- **Asignar en dos líneas sin variable temporal**:

  ```js
  nodo.left = invertirArbol(nodo.right);
  nodo.right = invertirArbol(nodo.left); // ¡nodo.left ya cambió!
  ```

  La segunda línea usa el `left` **nuevo**, así que pierdes el subárbol izquierdo original. Lo reconoces porque el árbol queda con ramas duplicadas o faltantes. Guarda antes en una variable o usa desestructuración.
- **Intercambiar solo los hijos de la raíz.** El árbol queda `4 (7, 2 (1, 3))`: los nietos siguen en su orden original. Lo reconoces en el test de los nietos.
- **Olvidar el caso base.** `null.left` lanza `TypeError` en cuanto llegas a una hoja.
- **No devolver el nodo** (olvidar `return nodo`). El padre recibe `undefined` como hijo y el árbol se rompe.
- **Crear nodos nuevos** en vez de modificar los existentes. El resultado se ve igual, pero no es la misma raíz. Lo reconoces en el test que usa `toBe`.

## Otra forma de resolverlo

**Con una cola (sin recursión)**: recorres el árbol por niveles; a cada nodo le intercambias los hijos y metes esos hijos en la cola. Es O(n) de tiempo y O(w) de memoria, donde w es el ancho máximo:

```js
if (!nodo) return null;
const cola = [nodo];
while (cola.length > 0) {
  const actual = cola.shift();
  [actual.left, actual.right] = [actual.right, actual.left];
  if (actual.left) cola.push(actual.left);
  if (actual.right) cola.push(actual.right);
}
return nodo;
```

Aquí el orden da igual: cada nodo intercambia sus propios hijos una sola vez, y tarde o temprano todos pasan por la cola.

**¿Cuál conviene?** La recursiva es la respuesta esperada: tres líneas y se explica sola. La de la cola sirve si te preocupa la profundidad de la recursión con árboles muy altos.

## Cómo explicarlo en la entrevista

> "En cada nodo intercambio sus hijos, y hago lo mismo recursivamente con cada subárbol. El caso base es un nodo nulo, que devuelvo tal cual. Uso desestructuración para asignar los dos hijos al mismo tiempo y no pisar uno antes de invertirlo. Visito cada nodo una vez, así que es O(n) de tiempo y O(h) de memoria por la recursión, con h la altura. Si temiera una recursión muy profunda, lo haría con una cola recorriendo por niveles."

## Conceptos

- **Recursión sobre árboles**: resolver para la raíz combinando las soluciones de los subárboles.
- **Desestructuración simultánea**: `[a, b] = [b, a]` evalúa todo el lado derecho antes de asignar.
- **Modificar en el lugar**: cambiar los nodos existentes en vez de construir otro árbol.
- **BFS con cola**: `shift` para sacar el primero y `push` para agregar al final.
- **`toBe` vs `toEqual`**: misma referencia contra mismo contenido.
