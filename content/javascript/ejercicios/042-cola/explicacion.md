## Idea clave

Una cola usa los **dos extremos** del arreglo: los elementos entran por el final (`push`) y salen por el inicio (`shift`). Así, el que lleva más tiempo esperando siempre está en la posición 0 y es el siguiente en salir.

## Paso a paso

1. **Declara el campo privado** `#items = []`. Solo los métodos de la clase pueden tocarlo, así nadie puede "colarse" en la fila desde fuera.
2. **`encolar(elemento)`**: `this.#items.push(elemento)` lo pone al final de la fila. Luego `return this` permite encadenar `.encolar(...).encolar(...)`.
3. **`atender()`**: `this.#items.shift()` quita el elemento de la posición 0 y lo devuelve. Los demás se recorren un lugar hacia adelante. Si el arreglo está vacío, `shift()` devuelve `undefined` sin dar error.
4. **`vacia`**: un **getter** que devuelve el resultado de la comparación `this.#items.length === 0`, que ya es `true` o `false`. No hace falta un `if`.

```js
export class Cola {
  #items = [];

  encolar(elemento) {
    this.#items.push(elemento);
    return this;
  }

  atender() {
    return this.#items.shift();
  }

  get vacia() {
    return this.#items.length === 0;
  }
}
```

## Por qué funciona

Estado de `#items` en cada paso del ejemplo:

| Llamada | Devuelve | `#items` después |
|---|---|---|
| `new Cola()` | la cola | `[]` |
| `.encolar("Ana")` | la misma cola | `["Ana"]` |
| `.encolar("Luis")` | la misma cola | `["Ana", "Luis"]` |
| `cola.atender()` | `"Ana"` | `["Luis"]` |
| `cola.vacia` | `false` (`1 === 0` es falso) | `["Luis"]` |
| `cola.atender()` | `"Luis"` | `[]` |
| `cola.vacia` | `true` (`0 === 0`) | `[]` |
| `cola.atender()` | `undefined` | `[]` |

Compárala con la pila: con los mismos `"Ana"` y `"Luis"`, una pila habría devuelto primero `"Luis"`. La única diferencia de código es `shift` en lugar de `pop`.

## Errores comunes

- **Usar `pop` en vez de `shift`.** Construyes una pila: atiendes primero al último que llegó. El test dice "expected 'Luis' to be 'Ana'".
- **Escribir `vacia()` como método normal.** `cola.vacia` devuelve la función, que no es `false`. Lo reconoces porque el test dice "expected [Function vacia] to be false". Usa `get vacia()`.
- **Devolver `this.#items.length` en `vacia`.** Devuelve un número, no un booleano: `1` no es `false` para `toBe`. Compara con `=== 0`.
- **Olvidar `return this` en `encolar`.** La segunda llamada encadenada falla con "Cannot read properties of undefined (reading 'encolar')".
- **Validar con `if (this.#items.length > 0)` antes de `shift`.** No está mal, pero sobra: `shift` en un arreglo vacío ya devuelve `undefined`.

## Otra forma de resolverlo

`shift` tiene un costo oculto: al quitar el primero, JavaScript tiene que mover todos los demás un lugar hacia adelante. Con 10 elementos no importa, pero con un millón cada `atender` se vuelve lento (es O(n)). Para colas grandes se usa un **índice** que marca dónde empieza la fila, y no se mueve nada:

```js
export class Cola {
  #items = {};
  #inicio = 0;
  #fin = 0;

  encolar(elemento) {
    this.#items[this.#fin] = elemento;
    this.#fin++;
    return this;
  }

  atender() {
    if (this.vacia) return undefined;
    const elemento = this.#items[this.#inicio];
    delete this.#items[this.#inicio];
    this.#inicio++;
    return elemento;
  }

  get vacia() {
    return this.#inicio === this.#fin;
  }
}
```

Aquí `atender` solo lee una posición y avanza `#inicio`, así que es O(1) siempre.

**¿Cuál conviene?** En una entrevista junior, empieza con `push` + `shift`: es claro y correcto. Si te preguntan por rendimiento, menciona que `shift` es O(n) y que con dos índices se logra O(1). Eso demuestra que conoces el costo de lo que usas.

## Cómo explicarlo en la entrevista

> "Una cola es FIFO: el primero en llegar es el primero en salir. Guardo los elementos en un arreglo privado, encolo con `push` al final y atiendo con `shift` desde el inicio. `vacia` es un getter que compara la longitud con cero. Hago que `encolar` devuelva `this` para encadenar. Una aclaración: `shift` es O(n) porque reacomoda el arreglo; si la cola fuera muy grande, usaría dos índices, uno de inicio y uno de fin, para que atender sea O(1)."

## Conceptos

- **Cola (FIFO)**: estructura donde el primer elemento en entrar es el primero en salir.
- **`shift`**: quita y devuelve el primer elemento de un arreglo; los demás se recorren.
- **`push`**: agrega un elemento al final de un arreglo.
- **Getter booleano**: un `get` que devuelve `true` o `false`, como `vacia`; se lee sin paréntesis.
- **Campo privado `#`**: protege el estado interno para que solo los métodos de la clase lo cambien.
- **Complejidad O(1) y O(n)**: O(1) tarda lo mismo siempre; O(n) tarda más mientras más elementos haya.
