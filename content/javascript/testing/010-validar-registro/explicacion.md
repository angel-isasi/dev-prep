## Idea clave

Con cinco campos y varias reglas, las combinaciones posibles son cientos. No hace falta probarlas todas: la técnica es partir de una **base válida** y **cambiar una sola cosa por test**. Así cada test aísla una regla, y si falla sabes cuál. A eso le sumas **un caso con todo válido** y **un caso con varios errores juntos**, que revisa algo que ningún caso aislado puede ver: que la función no se detenga en el primer error.

El segundo aprendizaje es sobre **cómo comparar objetos**: `toEqual` ignora las propiedades que valen `undefined`, y `toStrictEqual` no. Esa diferencia, que parece un detalle, es la que separa un formulario que se envía de uno que nunca lo hace.

## Paso a paso

1. **Arma la base válida.** `const validos = { nombre: "Ana Pérez", correo: "ana@correo.pe", ... }`. Primero comprueba que con ella no hay errores.
2. **Un campo inválido por test, con spread.** `{ ...validos, correo: "ana@correo" }` copia la base y reemplaza solo el correo. El esperado tiene una sola clave: `{ correo: "El correo no es válido" }`. Si aparece otra, también falla.
3. **Busca el caso engañoso de cada regla.** No basta con un nombre vacío `""`: el engañoso es `"   "`. No basta con `"ana"` sin arroba: el engañoso es `"ana@correo"`, que tiene arroba pero no punto. Para la edad, el borde: `18` pasa y `17` no.
4. **Un caso con todos los errores.** Datos con los cinco campos mal: el esperado tiene las cinco claves. La versión que se detiene en el primer error devuelve solo `{ nombre: ... }`.
5. **El caso válido con `toStrictEqual({})`.** La versión que arma `{ nombre: undefined, correo: undefined, ... }` pasa con `toEqual({})`, pero `Object.keys` de ese objeto tiene 5 elementos, así que el formulario nunca se envía. `toStrictEqual` sí revisa las propiedades con `undefined` y la atrapa.

## Por qué funciona

| Mutante | Qué rompe | Test que lo atrapa |
|---|---|---|
| Se detiene en el primer error | todos los errores a la vez | los cinco campos mal dan cinco claves |
| Acepta nombre de solo espacios | los espacios no cuentan | `"   "` da error de nombre |
| Acepta correo sin punto | forma `algo@algo.algo` | `"ana@correo"` da error de correo |
| Rechaza 18 justos | `18` o más | `edad: 18` da `{}` |
| No compara las contraseñas | `confirmar` igual a `clave` | `"secreta124"` da error de confirmación |
| Deja campos con `undefined` | objeto vacío si todo está bien | `toStrictEqual({})` con todo válido |

Fíjate en el último: **todos** los tests con `toEqual` pasan con esa versión, incluido el de cinco errores. Solo un `toStrictEqual` o un `Object.keys(...)` la delatan. Es un error real: pasa cuando alguien escribe `return { nombre: validarNombre(n), correo: validarCorreo(c), ... }` y cada función devuelve `undefined` si el campo está bien.

## Errores comunes

- **Partir de datos vacíos en vez de válidos.** Si cada test arma un objeto desde cero, es fácil que otro campo quede mal sin querer y el esperado ya no sea una sola clave.
- **Probar solo campos inválidos aislados.** Cada test aislado pasa con la versión que se detiene en el primer error, porque solo hay un error que encontrar.
- **Usar `toEqual({})` para "no hay errores".** Acepta objetos con propiedades `undefined`. Usa `toStrictEqual({})` o `expect(Object.keys(errores)).toEqual([])`, que es justo lo que revisa el formulario.
- **Revisar solo si hay error, no cuál.** `expect(errores.correo).toBeDefined()` no ve que además apareció un error de nombre que no debía estar. Comparar el objeto completo revisa las dos cosas.
- **Copiar mal los mensajes.** Un mensaje sin tilde (`"El correo no es valido"`) hace fallar el test con la función correcta. Copia los mensajes de la tabla del enunciado.

## Otra forma de resolverlo

Una tabla de "un campo inválido a la vez" deja todos los casos aislados en pocas líneas:

```js
const casos = [
  ["nombre", { nombre: "   " }],
  ["correo", { correo: "ana@correo" }],
  ["edad", { edad: 17 }],
  ["clave", { clave: "corta", confirmar: "corta" }],
  ["confirmar", { confirmar: "secreta124" }],
];
for (const [campo, cambio] of casos) {
  test(`detecta el error de ${campo}`, () => {
    expect(Object.keys(validarRegistro({ ...validos, ...cambio }))).toEqual([campo]);
  });
}
```

Fíjate en el caso de la clave: si cambias solo `clave`, ya no coincide con `confirmar` y aparecen dos errores. Por eso el cambio incluye los dos campos. Comparar `Object.keys` contra `[campo]` revisa que aparezca **solo** el error esperado.

## Cómo explicarlo en la entrevista

> "Partí de un objeto con todo válido y en cada test cambié un solo campo con spread, para aislar cada regla. En cada regla busqué el caso engañoso: un nombre de puros espacios, un correo con arroba pero sin punto, la edad justo en 18. Agregué un caso con todos los campos mal para confirmar que devuelve todos los errores. Y para el caso válido usé `toStrictEqual({})`, porque `toEqual` ignora propiedades `undefined` y el formulario revisa `Object.keys`."

## Conceptos

- **Base válida más un cambio**: técnica para aislar reglas en funciones con muchos campos.
- **Spread (`{ ...obj, campo: valor }`)**: copia un objeto y reemplaza algunas propiedades, sin modificar el original.
- **`toEqual`**: compara contenido, pero trata las propiedades `undefined` como si no existieran.
- **`toStrictEqual`**: como `toEqual`, pero también revisa propiedades `undefined` y el tipo de los objetos.
- **Casos combinados**: probar varias reglas rotas a la vez para ver que la función las reporta todas.
