## Idea clave

Los números de JavaScript son de **punto flotante**: se guardan en binario, y muchos decimales (0.1, 0.2, 1.1) no se pueden representar exactos. Al sumarlos queda un error diminuto: `1.1 + 2.2` da `3.3000000000000003`. Comparar ese total con `3.3` usando `>=` da `false`. Con dinero, la solución es trabajar en **céntimos enteros**, donde no hay decimales que pierdan precisión.

## Paso a paso

1. **Lee el síntoma.** Solo falla con **ciertos** pagos exactos. Si fuera un error de lógica, fallaría siempre o con un patrón claro.
2. **Reprodúcelo con el ejemplo del reporte.** `pagoCompleto([1.1, 2.2], 3.3)` da `false`.
3. **Mira los valores intermedios.** `console.log(total)` muestra `3.3000000000000003`. El problema no es la comparación, es que el total no es exactamente 3.3.
4. **Compara en céntimos.**

```js
return Math.round(pagado * 100) >= Math.round(total * 100);
```

## Por qué funciona

Con la compra de `[0.1, 0.2]` pagada con `0.3`:

| Valor | En soles | `* 100` | `Math.round` |
|---|---|---|---|
| `total` | `0.30000000000000004` | `30.000000000000004` | `30` |
| `pagado` | `0.3` | `30` | `30` |

`30 >= 30` es `true`. `Math.round` elimina el error, que siempre es muchísimo menor que medio céntimo. Y como los céntimos son enteros, la comparación es exacta.

El caso "falta un céntimo" sigue funcionando: `1049 >= 1050` es `false`.

## Errores comunes

- **Usar `toFixed(2)` y comparar.** `toFixed` devuelve un **texto**: `"9.50" >= "10.00"` compara letra por letra y da `true`, porque `"9"` es mayor que `"1"`. Si lo usas, convierte con `Number(...)` antes.
- **Cambiar `>=` por `>` o por `===`.** El problema no es el operador: `3.3 === 3.3000000000000003` también es `false`.
- **Redondear solo el total.** Sirve en este caso, pero si `pagado` viene de otra cuenta (por ejemplo, la suma de dos billeteras), también puede traer error.

## Otra forma de resolverlo

Aceptar una tolerancia de medio céntimo:

```js
return pagado - total > -0.005;
```

En sistemas reales, lo más seguro es **guardar los precios en céntimos desde el inicio** (`110` en vez de `1.1`) y convertir a soles solo al mostrarlos. Así nunca se suman decimales.

## Cómo explicarlo en la entrevista

> "Fallaba con algunos pagos exactos. Imprimí el total y era `3.3000000000000003`: los números en JavaScript son de punto flotante y decimales como 1.1 no son exactos en binario. Lo arreglé comparando en céntimos, multiplicando por 100 y redondeando. En un sistema real guardaría los montos en céntimos enteros desde el principio. Es el mismo motivo por el que `0.1 + 0.2 === 0.3` da `false`."

## Conceptos

- **Punto flotante**: forma de guardar números con decimales en binario; algunos decimales quedan aproximados.
- **`0.1 + 0.2`**: da `0.30000000000000004`, el ejemplo clásico de entrevista.
- **`Math.round`**: redondea al entero más cercano.
- **Céntimos enteros**: guardar dinero como enteros evita errores de redondeo.
- **`toFixed`**: formatea un número con N decimales, pero devuelve un texto.
