## Idea clave

Una pila es un arreglo al que solo le tocas **un extremo**: el final. `push` agrega arriba, `pop` saca de arriba. La clase envuelve ese arreglo en un **campo privado** (`#items`) para que nadie pueda saltarse las reglas y meter o sacar elementos por el medio.

## Paso a paso

1. **Declara el campo privado** `#items = []`. El `#` hace que solo el código dentro de la clase pueda leerlo o cambiarlo. Cada `new Pila()` recibe su propio arreglo vacío.
2. **`apilar(elemento)`**: `this.#items.push(elemento)` lo agrega al final. Luego `return this` devuelve la misma pila, y por eso puedes escribir `new Pila().apilar("a").apilar("b")`.
3. **`desapilar()`**: `this.#items.pop()` quita el último elemento y lo devuelve. Si el arreglo está vacío, `pop()` devuelve `undefined` por sí solo, así que no necesitas un `if`.
4. **`verTope()`**: `this.#items.at(-1)` lee el último elemento sin quitarlo. Con índices negativos, `at` cuenta desde el final: `-1` es el último. En un arreglo vacío también devuelve `undefined`.
5. **`tamano`**: un **getter** (`get tamano()`) es un método que se usa como si fuera una propiedad. Quien usa la pila escribe `pila.tamano`, sin paréntesis, y por dentro se ejecuta `return this.#items.length`.

```js
export class Pila {
  #items = [];

  apilar(elemento) {
    this.#items.push(elemento);
    return this;
  }

  desapilar() {
    return this.#items.pop();
  }

  verTope() {
    return this.#items.at(-1);
  }

  get tamano() {
    return this.#items.length;
  }
}
```

## Por qué funciona

Sigue el estado interno de `#items` con el ejemplo:

| Llamada | Devuelve | `#items` después |
|---|---|---|
| `new Pila()` | la pila | `[]` |
| `.apilar("a")` | la misma pila | `["a"]` |
| `.apilar("b")` | la misma pila | `["a", "b"]` |
| `pila.verTope()` | `"b"` | `["a", "b"]` (no cambia) |
| `pila.desapilar()` | `"b"` | `["a"]` |
| `pila.verTope()` | `"a"` | `["a"]` |
| `pila.tamano` | `1` | `["a"]` |

El encadenamiento funciona porque `new Pila()` devuelve la pila, `.apilar("a")` también la devuelve (`return this`) y entonces `.apilar("b")` se llama sobre ese mismo objeto. Al final, la variable `pila` guarda lo que devolvió el último `apilar`, que es la pila.

Con una pila vacía: `[].pop()` es `undefined`, `[].at(-1)` es `undefined` y `[].length` es `0`. Los casos borde salen gratis gracias a cómo funcionan los arreglos.

## Errores comunes

- **Olvidar `return this` en `apilar`.** El método devuelve `undefined` y la segunda llamada falla con "Cannot read properties of undefined (reading 'apilar')".
- **Escribir `tamano()` como método normal.** Entonces `pila.tamano` devuelve la función entera en vez de un número. Lo reconoces porque el test dice algo como "expected [Function tamano] to be 1". Usa `get tamano()`.
- **Usar `shift` o `unshift`.** Trabajan con el **inicio** del arreglo. Si mezclas `push` con `shift`, construyes una cola, no una pila: `desapilar` te devolvería `"a"` en vez de `"b"`.
- **Leer el tope con `this.#items[this.#items.length]`.** Los índices empiezan en 0, así que el último es `length - 1`. Con `length` siempre obtienes `undefined`.
- **Declarar `#items` fuera de la clase** (una variable suelta en el archivo). Todas las pilas compartirían el mismo arreglo y lo que apilas en una aparecería en la otra.

## Otra forma de resolverlo

Sin campos privados ni clases, con una función que devuelve un objeto y un **closure** que guarda el arreglo:

```js
export function crearPila() {
  const items = [];
  return {
    apilar(elemento) {
      items.push(elemento);
      return this;
    },
    desapilar: () => items.pop(),
    verTope: () => items.at(-1),
    get tamano() {
      return items.length;
    },
  };
}
```

`items` no se ve desde fuera porque vive dentro de la función, y los métodos lo "recuerdan". El resultado es igual de privado que `#items`.

**¿Cuál conviene?** La clase es lo que normalmente espera el entrevistador cuando dice "implementa una pila", y te permite usar `instanceof Pila`. La versión con closure es útil para mostrar que entiendes los closures. Antes de que existiera `#`, la convención era `this._items` (con guion bajo), pero eso es solo un aviso: cualquiera puede leerlo y cambiarlo.

## Cómo explicarlo en la entrevista

> "Una pila es LIFO: el último en entrar es el primero en salir. La implemento con un arreglo privado, `#items`, y solo trabajo con su final: `push` para apilar y `pop` para desapilar, las dos son O(1). Para ver el tope sin sacarlo uso `at(-1)`. Hago que `apilar` devuelva `this` para poder encadenar llamadas, y `tamano` es un getter para que se lea como propiedad. El campo privado evita que alguien de afuera modifique el arreglo y rompa la regla de la pila."

## Conceptos

- **Pila (LIFO)**: estructura donde el último elemento en entrar es el primero en salir.
- **Clase**: plantilla para crear objetos con los mismos métodos; se instancia con `new`.
- **Campo privado `#`**: propiedad que solo se puede usar dentro del cuerpo de la clase; desde fuera da error de sintaxis.
- **Getter (`get`)**: método que se lee como propiedad, sin paréntesis.
- **`return this`**: devolver el propio objeto para poder encadenar métodos (*method chaining*).
- **`push` / `pop`**: agregan y quitan elementos al final de un arreglo.
- **`at(-1)`**: lee el último elemento de un arreglo; los índices negativos cuentan desde el final.
