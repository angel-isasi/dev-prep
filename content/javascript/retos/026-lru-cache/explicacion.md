## Idea clave

Un `Map` recuerda el **orden de inserción** de sus claves. Si cada vez que usas una clave la borras y la vuelves a insertar, el `Map` queda ordenado de **la más vieja a la más reciente**: la que hay que expulsar es siempre la primera.

## Paso a paso

1. **En el constructor**, guarda la capacidad y crea un `Map` vacío.
2. **`get(clave)`**: si el mapa no la tiene, devuelve `-1`.
3. Si la tiene, lee el valor, haz `delete` y `set` de esa clave (así pasa al final, como la más reciente) y devuelve el valor.
4. **`put(clave, valor)`**: si la clave ya existía, bórrala primero, para que el `set` la deje al final.
5. Haz `set(clave, valor)`.
6. Si ahora `size` supera la capacidad, toma la primera clave con `this.mapa.keys().next().value` y bórrala.

```js
export class LRUCache {
  constructor(capacidad) {
    this.capacidad = capacidad;
    this.mapa = new Map();
  }

  get(clave) {
    if (!this.mapa.has(clave)) return -1;
    const valor = this.mapa.get(clave);
    this.mapa.delete(clave);
    this.mapa.set(clave, valor);
    return valor;
  }

  put(clave, valor) {
    if (this.mapa.has(clave)) this.mapa.delete(clave);
    this.mapa.set(clave, valor);

    if (this.mapa.size > this.capacidad) {
      const masAntigua = this.mapa.keys().next().value;
      this.mapa.delete(masAntigua);
    }
  }
}
```

## Por qué funciona

Recorrido del ejemplo con capacidad 2. El orden del mapa va de la más vieja (izquierda) a la más reciente (derecha):

| Operación | Orden del mapa después | Comentario |
|---|---|---|
| `put(1, 1)` | `1` | |
| `put(2, 2)` | `1, 2` | |
| `get(1)` → 1 | `2, 1` | la 1 se borra y se reinserta al final |
| `put(3, 3)` | `2, 1, 3` → `1, 3` | el tamaño es 3 > 2: se expulsa la primera, la 2 |
| `get(2)` → -1 | `1, 3` | ya no está |
| `get(3)` → 3 | `1, 3` | se mueve al final (ya estaba ahí) |

`this.mapa.keys()` devuelve un **iterador** sobre las claves en orden; `.next()` da el primer paso como `{ value: 2, done: false }`, y `.value` es la clave más vieja. No necesitas recorrer todo el mapa.

Todas las operaciones (`has`, `get`, `set`, `delete`, `keys().next()`) son O(1), así que `get` y `put` también lo son.

## Errores comunes

- **No mover la clave al final en `get`.** Leer no la protege y se expulsa la equivocada. Lo reconoces porque en el primer test la 1 desaparece en vez de la 2.
- **Hacer solo `set` en `put` cuando la clave ya existía.** `set` sobre una clave existente cambia el valor pero **no** la mueve al final. Lo reconoces porque falla el test de actualizar.
- **Expulsar antes de insertar, o con `>=`.** Al actualizar una clave existente con la caché llena, expulsarías a otra sin motivo. Lo reconoces porque "actualizar no debe expulsar" falla.
- **Usar un arreglo para el orden y `indexOf` para buscar.** Funciona, pero cada operación es O(n). En la entrevista te pedirán O(1).
- **Usar un objeto `{}` en vez de `Map`.** Los objetos ordenan las claves numéricas de menor a mayor, no por inserción, así que el orden se rompe con claves como `1, 2, 3`.

## Otra forma de resolverlo

La solución "de libro", la que se usa en lenguajes donde el diccionario no guarda orden, combina un **diccionario** (para buscar) con una **lista doblemente enlazada** (para el orden):

```js
export class LRUCache {
  constructor(capacidad) {
    this.capacidad = capacidad;
    this.nodos = new Map(); // clave -> nodo; aquí el Map solo se usa para buscar
    // Nodos "centinela": después de la cabeza va el más reciente, antes de la cola el más viejo.
    this.cabeza = {};
    this.cola = {};
    this.cabeza.siguiente = this.cola;
    this.cola.anterior = this.cabeza;
  }

  #quitar(nodo) {
    nodo.anterior.siguiente = nodo.siguiente;
    nodo.siguiente.anterior = nodo.anterior;
  }

  #alFrente(nodo) {
    nodo.anterior = this.cabeza;
    nodo.siguiente = this.cabeza.siguiente;
    this.cabeza.siguiente.anterior = nodo;
    this.cabeza.siguiente = nodo;
  }

  get(clave) {
    const nodo = this.nodos.get(clave);
    if (!nodo) return -1;
    this.#quitar(nodo);
    this.#alFrente(nodo);
    return nodo.valor;
  }

  put(clave, valor) {
    const existente = this.nodos.get(clave);
    if (existente) this.#quitar(existente);

    const nodo = { clave, valor };
    this.#alFrente(nodo);
    this.nodos.set(clave, nodo);

    if (this.nodos.size > this.capacidad) {
      const masAntiguo = this.cola.anterior;
      this.#quitar(masAntiguo);
      this.nodos.delete(masAntiguo.clave);
    }
  }
}
```

Cada nodo sabe quién está antes y después de él, así que sacarlo o ponerlo al frente es O(1): solo se reconectan cuatro referencias. Los centinelas evitan casos especiales cuando la lista está vacía. Es bastante más código, pero es lo que el entrevistador tiene en mente cuando pregunta "¿y si el diccionario no guardara el orden?". En JavaScript, la versión con `Map` ordenado es perfectamente válida si explicas **por qué** funciona.

## Cómo explicarlo en la entrevista

> "Aprovecho que un `Map` en JavaScript mantiene el orden de inserción. Cuando leo o escribo una clave, la borro y la vuelvo a insertar para que quede al final, como la más reciente. Así la primera clave del mapa siempre es la usada hace más tiempo. Si al insertar me paso de la capacidad, borro esa primera clave, que obtengo con `keys().next().value`. Todo es O(1). En otros lenguajes se haría con un diccionario más una lista doblemente enlazada."

## Conceptos

- **Caché LRU**: expulsa el elemento usado hace más tiempo cuando se llena.
- **`Map` y orden de inserción**: recorre sus claves en el orden en que se agregaron; `set` sobre una clave existente no cambia su posición.
- **Iterador**: objeto con `next()` que devuelve `{ value, done }` paso a paso.
- **`map.keys().next().value`**: la primera clave insertada (la más vieja que sigue ahí).
- **Complejidad O(1)**: tiempo constante, no depende de cuántos elementos haya.
- **Lista doblemente enlazada**: nodos que apuntan al anterior y al siguiente; permite mover nodos en O(1).
