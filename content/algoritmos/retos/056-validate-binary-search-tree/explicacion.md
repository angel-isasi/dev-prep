## Idea clave

Cada nodo no solo tiene que ser mayor que su hijo izquierdo y menor que el derecho: tiene que estar dentro de un **rango** `(min, max)` que hereda de **todos** sus ancestros. Bajas recursivamente achicando ese rango: a la izquierda, el nodo actual se vuelve el techo; a la derecha, se vuelve el piso. Si algún nodo cae fuera, el árbol no es válido.

## Paso a paso

1. **La idea tentadora (y equivocada)**: revisar en cada nodo que `left.val < nodo.val < right.val` y seguir recursivamente. Falla con este árbol:

   ```
       5
      / \
     4   6
        / \
       3   7
   ```

   El 6 con sus hijos 3 y 7 se ve bien, y el 5 con sus hijos 4 y 6 también. Pero el 3 está en el subárbol **derecho** del 5, y todo lo de la derecha del 5 debe ser mayor que 5. La regla es sobre **subárboles completos**, no sobre hijos directos.
2. **La solución directa** (dila en voz alta): para cada nodo, recorrer todo su subárbol izquierdo y comprobar que todos sean menores, y todo el derecho comprobando que todos sean mayores. Es correcta, pero cada nodo se revisa una vez por cada ancestro: O(n²) en un árbol en línea.
3. **Piensa en rangos.** ¿Entre qué valores puede estar el 3 del ejemplo? Para estar a la derecha del 5, debe ser **mayor que 5**. Para estar a la izquierda del 6, debe ser **menor que 6**. Su rango permitido es `(5, 6)`, y 3 no entra.
4. **Cómo se heredan los rangos.** La raíz puede ser cualquier cosa: `(-Infinity, Infinity)`. Si un nodo tiene rango `(min, max)`:
   - Su hijo izquierdo debe ser menor que él: rango `(min, nodo.val)`.
   - Su hijo derecho debe ser mayor que él: rango `(nodo.val, max)`.
   El rango se va achicando, y así cada nodo "recuerda" todos los límites de sus ancestros sin tener que mirarlos.
5. **La función recursiva** `valido(nodo, min, max)`:
   - Si `nodo` es `null`: `true` (un subárbol vacío no rompe nada).
   - Si `nodo.val <= min` o `nodo.val >= max`: `false`. Los `=` están porque los repetidos no se permiten.
   - Si no: es válido si **los dos** subárboles son válidos con sus rangos nuevos (`&&`).
6. **Costo**: cada nodo se visita una vez, O(n) de tiempo. O(h) de memoria por la pila de recursión, con h la altura del árbol.

```js
export function esArbolDeBusqueda(raiz) {
  function valido(nodo, min, max) {
    if (!nodo) return true;
    if (nodo.val <= min || nodo.val >= max) return false;
    return valido(nodo.left, min, nodo.val) && valido(nodo.right, nodo.val, max);
  }
  return valido(raiz, -Infinity, Infinity);
}
```

## Por qué funciona

Recorrido con el árbol de la trampa, `5 (4, 6 (3, 7))`, en el orden en que se llama `valido`:

| Nodo | Rango heredado `(min, max)` | ¿Está dentro? | Qué pasa |
|---|---|---|---|
| 5 | (-Infinity, Infinity) | sí | revisa la izquierda con `(-Infinity, 5)` |
| 4 | (-Infinity, 5) | sí | sus hijos son `null`: `true` |
| 6 | (5, Infinity) | sí | revisa la izquierda con `(5, 6)` |
| 3 | **(5, 6)** | **no**: 3 <= 5 | devuelve `false` |

El `false` del 3 sube: `valido(6)` da `false` por el `&&` (ni siquiera revisa el 7) y `valido(5)` también. Resultado: `false`.

La comparación local "padre con hijos" nunca lo habría detectado, porque el 3 sí es menor que su padre 6. Lo que lo delata es el **piso 5** que heredó al bajar a la derecha de la raíz.

Con el árbol válido `0 (-4 (-6, -2), 4 (2, 6))`: el -2 recibe el rango `(-4, 0)` y entra; el 2 recibe `(0, 4)` y entra. Todos dentro: `true`.

## Errores comunes

- **Comparar solo con los hijos directos.** Lo reconoces en los dos tests de "la trampa": das `true` cuando es `false`.
- **Usar `<` y `>` en vez de `<=` y `>=`** al chequear el rango. Aceptas repetidos. Lo reconoces en el test de valores repetidos.
- **Empezar con límites como 0 o `Number.MIN_VALUE`.** `Number.MIN_VALUE` es el número positivo más chico (casi 0), no el más negativo: rechazarías árboles con negativos. Usa `-Infinity` e `Infinity`.
- **Pasar el rango al revés.** A la izquierda el nodo es el **techo** (`max`); a la derecha es el **piso** (`min`). Si los cambias, casi ningún árbol válido pasa.
- **Usar `||` en vez de `&&`** al combinar los subárboles. Bastaría que un lado esté bien para devolver `true`.
- **Olvidar el caso `null`.** Lees `null.val` y lanza `TypeError` apenas llegas a una hoja.

## Otra forma de resolverlo

**Recorrido inorden**: si visitas el árbol en orden "izquierda, nodo, derecha", un BST válido da sus valores **estrictamente crecientes**. Basta con recordar el último valor visto y comprobar que cada nuevo sea mayor. O(n) de tiempo y O(h) de memoria:

```js
let anterior = -Infinity;
let ok = true;
function inorden(nodo) {
  if (!nodo || !ok) return;
  inorden(nodo.left);
  if (nodo.val <= anterior) ok = false;
  anterior = nodo.val;
  inorden(nodo.right);
}
inorden(raiz);
return ok;
```

Con el árbol de la trampa, el inorden es 4, 5, 3, 6, 7: el 3 no es mayor que el 5, y ahí se detecta.

**¿Cuál conviene?** La de rangos: se explica fácil con un dibujo y muestra que entendiste por qué falla la comparación local. La de inorden es elegante y es bueno mencionarla, porque demuestra que conoces la propiedad clave de los BST: su inorden sale ordenado.

## Cómo explicarlo en la entrevista

> "No basta comparar cada nodo con sus hijos, porque la regla es sobre subárboles completos: un nodo en el subárbol derecho de la raíz tiene que ser mayor que la raíz aunque sea hijo izquierdo de otro. Por eso paso a la recursión un rango permitido. La raíz empieza con menos infinito e infinito; al bajar a la izquierda, el valor del nodo pasa a ser el máximo, y al bajar a la derecha, el mínimo. Si un nodo cae fuera de su rango, o es igual a un límite, devuelvo false. Visito cada nodo una vez: O(n) de tiempo y O(h) de memoria por la recursión. Otra opción es el recorrido inorden, que en un BST válido sale estrictamente creciente."

## Conceptos

- **Árbol binario de búsqueda (BST)**: a la izquierda todo es menor y a la derecha todo es mayor, en cada nodo.
- **Propiedad sobre subárboles**: la regla vale para todos los descendientes, no solo los hijos directos.
- **Recursión con parámetros extra**: pasar información de los ancestros (aquí, el rango) hacia abajo.
- **`-Infinity` e `Infinity`**: límites iniciales que cualquier número cumple.
- **Recorrido inorden**: izquierda, nodo, derecha; en un BST visita los valores ordenados.
- **Cortocircuito de `&&`**: si el lado izquierdo es `false`, el derecho ni se evalúa.
