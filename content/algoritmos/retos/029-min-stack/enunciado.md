Escribe la clase `MinStack`: una **pila** que, además de las operaciones de siempre, puede decirte su **valor mínimo** en cualquier momento. **Todas** las operaciones deben ser O(1).

| Método | Qué hace |
|---|---|
| `push(x)` | Agrega `x` arriba de la pila. |
| `pop()` | Saca el elemento de arriba y lo devuelve. |
| `top()` | Devuelve el elemento de arriba **sin sacarlo**. |
| `getMin()` | Devuelve el menor valor que hay ahora en la pila. |

## Reglas

- `pop`, `top` y `getMin` solo se llaman cuando la pila no está vacía.
- Puede haber valores repetidos y negativos.
- Cada `new MinStack()` es una pila independiente.
- `getMin` no puede recorrer la pila: tiene que ser O(1), igual que las demás.

## Ejemplos

```js
const pila = new MinStack();
pila.push(-2);
pila.push(0);
pila.push(-3);
pila.getMin();   // -3
pila.pop();      // -3  (lo saca)
pila.top();      // 0
pila.getMin();   // -2  el -3 ya no está: el mínimo vuelve a ser -2
```

## Reto extra

Lo difícil es el `pop`: si sacas el mínimo, ¿cuál es el nuevo mínimo, **sin recorrer** lo que queda? Piensa qué podrías guardar en cada `push` para tener la respuesta lista.
