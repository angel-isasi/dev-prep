## El problema

El dueño de la tienda escribe molesto: "Registré un polo como **agotado** (stock 0) y en la tienda aparece **disponible, con 10 unidades**. Ya me hicieron dos pedidos que no puedo atender".

## Qué debe hacer

`crearProducto(datos)` completa los datos que falten:

- `nombre`: `"Sin nombre"` si no llegó o es un texto vacío.
- `categoria`: `"general"` si no llegó o es un texto vacío.
- `stock`: `10` solo si **no llegó** (`undefined` o `null`). El `0` es un valor válido: significa agotado.

```js
crearProducto({});                         // { nombre: "Sin nombre", categoria: "general", stock: 10 }
crearProducto({ nombre: "Polo", stock: 0 }); // { nombre: "Polo", categoria: "general", stock: 0 }
crearProducto({ nombre: "", stock: null });  // { nombre: "Sin nombre", categoria: "general", stock: 10 }
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
