# Ítems de lección del celular (estilo Duolingo)

Las lecciones del celular no tienen contenido propio: sus ítems se **generan** del contenido que ya existe (quizzes de Aprender, Referencia, tests de TypeScript y soluciones de ejercicios). Los genera `scripts/items/` al correr `npm run exportar:movil`, que escribe `client/public-movil/datos/items.json`.

## Unidades

Cada unidad es un tema de Aprender (35) más una unidad extra **`algoritmos`** (sin teoría). `scripts/items/unidades.js` decide a qué unidad va cada cosa:

1. Un ejercicio que aparece en `ejercicios` del `meta.json` de un tema va a ese tema.
2. Si no, se usa su `tema` con la tabla `TEMA_A_UNIDAD` (por ejemplo `react-estado` → `react-estado-y-eventos`, `strings` → `variables-y-tipos`, `algoritmos` → `algoritmos`).
3. Las entradas de Referencia van por categoría con `CATEGORIA_A_UNIDAD` ("Arrays" → `arrays`, "Promesas y async" → `promesas-y-async`, "React" → `react-hooks-avanzados`...).

Un test falla si algún tema de ejercicio o categoría de Referencia queda sin unidad.

## Formato de `items.json`

```js
{
  version: 1,
  unidades: [{ id, titulo, area, orden, conTeoria }],  // en orden de estudio: javascript, algoritmos, react, typescript, node
  items: [Item],
}
```

Campos comunes de un `Item`:
- `clave`: única y estable entre exportaciones (el progreso del celular se guarda por clave). Ejemplos: `quiz:<tema>:<n>`, `metodo:<entrada>`, `par:<categoria>:<n>`, `ref:<entrada>:<n>`, `ts:<ejercicio>:<n>`, `hueco:<ejercicio>:<n>`, `ordenar:<ejercicio>`, `ej:<ejercicio>`.
- `tipo`: `"opcion"`, `"emparejar"`, `"hueco"`, `"ordenar"` o `"tarjeta"`.
- `unidad`: id de la unidad.
- `fuente`: `{ tipo: "tema" | "referencia" | "ejercicio", id, titulo }`, para el enlace "Ver más" después de responder.

Por tipo:

| tipo | campos | de dónde sale |
|---|---|---|
| `opcion` | `subtipo` (`"quiz"`, `"metodo"`, `"devuelve"`, `"ts"`), `pregunta` (markdown), `codigo?` `{ lenguaje, texto, marcar? }` (`marcar`: índice de la línea a resaltar), `opciones` (strings, markdown en línea), `correcta` (índice), `explicacion` (markdown) | quizzes de Aprender; descripción de Referencia → ¿qué método?; `expr; // resultado` de los ejemplos de Referencia → ¿qué devuelve?; `@ts-expect-error` y asignaciones tipadas de los tests de TS → ¿TypeScript lo acepta? (opciones "Compila" y "Da error") |
| `emparejar` | `pares` `[{ izq, der }]` (4), `explicacion?` | 4 entradas de una misma categoría de Referencia: nombre ↔ qué hace |
| `hueco` | `pregunta`, `codigo` `{ lenguaje, texto }` con `____` en el hueco, `opciones` (4), `correcta`, `explicacion` | un método conocido que aparece una sola vez en la solución de un ejercicio, con distractores de una tabla de "no equivalentes" |
| `ordenar` | `pregunta`, `lenguaje`, `lineas` (orden correcto, con sangría), `explicacion` | soluciones de 4 a 12 líneas de código (sin comentarios, líneas vacías ni imports) |
| `tarjeta` | `ejercicio` (id) | cada ejercicio con solución; el cliente arma el frente (enunciado) y el reverso (idea clave, solución, "Cómo explicarlo") desde `col/*.json` |

Reglas:
- **Nunca** se generan ítems de `hueco`, `ordenar` ni `tarjeta` de los retos de entrevista (`javascript/retos`, `react/retos`, `typescript/retos`): sus soluciones no viajan al celular.
- Las opciones de un ítem no se repiten (comparando sin espacios ni mayúsculas) y la correcta es una sola.
- Se descarta todo ítem dudoso; el exportador imprime cuántos salen por tipo y por unidad.
- Las tarjetas de entrevista no van en `items.json`: el motor las toma de `entrevistas.json` y usa el mismo progreso que la pantalla Entrevistas.

## Progreso

Cada ítem usa las cajas de Leitner de `calificarPregunta` (`server/progreso-reglas.js`) guardadas en `datos.items[clave]`:
- acertar a la primera: `"sabia"`
- acertar después de fallar en la misma lección: `"dude"`
- fallar las dos veces o calificarse "No": `"no"`

Un ítem con `datos.reportados[clave]` (botón "Reportar pregunta") no vuelve a salir.
