## Idea clave

`for...of`, spread y `Array.from` funcionan con **cualquier objeto que tenga un método `[Symbol.iterator]`** que devuelva un iterador. La forma más corta de escribir ese método es como **generador**: `*[Symbol.iterator]()` y dentro `yield*` sobre el arreglo de canciones. Cada vez que alguien recorre la playlist, se llama al método y se crea un generador nuevo que empieza desde el principio.

## Paso a paso

1. **Recibe las canciones con rest**: `constructor(...canciones)`. Los tres puntos en un parámetro juntan todos los argumentos en un arreglo: `new Playlist("A", "B", "C")` → `canciones = ["A", "B", "C"]`. Sin argumentos, es `[]`.
2. **Guárdalas en el campo privado** `#canciones`.
3. **Define el método `[Symbol.iterator]`**. `Symbol.iterator` es un valor especial (un *símbolo*) que JavaScript usa como nombre del método de iteración. Va entre corchetes porque el nombre es el valor de una expresión, no un texto escrito.
4. **Hazlo generador** con el asterisco: `*[Symbol.iterator]()`. Así JavaScript arma el iterador por ti.
5. **`yield* this.#canciones`**: delega en el arreglo. Equivale a `for (const c of this.#canciones) yield c;`, es decir, entrega las canciones una por una.

```js
export class Playlist {
  #canciones;

  constructor(...canciones) {
    this.#canciones = canciones;
  }

  *[Symbol.iterator]() {
    yield* this.#canciones;
  }
}
```

## Por qué funciona

Cuando escribes `for (const cancion of lista)`, JavaScript hace esto por debajo:

1. Busca `lista[Symbol.iterator]`. Lo encuentra en `Playlist.prototype` (es un método de la clase).
2. Lo llama: `lista[Symbol.iterator]()`. Como es un generador, devuelve un generador nuevo, pausado al inicio.
3. Llama `next()` una y otra vez hasta que `done` sea `true`:

| Llamada | Qué hace el generador | Devuelve | `cancion` en el bucle |
|---|---|---|---|
| 1.º `next()` | `yield*` entrega el elemento 0 | `{ value: "A", done: false }` | `"A"` |
| 2.º `next()` | entrega el elemento 1 | `{ value: "B", done: false }` | `"B"` |
| 3.º `next()` | entrega el elemento 2 | `{ value: "C", done: false }` | `"C"` |
| 4.º `next()` | el arreglo se acabó, la función termina | `{ value: undefined, done: true }` | (sale del bucle) |

Spread (`[...lista]`), `Array.from(lista)` y `const [primera] = lista` hacen exactamente los mismos pasos y van metiendo cada `value` en un arreglo o en las variables.

Se puede recorrer varias veces porque **cada recorrido vuelve a llamar** a `[Symbol.iterator]()` y obtiene un generador nuevo, con su propia posición. Y la copia de `[...lista]` es un arreglo nuevo armado con los valores, así que hacerle `push` no toca `#canciones`.

## Errores comunes

- **Escribir `Symbol.iterator()` sin corchetes** o como texto `"Symbol.iterator"()`. Defines un método con otro nombre y `[...lista]` falla con "lista is not iterable". El nombre del método debe ir entre corchetes: `[Symbol.iterator]`.
- **Olvidar el asterisco.** Sin `*`, `yield` es un error de sintaxis ("Unexpected strict mode reserved word").
- **Usar `yield this.#canciones` (sin asterisco después de `yield`).** Entregas el arreglo entero como **un solo** valor: `[...lista]` da `[["A", "B", "C"]]`. `yield*` entrega los elementos uno por uno.
- **Recibir `constructor(canciones)` sin los tres puntos.** Solo guardas el primer argumento (`"A"`), y al recorrer un string con `yield*` obtienes sus letras.
- **Devolver siempre el mismo iterador** (por ejemplo, crearlo en el constructor y devolverlo en `[Symbol.iterator]`). El primer recorrido lo agota y el segundo da `[]`. Falla "se puede recorrer varias veces".

## Otra forma de resolverlo

Sin generador, devolviendo un iterador escrito a mano con `next()`:

```js
export class Playlist {
  #canciones;

  constructor(...canciones) {
    this.#canciones = canciones;
  }

  [Symbol.iterator]() {
    const canciones = this.#canciones;
    let indice = 0;
    return {
      next() {
        if (indice < canciones.length) {
          return { value: canciones[indice++], done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}
```

O la más corta: delegar en el iterador que ya trae el arreglo:

```js
[Symbol.iterator]() {
  return this.#canciones[Symbol.iterator]();
}
```

**¿Cuál conviene?** Si solo necesitas recorrer un arreglo interno, la de delegar (`return this.#canciones[Symbol.iterator]()`) o el generador con `yield*` son las mejores: cortas y sin errores de índice. El generador gana cuando quieres transformar o filtrar mientras recorres (por ejemplo, saltar canciones ocultas con un `if` antes del `yield`). La versión con `next()` a mano sirve para demostrar que entiendes el protocolo.

## Cómo explicarlo en la entrevista

> "`for...of` y el spread funcionan con cualquier objeto que tenga el método `Symbol.iterator`, que debe devolver un iterador con `next()`. En la clase guardo las canciones en un campo privado y defino `[Symbol.iterator]` como generador, con `yield*` sobre el arreglo, así JavaScript arma el iterador por mí. Cada recorrido llama al método de nuevo y obtiene un generador nuevo, por eso se puede recorrer varias veces. Es el mismo mecanismo que usan `Map`, `Set` o los strings."

## Conceptos

- **Iterable**: objeto con un método `[Symbol.iterator]()` que devuelve un iterador.
- **`Symbol.iterator`**: símbolo especial que JavaScript usa como nombre del método de iteración.
- **Nombre de método calculado `[...]`**: los corchetes en una clase u objeto usan el valor de una expresión como nombre.
- **Método generador `*metodo()`**: un método de clase que funciona como `function*`.
- **`yield*`**: delega en otro iterable y entrega sus valores uno por uno.
- **Parámetro rest (`...args`)**: junta los argumentos sueltos en un arreglo.
- **Spread (`[...x]`)**: recorre un iterable y mete sus valores en un arreglo nuevo.
