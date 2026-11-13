Crea el componente `ResumenPedido` que recibe `items` (arreglo de `{ precio, cantidad }`) y muestra el **subtotal**, el **IGV (18%)** y el **total** del pedido, en soles.

Exporta también la función `soles(monto)` que da formato a un número.

## Reglas

- `soles(monto)` devuelve `"S/ "` seguido del monto con **2 decimales**: `soles(118)` es `"S/ 118.00"`.
- Subtotal: suma de `precio * cantidad` de todos los items.
- IGV: 18% del subtotal.
- Total: subtotal + IGV.
- Usa una lista de definición `<dl>`: cada concepto en un `<dt>` (`Subtotal`, `IGV (18%)`, `Total`) seguido de su `<dd>` con el monto formateado.
- Con el carrito vacío, los tres montos son `S/ 0.00` (no debe romperse).

## Ejemplo

```jsx
<ResumenPedido items={[{ precio: 30, cantidad: 2 }, { precio: 40, cantidad: 1 }]} />
```

Se ve:

```
Subtotal    S/ 100.00
IGV (18%)   S/ 18.00
Total       S/ 118.00
```

## Por qué importa

Un resumen de compra es casi obligatorio en cualquier e-commerce. El ejercicio junta tres cosas que preguntan mucho: `reduce` con valor inicial, formatear dinero y **no guardar en estado lo que se puede calcular**.
