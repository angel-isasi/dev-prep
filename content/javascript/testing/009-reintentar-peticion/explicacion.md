## Idea clave

Para probar una función que **depende de otra** (aquí, `pedir`, que en la vida real sería un `fetch`), no llamas al servidor de verdad: le pasas una **función falsa que tú controlas**. A eso se le llama **doble de prueba**. Tu `pedir` falso decide cuándo fallar y cuándo responder, y además **lleva la cuenta** de cuántas veces lo llamaron. Así puedes revisar no solo **qué** devolvió la función, sino **cómo** se comportó.

Y como la función es asíncrona, cada test es `async`, usa `await`, y para los rechazos se usa `await expect(promesa).rejects`.

## Paso a paso

1. **Fabrica un `pedir` falso con contador.**

   ```js
   let llamadas = 0;
   const pedir = async () => {
     llamadas++;
     if (llamadas < 3) throw new Error(`fallo ${llamadas}`);
     return "datos";
   };
   ```

   Como es `async`, el `throw` se convierte en una **promesa rechazada**, igual que un `fetch` que falla.
2. **Caso "funciona a la primera"**: revisa el valor **y** que `llamadas` sea `1`. Sin lo segundo, la versión que sigue llamando después del éxito pasa, porque igual devuelve `"datos"`.
3. **Caso "falla y luego funciona"**: falla 2 veces y responde a la tercera. Debe devolver `"datos"`. Este caso atrapa a la versión que intenta una vez de menos y a la que olvidó el `await`.
4. **Caso "falla siempre"**: comprueba tres cosas. Que la promesa **se rechace** (`rejects.toThrow()`), que haya llamado **exactamente 3 veces** y que el error sea **el último** (`"fallo 3"`). Numerar los errores es lo que permite distinguir el primero del último.
5. **Cuando solo te importa el contador** de una promesa que rechaza, atrapa el rechazo para que no rompa el test: `await conReintentos(pedir, 3).catch(() => {})`.

## Por qué funciona

| Mutante | Qué rompe | Test que lo atrapa |
|---|---|---|
| Intenta una vez de más | máximo `intentos` | falla siempre: `llamadas` es `3` (y el error es `"fallo 3"`, no `"fallo 4"`) |
| Intenta una vez de menos | máximo `intentos` | falla 2 veces y a la tercera funciona |
| Sigue llamando tras el éxito | no vuelve a llamar | funciona a la primera: `llamadas` es `1` |
| Rechaza con el primer error | error del último intento | `rejects.toThrow("fallo 3")` |
| Olvida el `await` | reintentar | falla 2 veces y a la tercera funciona |
| Se resuelve con `undefined` | rechazar si todo falla | `rejects.toThrow()` |

El mutante del `await` merece atención porque es un error real y frecuente. Dentro de un `try`, `return pedir()` devuelve la promesa **sin esperarla**. Cuando esa promesa se rechaza, el `try` ya terminó y el `catch` nunca se entera: la función rechaza al primer fallo, sin reintentar. Con `return await pedir()`, el rechazo ocurre **dentro** del `try` y el `catch` lo atrapa.

## Errores comunes

- **Olvidar el `await` antes de `expect(...).rejects`.** Sin él, el test termina antes de que la promesa se resuelva y la comprobación queda flotando. En Vitest real es un aviso; aquí puede dar un resultado engañoso.
- **Revisar solo el valor devuelto.** La versión que sigue llamando tras el éxito devuelve siempre `"datos"`, igual que la correcta: solo la delata la **cantidad de llamadas**. En el código real, esa versión haría 3 peticiones al servidor por cada clic. El contador es la mitad del test.
- **Usar el mismo mensaje de error en todos los intentos.** Con `throw new Error("fallo")` siempre, el primer y el último error son idénticos y el mutante del primer error sobrevive.
- **Compartir el contador entre tests.** Si `llamadas` vive fuera de los tests, sigue sumando de un test a otro. Créalo dentro de cada test.
- **Poner una flecha con `rejects`.** Con promesas **no** va flecha: `expect(promesa).rejects`. La flecha es solo para funciones que lanzan al llamarlas: `expect(() => fn()).toThrow()`.

## Otra forma de resolverlo

En Vitest real existe `vi.fn`, que crea la función falsa y lleva la cuenta por ti:

```js
import { vi } from "vitest";

const pedir = vi.fn()
  .mockRejectedValueOnce(new Error("fallo 1"))
  .mockRejectedValueOnce(new Error("fallo 2"))
  .mockResolvedValue("datos");

expect(await conReintentos(pedir, 3)).toBe("datos");
expect(pedir).toHaveBeenCalledTimes(3);
```

Aquí no tienes `vi`, y está bien: el contador a mano es exactamente lo que `vi.fn` hace por dentro, y entenderlo te ayuda a leer cualquier mock en un proyecto real.

## Cómo explicarlo en la entrevista

> "No llamé al servidor real: le pasé un `pedir` falso que yo controlo, con un contador de llamadas. Probé tres escenarios: funciona a la primera, falla dos veces y luego funciona, y falla siempre. En cada uno revisé el resultado y también cuántas veces se llamó, porque una función de reintentos puede devolver bien y aun así llamar de más. Para los rechazos usé `await expect(...).rejects`, y numeré los errores para confirmar que devuelve el último."

## Conceptos

- **Doble de prueba (mock o fake)**: una versión falsa de una dependencia, controlada por el test.
- **Promesa rechazada**: lo que devuelve una función `async` cuando hace `throw`.
- **`await expect(promesa).rejects.toThrow(...)`**: comprueba que una promesa se rechaza con un error.
- **`return await` dentro de `try`**: necesario para que el `catch` atrape el rechazo; sin `await`, el rechazo escapa.
- **`vi.fn`**: la herramienta de Vitest para crear funciones falsas que cuentan sus llamadas.
