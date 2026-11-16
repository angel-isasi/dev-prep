## Idea clave

Una función que lee el reloj por dentro (`new Date()`) es **difícil de probar**: el resultado cambia cada segundo y un test que hoy pasa, mañana falla. La solución es de diseño: la función **recibe la hora actual como parámetro** (`ahora`). A eso se le llama **inyectar la dependencia**. En producción le pasas `new Date()`; en los tests, una fecha fija. Así cada test es **determinista**: da siempre el mismo resultado.

Con eso resuelto, el resto es lo de siempre: una prueba por fila de la tabla y los **valores límite** entre filas.

## Paso a paso

1. **Fija la hora.** `const AHORA = new Date("2026-03-10T12:00:00Z")`. La `Z` al final significa UTC: sin ella, la fecha se interpreta en la zona horaria de cada computadora.
2. **Crea un ayudante para restar tiempo.** `antes(5 * MINUTO)` es más fácil de leer que `new Date("2026-03-10T11:55:00Z")` y no te obliga a calcular horas a mano. Las constantes `SEGUNDO`, `MINUTO` y `HORA` hacen que cada test diga cuánto tiempo pasó.
3. **Una prueba por fila de la tabla**: un momento, minutos, horas, ayer y días.
4. **Prueba los bordes entre filas.** `59` segundos es "un momento" y `60` ya es "1 minuto": eso atrapa al `<=` donde iba `<`. `HORA` exacta prueba el singular.
5. **Prueba el redondeo con un valor intermedio.** `90` segundos son 1,5 minutos. Contando minutos completos da `1`; redondeando daría `2`.
6. **Prueba el error.** Una fecha un minuto después de `AHORA` debe lanzar. Recuerda la flecha: `expect(() => haceCuanto(...)).toThrow()`.

## Por qué funciona

| Mutante | Qué rompe | Test que lo atrapa |
|---|---|---|
| Ignora `ahora` y usa `new Date()` | fecha inyectada | `antes(5 * MINUTO)` da `"hace 5 minutos"` |
| Redondea los minutos | minutos completos | `90` segundos da `"hace 1 minuto"` |
| `<= 60` en vez de `< 60` | borde de un momento | `60` segundos da `"hace 1 minuto"` |
| Sin singular en horas | `"hace 1 hora"` | `HORA` da `"hace 1 hora"` |
| Nunca dice "ayer" | fila de 24 a 48 horas | `30 * HORA` da `"ayer"` |
| No rechaza el futuro | error con fecha futura | un minuto después lanza |

El primer mutante es el más interesante. Si escribieras tus tests con el reloj real, por ejemplo `haceCuanto(new Date(Date.now() - 5 * 60000), new Date())`, esa versión **pasaría**: ella también usa el reloj real. Solo una fecha fija la delata.

## Errores comunes

- **Usar `new Date()` en el test.** Además de dejar pasar al primer mutante, hace que el test dependa de la velocidad de la máquina: si entre crear la fecha y llamar a la función pasa un segundo, "hace un momento" se convierte en otra cosa.
- **Escribir fechas sin la `Z`.** `new Date("2026-03-10T12:00:00")` se lee en la hora local. Si todas las fechas del test son locales no pasa nada, pero mezclar locales y UTC da diferencias de 5 horas en Perú.
- **Probar solo valores redondos.** `5` minutos y `3` días no tocan los bordes. Los errores están en `60` segundos, en la hora justa y en el día justo.
- **Olvidar el plural y el singular.** "hace 1 horas" es un error que el usuario ve, y solo lo atrapa un test con exactamente una hora.

## Otra forma de resolverlo

Vitest trae **relojes falsos** para funciones que sí usan `new Date()` por dentro:

```js
import { vi } from "vitest";

vi.useFakeTimers();
vi.setSystemTime(new Date("2026-03-10T12:00:00Z"));
// ahora new Date() devuelve esa fecha
vi.useRealTimers();
```

Es útil cuando no puedes cambiar la función (código heredado o de una librería). Pero si puedes elegir, recibir `ahora` como parámetro es más simple: no hay que acordarse de restaurar el reloj y la función es más fácil de reusar. En este ejercicio no tienes `vi`, y no lo necesitas.

## Cómo explicarlo en la entrevista

> "La función recibe `ahora` como parámetro en vez de llamar a `new Date()` por dentro, así que en los tests uso una fecha fija y los resultados son siempre los mismos. Con eso probé una vez cada rango y sus bordes: 59 y 60 segundos, 90 segundos para el redondeo, una hora justa para el singular, ayer y una fecha futura que debe lanzar error. Si no pudiera cambiar la función, usaría los relojes falsos de Vitest."

## Conceptos

- **Test determinista**: da el mismo resultado cada vez que lo corres, sin depender del reloj, del azar ni de la red.
- **Inyección de dependencias**: pasar desde afuera lo que la función necesita (la hora, una función para pedir datos) en vez de que lo cree ella.
- **`getTime()`**: los milisegundos desde 1970; restar y sumar con números es la forma más segura de mover fechas.
- **UTC y la `Z`**: una fecha con `Z` es igual en todas las computadoras; sin ella, depende de la zona horaria.
- **Relojes falsos (`vi.useFakeTimers`)**: la alternativa cuando la función lee el reloj por dentro.
