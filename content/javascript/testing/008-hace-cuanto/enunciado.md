## El problema

Las redes sociales no muestran "10/03/2026 11:55", muestran **"hace 5 minutos"**. La función que arma ese texto ya está escrita y funciona. Te toca escribir **sus tests**. El reto: el resultado depende de **la hora actual**, que cambia cada segundo. ¿Cómo se prueba algo así?

La respuesta está en la firma de la función: no lee el reloj por su cuenta, **recibe `ahora` como parámetro**. Así, en el test tú decides qué hora es.

La app tiene **la función correcta y 6 versiones con un error escondido cada una**. Tus tests tienen que pasar con la correcta y **fallar** con cada versión con error.

## La función que vas a probar

`haceCuanto(fecha, ahora)` recibe dos `Date` y devuelve un texto según cuánto tiempo pasó **desde `fecha` hasta `ahora`**:

| Tiempo pasado | Resultado |
|---|---|
| menos de 60 segundos | `"hace un momento"` |
| menos de 60 minutos | `"hace 1 minuto"`, `"hace 5 minutos"` |
| menos de 24 horas | `"hace 1 hora"`, `"hace 5 horas"` |
| de 24 a menos de 48 horas | `"ayer"` |
| 48 horas o más | `"hace 3 días"` |

- Los minutos, horas y días se cuentan **completos** (se redondea hacia abajo): 90 segundos es `"hace 1 minuto"`.
- Si `fecha` es **posterior** a `ahora`, lanza un `Error`.

```js
const ahora = new Date("2026-03-10T12:00:00Z");

haceCuanto(new Date("2026-03-10T11:55:00Z"), ahora);  // "hace 5 minutos"
haceCuanto(new Date("2026-03-10T11:00:00Z"), ahora);  // "hace 1 hora"
haceCuanto(new Date("2026-03-09T06:00:00Z"), ahora);  // "ayer"
haceCuanto(new Date("2026-03-10T12:01:00Z"), ahora);  // lanza Error
```

## Tu tarea

En tu archivo, la función `misTests` recibe `test`, `expect` y la función a probar. Escribe ahí tus tests, igual que en Vitest:

```js
const AHORA = new Date("2026-03-10T12:00:00Z");
const MINUTO = 60 * 1000;
const antes = (ms) => new Date(AHORA.getTime() - ms);

export function misTests({ test, expect }, haceCuanto) {
  test("muestra los minutos", () => {
    expect(haceCuanto(antes(5 * MINUTO), AHORA)).toBe("hace 5 minutos");
  });
}
```

`antes(ms)` te da la fecha que está `ms` milisegundos antes de `AHORA`. Para el error: `expect(() => haceCuanto(fechaFutura, AHORA)).toThrow()`.

Escribe **al menos 3 tests**. Usa siempre una fecha fija como `AHORA`, nunca `new Date()` sin argumentos: un test que depende del reloj da un resultado distinto cada día.
