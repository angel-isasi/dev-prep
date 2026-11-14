## Idea clave

Un log es texto con estructura: una línea por evento y campos separados por espacios. Lo lees entero con `readFile`, lo partes en líneas con `split(/\r?\n/)` para soportar Windows y Linux, descartas las vacías, y en cada línea separas `fecha hora NIVEL mensaje` con desestructuración y el operador rest. El resumen es un objeto contador que preparas antes del bucle.

## Paso a paso

1. **Leer**: `const texto = await readFile(ruta, "utf8")`. Si el archivo no existe, el `await` lanza y la promesa de `resumirLog` se rechaza sola: no hace falta `try/catch`, porque la regla dice que el error debe llegar a quien llama.
2. **Partir en líneas**: `texto.split(/\r?\n/)`. La expresión regular significa "un `\r` opcional seguido de `\n`", así que corta bien en archivos de Windows (`\r\n`) y de Linux (`\n`).
3. **Quitar vacías**: `filter((linea) => linea.trim() !== "")`. El salto final del archivo deja una línea `""` al final del arreglo, y puede haber líneas con espacios.
4. **Preparar el resumen**: `total` es la cantidad de líneas útiles; `porNivel` empieza con las tres claves en 0, así siempre existen aunque no aparezcan en el log.
5. **Separar los campos de cada línea**:

   ```js
   const [, , nivel, ...palabras] = linea.trim().split(" ");
   ```

   Las dos comas iniciales **saltan** fecha y hora (no las necesitas). `...palabras` junta todo lo que sobra en un arreglo: el mensaje, palabra por palabra.
6. **Contar**: si el nivel no es una clave de `porNivel` (por ejemplo `DEBUG`), `continue` pasa a la siguiente línea. Si es `ERROR`, además guardas `palabras.join(" ")`.

```js
import { readFile } from "node:fs/promises";

export async function resumirLog(ruta) {
  const texto = await readFile(ruta, "utf8");
  const lineas = texto.split(/\r?\n/).filter((linea) => linea.trim() !== "");

  const resumen = {
    total: lineas.length,
    porNivel: { INFO: 0, WARN: 0, ERROR: 0 },
    errores: [],
  };

  for (const linea of lineas) {
    const [, , nivel, ...palabras] = linea.trim().split(" ");
    if (!(nivel in resumen.porNivel)) continue;
    resumen.porNivel[nivel]++;
    if (nivel === "ERROR") resumen.errores.push(palabras.join(" "));
  }

  return resumen;
}
```

## Por qué funciona

Recorrido de la línea `"2026-11-14 10:06:02 ERROR Pedido 42 sin stock"`:

| Paso | Valor |
|---|---|
| `split(" ")` | `["2026-11-14", "10:06:02", "ERROR", "Pedido", "42", "sin", "stock"]` |
| `[, , nivel, ...palabras]` | `nivel = "ERROR"`, `palabras = ["Pedido", "42", "sin", "stock"]` |
| `"ERROR" in porNivel` | `true` |
| `porNivel.ERROR++` | sube en 1 |
| `palabras.join(" ")` | `"Pedido 42 sin stock"` |

Y el archivo completo con saltos de Windows, `"línea1\r\nlínea2\r\n"`:

| Forma de partir | Resultado |
|---|---|
| `split("\n")` | `["línea1\r", "línea2\r", ""]`: el `\r` queda pegado |
| `split(/\r?\n/)` | `["línea1", "línea2", ""]` |

Con `split("\n")` el último campo de cada línea terminaría en `\r`, y un mensaje como `"Pedido 42 sin stock\r"` no sería igual a `"Pedido 42 sin stock"`. El `""` del final lo elimina el `filter`.

## Errores comunes

- **`split("\n")` en archivos de Windows**: los mensajes quedan con un `\r` invisible al final. Lo reconoces porque el test de `\r\n` dice que los textos "se ven iguales" pero no lo son.
- **No filtrar las vacías**: `total` sale con una línea de más por el salto final del archivo.
- **Inicializar `porNivel` vacío** (`{}`) y sumar con `++`: si no hay WARN, la clave no existe y el test espera `WARN: 0`. Además `undefined++` da `NaN`.
- **Tomar solo `partes[3]` como mensaje**: te quedas con la primera palabra (`"Pedido"`).
- **Contar `DEBUG` en `porNivel`**: aparece una clave que el test no espera.
- **Atrapar el error de lectura y devolver un resumen vacío**: esconderías que el log no existe, que suele ser señal de un problema de configuración.

## Otra forma de resolverlo

**Con una expresión regular por línea:**

```js
const coincidencia = linea.match(/^\S+ \S+ (\w+) (.*)$/);
if (!coincidencia) continue;
const [, nivel, mensaje] = coincidencia;
```

`\S+` es "texto sin espacios" (fecha y hora), `(\w+)` captura el nivel y `(.*)` el resto. Es más estricta (descarta líneas mal formadas) pero más difícil de leer. Para un formato tan simple, `split` con rest es suficiente y más fácil de explicar.

**Leer línea por línea con `readline`** para archivos muy grandes (cientos de MB): en vez de cargar todo en memoria, lees por partes con `createReadStream` y `readline.createInterface`, y procesas cada línea con `for await (const linea of rl)`. Para logs pequeños, `readFile` es más simple; en un servidor real con logs enormes, conviene leer por streams.

## Cómo explicarlo en la entrevista

> "Leo el archivo completo con readFile en utf8 y lo parto con split usando la regex \r?\n, para que funcione con saltos de Windows y de Linux. Filtro las líneas vacías. Preparo el resumen con los tres niveles en cero para que siempre existan. En cada línea uso desestructuración: salto fecha y hora, tomo el nivel y junto el resto con el operador rest para reconstruir el mensaje aunque tenga espacios. Si el archivo no existe dejo que la promesa se rechace. Si el log fuera muy grande, lo leería por streams con readline en vez de cargarlo entero."

## Conceptos

- **Archivo de log**: registro de eventos de una aplicación, una línea por evento, con nivel (INFO, WARN, ERROR).
- **`split(/\r?\n/)`**: parte un texto en líneas aceptando finales de Windows (`\r\n`) y de Linux (`\n`).
- **Desestructuración de arreglos**: `const [a, b] = arr`; con comas vacías (`[, , c]`) saltas posiciones.
- **Operador rest en arreglos**: `[primero, ...resto]` junta los elementos sobrantes en un arreglo.
- **Operador `in`**: `"WARN" in objeto` pregunta si la clave existe.
- **`continue`**: salta al siguiente ciclo del bucle.
- **Rechazo que se propaga**: en una función `async`, un `await` que falla sin `try/catch` rechaza la promesa de la función.
