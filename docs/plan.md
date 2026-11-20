# Plan v1: dev-prep, app de práctica offline (propuesta para iterar)

## Estado (2026-11-16): construcción cerrada

Terminados el plan v1 (fases 1 a 7), la versión web y celular (plan v2), el plan v3 y el plan v4. La app está en uso diario.

Contenido validado: 390 ejercicios (122 de JavaScript, 60 de algoritmos, 148 de React, 30 de TypeScript y 30 de Node y SQL), 35 temas de Aprender, 146 entradas de Referencia, 152 preguntas de entrevista, inglés en 3 etapas (básico, intermedio y de trabajo), 10 escenarios de Git práctico, 4 pruebas técnicas, 2 proyectos guiados y 12 fichas de portafolio.

Partes de la app:
- **Motor local** (`server/`, Express en `127.0.0.1:4321`): lee el contenido, guarda el progreso en `data/`, abre VS Code, corre Vitest en modo watch y avisa por SSE. Arranca oculto con Windows (`npm run arranque:activar`).
- **Versión web** (dev-prep.angel-isasi.com, Vercel): PWA offline con todo el contenido; en la laptop se conecta con el motor y tiene VS Code y tests en vivo.
- **Nube** (AWS, `aws/`): una Lambda con URL propia y una tabla DynamoDB unen el progreso de la laptop y el celular, mandan los avisos diarios y buscan ofertas nuevas a las 11:00.

Seguridad (auditoría del 2026-11-16): el motor solo acepta peticiones de localhost y de la versión web (cabeceras Origin y Host), no se deja meter en marcos, el navegador nunca envía rutas de disco, la nube exige un token de 256 bits que solo viaja en el QR, el enlace de vincular solo acepta una Lambda de AWS, los avisos solo abren páginas de dev-prep y los enlaces externos solo pueden ser http o https. El sitio publicado tiene CSP estricta con huella verificada en el build.

Ideas para más adelante (no son necesarias para usarla):
- Electron: ya no hace falta para el uso diario (acceso directo, arranque automático y PWA instalable). Lo difícil sería empaquetar Vitest.
- Funciones con IA (conversación en inglés, convocatorias de prácticas día por día): necesitan una clave de API propia.

## Versión publicada: decisiones de Angel (2026-11-15)

- **Una sola app para todas las pantallas:** dev-prep.angel-isasi.com se ve como app en el celular (navegación abajo) y con barra lateral en pantallas de 900 px o más. Lecciones y quizzes funcionan en las dos.
- **Dónde se guarda el avance:** en el almacenamiento del navegador de cada dispositivo (en la laptop, en su disco): sobrevive a apagar o suspender. Con internet se sube solo a AWS y se une con los demás dispositivos. Borrar los datos de navegación borra la copia local; si estaba sincronizada, se recupera al volver a vincular con el QR.
- **Privacidad:** el progreso de Angel no está en la página. Un visitante solo tendría su propio progreso vacío en su navegador, y la nube rechaza a cualquiera sin el token secreto (que solo viaja en el QR). Lo único visible para un extraño es el contenido de estudio; la página no se indexa (noindex y robots.txt). No hace falta un sistema de usuarios. Opcional, si algún día quiere bloquear del todo la entrada: Cloudflare Access con código por correo (gratis), con el costo de complicar el uso sin internet.
- **APK:** descartado por ahora (la PWA instalada ya es app real); queda documentado como paso opcional.

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

## Plan v3 (2026-11-16): aprender mejor, motivación, avisos, inglés y trabajo

Unas 40 funciones en 5 bloques, todas en la versión web y con sus reglas en módulos puros de `server/` probados con tests:

- **Base**: registros que se mezclan entre dispositivos con borrados que no resucitan (`server/combinar.js`), ajustes por separado, intercambio directo web y laptop sin AWS, y sincronización sin bucles.
- **Aprender mejor**: depurar (`content/*/depurar`), Lee y predice (`content/predice`, validado ejecutando cada fragmento), glosario, revisión de código, mapa de dominio (`server/dominio.js`) y errores frecuentes (`server/errores.js`).
- **Motivación**: tiempo libre ganado (`server/juego.js` y el vigilante `server/juego-vigilante.js`), niveles e insignias (`server/logros.js`), día salvado, horario y pausas (`server/metricas.js`), plan de hoy, examen semanal, enfoque, reto y resumen del mes, diario.
- **Avisos**: Web Push sin librerías (`server/webpush.js`, probado con el ejemplo del RFC 8291), reglas de cuándo avisar (`server/avisos.js`) y Lambda empaquetada (`aws/lambda`).
- **Inglés**: `content/ingles/{basico,intermedio,trabajo}` (formato en `docs/guia-ingles.md`), ítems en `scripts/items/ingles.js`.
- **Trabajo**: postulaciones, ofertas (`server/ofertas.js`), CV, portafolio (`server/portafolio.js`), pruebas técnicas y proyecto guiado (`server/proyectos.js`, formato en `docs/guia-proyectos.md`).

## Plan v4 (2026-11-16): diseño que fluye, entrevista completa y práctica de trabajo real

Ideas elegidas por Angel después del plan v3. Todas con sus reglas en módulos puros de `server/` y tests:

- **Diseño**: scroll suave con Lenis (el bucle de animación solo corre mientras te mueves, `client/src/hooks/useScrollSuave.js`), transición entre pantallas con View Transitions, listas animadas con AutoAnimate (`ListaAnimada`) y texto de lectura a 72 caracteres por línea.
- **Entrevistas**: simulacro por etapas (`server/simulacro.js`, contenido en `content/entrevistas/proceso.json`), preguntas de recursos humanos y "Defiende tu proyecto" (`content/entrevistas/preguntas/11` y `12`), repaso rápido de HTML y CSS.
- **Practicar**: colecciones `javascript/testing` (pruebas de mutación) y `react/apis`, API de práctica (`server/api-practica.js`), Git práctico (`server/git-practico.js`, escenarios en `content/git/escenarios.json`, cada uno probado con git real) y reto de la semana.
- **Progreso**: cuánto avancé, plan de la semana y reto (`server/avance.js`), tu día en números, pregunta ancla.
- **Inglés**: shadowing en cada unidad y 2 unidades nuevas (sonidos difíciles y falsos amigos).
- **Trabajo**: ofertas para ti (`server/ofertas-auto.js`, APIs públicas, sin scraping ni IA) y el proyecto guiado "Primer día de trabajo" con tickets.

Después se agregó el aviso al celular de ofertas nuevas para junior en Perú o remotas para Latinoamérica (la Lambda las busca a las 11:00). Quedan para más adelante solo las ideas que necesitan una clave de IA.

**Ofertas más seguras y útiles (2026-11-16):** 14 mejoras a "Conseguir trabajo".
- Seguridad: confianza por bolsa (`CONFIANZA`) y detector de señales de estafa (`senalesDeAlerta`) en `server/ofertas-auto.js`; checklist y enlaces para verificar la empresa.
- Fuentes: se suman We Work Remotely (RSS, piden citar la fuente) y Himalayas (API, piden postular con su enlace; solo motor y Lambda por CORS). De Arbeitnow, solo las remotas; si una oferta se repite, gana la bolsa más confiable.
- Por oferta: filtro "Solo para mí", guardar y ocultar (colección `ofertasMarcadas`, se sincroniza), "Nuevas desde tu última visita", qué te falta con enlace a la lección, palabras clave para el CV (`palabrasParaCv` en `server/ofertas.js`) y mensaje para postular.
- Postulaciones (`server/postulaciones.js`): fecha de envío, seguimiento a los 7 días (aviso a las 12:00 los días 7, 14 y 21), etapa "Sin respuesta", números por semana y por fuente, y meta semanal opcional.

## Inglés v2 (2026-11-17): estilo Duolingo de verdad

Pedido de Angel: el inglés se sentía repetitivo y "0 de 227 dominados" no tenía sentido. Cambios:

- **Conceptos en vez de preguntas sueltas**: cada palabra o frase se domina una sola vez y se pregunta de otra forma según su caja (reconocer, producir con ayuda, sin ayuda). La unidad 10 bajó de 227 ítems a 106 conceptos. El progreso viejo se junta solo (`registrosPorConcepto`).
- **Formas nuevas de preguntar**: completar el hueco, escribir sin banco de palabras (tolera contracciones y un error de tipeo), hablar en voz alta (reconocimiento de voz, necesita internet en Chrome), ¿natural o calco?, oído fino con pares mínimos.
- **Camino**: nivel 0 a 5 por unidad, barras de aprendidos y fijados, cofre al ver la unidad completa y nivel legendario.
- **Motivación**: combo dentro de la lección, lección perfecta, vidas opcionales, misiones diarias con cofre, "Tú contra ti" (XP de esta semana contra la pasada) y Bit, el personaje de la app.
- **Contenido nuevo**: 47 historias (la serie de Ana), 24 roleplays, 199 calcos, 194 frases de trabajo y 40 pares mínimos.
- **Modos nuevos**: historias, roleplays, parejas contrarreloj, repaso mezclado y oído fino.
- **Peso**: los ítems de inglés se guardan compactos y se expanden al cargar (`expandirIngles`): 2,5 MB en total, todo disponible sin internet. Sin cambios en AWS.

## Plan v5 (2026-11-18): mejoras grandes a toda la app

Pedido de Angel: dejar de mejorar apartado por apartado y hacer cambios que atraviesen toda la app. Aceptó 14 mejoras, que se construyen por tandas (cada una queda publicada antes de empezar la siguiente):

1. **Cimientos**: sistema de diseño v2 y abrir al instante.
2. **Estructura**: una sola app (hoy la app local, la web grande y el celular muestran pantallas distintas), menú de 17 a 6 entradas y buscador global con Ctrl+K.
3. **El día**: una sola medida, una sola racha y una meta que cuente también el celular; sesión de hoy con una cola única de repaso.
4. **Contenido y avance**: el tema como centro (Aprender, Lecciones, Chuletas, Referencia y Glosario en una página por tema), ruta semana a semana hasta la fecha meta (2027-01-31) y Progreso nuevo, también en el celular.
5. **Acabado**: pantallas rehechas (Ejercicio como banco de trabajo, Inglés con el camino primero) y movimiento y respuesta en toda la app.
6. **Extras**: modo visita para reclutadores, entrevistas en un solo lugar y evaluación con IA en todos los textos libres (cuando haya clave).

Reglas: el progreso guardado no cambia (las medidas nuevas se calculan al leer), ningún recurso nuevo de AWS y captura de antes y después antes de publicar.

### Tanda 1, primera parte (2026-11-18)

- **Tokens completos** en `client/src/styles/tokens.css`: 8 tamaños de texto y 6 de título (`--letra-1..8`, `--titulo-1..6`; los títulos grandes se achican solos en el celular), pesos, radios, sombras en tres alturas, duraciones y curvas de movimiento, capas y zona táctil mínima. Los 614 tamaños de letra, 233 pesos y 145 radios escritos a mano en 69 archivos CSS pasaron a usar tokens.
- **Tarjetas sólidas en tres alturas**: `--superficie`, `--superficie-2` y `--superficie-3` ahora son colores opacos, más `--hundido` para huecos dentro de una tarjeta y `--velo` para lo que va sobre un fondo de color.
- **Niveles de tarjeta** en `base.css`: `.tarjeta`, `.tarjeta-protagonista`, `.tarjeta-silenciosa` y `.tarjeta-hundida`, más `.chip` y `.etiqueta` globales. Se aplican a medida que se rehace cada pantalla.
- **Puntos de corte**: de 14 anchos distintos a 4 (600, 900, 1200 y 1600 px).
- **Tema claro**: el gris tenue ya pasa el contraste AA, el confeti toma los colores del tema y la barra del sistema cambia de color con el tema.
- **Accesibilidad**: pestañas con flechas, Inicio y Fin; botones de 44 px de alto con el dedo; las animaciones se apagan en toda la app si el sistema pide menos movimiento.
- **Abrir al instante**: cada pantalla se descarga cuando se abre (`client/src/lib/perezoso.js`). El primer archivo de la web bajó de 1.621 KB a 493 KB (de 520 a 162 KB comprimido). Sin internet abre igual: el service worker guarda todos los trozos.

### Tanda 2, primera parte (2026-11-18): menú de 6 y buscador

- **Una sola definición de navegación** en `client/src/lib/navegacion.js`: 6 secciones (Hoy, Aprender, Practicar, Inglés, Conseguir trabajo, Progreso), cada una con sus destinos. La usan la barra lateral, la barra del celular, las pastillas de sección y el buscador.
- **Barra lateral**: de 17 entradas a 6. La sección en la que estás despliega sus destinos (en Aprender: Temas, Lecciones, Chuletas, Referencia y Glosario). Arriba, el botón Buscar; abajo, Modo enfoque, Ajustes y el tema.
- **Celular**: barra de abajo con las 6 secciones (antes 5, con un menú "Más" de 9 opciones, que ya no existe), barra de arriba con la lupa y los ajustes, y pastillas con los destinos de la sección (`components/SubNav.jsx`, dentro de `CabeceraPagina`). Progreso ya abre en el celular.
- **Buscador global** (`components/Paleta.jsx`, lógica y tests en `lib/paleta.js`): Ctrl+K o la lupa. Busca en temas, ejercicios, referencia, glosario, preguntas de entrevista y acciones, sin tildes y exigiendo todas las palabras. Flechas y Enter para ir.
- **Pestañas en la dirección** (`hooks/usePestanaUrl.js`): Entrevistas, Trabajo, Tema y Mapache guardan la pestaña en `?pestana=`, así se puede enlazar y recargar. `/entrevistas?pregunta=ent-031` abre una pregunta sola y `/glosario?q=closure` llega filtrado.
- La lista de rutas de la web ya no está copiada dos veces.

Pendiente de la tanda 2: unir las tres versiones de Ajustes y que la app local (`localhost:4321`) muestre exactamente la misma web. Inicio + Hoy y las dos versiones de Ejercicio se unen cuando se rehagan esas pantallas (tandas 3 y 5).

### Tanda 2, segunda parte (2026-11-18): una sola pantalla de Ajustes y un solo punto de entrada

- **Ajustes es una sola pantalla** (`pages/Ajustes.jsx`) en la laptop, la web y el celular; antes había tres con campos distintos. En el celular ya se pueden cambiar la meta diaria, el tope de deuda y la fecha meta, y está Empezar de cero. En pantallas anchas las secciones van en dos columnas.
- **El acceso directo abre la versión web** si existe `data/abrir-web.txt` con su dirección (`scripts/abrir.ps1`). Es la misma app conectada al motor, así que ya no hay que elegir entre la interfaz local y la web. Sin ese archivo se abre la interfaz local de siempre.

### Tanda 3, primera parte (2026-11-18): una sola medida y una sola racha

- **Puntos de estudio** (`server/puntos.js`): una sola tabla dice cuánto vale cada cosa que haces, en la laptop y en el celular. Un ejercicio resuelto da 25; una lección, 8 (máximo 3 al día); un quiz, 5; 10 tarjetas de entrevista, 5. Lo fácil de repetir tiene máximo diario para que la meta no se cumpla solo con eso. Se calculan al leer los contadores de cada día: no se guarda nada nuevo ni cambia la sincronización.
- **La meta diaria, la deuda y la racha se miden en puntos** (`server/metricas.js`). El número de Ajustes sigue siendo el mismo, pero ahora son unidades de 25 puntos (meta 2 = 50 puntos). Con horario, la meta de cada día se reparte de 5 en 5 puntos.
- **Una sola racha** en toda la app: días seguidos cumpliendo la meta. Se quitó la racha aparte del celular. La de inglés es una sola (la misma en Inglés y en el mapache) y se sigue llamando racha de inglés.
- **Tiempo libre**: 1 punto = 1 minuto, con la misma tabla. Se agregaron el ejercicio estudiado sin tests y el quiz.
- **El calendario y la semana ven todo**: cuentan los puntos y los minutos de inglés y de lecciones, no solo los ejercicios de la laptop.
- Los avisos al celular hablan en puntos (`server/avisos.js`; la Lambda se actualiza con `npm run aws:crear`).

### Tanda 3, segunda parte (2026-11-18): sesión de hoy y una sola pantalla Hoy

- **Sesión de hoy** (`server/sesion.js`, con tests): una sola lista ordenada de lo que conviene hacer, primero lo que toca repasar (preguntas de lección, tarjetas de entrevista y ejercicios que vencen hoy) y después lo nuevo (inglés, tu siguiente lección y tu siguiente ejercicio). Cada paso dice cuántos puntos da y cuánto tarda, y hay un único "siguiente". Reemplaza al mazo de Inicio, a la lista del celular y al plan de hoy.
- **Hoy es una sola pantalla** (`pages/Hoy.jsx`) en la laptop, la web y el celular; antes eran Inicio y Hoy, con bloques distintos. Tiene un bloque protagonista (la sesión, con el botón Empezar), cuatro números (puntos de hoy en el tanque, racha, días para la fecha meta en el tablero de fichas y preparación), el tiempo libre y la semana.
- **Lo demás se mudó a Progreso**: tu nivel e insignias y el día en números. El plan y el reto de la semana ya estaban en Progreso y Practicar.
- Se quitaron los efectos que ya no se usan (rejilla de puntos, borde eléctrico, partículas, mazo de cartas).

### Tanda 4 (2026-11-18): ruta, tema como centro y Progreso

- **Ruta hasta la fecha meta** (`server/ruta.js`, con tests; `components/Ruta.jsx`): las semanas que quedan, de lunes a domingo, con las unidades que tocan en cada una. Las dos últimas se reservan para el proyecto y para postular. Una unidad cuenta como lista cuando llega a amarillo en el mapa de dominio. "Vas al día", "adelantado" o "atrasado" sale de comparar tus unidades listas con las que tocaría llevar a ritmo parejo; antes salía de dividir los 390 ejercicios entre los días restantes y siempre daba atrasado. Si te atrasas, lo pendiente se reparte solo entre las semanas que quedan; una semana de exámenes no recibe unidades, y avisa si el ritmo pasa de 5 unidades por semana. La fecha meta quedó en 2027-01-31.
- **El tema como centro** (`pages/Tema.jsx`, `api.centroDelTema`): la página de cada tema reúne en pestañas su teoría con chuleta, sus lecciones, sus ejercicios guiados más los demás ejercicios de Practicar del mismo tema, su quiz y "Para la entrevista" (términos del Glosario, métodos de la Referencia y las preguntas de Entrevistas que lo tocan, elegidas por palabras clave en `server/centro-tema.js`). Arriba, cuánto dominas el tema y qué te falta para ponerlo en verde.
- **Aprender es un mapa**: cada tema muestra su porcentaje de dominio con un símbolo y una barra de color.
- **Progreso**: un solo "cuánto dominas" (el promedio del mapa: ejercicios, lecciones y quiz), igual en Hoy y en Progreso; la ruta completa; y los puntos de la semana. Lecciones, Chuletas, Referencia y Glosario siguen existiendo como vistas de consulta de todos los temas a la vez.

### Tanda 5 (2026-11-18): pantallas más cortas y la misma respuesta en toda la app

- **Practicar** muestra un área a la vez (JavaScript, Algoritmos, React, TypeScript, Node), elegida con un selector que queda en la dirección (`?area=react`); antes eran las cinco una debajo de otra.
- **Inglés**: la rutina de hoy subió junto al resumen, así el camino se ve sin bajar.
- **Estados de carga**: Postulaciones, CV, Portafolio, Pruebas, Insignias y Pitch muestran la silueta de la pantalla mientras cargan (antes quedaban en blanco) y los mensajes de error ya no hablan de `iniciar.bat` en la web.
- **Una sola respuesta** (`lib/feedback.js`): acierto, fallo, toque y logro suenan y vibran igual en lecciones, historias, parejas y el quiz de cada tema (que antes no hacía nada). Terminar un simulacro o un quiz perfecto se celebra.
- **Transición con sentido**: al abrir un tema desde Aprender, su título viaja de la tarjeta al encabezado de la página (View Transitions del navegador).
- **Cierre de sesión**: al terminar la sesión de hoy, Hoy resume los puntos, los minutos y la racha.
- La pantalla de Ejercicio con tests ya tenía dos columnas (enunciado y tests en vivo), así que no se rehízo; sus dos versiones siguen separadas por lo que cada una puede hacer (con tests en la laptop, modo estudio sin ella).

### Tanda 6 (2026-11-18): modo visita y entrevistas en un solo lugar

- **Modo visita** (`lib/visita.js`, `movil/Visita.jsx`): con `?visita=1` en la dirección, quien entra a ver el proyecto encuentra la app llena con un progreso de ejemplo (cinco semanas de estudio, racha, unidades dominadas y a medias, repasos para hoy) y una presentación corta con qué mirar, con qué está hecha y el enlace al código. Tres garantías: el progreso de ejemplo vive en memoria y no lee ni toca el progreso real; no sincroniza ni se conecta al motor de la laptop (no llama a AWS); y al salir o cerrar la pestaña no queda nada. Dirección para compartir: https://dev-prep.angel-isasi.com/?visita=1
- **Entrevistas en un solo lugar**: la pestaña "Por etapa" de Entrevistas ordena todo según el proceso real (recursos humanos, técnica, proyecto y cierre). Cada etapa junta sus mazos de tarjetas con tu avance y los enlaces a lo que estaba repartido en otras secciones: pitch y STAR, roleplays y entrevista en inglés, preguntas reales de tus postulaciones, retos con tests, Lee y predice, Glosario y portafolio.
- Pendiente: la evaluación con IA en todos los textos libres. Se construye cuando esté puesta la clave (ver `docs/ia.md`), porque no se puede probar sin ella.

## Plan v6 (2026-11-19): la IA como tutor en toda la app

Aprobado por Angel. Regla: el algoritmo calcula, la IA explica, corrige y genera. Modelos: Haiku para lo repetido y acotado, Sonnet para lo que necesita criterio. Gasto estimado: unos 20 USD al mes con uso intenso (subir en la consola Default a 25 y la organización a 27).

Tandas (cada una publicada y usable):
1. Base y Practicar: memoria del tutor (perfil corto que acompaña cada pedido), pista personalizada, ¿Por qué falla?, comparar con la solución oficial (dentro de la revisión de senior), variantes, detecta el error, di la complejidad, code review al revés, ¿qué imprime este código?
2. Aprender y repaso: explícamelo distinto, quiz de tus fallos, explícalo en 30 segundos por voz, unidad de Algoritmos (8 lecciones), 60 retos por patrón, Anki (FSRS sin IA; la IA crea tarjetas de tus errores con aprobación, explica al fallar, reformula la pregunta, sugiere el botón y da ejemplos en contexto; tope diario de nuevas y repasos, una tarjeta a la vez), detector diario de puntos débiles, plan y resumen de la semana con su horario de la universidad.
3. Entrevistas y trabajo: repregunta sobre tu código, entrevistador con personalidad, preguntas para el entrevistador, prueba técnica para llevar a casa, defiende tu proyecto (empezando con dev-prep), examen mensual de preparación, adaptar perfil a una oferta, revisar CV, ensayo de negociación de sueldo, proyecto guiado de portafolio.
4. Inglés: explícalo en inglés, daily en inglés, entrevistas técnicas en inglés, entrevistas en inglés con ayudas que se van quitando, ¿cómo se dice?, inglés escrito guiado, tus errores de siempre con mini lecciones, simulador de reuniones, 200 frases nuevas de Map sin repetirse, modo inmersión (solo la interfaz en inglés, sin IA).

Fuera por ahora: carta para postular, diario de entrevistas reales, pronunciación técnica, primer día en la empresa, leer documentación.
Tanda 0 (probar con IA real lo existente) la hace Angel después.
