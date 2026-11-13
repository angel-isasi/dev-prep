## Idea clave

Un método es una función guardada dentro de un objeto. Cuando lo llamas con un punto, `carrito.total()`, JavaScript pone en `this` el objeto que está **antes del punto**. Así el mismo método trabaja con los datos de cualquier objeto que lo llame.

## Paso a paso

1. **Devuelve un objeto nuevo** en cada llamada: `return { ... }`. Por eso dos carritos no se mezclan.
2. **`productos: []`**: el arreglo vive dentro del objeto, como una propiedad más.
3. **`agregar(nombre, precio)`**: arma el objeto `{ nombre, precio }` (forma corta de `{ nombre: nombre, precio: precio }`) y lo empuja a `this.productos`.
4. **`return this`** al final de `agregar`: devuelve el propio carrito, y por eso puedes escribir `.agregar(...).agregar(...)`.
5. **`total()`**: recorre `this.productos` con `reduce` y suma los precios, empezando en 0.
6. **`cantidad()`**: devuelve `this.productos.length`.

```js
export function crearCarrito() {
  return {
    productos: [],

    agregar(nombre, precio) {
      this.productos.push({ nombre, precio });
      return this;
    },

    total() {
      return this.productos.reduce((suma, producto) => suma + producto.precio, 0);
    },

    cantidad() {
      return this.productos.length;
    },
  };
}
```

## Por qué funciona

Recorrido con `carrito.agregar("Pan", 0.5).agregar("Leche", 4.5)`:

| Paso | Llamada | `this` vale | `this.productos` después | Devuelve |
|---|---|---|---|---|
| 1 | `carrito.agregar("Pan", 0.5)` | `carrito` | `[Pan]` | `carrito` |
| 2 | `(carrito).agregar("Leche", 4.5)` | `carrito` | `[Pan, Leche]` | `carrito` |
| 3 | `carrito.total()` | `carrito` | sin cambios | `0 + 0.5 + 4.5 = 5` |

El paso 2 funciona porque el paso 1 devolvió `carrito`: el segundo `.agregar` se llama sobre ese resultado.

En el test del préstamo, `otro.total()` tiene `otro` antes del punto, así que `this` es `otro` y se suman **sus** productos (12 + 8 = 20). El método no está "pegado" al carrito donde nació: `this` se decide en el momento de la llamada.

La flecha dentro de `reduce` no molesta: no usa `this`, solo sus parámetros `suma` y `producto`.

## Errores comunes

- **Escribir los métodos como flechas**: `total: () => this.productos.reduce(...)`. Una flecha no tiene `this` propio: toma el de afuera, el de `crearCarrito`, que al llamarse suelta en un módulo es `undefined`. Lo reconoces por `TypeError: Cannot read properties of undefined (reading 'productos')`.
- **Olvidar `return this` en `agregar`**: la primera llamada devuelve `undefined` y la segunda revienta con `Cannot read properties of undefined (reading 'agregar')`.
- **Guardar los productos en una variable de afuera** (`const productos = []` y luego `productos.push(...)`). Funciona para el carrito, pero falla el test del préstamo: `otro.total()` sumaría los productos del carrito y no los de `otro`.
- **Declarar `productos` fuera de `crearCarrito`**, a nivel del archivo: todos los carritos comparten el mismo arreglo y el test de "dos carritos" falla.
- **Olvidar el 0 inicial de `reduce`**: con el carrito vacío, `[].reduce(fn)` lanza `TypeError: Reduce of empty array with no initial value`.

## Otra forma de resolverlo

Con una **clase**, que es como se haría en un proyecto real:

```js
class Carrito {
  constructor() {
    this.productos = [];
  }

  agregar(nombre, precio) {
    this.productos.push({ nombre, precio });
    return this;
  }

  total() {
    return this.productos.reduce((suma, p) => suma + p.precio, 0);
  }

  cantidad() {
    return this.productos.length;
  }
}

export function crearCarrito() {
  return new Carrito();
}
```

Con `new`, `this` dentro del `constructor` es el objeto recién creado. Los métodos quedan en el prototipo y todos los carritos los comparten, en vez de crear tres funciones nuevas por carrito. Para un carrito da igual; con miles de objetos, la clase ahorra memoria.

## Cómo explicarlo en la entrevista

> "Devuelvo un objeto con un arreglo `productos` y tres métodos. Dentro de cada método uso `this`, que es el objeto que está antes del punto al llamar, así el método trabaja con los datos de ese carrito. `agregar` devuelve `this` para poder encadenar llamadas, como hace jQuery. Uso la sintaxis de método y no flechas, porque una flecha no tiene `this` propio y tomaría el de afuera."

## Conceptos

- **Método**: función guardada como propiedad de un objeto.
- **`this` implícito**: en `obj.metodo()`, `this` es `obj`. Se decide al llamar, no al escribir la función.
- **Encadenar métodos**: devolver `this` para escribir `obj.a().b().c()`.
- **Propiedades abreviadas**: `{ nombre, precio }` es lo mismo que `{ nombre: nombre, precio: precio }`.
- **Funciones flecha y `this`**: las flechas no tienen `this` propio, usan el del lugar donde se escribieron.
- **`reduce` con valor inicial**: convierte un arreglo en un solo valor; el 0 evita el error con arreglos vacíos.
