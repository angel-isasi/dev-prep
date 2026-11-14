# Plan v1: dev-prep, app de práctica offline (propuesta para iterar)

## Estado (2026-11-13)

Fases 1 a 7 terminadas. Contenido validado: 257 ejercicios (17 guiados, 50 de JavaScript, 30 retos de JS, 30 de algoritmos, 50 de React, 50 mixtos y 30 retos de React), 18 temas de Aprender (10 de JavaScript y 8 de React, en pestañas separadas), 146 entradas de Referencia y 100 preguntas de entrevista.

Después de la fase 7 se agregó:
- Practicar organizado por áreas (JavaScript, Algoritmos, React) y colecciones, con Siguiente, Uno al azar, repasos y práctica mezclada.
- Diseño: esqueletos de carga, fuente Bricolage Grotesque para títulos, Radix (selectores, diálogos, tooltips), Motion (transiciones, panel de tests animado, confeti al resolver, anillos de progreso) y efectos tipo Magic UI hechos con CSS.
- Acceso directo en el escritorio (npm run acceso-directo, scripts/abrir.ps1): abre sin ventana, reinicia la versión vieja; botón "Cerrar dev-prep" en la app.

Pendiente o ideas (cuando Angel lo pida):
- Sincronización online y offline con Supabase (log de eventos como fuente de verdad) y versión web en Vercel. Planificar con Fable.
- Tailwind 4 instalado (2026-11-14) conviviendo con el CSS actual, sin reinicio global: se usa solo en componentes nuevos, dentro de un elemento con la clase `tw` (ver `client/src/styles/tailwind.css`). Los estilos existentes no se migran.
- Diseño: el estilo de Inicio (React Bits, Magic UI, Motion Primitives, Animate UI y RareUI) ya está en todas las pantallas (2026-11-14). Piezas comunes: `CabeceraPagina`, `Buscador`, `BotonAzar` y los colores por área (`[data-area]` en `client/src/styles/base.css`).
- Rendimiento (2026-11-14): caché de datos por pantalla, Referencia por tandas, grano estático y sin desenfoques sobre capas animadas.
- Referencia de HTML y CSS (unas 40 entradas) para las 24 preguntas de entrevista de esos temas.
- Electron, insignias y niveles.
- "Explica tu proyecto": preguntas de entrevista sobre el propio dev-prep (Angel lo dejó aparte por ahora).

## Ampliación del stack (aprobada por Angel el 2026-11-14)

Meta: seguir el stack que piden las ofertas junior (React, TypeScript, Node, SQL, Git) y poder explicar en entrevista los proyectos propios. Orden:

1. **30 retos más de algoritmos** (alg-reto-031 a 060): 6 básicos, 20 intermedios y 4 difíciles. Patrones nuevos: prefijos, intervalos, pila monotónica, backtracking, programación dinámica, BFS, grafos. Sin tests de rendimiento ni casos borde extra por ahora (Angel lo pidió: primero aprender).
2. **TypeScript** (área nueva en Aprender y Practicar):
   - Tipos de ejercicio nuevos `ts` y `tsx` (archivos `inicio.ts`, `solucion.ts`, `tests.test.ts`). Vitest ya corre TypeScript sin configurar nada.
   - Revisión de tipos: un test "Tus tipos compilan" usa el compilador de TypeScript (dependencia `typescript`) sobre tu archivo y el de tests, en modo estricto. Así un error de tipos falla un test, con el mensaje de `tsc` traducido. Los ejercicios de tipos usan `// @ts-expect-error` y `expectTypeOf` en los tests.
   - `tsconfig.json` en workspace/ para que VS Code marque los errores mientras escribes.
   - Contenido: unos 8 temas en Aprender (tipos básicos, objetos e interfaces, uniones y narrowing, funciones, genéricos, utility types, clases y módulos, React con TypeScript) y unos 30 ejercicios en Practicar (Práctica y Retos).
3. **Node.js y SQL** (área nueva):
   - Ejercicios en JavaScript que corren en Node: módulos, `fs`, eventos, asincronía, y APIs con Express (rutas, validación, errores, middlewares). Los tests levantan tu servidor en un puerto libre y le hacen peticiones con `fetch`, como se prueba una API en el trabajo.
   - SQL con `node:sqlite` (viene con Node 24): base en memoria en cada test, consultas reales sin instalar nada.
   - Contenido: unos 8 temas en Aprender y unos 30 ejercicios.
4. **AWS, Docker y Kubernetes**: por ahora solo conceptos, como preguntas de entrevista. La práctica real llega con la versión online (deploy).

Costo estimado: unos 10 KB por ejercicio con su explicación completa. El contenido se reparte entre subagentes en paralelo, cada uno valida lo suyo con `npm run validar`.

**Hecho el 2026-11-14:** 30 retos de algoritmos (031 a 060), 30 ejercicios de TypeScript (20 de práctica y 10 retos, 4 de ellos componentes .tsx), 30 de Node (10 fundamentos, 10 APIs con Express, 10 de SQL), 8 temas de TypeScript y 9 de Node y SQL en Aprender, y 30 preguntas de entrevista (TypeScript, Node y SQL, nube y DevOps). Total validado: 347 ejercicios y 35 temas. Guía para crear más: `docs/guia-contenido-ts-node.md`.

## Contexto

Angel quiere un "LeetCode personal" offline en Windows para llegar a su primer trabajo frontend junior en 2027: programa en VS Code, los tests corren solos al guardar y la app muestra el resultado en vivo, con progreso y presión diaria. El repo `D:\angel-isasi-dev\dev-prep` empezó solo con la especificación del proyecto (sin Git).

Hallazgo que cambia el plan: en `D:\Exercices\definitivo` **ya existe el contenido**, en español y con soluciones probadas:

| Carpeta | Cantidad | Formato actual |
|---|---|---|
| `01-ejercicios/01-javascript` | 50 | `.js` con `igual()/assert()` y `node` |
| `01-ejercicios/02-react` y `03-mixtos` | 50 + 50 | `.test.jsx` con Vitest + Testing Library |
| `03-retos/01-tipo-leetcode`, `02-javascript`, `03-react` | 30 + 30 + 30 | `.js` / `.test.jsx` |
| `02-entrevista/*.md` | 100 preguntas | Markdown con "Di esto" + "In English" |

Total: **240 ejercicios y 100 preguntas**. No hay que crear 30 ejercicios desde cero: hay que **convertirlos** al formato de carpeta por ejercicio. Lo que les falta (medido):

- 151 de 240 no tienen enunciado ("guíate por el título y la prueba").
- Los de JS tienen 2.1 pruebas en promedio (32 tienen 1 sola); los de React tienen 1 `test()` cada uno. Para que "3/5 tests pasan" tenga sentido hay que subirlos a 3 o más casos.
- Ninguno tiene pistas. La "Idea clave", "Qué evalúan" y "Cómo lo explicarías" de los `.md` se reutilizan como explicación.
- 21 usan `await`/timers: la conversión no es 100% mecánica, se hace por tandas y con validador.

Entorno verificado: Node 24.15, npm 11.12, Git 2.49, VS Code 1.146 (`code.cmd` en el PATH), Vitest 5.1.0 y Vite 8.3.8 (las versiones con las que ya se probó el contenido).

## Stack (pensado dos veces)

| Pieza | Decisión | Por qué | Descartado |
|---|---|---|---|
| Lenguaje | **JavaScript** (ESM) + JSDoc en el modelo de datos | Lo puedes leer y defender hoy. Migrar a TypeScript después es un módulo de aprendizaje real | TypeScript desde el día 1: te frena y no podrías revisar tu propia app |
| Interfaz | **React 19 + Vite 8**, React Router | Es lo que piden las ofertas junior; ya decidido | Next.js: sobra, no hay SSR ni deploy |
| Estilos | **CSS Modules + variables CSS** (tokens, modo oscuro) | Cero dependencias, viene con Vite y practicas CSS real (flex, grid), que preguntan en entrevistas | Tailwind: más rápido de maquetar, pero tapa el CSS que necesitas aprender. Es la alternativa si prefieres tenerlo en el CV |
| Servidor | **Express 5** | El más conocido y fácil de explicar | Fastify/Hono: mejores, menos reconocibles para un junior |
| Tiempo real | **SSE** (`EventSource`) | Solo necesitamos servidor → navegador; reconecta solo y son 20 líneas | WebSocket: bidireccional, no hace falta |
| Tests en vivo | **Vitest 5 por su API de Node** (`createVitest` de `vitest/node`, `watch` + `standalone`) con un reporter propio | Un solo proceso caliente: resultado en ~100 ms al guardar. API confirmada en la versión instalada (`onTestCaseResult`, `onTestRunEnd`, `onUserConsoleLog`, `runTestSpecifications`) | Lanzar `vitest run` por cada guardado: 1 a 2 s de arranque cada vez. Queda como plan B |
| Datos | **JSON** con escritura atómica + un log `eventos.jsonl` | Un solo usuario, se lee a simple vista, sin módulos nativos (clave para Electron) | SQLite: no aporta con este volumen |
| Markdown | `react-markdown` + `rehype-highlight` | Sin `dangerouslySetInnerHTML`, todo empaquetado (offline) | |
| Fuentes | Empaquetadas con `@fontsource` (sin CDN) | Offline real | Google Fonts |

Cambio clave frente a "tres cosas corriendo": **en uso diario hay un solo proceso**. Express sirve la interfaz ya compilada (`client/dist`), la API y lleva Vitest adentro. Vite solo corre cuando desarrollamos la app (`npm run dev`).

## Arquitectura

```
dev-prep/
  iniciar.bat                 doble clic: instala si falta, compila si falta, arranca
  package.json                un solo package.json (scripts: dev, build, start, validar, test)
  vitest.ejercicios.config.js config de Vitest para workspace/ (pool forks, jsdom por archivo)
  client/                     React + Vite
    src/
      main.jsx  App.jsx       rutas y layout
      api.js                  funciones fetch (un solo lugar)
      hooks/                  useEjercicios, useEjercicio, useEventos (SSE), useTema
      components/             BarraLateral, FilaEjercicio, Insignia, PanelTests, CasoTest, Enunciado
      pages/                  Practicar, Ejercicio, Aprender, Entrevistas, Progreso (las 3 últimas vacías en el MVP)
      styles/                 tokens.css (colores claro/oscuro), base.css
  server/
    index.js                  arranque: escucha en 127.0.0.1 y abre el navegador
    app.js                    crearApp({ rutas }) sin rutas fijas: reutilizable por Electron y testeable
    config.js                 CONTENT_DIR, WORKSPACE_DIR, DATA_DIR, puerto
    contenido.js              escanea content/, valida meta.json, índice en memoria
    workspace.js              preparar y reiniciar la carpeta de trabajo
    corredor.js               Vitest + reporter → resultados normalizados
    eventos.js                hub SSE
    progreso.js               leer/escribir JSON, reglas de estado
    vscode.js                 abrir VS Code
    rutas/                    ejercicios.js, progreso.js
  scripts/
    validar-contenido.js      cada solución pasa sus tests y cada inicio falla
    importar.js               (fase 2) convierte D:\Exercices\definitivo al formato nuevo
  content/                    contenido, versionado en Git
  workspace/                  mi código (fuera de Git)
  data/                       mi progreso (fuera de Git, con respaldo diario)
```

### Cómo se comunican

```
VS Code ──guardo──► workspace/<id>/solucion.js
                          │ (Vitest vigila la carpeta)
                          ▼
Navegador ◄──SSE "resultado"── Express ◄── reporter ◄── Vitest (watch)
    │                             │
    └──── fetch /api/... ────────►├─► content/  (lee ejercicios)
                                  ├─► data/     (guarda progreso)
                                  └─► code ...  (abre VS Code)
```

1. La app pide `GET /api/ejercicios` (lista con estado) y `GET /api/ejercicios/:id` (enunciado, sin solución).
2. "Abrir en VS Code" → `POST /api/ejercicios/:id/abrir`: si no existe, copia `inicio.js` a `workspace/<id>/solucion.js` junto con los tests y el enunciado; abre VS Code y lanza una primera corrida.
3. Guardo en VS Code → Vitest vuelve a correr solo ese ejercicio → el reporter arma `{ ejercicioId, pasan, total, casos: [{ nombre, ok, mensaje, esperado, recibido }] }` → el servidor actualiza el progreso y lo emite por SSE → `PanelTests` se repinta.
4. Si todos pasan, el servidor marca el ejercicio como resuelto.

API del MVP: `GET /api/ejercicios`, `GET /api/ejercicios/:id`, `POST .../abrir`, `POST .../reiniciar`, `GET /api/eventos` (SSE). Después: pistas, solución, explicación, progreso y config.

### Formato de contenido (ajustes a la especificación)

```
content/javascript/ejercicios/009-frecuencia-de-palabras/
  meta.json        { id: "js-ej-009", titulo, tipo: "funcion"|"componente", tema, nivel: 1|2|3, tags, origen }
  enunciado.md
  inicio.js        enunciado en comentario + export de la función vacía
  tests.test.js    importa de "./solucion.js", 3 a 6 casos con nombre claro
  pistas.json      3 pistas (opcional: sin archivo, la app oculta el botón)
  solucion.js      solución oficial
  explicacion.md   idea clave + qué evalúan + cómo lo explicarías
```

- **Los tests siempre importan `./solucion.js`**. En `content/` eso prueba la solución oficial sin copiar nada (así valida el script); en `workspace/` prueba la mía. El mismo archivo de test sirve en los dos lados.
- **`id` estable en `meta.json`**, no el nombre de carpeta: puedo renombrar o mover sin perder progreso.
- **Un solo banco de ejercicios, varias vistas**: Aprender, Practicar y Entrevistas filtran por `tema`, `nivel` y colección. No se duplica contenido.
- Colecciones: `javascript/ejercicios` (50), `javascript/retos` (30), `algoritmos/retos` (30), `react/ejercicios` (50), `react/mixtos` (50), `react/retos` (30).
- El sistema soporta React desde el MVP (es solo otro tipo de test), aunque el contenido de React se importa después del de JavaScript.

## Modelo de datos del progreso

`data/progreso.json` (el MVP solo usa `estado`, `intentos`, `ultimoResultado` y fechas; el resto se llena en fases siguientes):

```json
{
  "version": 1,
  "config": { "metaDiaria": 2, "topeDeuda": 6, "fechaMeta": "2027-03-01", "objetivo": "", "tema": "oscuro" },
  "ejercicios": {
    "js-ej-009": {
      "estado": "en-progreso",
      "iniciadoEn": "2026-11-13T15:02:11-05:00",
      "resueltoEn": null,
      "intentos": 7,
      "ultimoResultado": { "pasan": 3, "total": 5, "en": "2026-11-13T15:20:40-05:00" },
      "pistasVistas": 2,
      "vioSolucion": false,
      "segundosActivos": 840,
      "explicacion": "",
      "repaso": { "caja": 1, "proximo": "2026-11-16" }
    }
  },
  "preguntas": { "ent-012": { "caja": 2, "proximo": "2026-11-20", "ultima": "dude" } },
  "quizzes": { "closures": { "mejor": 4, "total": 5 } },
  "dias": { "2026-11-13": { "resueltos": 2, "repasos": 1, "preguntas": 5, "segundos": 3100, "meta": 2, "deuda": 0 } }
}
```

Reglas:
- **Estados**: `pendiente` (nunca abierto), `en-progreso` (abierto, no pasan todos), `resuelto` (pasan todos sin ver la solución), `repasar` (vi la solución o le toca repaso).
- **Intento** = una corrida de tests disparada por un guardado.
- **Tiempo activo** = suma de intervalos entre guardados, con tope de 5 minutos por intervalo (no cuenta si me fui).
- **Repaso espaciado con cajas de Leitner** (1, 3, 7, 14, 30 días): si lo resuelvo en el repaso sube de caja, si fallo o veo la solución vuelve a la caja 1. Mismo mecanismo para preguntas de entrevista. Se explica en una frase, a diferencia de SM-2.
- **Día** = fecha local de Lima, nunca `toISOString()` (es UTC y después de las 7 p. m. ya cuenta como mañana).
- `data/eventos.jsonl`: una línea por evento (abrí, corrida, resuelto, pista, solución). El MVP solo escribe; después sirve para resumen semanal y "antes y después" sin migrar datos.
- `data/mis-respuestas.json`: textos míos (pitch, STAR), separados de las estadísticas.
- Escritura atómica (archivo temporal + renombrar) y copia diaria en `data/respaldos/` (últimas 7).

## Pantallas

```
┌────────────┬──────────────────────────────────────────────────────┐
│ dev-prep   │  Practicar                       [tema▾][nivel▾][estado▾]
│            │  ──────────────────────────────────────────────────
│ ▸ Inicio   │  ● 009 Frecuencia de palabras   objetos   ●○○  3/5
│ ▸ Aprender │  ✓ 001 Duplicar                 arrays    ●○○  resuelto
│ ▸ Practicar│  ○ 014 Two Sum                  algoritmos●●○  pendiente
│ ▸ Entrevist│
│ ▸ Progreso │
│            │
│ 🔥 racha 4 │
│ ☾ tema     │
└────────────┴──────────────────────────────────────────────────────┘

Ejercicio:
┌──────────────────────────────┬─────────────────────────────┐
│ 009 Frecuencia de palabras   │  Tests en vivo      3/5 ▓▓▓░░│
│ objetos · intermedio         │  ✅ cuenta palabras repetidas│
│                              │  ✅ ignora mayúsculas        │
│ Enunciado (markdown)         │  ✅ texto vacío → {}         │
│ Ejemplos entrada → salida    │  ❌ ignora signos            │
│                              │     esperado {ica: 2}        │
│ [Abrir en VS Code]           │     recibido {"ica,": 1,...} │
│ [Pista 1] [Pista 2] [Pista 3]│  ❌ espacios dobles          │
│ [Ver solución 🔒] [Reiniciar]│  última corrida: hace 3 s    │
│                              │  Consola: (console.log míos) │
└──────────────────────────────┴─────────────────────────────┘
```

- **Inicio** (fase 4): objetivo personal, racha, meta de hoy y deuda, cuenta regresiva a la fecha meta, "continuar" y repasos pendientes, frase del día.
- **Practicar**: lista con filtros y buscador. **Ejercicio**: dos columnas como arriba; al resolver aparece "Explícalo con tus palabras" junto al "Cómo lo explicarías" modelo.
- **Aprender** (fase 6): temas → teoría de 1 pantalla, ejercicios guiados del banco, mini quiz.
- **Entrevistas** (fase 5): tarjetas (pienso, revelo, me califico), retos con temporizador, guía, STAR y pitch, simulacro.
- **Progreso** (fase 4): % de preparación, calendario tipo GitHub, resumen semanal, avance por tema.
- **Ajustes**: meta diaria, fecha meta, objetivo, tema.

## Plan por fases

Un commit por tarea.

### Fase 0: prueba de riesgo (30 min)
Un script suelto que demuestre lo único incierto antes de construir encima:
- Vitest por API de Node en modo `watch` + `standalone` sobre una carpeta temporal con 1 ejercicio `.js` y 1 `.jsx`, y un reporter que imprima el JSON de resultados al guardar.
- Abrir VS Code desde Node. En Windows `code` es `code.cmd`: `spawn` sin `shell: true` falla, así que se usa `shell: true` con rutas entre comillas.
- Si la API da problemas: plan B (`vitest run --reporter=json` por cada guardado, vigilando con `fs.watch`).

### Fase 1: MVP (unas 4.5 h)
| # | Tarea | Min |
|---|---|---|
| 1.1 | `git init`, `.gitignore`, `package.json`, estructura, README inicial | 20 |
| 1.2 | Formato de contenido + 3 ejercicios convertidos a mano desde `definitivo` (uno JS, un reto tipo LeetCode, un componente React) + `validar-contenido.js` | 40 |
| 1.3 | Servidor: `config`, `contenido` (índice), rutas de lista y detalle | 30 |
| 1.4 | `workspace` (preparar, reiniciar con respaldo) + `vscode` | 30 |
| 1.5 | `corredor` (Vitest + reporter) + `eventos` (SSE) | 45 |
| 1.6 | `progreso` básico: estado, intentos, último resultado | 25 |
| 1.7 | Cliente: layout, barra lateral, tokens, modo oscuro | 40 |
| 1.8 | Páginas Practicar y Ejercicio con `PanelTests` en vivo | 50 |
| 1.9 | `iniciar.bat` (un proceso, abre el navegador, detecta si ya está corriendo) + README para Windows | 25 |

**Tu parte (1.8):** el componente `Insignia` (estado y nivel) y la función pura `filtrarEjercicios(lista, filtros)`. Te dejo los tests escritos y las instrucciones; lo programas y lo reviso como senior.

### Fase 2: contenido para usarla a diario (tanda 1)
`scripts/importar.js` + revisión: los 50 de `javascript/ejercicios`. Por cada uno: enunciado si falta, 3 o más casos de test, 3 pistas, nivel y tema, explicación desde el `.md`. No entra nada que no pase `npm run validar`. Desde aquí ya la usas todos los días.

### Fase 3: flujo completo de práctica
Pistas progresivas (se registran), solución con "¿seguro?" y penalidad, "Explícalo con tus palabras", filtros y buscador, tiempo activo, panel de consola (`onUserConsoleLog`), y vigilante de bucles infinitos (si una corrida no termina en 10 s, se reinicia Vitest y la app avisa "posible bucle infinito").

### Fase 4: presión y progreso
Meta diaria y deuda con tope, racha, pantalla Inicio, fecha meta con ritmo (atrasado o al día), repaso espaciado, calendario, resumen semanal y % de preparación. La lógica (racha, deuda, cajas) va en funciones puras con tests propios.

Fórmula inicial de preparación: por tema, promedio del dominio de cada ejercicio (1 = resuelto sin solución y repaso al día; 0.6 = resuelto usando la pista 3; 0 = vi la solución o pendiente), ponderado por qué tanto se pregunta el tema en entrevistas junior.

### Fase 5: entrevistas
Importar las 100 preguntas a tarjetas (con botón ES/EN, el inglés ya está escrito), autoevaluación (lo sabía, dudé, no lo sabía) que alimenta el repaso, guía de pensar en voz alta, STAR y pitch editables, retos con temporizador y modo simulacro.

### Fase 6: aprender
10 temas: teoría de 1 pantalla (escrita por nosotros), 3 a 5 ejercicios guiados tomados del banco y quiz de opción múltiple.

### Fase 7: resto del contenido y pulido
Tandas 2 a 6 (retos JS 30, algoritmos 30, React 50, mixtos 50, retos React 30), ejercicios de DOM sin React (modal, buscador, lista con datos), README de portafolio con capturas, tests de la app. Más adelante: migrar a TypeScript, Electron, insignias y niveles.

## Qué agregaría o cambiaría (con razón)

1. **Importar en vez de escribir**: pasas de 30 a 240 ejercicios y de 30 a 100 preguntas con contenido ya probado. Es el cambio más grande del plan.
2. **Validador de contenido** (`npm run validar`): cumple "todas las soluciones pasan sus tests" de forma automática y evita ejercicios rotos.
3. **Abrir `workspace/` como carpeta y saltar al archivo** (`code workspace -g archivo`), en vez de abrir la carpeta de cada ejercicio: una sola ventana de VS Code, no una por ejercicio ni reemplazar la que tengas abierta. Cambio pequeño frente a la especificación.
4. **Copiar `enunciado.md` al workspace**: lees el enunciado en VS Code sin ir al navegador.
5. **Panel de consola y vigilante de bucles infinitos**: son los dos tropiezos más comunes al practicar.
6. **Autoevaluación de explicación**: después de resolver, comparas tu explicación con "Cómo lo explicarías". Entrena lo que de verdad se evalúa en entrevista.
7. **Seguridad básica**: el servidor escucha solo en `127.0.0.1` y las rutas reciben un `id` que se valida contra el índice, nunca una ruta de disco (la API abre programas y escribe archivos).
8. **No copiar `es.javascript.info` ni `30-Days-Of-JavaScript`** al repo: son de terceros y el repo será público. Sirven como lectura opcional enlazada.
9. **Repo aparte para tus soluciones** (opcional, después): `workspace/` como repo propio en GitHub suma actividad visible.
10. **Lo que retrasaría**: insignias y niveles, simulacro (hasta tener las tarjetas), SQLite y Electron (hasta llevar 2 semanas de uso real).

Riesgo honesto para Electron: empaquetar Vitest dentro de un instalable es la parte difícil de esa fase. El diseño (`crearApp` sin rutas fijas, datos en una carpeta configurable) lo prepara, pero no lo resuelve hoy.

## Verificación

- **Fase 0**: guardar un archivo en la carpeta temporal imprime el JSON de resultados en menos de 1 s; `code` abre el archivo.
- **MVP, de punta a punta**:
  1. Doble clic en `iniciar.bat` → se abre el navegador con la lista de 3 ejercicios.
  2. "Abrir en VS Code" → se crea `workspace/<id>/` y se abre `solucion.js`; el panel muestra 0/N en rojo.
  3. Escribo una solución a medias y guardo → el panel cambia solo a "3/5" con el detalle esperado/recibido.
  4. Completo y guardo → todo ✅, el ejercicio aparece como resuelto en la lista y en `data/progreso.json`.
  5. Rompo la sintaxis y guardo → la app muestra el error sin caerse.
  6. "Reiniciar" → vuelve el archivo base y queda un respaldo.
  7. Cierro y vuelvo a abrir → el progreso sigue ahí.
  8. Repetir 2 a 4 con el ejercicio de React (jsdom).
- `npm run validar`: las 3 soluciones pasan y los 3 `inicio` fallan.
- `npm test`: tests de `progreso` y `filtrarEjercicios`.
- Sin internet (modo avión): todo lo anterior funciona igual.

## Resultado de la Fase 0 (hecha el 2026-11-13)

Probado con Vitest 5.1.0 en una carpeta temporal (ya borrada). La arquitectura se confirma, sin plan B:

- `createVitest({ watch: true, standalone: true, root, config: false, include, pool: "forks", reporters: [reporter], setupFiles }, { oxc: { jsx: { runtime: "automatic" } } })` + `await vitest.standalone()` funciona. Arranca en ~200 ms y no corre nada hasta que se le pide.
- Corrida a pedido (al abrir un ejercicio): `vitest.runTestSpecifications(await vitest.globTestSpecifications([carpeta]))`.
- Al guardar el archivo, Vitest vuelve a correr solo ese ejercicio. Tiempos: **JS ~370 ms**, **React ~1.5 s** (1 s es levantar jsdom en cada corrida). La primera corrida de React tras encender la PC puede tardar mucho más (una vez tardó 39 s por carga en frío de jsdom): la app debe mostrar "corriendo..." mientras tanto.
- Reporter: en `onTestRunEnd(modulos)`, por cada módulo `m.moduleId` (ruta → id del ejercicio), `m.children.allTests()`, y por caso `c.name` y `c.result()` → `{ state, errors: [{ message, expected, actual }] }`. `onUserConsoleLog(log)` entrega `log.content`.
- Casos borde ya vistos:
  - Error de sintaxis: 0 casos y el mensaje llega en `m.errors()`. La app debe mostrarlo como "tu archivo no se pudo leer".
  - Falta el `export`: todos los casos fallan con "X is not a function". Conviene traducirlo a "¿exportaste la función?".
- **Hallazgo nuevo**: sin `globals: true`, Testing Library no limpia el DOM entre tests y los casos de React se contaminan entre sí. Hace falta un archivo de preparación (`setupFiles`) con `afterEach(cleanup)`. Va en la tarea 1.5.
- VS Code: `spawn("code", [...])` sin shell da `ENOENT`; con `shell: true` funciona.
- Ajuste futuro (fase 3): probar `pool: "threads"` o reutilizar el entorno para bajar el 1.5 s de React.

## Estándar de calidad del contenido (pedido de Angel, 2026-11-13)

Angel usará la app sin internet: es su **única fuente de consulta** (sin MDN, sin Google). Por eso la guía de aprendizaje y las resoluciones pesan tanto como el código. Reglas para todo contenido que entre:

**Cada `explicacion.md` (resolución) debe traer, en este orden:**
1. Idea clave en una o dos frases.
2. Solución paso a paso: cómo se llega, no solo el código final.
3. Por qué funciona, con un ejemplo recorrido con valores reales.
4. Errores comunes en ese ejercicio y cómo reconocerlos.
5. Otra forma de resolverlo (por ejemplo bucle vs `reduce`) y cuándo conviene cada una.
6. Cómo lo explicarías en voz alta en una entrevista.
7. Conceptos usados, con enlace al tema de Aprender y a la Referencia.

**Cada pista** debe destrabar sin regalar: 1) hacia dónde mirar, 2) qué herramienta usar, 3) el esqueleto de la solución sin completarla.

**Cada tema de Aprender:** teoría de 1 pantalla con ejemplos que se pueden correr, errores típicos, una "chuleta" de resumen y preguntas de entrevista relacionadas.

**Agregado nuevo: Referencia offline** (fase 6, junto con Aprender). Un mini MDN propio dentro de la app, con buscador: métodos de array, string y objeto, promesas, DOM y hooks de React. Cada entrada con qué hace, firma, ejemplo corto y error típico. Reemplaza las búsquedas que no podrá hacer.

**Mensajes de error explicados:** cuando un test falla por un error conocido ("X is not a function", "Cannot read properties of undefined"), la app muestra en español qué significa y qué revisar.

**Control automático:** `npm run validar` también rechaza un ejercicio si a su `explicacion.md` le falta alguna de las 7 secciones o si no tiene 3 pistas. La fase 2 (primera tanda de 50) ya se hace con este estándar; es más lenta por ejercicio, pero no se importa nada a medias.
