## Idea clave

Guardas un objeto donde cada **nombre de evento** apunta a un **arreglo de funciones**. `on` agrega al arreglo, `off` lo filtra y `emit` recorre el arreglo llamando a cada función. `on` devuelve una flecha que, gracias al closure, recuerda qué evento y qué función quitar.

## Paso a paso

1. **En el `constructor`**, crea `this.eventos = {}`. Cada `new Emisor()` ejecuta el constructor y tiene su propio objeto.
2. **`on(evento, fn)`**: `(this.eventos[evento] ||= []).push(fn)` crea la lista la primera vez y agrega la función.
3. **`on` devuelve** `() => this.off(evento, fn)`. Es una flecha, así que su `this` es el del método `on`: el emisor.
4. **`off(evento, fn)`**: reemplaza la lista por una copia filtrada que no incluye `fn`. Si la lista no existía, usa `[]` para no fallar.
5. **`emit(evento, ...args)`**: toma la lista (o `[]`) y llama a cada función con `fn(...args)`.

```js
export class Emisor {
  constructor() {
    this.eventos = {};
  }

  on(evento, fn) {
    (this.eventos[evento] ||= []).push(fn);
    return () => this.off(evento, fn);
  }

  off(evento, fn) {
    this.eventos[evento] = (this.eventos[evento] || []).filter((f) => f !== fn);
  }

  emit(evento, ...args) {
    (this.eventos[evento] || []).forEach((fn) => fn(...args));
  }
}
```

## Por qué funciona

Recorrido del ejemplo:

| Acción | `this.eventos` | Efecto |
|---|---|---|
| `new Emisor()` | `{}` | |
| `quitar = e.on("voto", A)` | `{ voto: [A] }` | `quitar` recuerda `"voto"` y `A` |
| `e.emit("voto", "Drama")` | `{ voto: [A] }` | llama `A("Drama")` |
| `quitar()` | `{ voto: [] }` | llama `this.off("voto", A)` |
| `e.emit("voto", "Terror")` | `{ voto: [] }` | la lista está vacía: nadie recibe nada |

`off` compara con `f !== fn`: dos funciones son "iguales" solo si son **la misma** función (misma referencia). Por eso para desuscribirte necesitas la función original, y por eso es tan cómodo que `on` te devuelva un "desuscribir" que ya la tiene guardada.

## Errores comunes

- **Crear `eventos` fuera de la clase (a nivel del módulo).** Todos los emisores compartirían las suscripciones. Lo reconoces porque falla el test "cada emisor es independiente".
- **Hacer `push` sin crear la lista.** La primera vez falla con "Cannot read properties of undefined (reading 'push')".
- **En `emit`, no contemplar un evento sin lista.** `this.eventos[evento].forEach` falla con "Cannot read properties of undefined (reading 'forEach')".
- **Devolver `function () { this.off(...) }` desde `on`.** Al llamar `quitar()` suelto, `this` es `undefined`. Lo reconoces por "Cannot read properties of undefined (reading 'off')". Por eso se usa flecha.
- **Pasar los argumentos como arreglo: `fn(args)`.** El suscriptor recibe `["Drama", 9]` como primer argumento. Debe ser `fn(...args)`.
- **Quitar suscripciones con `splice` mientras `emit` recorre la lista.** Si un suscriptor se desuscribe dentro de su propia llamada, el recorrido salta al siguiente. Con `filter` creas una lista nueva y el recorrido actual no se altera.

## Otra forma de resolverlo

Con `Map` y `Set`, estructuras pensadas para esto:

```js
export class Emisor {
  #eventos = new Map();

  on(evento, fn) {
    if (!this.#eventos.has(evento)) this.#eventos.set(evento, new Set());
    this.#eventos.get(evento).add(fn);
    return () => this.off(evento, fn);
  }

  off(evento, fn) {
    this.#eventos.get(evento)?.delete(fn);
  }

  emit(evento, ...args) {
    for (const fn of [...(this.#eventos.get(evento) ?? [])]) fn(...args);
  }
}
```

`Set` quita en O(1) (el `filter` recorre toda la lista) y no permite suscribir dos veces la misma función. El campo privado `#eventos` impide que alguien manipule las suscripciones desde fuera. El `[...]` en `emit` copia la lista antes de recorrerla, por si alguien se desuscribe durante el recorrido. Conviene cuando hay muchos suscriptores; con pocos, la versión con objeto y arreglos es más simple de explicar.

## Cómo explicarlo en la entrevista

> "Guardo, por cada nombre de evento, una lista de funciones. `on` agrega a la lista, `off` la filtra quitando esa función, y `emit` recorre la lista llamando a cada una con los argumentos. `on` devuelve una función para desuscribirse que, por closure, recuerda el evento y la función, igual que la limpieza de un `useEffect`. Uso flecha en esa función para que `this` siga siendo el emisor. Emitir es O(k), donde k es la cantidad de suscriptores de ese evento. Es el mismo patrón de `addEventListener`."

## Conceptos

- **Pub/sub (publicar/suscribir)**: quien emite no conoce a quien escucha; se comunican por el nombre del evento.
- **Clase y `constructor`**: el constructor corre con cada `new` y prepara el estado de esa instancia.
- **Comparación de funciones**: `f === g` solo es verdadero si son la misma referencia.
- **Flecha y `this`**: la flecha devuelta por `on` usa el `this` del método, que es el emisor.
- **Operador `||=`**: crea la lista solo si todavía no existe.
- **Función de limpieza**: devolver una función que deshace lo hecho; React la usa en `useEffect`.
