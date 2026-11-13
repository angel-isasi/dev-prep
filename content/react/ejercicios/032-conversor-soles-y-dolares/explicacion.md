## Idea clave

**Una sola fuente de verdad**: guarda solo lo que escribió el usuario y en qué input lo escribió. El otro monto es **estado derivado** y se calcula en cada render. Así los dos inputs nunca se desincronizan, y el que estás editando muestra exactamente lo que tecleaste.

## Paso a paso

1. **Elige el estado mínimo**: `{ moneda, texto }`. `moneda` dice qué input editó el usuario por última vez y `texto` es lo que escribió, como texto (así se conservan cosas como `"1."` mientras escribes un decimal).
2. **Una función `convertir(texto, formula)`** fuera del componente:
   - Si el texto está vacío o `Number(texto)` es `NaN`, devuelve `""`.
   - Si no, aplica la fórmula y redondea con `toFixed(2)`, que devuelve un **texto** con 2 decimales.
3. **Calcula los dos valores en el render**: el input editado muestra `texto` sin tocar; el otro muestra la conversión.
4. **Cada input actualiza el estado completo**: `onChange` de Soles hace `setEditado({ moneda: "soles", texto: e.target.value })`, y el de Dólares lo mismo con `"dolares"`.
5. **Etiquetas**: un `<label>` que envuelve al input le da su nombre accesible ("Soles", "Dólares"), que es como los encuentra `getByLabelText`.

```jsx
import { useState } from "react";

const TASA = 3.75; // soles por dólar

// Convierte el texto con la fórmula dada; "" si está vacío o no es número.
function convertir(texto, formula) {
  const numero = Number(texto);
  if (texto.trim() === "" || Number.isNaN(numero)) return "";
  return formula(numero).toFixed(2);
}

export function Conversor() {
  // Única fuente de verdad: qué input editó el usuario y qué escribió.
  const [editado, setEditado] = useState({ moneda: "soles", texto: "" });

  // El input editado muestra el texto tal cual; el otro se calcula.
  const soles =
    editado.moneda === "soles" ? editado.texto : convertir(editado.texto, (d) => d * TASA);
  const dolares =
    editado.moneda === "dolares" ? editado.texto : convertir(editado.texto, (s) => s / TASA);

  return (
    <div>
      <label>
        Soles
        <input
          inputMode="decimal"
          value={soles}
          onChange={(e) => setEditado({ moneda: "soles", texto: e.target.value })}
        />
      </label>
      <label>
        Dólares
        <input
          inputMode="decimal"
          value={dolares}
          onChange={(e) => setEditado({ moneda: "dolares", texto: e.target.value })}
        />
      </label>
    </div>
  );
}
```

`inputMode="decimal"` es un detalle de usabilidad: en el celular muestra el teclado numérico.

## Por qué funciona

| Acción | Estado `editado` | Soles muestra | Dólares muestra |
|---|---|---|---|
| Primer render | `{ soles, "" }` | `""` | `convertir("")` = `""` |
| Escribe 75 en Soles | `{ soles, "75" }` | `"75"` | 75 / 3.75 = `"20.00"` |
| Escribe 1 en Dólares | `{ dolares, "1" }` | 1 × 3.75 = `"3.75"` | `"1"` |
| Escribe 10 en Dólares | `{ dolares, "10" }` | `"37.50"` | `"10"` |
| Escribe abc en Soles | `{ soles, "abc" }` | `"abc"` | `NaN`, así que `""` |

¿Por qué no guardar solo los soles, como en la versión original de este ejercicio? Porque al escribir "1" en Dólares, se guardaría soles = "3.75" y Dólares se recalcularía como `"1.00"`. Al teclear el "0" siguiente, el input tendría `"1.000"`, que vuelve a dar `"1.00"`: **no podrías escribir 10**. Guardando qué input editaste, ese input nunca se reformatea mientras escribes.

## Errores comunes

- **Dos estados (`soles` y `dolares`) que se actualizan el uno al otro**, a veces con un `useEffect`. Es más código, hay renders con datos viejos y si un `onChange` olvida actualizar el otro, se desincronizan.
- **Guardar números en vez de texto.** Con `Number(e.target.value)` pierdes lo que el usuario está escribiendo: `"1."` pasa a ser `1` y no puedes escribir decimales; un input vacío pasa a ser `0`.
- **Reformatear el input que se está editando.** Es el error de la versión "solo soles": el cursor salta y no puedes escribir. Lo reconoces porque falla el test "se queda tal cual".
- **Olvidar el caso vacío.** `Number("")` es `0`, no `NaN`: sin el `trim() === ""` mostrarías `"0.00"` en vez de vacío.
- **Usar `toFixed` antes de dividir o comparar.** `toFixed` devuelve un texto; úsalo solo al final, para mostrar.

## Otra forma de resolverlo

Guardar **solo los soles** (versión original de la fuente). Es más corta, pero tiene el problema de que el input de dólares se reformatea al escribir:

```jsx
import { useState } from "react";

const TASA = 3.75;

export function Conversor() {
  const [soles, setSoles] = useState("");
  const dolares = soles === "" ? "" : (Number(soles) / TASA).toFixed(2);
  return (
    <div>
      <label>Soles <input value={soles} onChange={(e) => setSoles(e.target.value)} /></label>
      <label>
        Dólares
        <input
          value={dolares}
          onChange={(e) =>
            setSoles(e.target.value === "" ? "" : (Number(e.target.value) * TASA).toFixed(2))
          }
        />
      </label>
    </div>
  );
}
```

**¿Cuándo conviene?** Cuando solo un input es editable y el otro es de lectura (por ejemplo, un `<output>` con el resultado). Si los dos se editan, la versión con `{ moneda, texto }` es la correcta: es justo el patrón que propone la documentación oficial de React con el conversor de temperaturas.

## Cómo explicarlo en la entrevista

> "Busco una sola fuente de verdad. No guardo los dos montos, porque tendría que sincronizarlos a mano. Guardo qué input editó el usuario y el texto que escribió; el otro valor lo calculo en cada render con `toFixed(2)`. Así el input que estás editando muestra exactamente lo que tecleas, sin que se reformatee, y el otro siempre está al día. Si el texto está vacío o no es un número, el otro queda vacío."

## Conceptos

- **Una sola fuente de verdad**: cada dato vive en un solo lugar.
- **Estado derivado**: lo que se calcula a partir del estado no se guarda aparte.
- **Inputs controlados**: `value` sale del estado y `onChange` lo actualiza.
- **Guardar texto, no números**, en estados de inputs: respeta lo que escribe el usuario.
- **`Number()` y `Number.isNaN()`**: convertir y validar números.
- **`toFixed(2)`**: redondea y devuelve un texto con 2 decimales.
- **`<label>` envolviendo el input**: nombre accesible sin necesidad de `id`.
- **Levantar el estado**: guardar el dato en el ancestro común de quienes lo usan.
