## Idea clave

Calcula el **subtotal con `reduce` y valor inicial `0`**; el IGV y el total salen de él. Son valores derivados de las props: se calculan en cada render, sin `useState`. El formato de dinero va en una función aparte (`soles`) para no repetirlo.

## Paso a paso

1. **Función de formato.** `soles(monto)` usa `toFixed(2)`, que convierte el número en texto con exactamente 2 decimales (y redondea).
2. **Subtotal.** `reduce` recorre los items sumando `precio * cantidad`. El segundo argumento, `0`, es el valor inicial de `suma`.
3. **IGV y total.** `igv = subtotal * 0.18` y `total = subtotal + igv`. La tasa va en una constante con nombre (`TASA_IGV`) para que no sea un "número mágico".
4. **Pinta con `<dl>`.** Una lista de definición es la etiqueta semántica para pares "concepto: valor".

```jsx
const TASA_IGV = 0.18;

export function soles(monto) {
  return `S/ ${monto.toFixed(2)}`;
}

export function ResumenPedido({ items }) {
  const subtotal = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  const igv = subtotal * TASA_IGV;
  const total = subtotal + igv;

  return (
    <dl>
      <dt>Subtotal</dt>
      <dd>{soles(subtotal)}</dd>
      <dt>IGV (18%)</dt>
      <dd>{soles(igv)}</dd>
      <dt>Total</dt>
      <dd>{soles(total)}</dd>
    </dl>
  );
}
```

## Por qué funciona

Con `items = [{ precio: 30, cantidad: 2 }, { precio: 40, cantidad: 1 }]`:

| Vuelta | `suma` antes | `precio * cantidad` | `suma` después |
|---|---|---|---|
| 1 | `0` | `60` | `60` |
| 2 | `60` | `40` | `100` |

Subtotal `100`, IGV `18`, total `118`. `soles(118)` da `"S/ 118.00"`.

Con céntimos: `9.9 * 3` da `29.700000000000003` por cómo la computadora guarda decimales (coma flotante). `toFixed(2)` lo deja en `"29.70"`. El IGV es `5.346...` y `toFixed(2)` redondea a `"5.35"`. Por eso solo redondeas **al mostrar**, nunca en medio de los cálculos.

Con `items = []`, `reduce` no da ninguna vuelta y devuelve el valor inicial `0`: los tres montos son `S/ 0.00`.

## Errores comunes

- **`reduce` sin valor inicial.** Con el carrito vacío lanza `TypeError: Reduce of empty array with no initial value`, y con items el primer acumulador sería un objeto, no un número (sale `"[object Object]40"`).
- **Redondear en cada paso.** Si haces `toFixed` al subtotal y luego calculas el IGV sobre ese texto, mezclas texto con números y los céntimos pueden no cuadrar.
- **Guardar subtotal, IGV y total en `useState`** y actualizarlos con `useEffect`. Son derivados: si cambian los items, se recalculan solos en el siguiente render.
- **Sumar `precio` sin multiplicar por `cantidad`.** El test del ejemplo da `S/ 70.00` de subtotal en lugar de `S/ 100.00`.
- **Escribir `0.18` en tres lugares.** Si mañana cambia la tasa, te olvidas de uno. Una constante con nombre lo evita.

## Otra forma de resolverlo

Con **`Intl.NumberFormat`**, que formatea dinero según el país:

```jsx
const formatoSoles = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

export function soles(monto) {
  return formatoSoles.format(monto); // "S/ 118.00"
}
```

**¿Cuándo conviene?** En una app real, siempre: agrega separadores de miles (`S/ 1,250.00`) y respeta las convenciones del país. Crea el formateador **una sola vez** fuera del componente porque construirlo es costoso. Ojo: según la versión de Node o del navegador, el espacio entre `S/` y el número puede ser un espacio especial (no separable), por eso los tests de este ejercicio usan `toFixed`.

Otra mejora real: trabajar en **céntimos enteros** (`3000` en vez de `30.00`) para evitar los problemas de coma flotante en sumas grandes.

## Cómo explicarlo en la entrevista

> "Calculo el subtotal con `reduce` y valor inicial 0, para que con el carrito vacío no falle. El IGV y el total los derivo del subtotal en el mismo render; no uso estado porque todo sale de las props. Solo redondeo al mostrar, con `toFixed(2)` dentro de una función `soles`, para no acumular errores de coma flotante. En producción usaría `Intl.NumberFormat` con `es-PE` y `PEN`, o manejaría los montos en céntimos."

## Conceptos

- **`reduce` con valor inicial**: acumula un resultado y funciona con arreglos vacíos.
- **`toFixed(2)`**: convierte un número a texto con 2 decimales, redondeando.
- **Coma flotante**: `0.1 + 0.2` no es exactamente `0.3`; redondea solo al mostrar.
- **Estado derivado**: lo que se calcula de las props no va en `useState`.
- **`<dl>`, `<dt>`, `<dd>`**: lista de definición para pares concepto y valor.
- **`Intl.NumberFormat`**: formato de números y monedas según el idioma y el país.
- **Constantes con nombre**: evitan "números mágicos" repetidos.
