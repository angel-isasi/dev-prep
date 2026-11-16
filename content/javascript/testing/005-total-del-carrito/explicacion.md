## Idea clave

En una función con **varias reglas que se combinan** (cantidad, cupón, envío), los errores más caros están donde **una regla afecta a otra**: ¿el envío gratis se decide antes o después del descuento? Un test por regla aislada no basta; también necesitas un caso donde **el orden de las reglas cambie el resultado**. Y como siempre, el límite (`100` justos) se prueba exactamente en el borde.

## Paso a paso

1. **Escribe las reglas como una receta con orden**: subtotal, luego descuento, luego envío según lo que quedó. Ese orden ya te sugiere un test.
2. **Prueba la cantidad con un número mayor que 1.** Con `cantidad: 1`, `precio * cantidad` y `precio` dan lo mismo. Con `{ precio: 20, cantidad: 3 }` el subtotal es `60`, y la versión que ignora la cantidad devuelve `35`.
3. **Prueba el límite del envío con `100` justos.** `{ precio: 50, cantidad: 2 }` debe dar `100` sin envío. La versión con `>` cobra `115`.
4. **Busca un caso donde el orden importe.** Hace falta un subtotal que esté **por encima de `100` antes del cupón y por debajo después**. `105` con `DESC10` queda en `94.5`, así que se cobra envío: `109.5`. La versión que decide el envío con el subtotal (`105`) lo da gratis y devuelve `94.5`.
5. **Prueba el cupón por los dos lados.** Que acepte `"desc10"` en minúsculas y que **no** acepte un cupón inventado. El primero atrapa la comparación exacta; el segundo, la versión que descuenta con cualquier texto.
6. **No olvides el carrito vacío.** Sin items no hay nada que enviar: `0`, no `15`.

## Por qué funciona

| Mutante | Qué rompe | Test que lo atrapa |
|---|---|---|
| Ignora la cantidad | subtotal | `20 x 3` da `75` |
| Usa `>` en vez de `>=` | límite del envío | `50 x 2` da `100` |
| Envío antes del cupón | orden de las reglas | `105` con `DESC10` da `109.5` |
| Cupón solo en mayúsculas | cupón sin importar mayúsculas | `"desc10"` da `60` |
| Descuenta con cualquier cupón | solo `DESC10` | `"GRATIS"` da `65` |
| Cobra envío al carrito vacío | carrito vacío | `[]` da `0` |

El test del ejemplo (`30 + 20 = 50`, más envío) no atrapa a **ninguno** de los seis: usa cantidad 1, está lejos del límite y no usa cupón. Es un buen recordatorio de que "funciona con el caso normal" dice muy poco.

## Errores comunes

- **Elegir datos que esconden el error.** Para probar el orden cupón y envío, un subtotal de `200` con cupón queda en `180`: gratis en las dos versiones. El dato tiene que **cruzar el límite** al aplicar el descuento.
- **Calcular el esperado corriendo la función.** Si ves que devuelve `94.5` y lo copias al test, confirmaste el error. Haz la cuenta en papel: `105 - 10.5 = 94.5`, menor que `100`, más `15` = `109.5`.
- **Comparar decimales sin redondeo.** En JavaScript, `0.1 + 0.2` da `0.30000000000000004`, y con precios como `19.90` pasa lo mismo. La función redondea a 2 decimales, por eso `toBe(109.5)` funciona. Si una función no redondea, usa `toBeCloseTo(109.5)`.
- **Probar solo el cupón válido.** Que el cupón correcto funcione no dice nada de qué pasa con uno falso. Prueba también lo que **no** debe tener efecto.

## Otra forma de resolverlo

Puedes escribir el esperado como la cuenta misma, para que el test documente de dónde sale el número:

```js
test("decide el envío con el monto después del descuento", () => {
  const conDescuento = 105 - 105 * 0.1; // 94.5, menor que 100
  const envio = 15;
  expect(totalCarrito([{ precio: 105, cantidad: 1 }], "DESC10")).toBeCloseTo(conDescuento + envio);
});
```

`toBeCloseTo` compara con tolerancia (por defecto, 2 decimales), útil cuando el esperado también sale de una cuenta con decimales.

## Cómo explicarlo en la entrevista

> "Probé cada regla por separado, cada una con datos que hicieran visible el error, por ejemplo cantidad 3 en vez de 1. El límite del envío lo probé con 100 justos. Y como hay reglas que se combinan, busqué un caso donde el orden cambia el resultado: un carrito de 105 que con el cupón baja a 94.5 y por eso paga envío. Los esperados los calculé a mano desde las reglas."

## Conceptos

- **Reglas de negocio**: las condiciones que define el negocio (descuentos, envíos, límites); son lo primero que hay que cubrir con tests.
- **Interacción entre reglas**: cuando el resultado de una regla es la entrada de otra; el orden se prueba con un caso que cruce el límite.
- **Valor límite**: `100` justos, donde `>` y `>=` dan resultados distintos.
- **`toBeCloseTo`**: compara números con decimales con cierta tolerancia, en vez de exactitud.
