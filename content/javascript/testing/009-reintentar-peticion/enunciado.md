## El problema

Las peticiones a un servidor a veces fallan por un instante: la red parpadea, el servidor está ocupado. Por eso muchas apps **reintentan** antes de mostrar un error. La función que lo hace ya está escrita y funciona. Te toca escribir **sus tests**, y esta vez la función es **asíncrona**: devuelve una promesa.

La app tiene **la función correcta y 6 versiones con un error escondido cada una**. Tus tests tienen que pasar con la correcta y **fallar** con cada versión con error.

## La función que vas a probar

`conReintentos(pedir, intentos)` recibe una función `pedir` (que devuelve una promesa, como `fetch`) y un número máximo de intentos. Es `async`:

- Llama a `pedir()`. Si la promesa **se resuelve**, devuelve ese valor y **no vuelve a llamar**.
- Si la promesa **se rechaza**, vuelve a intentar. En total llama a `pedir` **como máximo `intentos` veces**.
- Si todos los intentos fallan, **rechaza con el error del último intento**.

```js
// pedir falla 2 veces y a la tercera responde "datos"
await conReintentos(pedir, 3);  // "datos" (llamó a pedir 3 veces)

// pedir falla siempre
await conReintentos(pedir, 3);  // rechaza con el error del 3.er intento
```

## Tu tarea

En tu archivo, la función `misTests` recibe `test`, `expect` y la función a probar. Escribe ahí tus tests, igual que en Vitest:

```js
export function misTests({ test, expect }, conReintentos) {
  test("si funciona a la primera, devuelve los datos", async () => {
    const pedir = async () => "datos";
    expect(await conReintentos(pedir, 3)).toBe("datos");
  });
}
```

Para tus tests vas a fabricar tu propio `pedir` falso. Para saber **cuántas veces lo llamaron**, usa un contador:

```js
let llamadas = 0;
const pedir = async () => {
  llamadas++;
  throw new Error(`fallo ${llamadas}`);  // esta versión falla siempre
};
```

Para comprobar que una promesa se rechaza: `await expect(conReintentos(pedir, 3)).rejects.toThrow("fallo 3")`. El `await` delante es obligatorio, y el test debe ser `async`.

Escribe **al menos 3 tests**. No basta con revisar qué devuelve: también importa **cuántas veces** llamó a `pedir`.
