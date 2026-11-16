## Idea clave

En una función normal (`function`), `this` depende de **cómo se llama** la función, no de dónde está escrita. `forEach` llama al callback como una función suelta, sin objeto delante, y dentro de una clase (que siempre corre en modo estricto) eso deja `this` en `undefined`. Una **función flecha** no tiene `this` propio: usa el del método que la rodea, que es el carrito.

## Paso a paso

1. **Lee el error.** `Cannot read properties of undefined (reading 'agregar')` significa: "intentaste hacer `algo.agregar` y `algo` era `undefined`". En el código, ese `algo` es `this`.
2. **Compara lo que funciona con lo que no.** `carrito.agregar(...)` funciona: ahí `this` es el carrito. Dentro del `forEach`, no.
3. **Aísla.** Pon `console.log(this)` dentro del callback: imprime `undefined`. Ponlo justo antes del `forEach`: imprime el carrito.
4. **Usa una flecha**, que toma el `this` de `agregarVarios`.

```js
agregarVarios(items) {
  items.forEach((item) => {
    this.agregar(item);
  });
}
```

## Por qué funciona

| Dónde se lee `this` | Con `function (item)` | Con `(item) =>` |
|---|---|---|
| En `agregarVarios` | el carrito | el carrito |
| Dentro del callback | `undefined` (lo llama `forEach` sin objeto) | el carrito (heredado de `agregarVarios`) |

Cuando escribes `carrito.agregarVarios(combo)`, `this` en `agregarVarios` es el carrito porque hay un objeto antes del punto. La flecha no crea un `this` nuevo, así que dentro de ella `this.agregar` sigue apuntando al carrito.

## Errores comunes

- **Cambiar `this.agregar(item)` por `agregar(item)`**: `agregar` no es una variable, es un método del objeto. Da `ReferenceError: agregar is not defined`.
- **Cambiar `this` por `carrito`**: dentro de la clase no existe la variable `carrito`; ese nombre solo existe en el código de afuera.
- **Convertir `agregarVarios` en flecha y dejar el callback igual**: el problema es el callback interno, que sigue siendo una función normal.

## Otra forma de resolverlo

`forEach` acepta un segundo argumento: el valor que usará como `this` dentro del callback.

```js
agregarVarios(items) {
  items.forEach(function (item) {
    this.agregar(item);
  }, this);
}
```

También funciona un `for...of`, que no crea ninguna función nueva: `for (const item of items) this.agregar(item);`. Antes de las flechas se usaba `const self = this;` y luego `self.agregar(item)`.

## Cómo explicarlo en la entrevista

> "El error decía que `this` era `undefined` dentro del callback del `forEach`. En una función normal, `this` depende de cómo la llaman, y `forEach` la llama sin objeto, así que en modo estricto queda `undefined`. La cambié por una flecha, que no tiene `this` propio y usa el del método, que es el carrito. Otra opción es el segundo argumento de `forEach` o un `for...of`."

## Conceptos

- **`this`**: en una función normal, el objeto que está antes del punto al llamarla (`carrito.agregar()`).
- **`this` perdido**: cuando otra función llama a tu función sin objeto, `this` deja de ser tu objeto.
- **Función flecha**: no tiene `this` propio; usa el del lugar donde está escrita.
- **Modo estricto**: las clases y los módulos lo activan; ahí un `this` sin objeto es `undefined` en vez del objeto global.
- **Método**: una función que vive dentro de una clase u objeto.
