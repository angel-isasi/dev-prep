## El problema

El formulario de registro muestra un mensaje rojo debajo de cada campo con problemas, y solo deja enviar si no hay ninguno. Todo eso lo decide una función que ya está escrita y funciona. Te toca escribir **sus tests**. Con cinco campos y varias reglas, el reto es **organizar los casos** sin escribir cincuenta tests.

La app tiene **la función correcta y 6 versiones con un error escondido cada una**. Tus tests tienen que pasar con la correcta y **fallar** con cada versión con error.

## La función que vas a probar

`validarRegistro(datos)` recibe `{ nombre, correo, edad, clave, confirmar }` y devuelve un **objeto de errores**: una clave por cada campo inválido, con su mensaje. Si todo está bien, devuelve un **objeto vacío `{}`**, sin ninguna clave. El formulario se envía solo si `Object.keys(errores).length === 0`.

| Campo | Regla | Mensaje si falla |
|---|---|---|
| `nombre` | no está vacío (los espacios no cuentan) | `"El nombre es obligatorio"` |
| `correo` | tiene la forma `algo@algo.algo` | `"El correo no es válido"` |
| `edad` | es `18` o más | `"Debes tener al menos 18 años"` |
| `clave` | tiene al menos 8 caracteres | `"La contraseña debe tener al menos 8 caracteres"` |
| `confirmar` | es igual a `clave` | `"Las contraseñas no coinciden"` |

Revisa **todos** los campos y devuelve **todos** los errores a la vez, no solo el primero.

```js
validarRegistro({ nombre: "Ana", correo: "ana@correo.pe", edad: 25, clave: "secreta123", confirmar: "secreta123" });
// {}

validarRegistro({ nombre: "Ana", correo: "ana", edad: 16, clave: "secreta123", confirmar: "secreta123" });
// { correo: "El correo no es válido", edad: "Debes tener al menos 18 años" }
```

## Tu tarea

En tu archivo, la función `misTests` recibe `test`, `expect` y la función a probar. Escribe ahí tus tests, igual que en Vitest. Un truco para no repetir datos: arma un objeto **con todo válido** y en cada test cambia solo un campo con `...`:

```js
const validos = { nombre: "Ana Pérez", correo: "ana@correo.pe", edad: 25, clave: "secreta123", confirmar: "secreta123" };

export function misTests({ test, expect }, validarRegistro) {
  test("detecta un correo sin arroba", () => {
    expect(validarRegistro({ ...validos, correo: "ana" })).toEqual({ correo: "El correo no es válido" });
  });
}
```

Un dato importante: `toEqual` **ignora las propiedades que valen `undefined`**, así que para él `{ nombre: undefined }` y `{}` son iguales. Si necesitas que el objeto esté realmente vacío, usa **`toStrictEqual({})`**.

Escribe **al menos 3 tests**. Prueba cada campo inválido por separado, el caso con todo válido y un caso con varios errores juntos.
