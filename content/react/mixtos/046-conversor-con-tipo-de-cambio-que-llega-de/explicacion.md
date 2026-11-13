## Idea clave

Dos estados con vidas distintas: la **tasa** (llega una vez de la API, con sus fases cargando, lista o error) y el **texto del input**. El resultado en dólares **no** es estado: se calcula en cada render. Y como un input siempre entrega texto, hay que convertirlo y validarlo antes de dividir.

## Paso a paso

1. **Estado de la tasa como objeto con fase**: `{ fase: "cargando" }` al inicio, luego `{ fase: "lista", valor }` o `{ fase: "error" }`. Una sola variable describe en qué momento estás.
2. **Estado del input como texto**: `useState("100")`. No lo conviertas a número al guardarlo: si el usuario borra todo, quieres poder mostrar `""`.
3. **Pide la tasa en un efecto**: `obtenerTasa().then(siSale, siFalla)`. El segundo argumento de `then` maneja el rechazo (equivale a un `.catch`).
4. **Bandera `vigente`**: la limpieza del efecto la pone en `false`. Si el componente se desmonta (o `obtenerTasa` cambia) antes de que llegue la respuesta, la ignoramos.
5. **Convierte y valida**:
   - `Number(soles)` convierte el texto. `Number("abc")` es `NaN`.
   - Trampa: `Number("")` y `Number("   ")` dan `0`, no `NaN`. Por eso también exigimos `soles.trim() !== ""`.
   - `Number.isFinite(monto)` descarta `NaN` e `Infinity`.
   - `monto >= 0` descarta negativos.
6. **Formatea** con `toFixed(2)`: devuelve un texto con exactamente 2 decimales (`25` pasa a `"25.00"`).

```jsx
import { useEffect, useState } from "react";

export function ConversorDolares({ obtenerTasa }) {
  const [tasa, setTasa] = useState({ fase: "cargando" });
  const [soles, setSoles] = useState("100");

  useEffect(() => {
    let vigente = true;
    obtenerTasa().then(
      (valor) => {
        if (vigente) setTasa({ fase: "lista", valor });
      },
      () => {
        if (vigente) setTasa({ fase: "error" });
      },
    );
    return () => {
      vigente = false;
    };
  }, [obtenerTasa]);

  const monto = Number(soles);
  const valido = soles.trim() !== "" && Number.isFinite(monto) && monto >= 0;

  return (
    <div>
      <label htmlFor="soles">Monto en soles</label>
      <input
        id="soles"
        inputMode="decimal"
        value={soles}
        onChange={(evento) => setSoles(evento.target.value)}
      />

      {tasa.fase === "cargando" && <p>Consultando el tipo de cambio…</p>}
      {tasa.fase === "error" && <p role="alert">No pudimos obtener el tipo de cambio.</p>}
      {tasa.fase === "lista" &&
        (valido ? (
          <p>Equivale a US$ {(monto / tasa.valor).toFixed(2)}</p>
        ) : (
          <p>Escribe un monto válido.</p>
        ))}
    </div>
  );
}
```

## Por qué funciona

Recorrido con `obtenerTasa={async () => 4}`:

1. **Primer render**: `tasa = { fase: "cargando" }`, `soles = "100"`. Se pinta "Consultando el tipo de cambio…".
2. **Después del render** corre el efecto y llama a `obtenerTasa()`, que devuelve una promesa.
3. **La promesa se resuelve con 4**: `vigente` sigue en `true`, así que `setTasa({ fase: "lista", valor: 4 })`. React vuelve a renderizar.
4. **Segundo render**: `monto = 100`, `valido = true`, se pinta `(100 / 4).toFixed(2)` = `"25.00"`.

Luego el usuario escribe. Cada tecla cambia `soles`, pero **no** vuelve a pedir la tasa, porque el efecto solo depende de `obtenerTasa`:

| `soles` | `Number(soles)` | `valido` | Se ve |
|---|---|---|---|
| `"10"` | 10 | true | Equivale a US$ 2.50 |
| `"abc"` | NaN | false (no es finito) | Escribe un monto válido. |
| `""` | 0 | false (está vacío) | Escribe un monto válido. |
| `"-5"` | -5 | false (negativo) | Escribe un monto válido. |

Ojo con las dependencias: si el padre escribiera `obtenerTasa={async () => 4}` **y se volviera a renderizar**, cada render crearía una función nueva y el efecto pediría la tasa otra vez. El padre debe pasar una función estable (definida fuera del componente o con `useCallback`).

## Errores comunes

- **Validar solo con `isNaN`**: `Number("")` es `0`, así que el input vacío muestra "US$ 0.00" en vez de pedir un monto. Lo reconoces cuando borras el input y no aparece el aviso.
- **Pedir la tasa en el cuerpo del componente** (fuera de `useEffect`): se llama en **cada** render, incluso con cada tecla. El test de "una sola vez" lo detecta.
- **Guardar el resultado en dólares en otro estado** y actualizarlo en un efecto: hay un render con el valor viejo y dos estados que mantener sincronizados.
- **No manejar el rechazo**: si la API falla, el usuario se queda para siempre en "Consultando…". Siempre ten una fase de error.
- **Olvidar la limpieza**: si el usuario sale de la pantalla antes de que llegue la respuesta, se intenta actualizar un componente desmontado. Con respuestas que cambian (por ejemplo, otra moneda) una respuesta vieja podría pisar a una nueva.

## Otra forma de resolverlo

Con `async/await` dentro del efecto (el efecto en sí no puede ser `async`, así que se define una función interna):

```jsx
useEffect(() => {
  let vigente = true;

  async function cargar() {
    try {
      const valor = await obtenerTasa();
      if (vigente) setTasa({ fase: "lista", valor });
    } catch {
      if (vigente) setTasa({ fase: "error" });
    }
  }

  cargar();
  return () => {
    vigente = false;
  };
}, [obtenerTasa]);
```

**¿Cuándo conviene?** Cuando hay varios pasos asíncronos seguidos (pedir la tasa y luego otra cosa), `await` se lee de arriba abajo como código normal. Para una sola promesa, `then(siSale, siFalla)` es igual de claro y más corto. Si fuera un `fetch` real, en vez de la bandera usarías un `AbortController` para cancelar la petición de verdad.

## Cómo explicarlo en la entrevista

> "Separé dos estados: la tasa, con una fase que puede ser cargando, lista o error, y el texto del input. El monto en dólares lo calculo en el render. La tasa la pido en un `useEffect` que depende solo de `obtenerTasa`, así no se vuelve a pedir con cada tecla, y uso una bandera en la limpieza para ignorar respuestas que lleguen después de desmontar. Para validar, convierto con `Number` y compruebo que no esté vacío, porque `Number('')` da 0, que sea finito y que no sea negativo. El resultado lo formateo con `toFixed(2)`."

## Conceptos

- **`useEffect` para pedir datos al montar**, con sus dependencias.
- **Limpieza del efecto** y bandera `vigente` para ignorar respuestas tardías.
- **Estado con fases** (`cargando`, `lista`, `error`) en vez de varios booleanos.
- **`promesa.then(siSale, siFalla)`**: manejar éxito y error.
- **Conversión de texto a número**: `Number`, `NaN`, `Number.isFinite` y la trampa de `Number("")`.
- **`toFixed(2)`**: formatear con 2 decimales (devuelve texto).
- **Estado derivado**: el monto convertido no se guarda.
- **`role="alert"`**: el lector de pantalla anuncia el error.
