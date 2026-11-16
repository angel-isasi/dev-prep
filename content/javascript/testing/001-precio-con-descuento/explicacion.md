## Idea clave

Un buen test no prueba que la función "funciona": prueba **cada regla** y, sobre todo, **los límites** de cada regla. Los errores casi nunca están en el caso normal (`100` con `20 %`); están en el `100 %` justo, en el negativo que nadie revisó o en el decimal que no se redondeó. Si tus tests no tocan esos bordes, una versión rota pasa igual.

## Paso a paso

1. **Convierte cada regla del enunciado en una lista de casos.** "Va de 0 a 100" da cuatro casos: `0`, `100`, uno mayor que `100` y uno negativo. "Redondea a 2 decimales" da un caso con decimales largos.
2. **Empieza por el caso normal**, que ya venía de ejemplo: `precioConDescuento(100, 20)` da `80`.
3. **Agrega los límites incluidos**: `0 %` devuelve el mismo precio y `100 %` devuelve `0`. Esto atrapa la versión que usa `>=` en vez de `>`.
4. **Agrega los límites excluidos**: `120` y `-10` deben lanzar error. Cada uno atrapa una versión distinta, por eso hacen falta los dos.
5. **Prueba el redondeo con un número que de verdad deje decimales.** `100 * 0.8` es exacto, así que no sirve. `19.99 * 0.85` da `16.9915` sin redondear.

## Por qué funciona

Cada mutante rompe una sola regla, y cada test de la suite revisa una regla:

| Mutante | Qué rompe | Test que lo atrapa |
|---|---|---|
| No redondea | 2 decimales | `19.99` con `15` % da `16.99` |
| Acepta más de 100 % | rango superior | `120` lanza error |
| Rechaza el 100 % | límite incluido | `100` % da `0` |
| Acepta negativos | rango inferior | `-10` lanza error |

Esta técnica se llama **pruebas de mutación**: se cambia el código a propósito para ver si los tests se dan cuenta. Si un mutante sobrevive (todos los tests pasan), a tu suite le falta un caso.

## Errores comunes

- **Probar solo el caso feliz.** Diez tests con descuentos normales atrapan cero mutantes: todos revisan lo mismo.
- **Usar números que no muestran el error.** `100` con `20` % da `80` exacto con o sin redondeo. Elige datos que hagan visible el problema.
- **Copiar lo que devuelve la función como "esperado".** Si corres la función, ves `16.9915` y lo pones en el test, el test confirma el error en vez de atraparlo. El valor esperado sale de las reglas, no de la función.
- **Olvidar la flecha en `toThrow`.** `expect(precioConDescuento(50, 120)).toThrow()` lanza el error antes de que `expect` pueda atraparlo. Debe ser `expect(() => precioConDescuento(50, 120)).toThrow()`.

## Otra forma de resolverlo

Con muchos casos parecidos, una tabla evita repetir código:

```js
const casos = [
  [100, 20, 80],
  [19.99, 15, 16.99],
  [50, 0, 50],
  [50, 100, 0],
];
for (const [precio, porcentaje, esperado] of casos) {
  test(`${precio} con ${porcentaje} % da ${esperado}`, () => {
    expect(precioConDescuento(precio, porcentaje)).toBe(esperado);
  });
}
```

En Vitest real existe `test.each` para lo mismo.

## Cómo explicarlo en la entrevista

> "Saqué los casos de las reglas: para el rango de 0 a 100 probé los dos límites que se aceptan y los dos que no, porque es donde suelen estar los errores de `<` contra `<=`. Para el redondeo elegí un número que de verdad deja decimales largos. El valor esperado lo calculé de la regla, no copiando lo que devolvía la función."

## Conceptos

- **Caso borde**: un valor en el límite de una regla (`0`, `100`, vacío, negativo).
- **Prueba de mutación**: cambiar el código a propósito para comprobar que los tests lo detectan.
- **`toThrow`**: comprueba que una función lanza un error; se le pasa una función, no su resultado.
