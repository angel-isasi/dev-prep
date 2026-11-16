## El problema

En la app de pedidos, el botón **"Agregar combo"** (que agrega una hamburguesa, papas y gaseosa de una vez) rompe la página con este error en la consola:

```
TypeError: Cannot read properties of undefined (reading 'agregar')
```

Agregar los productos **uno por uno** sí funciona.

## Qué debe hacer

La clase `Carrito` guarda los productos en `items`:

- `agregar(item)` suma un producto.
- `agregarVarios(items)` suma todos los productos de un arreglo, en orden.
- `total()` devuelve la suma de los precios.

```js
const carrito = new Carrito();
carrito.agregar({ nombre: "Helado", precio: 5 });
carrito.agregarVarios([
  { nombre: "Hamburguesa", precio: 15 },
  { nombre: "Papas", precio: 6 },
  { nombre: "Gaseosa", precio: 4 },
]);
carrito.total(); // 30
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
