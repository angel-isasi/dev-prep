Estás armando el carrito de compras de una tienda online. Antes de escribir la lógica, define la **forma de los datos** con interfaces, como se hace en cualquier proyecto con TypeScript.

1. `interface Producto` con:
   - `id`: número
   - `nombre`: texto
   - `precio`: número (precio unitario en soles)
2. `interface ItemCarrito` con:
   - `producto`: un `Producto`
   - `cantidad`: número
3. La función `totalCarrito(items: ItemCarrito[]): number`, que devuelve el total a pagar: la suma de `precio * cantidad` de cada ítem, **redondeada a 2 decimales**.

## Reglas

- Exporta las dos interfaces y la función.
- Un carrito vacío cuesta `0`.
- Un objeto al que le falte una propiedad, o con un precio en texto, debe ser un **error de tipos**. Los tests crean objetos con tus interfaces y `tsc` los revisa.

## Ejemplos

```ts
const audifonos: Producto = { id: 1, nombre: "Audífonos", precio: 59.9 };
const mouse: Producto = { id: 2, nombre: "Mouse", precio: 35 };

totalCarrito([
  { producto: audifonos, cantidad: 2 },   // 119.8
  { producto: mouse, cantidad: 1 },       // 35
]);                                        // 154.8

totalCarrito([]);                          // 0

const roto: ItemCarrito = { producto: mouse };   // error: falta cantidad
```

## Reto extra

Escribe un objeto `ItemCarrito` en VS Code y, dentro de las llaves, presiona `Ctrl + Espacio`: el editor te sugiere las propiedades que faltan. Eso es lo que ganas en el día a día al tipar tus datos.
