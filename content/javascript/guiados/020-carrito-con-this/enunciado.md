Escribe la función `crearCarrito()` que devuelva un **objeto carrito** con estos datos y métodos:

- `productos`: un arreglo que empieza vacío.
- `agregar(nombre, precio)`: agrega el objeto `{ nombre, precio }` al final de `productos` y **devuelve el propio carrito**, para poder encadenar llamadas.
- `total()`: devuelve la suma de los precios (0 si está vacío).
- `cantidad()`: devuelve cuántos productos hay.

## Reglas

- Los métodos leen y escriben los productos **a través de `this`**, no de una variable de afuera. Los tests lo comprueban prestándole un método a otro objeto: `total` debe sumar los productos del objeto que lo llama.
- Cada llamada a `crearCarrito()` crea un carrito independiente.
- Escribe los métodos con la sintaxis corta `metodo() { ... }`, no con funciones flecha.

## Ejemplos

```js
const carrito = crearCarrito();
carrito.cantidad();                          // 0

carrito.agregar("Pan", 0.5).agregar("Leche", 4.5);
carrito.productos;   // [{ nombre: "Pan", precio: 0.5 }, { nombre: "Leche", precio: 4.5 }]
carrito.total();     // 5
carrito.cantidad();  // 2

// Prestar el método: this pasa a ser "otro"
const otro = { productos: [{ nombre: "Café", precio: 12 }], total: carrito.total };
otro.total();        // 12
```

## Por qué importa

Es el uso más común de `this`: un objeto con datos y métodos que trabajan sobre **ese** objeto. Es la base de las clases, de librerías como jQuery (que encadenan con `return this`) y de la pregunta de entrevista "¿qué vale `this` aquí?".
