## Idea clave

Al lado de la pila de valores mantienes una **segunda pila de mínimos**: en cada posición guardas el mínimo de todo lo que había hasta ese momento. Las dos crecen y se achican juntas, así que el mínimo actual siempre está en el tope de la segunda pila. Todo O(1).

## Paso a paso

1. **La solución directa** (dila en voz alta): una pila normal y un `getMin` que la recorre con `Math.min(...this.pila)`. `push`, `pop` y `top` son O(1), pero `getMin` es O(n), y el enunciado pide O(1) para todas.
2. **El intento con una variable**: guardar `this.minimo` y actualizarlo en cada `push`. Funciona hasta que haces `pop` del mínimo: ya no sabes cuál era el anterior y tendrías que recorrer la pila.
3. **Anota el mínimo en cada momento.** Cada vez que haces `push(x)`, guardas también "cuál es el mínimo ahora", que es el menor entre `x` y el mínimo anterior. Lo guardas en `this.minimos`, que crece al mismo ritmo que `this.pila`.
4. **`pop` saca de las dos.** Al quitar el tope de `minimos`, el nuevo tope es justo el mínimo que había **antes** de ese `push`. No hay que recalcular nada.
5. **`top` y `getMin`** solo leen el último elemento de su pila: `arr[arr.length - 1]`.
6. **Las pilas viven en `this`**, dentro del `constructor`. Así cada `new MinStack()` tiene las suyas.

```js
export class MinStack {
  constructor() {
    this.pila = [];
    this.minimos = [];
  }

  push(x) {
    this.pila.push(x);
    const minimo = this.minimos.length === 0 ? x : Math.min(x, this.getMin());
    this.minimos.push(minimo);
  }

  pop() {
    this.minimos.pop();
    return this.pila.pop();
  }

  top() {
    return this.pila[this.pila.length - 1];
  }

  getMin() {
    return this.minimos[this.minimos.length - 1];
  }
}
```

## Por qué funciona

Recorrido con el ejemplo:

| Operación | `pila` | `minimos` | Devuelve |
|---|---|---|---|
| `push(-2)` | `[-2]` | `[-2]` | |
| `push(0)` | `[-2, 0]` | `[-2, -2]` | |
| `push(-3)` | `[-2, 0, -3]` | `[-2, -2, -3]` | |
| `getMin()` | `[-2, 0, -3]` | `[-2, -2, -3]` | **-3** |
| `pop()` | `[-2, 0]` | `[-2, -2]` | -3 |
| `top()` | `[-2, 0]` | `[-2, -2]` | **0** |
| `getMin()` | `[-2, 0]` | `[-2, -2]` | **-2** |

Fíjate en `push(0)`: el 0 no es menor que -2, así que en `minimos` se repite el -2. Esa repetición es la que permite que, después del `pop` del -3, el tope de `minimos` vuelva a ser -2 sin buscar nada.

Con el mínimo repetido (`push(0)`, `push(1)`, `push(0)`), `minimos` queda `[0, 0, 0]`. Al sacar un 0, el tope sigue siendo 0: el otro 0 todavía está en la pila.

## Errores comunes

- **Guardar el mínimo en una sola variable.** Después de sacar el mínimo, `getMin` devuelve un valor que ya no está. Lo reconoces en el test "el mínimo se recupera al sacar".
- **Solo agregar a `minimos` cuando `x` es estrictamente menor** (`x < min`) y sacar cuando el valor sacado es igual al mínimo. Con mínimos repetidos sacas el mínimo una vez de más. Si usas esta variante, agrega con `x <= min`. Lo reconoces en el test del mínimo repetido.
- **Olvidar sacar de `minimos` en `pop`.** Las pilas se desincronizan y `getMin` devuelve mínimos viejos.
- **No devolver nada en `pop`.** El enunciado pide devolver el elemento sacado; `return this.pila.pop()` lo hace en una línea.
- **Declarar las pilas fuera de la clase** (como variables del módulo). Todas las instancias compartirían los mismos datos. Lo reconoces en el test "cada pila es independiente".
- **`getMin` con `Math.min(...this.pila)`.** Funciona, pero es O(n): justo lo que el problema quiere evitar.

## Otra forma de resolverlo

**Recorrer en `getMin`** (paso 1): O(1) para `push`, `pop` y `top`, pero O(n) para `getMin`. Válida solo si no exigen O(1).

**Una sola pila de pares**: cada elemento guarda `{ valor, minimo }`. Es la misma idea con una estructura en lugar de dos arreglos:

```js
push(x) {
  const minimo = this.datos.length === 0 ? x : Math.min(x, this.getMin());
  this.datos.push({ valor: x, minimo });
}
getMin() {
  return this.datos[this.datos.length - 1].minimo;
}
```

**¿Cuál conviene?** Cualquiera de las dos con mínimos guardados: todas las operaciones O(1) y O(n) de memoria. La de dos pilas es la más fácil de dibujar en la pizarra.

## Cómo explicarlo en la entrevista

> "El problema es que al hacer pop el mínimo puede cambiar, y no quiero recorrer la pila para recalcularlo. Por eso guardo una segunda pila paralela donde cada posición tiene el mínimo hasta ese momento. Al hacer push guardo el menor entre el nuevo valor y el mínimo anterior; al hacer pop saco de ambas pilas, y el nuevo tope de los mínimos es justo el mínimo que había antes. Todas las operaciones son O(1) de tiempo, a cambio de O(n) de memoria extra."

## Conceptos

- **Pila**: `push` agrega arriba, `pop` saca de arriba; en JavaScript, un arreglo.
- **Clases en JavaScript**: `class`, `constructor` y métodos; los datos de cada instancia van en `this`.
- **Estructuras paralelas**: dos arreglos del mismo tamaño que guardan información relacionada por posición.
- **Precalcular**: guardar una respuesta en el momento barato (`push`) para no calcularla en el caro (`getMin`).
- **Tiempo vs memoria**: O(n) de memoria extra para tener `getMin` en O(1).
