## Idea clave

La técnica de este ejercicio se llama **análisis de valores límite**. Cuando una regla dice "entre 8 y 20", los errores casi siempre están en los bordes: alguien escribe `<=` donde iba `<`, o `>=` donde iba `>`. Por eso no basta con probar una contraseña de 12 caracteres: hay que probar **justo el borde que entra y justo el que ya no entra**, en los dos extremos. Eso da cuatro tests para una sola regla: `7`, `8`, `20` y `21`.

## Paso a paso

1. **Separa las reglas.** Son tres: largo, número y mayúscula. Cada una necesita sus propios tests.
2. **Para el largo, marca los cuatro valores límite.** El mínimo (`8`) y uno menos (`7`); el máximo (`20`) y uno más (`21`). Cada uno atrapa un error distinto:
   - `8` debe aceptarse: atrapa a quien escribió `length <= 8`.
   - `7` debe rechazarse: atrapa a quien puso el mínimo en 7.
   - `20` debe aceptarse: atrapa a quien escribió `length >= 20`.
   - `21` debe rechazarse: atrapa a quien olvidó el máximo.
3. **Haz que cada test rompa una sola regla.** El texto de 7 caracteres (`"Abcdef1"`) sí tiene número y mayúscula: si falla, solo puede ser por el largo. Si usaras `"abc"`, que rompe las tres reglas, no sabrías cuál revisó la función.
4. **Arma textos largos con `repeat`.** `"A1" + "x".repeat(18)` tiene exactamente 20 caracteres y ya cumple número y mayúscula. Contar 20 letras a mano es la forma más fácil de equivocarse en el propio test.
5. **Prueba las otras dos reglas con largo válido.** `"Abcdefgh"` (8 caracteres, sin número) y `"abcdefg1"` (8 caracteres, sin mayúscula).

## Por qué funciona

| Mutante | Qué rompe | Test que lo atrapa |
|---|---|---|
| Rechaza 8 justos (`<= 8`) | mínimo incluido | `"Abcdefg1"` da `true` |
| Acepta 7 | mínimo | `"Abcdef1"` da `false` |
| Rechaza 20 justos (`>= 20`) | máximo incluido | 20 caracteres dan `true` |
| No tiene máximo | máximo | 21 caracteres dan `false` |
| No exige número | número | `"Abcdefgh"` da `false` |
| No exige mayúscula | mayúscula | `"abcdefg1"` da `false` |

Fíjate en que ningún test con 12 caracteres atrapa a los cuatro primeros mutantes: todos aceptan 12. Los valores de en medio solo confirman lo que ya sabías; los bordes son los que encuentran errores.

## Errores comunes

- **Probar solo valores lejanos al borde.** `"abc"` (3) y `"A1" + "x".repeat(40)` (42) se rechazan en todas las versiones, incluidas las que tienen el límite mal. No atrapan nada.
- **Romper varias reglas en un mismo test.** `"abc"` es corta, sin número y sin mayúscula. La versión que no exige número igual la rechaza por corta, así que sobrevive.
- **Contar mal el largo en el test.** Si crees que `"Abcdefghijklmnopqr12"` tiene 21 y en realidad tiene 20, tu test falla con la función correcta. Usa `repeat` o revisa con `.length` en la consola.
- **Olvidar el lado que se acepta.** Muchos prueban solo lo que debe fallar (`7` y `21`) y nunca que `8` y `20` pasen. Así sobreviven los mutantes que son demasiado estrictos.

## Otra forma de resolverlo

Una tabla de casos deja ver los cuatro bordes de un vistazo:

```js
const casos = [
  ["Abcdef1", false],             // 7
  ["Abcdefg1", true],             // 8
  ["A1" + "x".repeat(18), true],  // 20
  ["A1" + "x".repeat(19), false], // 21
];
for (const [clave, esperado] of casos) {
  test(`largo ${clave.length} da ${esperado}`, () => {
    expect(esClaveSegura(clave)).toBe(esperado);
  });
}
```

El nombre del test usa `clave.length`, así que si te equivocaste contando, el propio nombre te lo dice.

## Cómo explicarlo en la entrevista

> "Usé valores límite: para el rango de 8 a 20 probé 7, 8, 20 y 21, porque los errores de `<` contra `<=` solo se ven ahí. Además, cada test rompe una sola regla y cumple las demás, para que si falla sepa exactamente por qué. Los textos largos los armé con `repeat` para no equivocarme contando."

## Conceptos

- **Valor límite**: el valor justo en el borde de una regla y su vecino inmediato de afuera.
- **Partición de equivalencia**: agrupar entradas que la función trata igual (todas las contraseñas de 9 a 19 caracteres) y probar solo una de cada grupo.
- **Aislar la regla**: en cada test, romper solo una condición para saber cuál falló.
- **`toBe(true)` y `toBe(false)`**: comparan el booleano exacto; un `undefined` no pasa como `false`.
