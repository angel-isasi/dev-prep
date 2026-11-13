Escribe y exporta la clase `Producto`. Su precio se lee y se cambia como una propiedad normal (`producto.precio = 20`), pero la clase **valida** cada asignación y rechaza los precios inválidos. Además calcula el precio con IGV (el impuesto de 18% en Perú).

## Reglas

- `new Producto(nombre, precio)` guarda `nombre` y `precio`. El constructor también valida el precio.
- `producto.precio` devuelve el precio actual.
- `producto.precio = valor`:
  - Si `valor` no es un número finito (por ejemplo `"30"`, `NaN` o `Infinity`) o es negativo, lanza `new Error("Precio inválido")`.
  - Si es válido, lo guarda. El `0` es válido (un producto gratis).
  - Si se lanza el error, el precio anterior **no cambia**.
- `producto.conIgv`: el precio multiplicado por `1.18`, redondeado a 2 decimales. Es una propiedad de solo lectura que siempre se calcula con el precio actual.
- El precio se guarda en un campo privado, para que nadie pueda saltarse la validación.

## Ejemplos

```js
const pizza = new Producto("Pizza", 30);
pizza.precio;   // 30
pizza.conIgv;   // 35.4

pizza.precio = -5;    // ❌ Error: "Precio inválido"
pizza.precio;         // 30 (no cambió)

pizza.precio = "50";  // ❌ Error: "Precio inválido" (es un texto)

pizza.precio = 10;
pizza.conIgv;   // 11.8

new Producto("Agua", -1); // ❌ Error: "Precio inválido"
```

## Por qué importa

Los getters y setters te permiten controlar qué pasa cuando alguien lee o escribe una propiedad, sin cambiar cómo se usa. Así un objeto nunca queda en un estado inválido. En entrevistas sirve para hablar de **encapsulamiento**, y la idea de "validar en un solo lugar" es la misma que usarás en formularios.
