## Idea clave

Una `interface` describe la **forma** de un objeto: qué propiedades tiene y de qué tipo. Defines `Producto` e `ItemCarrito` una vez, y desde ahí TypeScript revisa cada objeto que crees, te autocompleta las propiedades y te avisa si falta una o si sobra. La lógica del total es un `reduce` de `precio * cantidad`.

## Paso a paso

1. **Modela los datos antes que la lógica.** Un producto tiene `id`, `nombre` y `precio`. Un ítem del carrito es "este producto, tantas veces".

   ```ts
   export interface Producto {
     id: number;
     nombre: string;
     precio: number;
   }

   export interface ItemCarrito {
     producto: Producto;
     cantidad: number;
   }
   ```

2. **Anida en vez de copiar.** `ItemCarrito` tiene `producto: Producto`, no `id`, `nombre` y `precio` sueltos. Si mañana `Producto` gana una propiedad `imagen`, el carrito la tiene automáticamente.
3. **El total con `reduce`.** Empiezas en `0` y por cada ítem sumas `item.producto.precio * item.cantidad`. Dentro del callback, `item` ya es un `ItemCarrito`: no necesitas anotarlo, TypeScript lo deduce de `items: ItemCarrito[]`.
4. **Redondea al final.** Sumar decimales en JavaScript da resultados como `0.30000000000000004`.

```ts
export function totalCarrito(items: ItemCarrito[]): number {
  const total = items.reduce((suma, item) => suma + item.producto.precio * item.cantidad, 0);
  return Math.round(total * 100) / 100;
}
```

## Por qué funciona

Recorrido con 2 audífonos (59.9) y 1 mouse (35):

| Paso | `suma` antes | Ítem | `precio * cantidad` | `suma` después |
|---|---|---|---|---|
| 1 | `0` | Audífonos x2 | `119.8` | `119.8` |
| 2 | `119.8` | Mouse x1 | `35` | `154.8` |

Redondeo: `Math.round(15480) / 100 = 154.8`.

Del lado de los tipos, cuando escribes `const sinCantidad: ItemCarrito = { producto: mouse }`, TypeScript compara el objeto con la interface y responde: `La propiedad "cantidad" falta en el tipo "{ producto: Producto; }", pero es obligatoria en el tipo "ItemCarrito"`. Y con `{ ..., stock: 5 }` responde: "El literal de objeto solo puede especificar propiedades conocidas y 'stock' no existe en el tipo 'Producto'": en un **objeto literal**, las propiedades de más también son error (te protege de errores de tipeo como `prcio`).

## Errores comunes

- **Dejar la interface vacía.** `interface Producto {}` acepta casi cualquier cosa y los `@ts-expect-error` de los tests quedan sin usar.
- **Separar con comas o sin punto y coma.** En una interface se separa con `;` (o salto de línea). Escribir `id: number,` funciona, pero lo usual es `;`.
- **Confundir la interface con un objeto.** `interface Producto { precio: 0 }` no le da "valor 0" a precio: le da el **tipo literal** 0 (solo acepta el número 0). En una interface solo van tipos.
- **Escribir `item.precio`.** El precio está dentro del producto: `item.producto.precio`. TypeScript te avisa: "La propiedad 'precio' no existe en el tipo 'ItemCarrito'".
- **No redondear.** El test de los cables (3 x 0.1) recibe `0.30000000000000004`.

## Otra forma de resolverlo

**Con `type` en vez de `interface`**:

```ts
export type Producto = {
  id: number;
  nombre: string;
  precio: number;
};
```

Para describir objetos, `type` e `interface` son casi intercambiables. Diferencias prácticas: `interface` se puede **extender** con `extends` y se puede ampliar declarándola dos veces; `type` además sirve para uniones (`"a" | "b"`), tuplas y otros tipos que no son objetos. Muchos equipos usan `interface` para objetos y `type` para lo demás.

**Con bucle `for...of`** en vez de `reduce`: `let total = 0; for (const item of items) total += item.producto.precio * item.cantidad;`. Mismo resultado y más fácil de depurar con `console.log`.

## Cómo explicarlo en la entrevista

> "Primero modelo los datos: una interface Producto con id, nombre y precio, y un ItemCarrito que contiene un Producto y una cantidad, así no duplico campos. Con eso, el total es un reduce que empieza en cero y suma precio por cantidad; TypeScript infiere el tipo de cada ítem desde el array. Redondeo a dos decimales al final por los errores de los decimales en JavaScript. La ventaja de las interfaces es que el editor autocompleta y cualquier objeto mal formado falla al compilar."

## Conceptos

- **`interface`**: describe la forma de un objeto.
- **Interfaces anidadas**: una propiedad cuyo tipo es otra interface.
- **Revisión de propiedades de más**: en objetos literales, una propiedad que no existe en el tipo es error.
- **Inferencia en callbacks**: el tipo de `item` sale de `items: ItemCarrito[]`.
- **Tipo de una propiedad**: `ItemCarrito["cantidad"]` es `number` (indexed access type).
- **`interface` vs `type`**: casi iguales para objetos; `type` también sirve para uniones y tuplas.
- Tema de Aprender: objetos e interfaces en TypeScript.
