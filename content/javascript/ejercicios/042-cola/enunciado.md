Escribe y exporta la clase `Cola`. Una **cola** funciona como la fila de un banco: el primero que llega es el primero que atienden (en inglés, FIFO: *first in, first out*).

## Reglas

- `encolar(elemento)`: agrega el elemento al **final** de la cola y **devuelve la misma cola** (`this`), para poder encadenar: `cola.encolar("Ana").encolar("Luis")`.
- `atender()`: saca el elemento del **inicio** (el que lleva más tiempo esperando) y lo devuelve. Si la cola está vacía, devuelve `undefined`.
- `vacia`: `true` si no hay nadie en la cola y `false` si hay al menos uno. Es una **propiedad**, no un método: se lee como `cola.vacia`, sin paréntesis.
- Los elementos se guardan en un arreglo interno que no se debe poder tocar desde fuera de la clase.

## Ejemplos

```js
const cola = new Cola().encolar("Ana").encolar("Luis");

cola.atender();  // "Ana"  (llegó primero)
cola.vacia;      // false  (todavía está Luis)
cola.atender();  // "Luis"
cola.vacia;      // true
cola.atender();  // undefined
```

## Por qué importa

Las colas aparecen cuando hay que procesar cosas **en orden de llegada**: pedidos de una tienda, mensajes de un chat, tareas pendientes. El propio JavaScript usa una cola (la *cola de tareas* del event loop) para decidir qué callback ejecutar después. Compararla con la pila es una pregunta clásica de entrevista.
