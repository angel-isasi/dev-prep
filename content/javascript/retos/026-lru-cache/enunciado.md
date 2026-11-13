Escribe la clase `LRUCache`: una caché con **capacidad fija** que, cuando se llena, expulsa el elemento que fue **usado hace más tiempo** (LRU significa *Least Recently Used*, "el usado menos recientemente").

## Reglas

- `new LRUCache(capacidad)`: crea la caché vacía con esa capacidad máxima.
- `get(clave)`: devuelve el valor guardado, o `-1` si la clave no está. Leer una clave cuenta como **usarla**: pasa a ser la más reciente.
- `put(clave, valor)`: guarda el valor. Si la clave ya existía, actualiza su valor y la marca como la más reciente (no cuenta como elemento nuevo).
- Si al guardar una clave **nueva** se supera la capacidad, expulsa la que se usó hace más tiempo.
- `get` y `put` deben ser rápidos: nada de recorrer toda la caché en cada operación.

## Ejemplos

```js
const c = new LRUCache(2);
c.put(1, 1);
c.put(2, 2);
c.get(1);      // 1   (ahora la 1 es la más reciente; la 2 es la más vieja)
c.put(3, 3);   // se pasa de 2: expulsa la 2
c.get(2);      // -1
c.get(3);      // 3
c.get(1);      // 1
```

## Por qué importa

Las cachés con límite están en todas partes: el navegador con sus imágenes, librerías como React Query con los datos de las peticiones, o un buscador que recuerda las últimas consultas. "Implementa una caché LRU" es una pregunta famosa de entrevista; en JavaScript tiene una solución elegante si sabes cómo ordena sus claves un `Map`.
