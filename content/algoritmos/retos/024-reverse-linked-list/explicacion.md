## Idea clave

Recorres la lista volteando cada flecha: el `next` de cada nodo pasa a apuntar al nodo **anterior**. Para no perder el resto de la lista, guardas el siguiente **antes** de cambiar la flecha. Con tres referencias (`anterior`, `actual`, `siguiente`) lo haces en una pasada y sin memoria extra.

## Paso a paso

1. **La solución directa** (dila en voz alta): pasar los valores a un arreglo, invertirlo y construir una lista nueva. Es O(n), pero usa O(n) de memoria y crea nodos nuevos, cuando el enunciado pide reutilizar los existentes.

   ```js
   const valores = [];
   for (let n = cabeza; n; n = n.next) valores.push(n.val);
   return valores.reduce((next, val) => ({ val, next }), null);
   ```

2. **Piensa en dos listas**: la parte ya invertida (empieza vacía, `anterior = null`) y la parte que falta (empieza en `actual = cabeza`). En cada vuelta pasas un nodo de una a la otra.
3. **Guarda el siguiente**: `const siguiente = actual.next`. Si no lo haces, al cambiar `actual.next` pierdes la única referencia al resto de la lista.
4. **Voltea la flecha**: `actual.next = anterior`. El nodo actual ahora apunta hacia la parte invertida.
5. **Avanza**: `anterior = actual` (el nodo actual es la nueva cabeza de la parte invertida) y `actual = siguiente`.
6. **Termina cuando `actual` es `null`**. En ese momento `anterior` es el último nodo de la lista original, que es la nueva cabeza. Si la lista estaba vacía, el bucle no entra y devuelves `anterior = null`.

```js
export function invertir(cabeza) {
  let anterior = null;
  let actual = cabeza;

  while (actual) {
    const siguiente = actual.next;
    actual.next = anterior;
    anterior = actual;
    actual = siguiente;
  }

  return anterior;
}
```

## Por qué funciona

Recorrido con la lista `1 -> 2 -> 3 -> null`:

| Vuelta | `actual` | `siguiente` guardado | Cambio de flecha | Parte invertida (`anterior`) | Lo que falta (`actual`) |
|---|---|---|---|---|---|
| inicio | 1 | | | `null` | `1 -> 2 -> 3` |
| 1 | 1 | 2 | `1.next = null` | `1 -> null` | `2 -> 3` |
| 2 | 2 | 3 | `2.next = 1` | `2 -> 1 -> null` | `3` |
| 3 | 3 | `null` | `3.next = 2` | `3 -> 2 -> 1 -> null` | `null` |

Devuelve el nodo 3. Son los **mismos** tres objetos del principio; solo cambiaron sus `next`. Por eso el test comprueba con `toBe` (misma referencia) que la cabeza vieja ahora es el último nodo y apunta a `null`.

## Errores comunes

- **Cambiar `actual.next` antes de guardarlo.** Después de `actual.next = anterior`, ya no hay forma de llegar al nodo 2: la lista se corta y devuelves solo `1`. Es el error número uno de este problema.
- **Devolver `actual` en vez de `anterior`.** Al terminar el bucle `actual` es `null`. Lo reconoces porque todos los tests devuelven una lista vacía.
- **Devolver `cabeza`.** La cabeza vieja ahora es el **último** nodo; desde ella solo llegas a `null`.
- **Empezar con `anterior = cabeza`** en lugar de `null`. El primer nodo apuntaría a sí mismo y la lista tendría un ciclo infinito.
- **Crear nodos nuevos** (como en la solución directa). El resultado se ve bien, pero no es lo que se pide. Lo reconoces en el test "reutiliza los nodos".

## Otra forma de resolverlo

**Pasar a arreglo y reconstruir** (paso 1): O(n) de tiempo y O(n) de memoria. Útil solo si te permiten crear nodos nuevos.

**Recursión**: invierte el resto de la lista y luego engancha el nodo actual al final. Es elegante, pero usa O(n) de memoria por la pila de llamadas, y con listas muy largas puede desbordar la pila:

```js
function invertir(cabeza) {
  if (!cabeza || !cabeza.next) return cabeza;
  const nuevaCabeza = invertir(cabeza.next);
  cabeza.next.next = cabeza; // el siguiente ahora apunta a mí
  cabeza.next = null;        // yo paso a ser el último
  return nuevaCabeza;
}
```

**¿Cuál conviene?** La iterativa: O(n) de tiempo, O(1) de memoria y sin riesgo de desbordar la pila. La recursiva es buena para mostrar que manejas recursión si te la piden.

## Cómo explicarlo en la entrevista

> "Recorro la lista con tres referencias: el anterior, el actual y el siguiente. En cada nodo primero guardo el siguiente para no perderlo, luego hago que el actual apunte al anterior y avanzo los dos punteros. Cuando el actual llega a null, el anterior es la nueva cabeza. Es O(n) de tiempo y O(1) de memoria, porque reutilizo los mismos nodos. Lo más importante es guardar el siguiente antes de cambiar el puntero."

## Conceptos

- **Lista enlazada**: nodos `{ val, next }` encadenados; el último apunta a `null`.
- **Cabeza (head)**: el primer nodo; desde él se llega a todos los demás.
- **Referencias**: en JavaScript los objetos se pasan por referencia; cambiar `nodo.next` modifica el nodo original.
- **Guardar antes de sobrescribir**: patrón clave en cualquier manipulación de punteros.
- **`toBe` vs `toEqual`**: `toBe` comprueba que sea el mismo objeto; `toEqual`, que tenga el mismo contenido.
