# Guía para crear contenido de TypeScript, Node.js y SQL

Guía común para quien cree ejercicios o temas nuevos de estas áreas en dev-prep. Léela entera antes de empezar.

## Contexto

dev-prep es una app local (Windows, sin internet) para que Angel, estudiante de Ingeniería de Sistemas en Perú, se prepare para su primer trabajo de frontend junior. La app es su **única fuente de consulta**: sin MDN ni Google. Por eso la explicación importa tanto como el código.

Antes de escribir, lee:
- `docs/plan.md`, secciones "Estándar de calidad del contenido" y "Ampliación del stack".
- Un ejercicio completo de ejemplo: `content/algoritmos/retos/016-longest-substring-without-repeating/` (los 7 archivos). El tono, la profundidad y el largo de la explicación deben ser parecidos.
- `server/contenido.js` (`SECCIONES_EXPLICACION`, `EXTENSION`, `revisarEjercicio`).

## Idioma y estilo

- Español de Perú con tuteo neutro (tú, sin voseo). Títulos y textos en español; nombres de funciones, tipos y variables en español (`calcularTotal`, `Usuario`, `Pedido`), salvo términos técnicos que se usan en inglés (`id`, `email`).
- **Nunca uses la raya larga (—)** en ningún texto: usa dos puntos o comas.
- Crea cada archivo con la herramienta **Write** y rutas absolutas. No uses heredocs de bash: las barras invertidas se rompen.

## Estructura de un ejercicio (7 archivos)

`content/<area>/<coleccion>/<NNN-slug>/`:
- `meta.json`: `{ "id", "titulo", "tipo", "tema", "nivel", "tags" }` (sin "origen").
- `enunciado.md`: qué hacer, reglas y ejemplos en bloque de código (como el ejemplo 016).
- `inicio.<ext>`: comentario con título, qué hacer, un ejemplo, la línea "Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app." y el esqueleto con `// Tu código aquí`. **No debe pasar todos los tests.**
- `solucion.<ext>`: la solución oficial, comentada donde ayude.
- `tests.test.<ext>`: entre 5 y 8 tests, nombres descriptivos en español. Sin tests de rendimiento ni entradas gigantes.
- `pistas.json`: exactamente 3 pistas: 1) hacia dónde mirar, 2) qué herramienta usar, 3) esqueleto sin completar.
- `explicacion.md`: exactamente las 7 secciones `## ` de `SECCIONES_EXPLICACION`, con esos títulos y en ese orden (Idea clave, Paso a paso, Por qué funciona, Errores comunes, Otra forma de resolverlo, Cómo explicarlo en la entrevista, Conceptos). "Cómo explicarlo en la entrevista" va como cita `>`.

## TypeScript

- `tipo`: `"funcion-ts"` (archivos `.ts`) o `"componente-ts"` (archivos `.tsx`, React).
- Los tests importan **sin extensión**: `import { calcularTotal } from "./solucion";` (así funciona tanto en Vitest como en tsc).
- **Los tipos se revisan solos**: después de los tests, la app corre `tsc` en modo estricto sobre `solucion.ts` y `tests.test.ts` y agrega el caso "Tus tipos compilan sin errores (tsc)" (ver `server/tipos.js`). Opciones: strict, target es2022, module esnext, moduleResolution bundler, jsx react-jsx, lib es2023 + dom.
- Por eso en los tests puedes comprobar **tipos**, no solo valores:
  - `expectTypeOf(valor).toEqualTypeOf<Usuario>()` (de `vitest`): en tiempo de ejecución no hace nada, pero tsc lo revisa.
  - `// @ts-expect-error` sobre una línea que DEBE dar error de tipos (por ejemplo, llamar con un argumento inválido). Si tu solución tipa mal y esa línea deja de dar error, tsc falla con "Directiva @ts-expect-error no usada".
  - Asignaciones tipadas: `const r: number = sumar(1, 2);`.
- Envuelve las líneas con `@ts-expect-error` dentro de una función que no se ejecute o en un test que no las llame realmente, para que no rompan en tiempo de ejecución, por ejemplo:
  ```ts
  test("no acepta un estado inventado (lo revisa tsc)", () => {
    const probar = () => {
      // @ts-expect-error "enviado-al-espacio" no es un EstadoPedido
      mensajeDeEstado("enviado-al-espacio");
    };
    expect(typeof probar).toBe("function");
  });
  ```
- El `inicio.ts` declara los tipos que el estudiante debe completar o la firma de la función con su tipo de retorno, y el cuerpo vacío. Puede tener tipos `any` o `unknown` a reemplazar si el ejercicio trata de tipar.
- Componentes (`.tsx`): mira `content/react/retos/001-contador-con-limites/` (comentario `// @vitest-environment jsdom` en la primera línea de los tests, `@testing-library/react`). Tipa las props con `type` o `interface`.
- Valida la solución oficial con `npm run validar -- <filtro>`: debe pasar todos los tests **y** el caso de tsc.

## Node.js y SQL

- `tipo`: `"funcion"` (archivos `.js`, ESM con `import`/`export`). Los tests corren en Node (sin jsdom).
- **APIs con Express**: el estudiante exporta una función `crearApp()` que devuelve la app de Express **sin** llamar a `listen`. Los tests la levantan en un puerto libre y le hacen peticiones con `fetch`:
  ```js
  import { test, expect, beforeAll, afterAll } from "vitest";
  import { crearApp } from "./solucion.js";

  let servidor, url;
  beforeAll(() => {
    servidor = crearApp().listen(0);
    url = `http://127.0.0.1:${servidor.address().port}`;
  });
  afterAll(() => servidor.close());

  test("GET /productos devuelve la lista", async () => {
    const r = await fetch(`${url}/productos`);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual([...]);
  });
  ```
  Si un ejercicio guarda datos en memoria, que `crearApp()` cree datos nuevos cada vez, para que los tests no se contaminen.
- **SQL**: usa `node:sqlite` (viene con Node 24, sin instalar nada): `import { DatabaseSync } from "node:sqlite";`. Base en memoria (`new DatabaseSync(":memory:")`). El patrón recomendado: el test crea la base con tablas y datos, y el estudiante escribe una función que recibe `db` y devuelve el resultado de su consulta (`db.prepare(sql).all(...)`). Enseña siempre parámetros `?` en vez de concatenar texto (inyección SQL).
- **Archivos (`fs`)**: trabaja en una carpeta temporal creada por el test (`fs.mkdtemp` en `os.tmpdir()`) y bórrala al final.
- Valida con `npm run validar -- <filtro>`.

## Temas de Aprender

Carpeta `content/aprender/<id-carpeta>/` con `meta.json`, `teoria.md` y `quiz.json`. Lee como ejemplo `content/aprender/04-arrays/` y `content/aprender/react-01-jsx-y-componentes/`, y `server/aprender.js` (`revisarTema`) para las reglas.
- `meta.json`: `{ "id", "titulo", "area": "typescript" o "node", "orden", "descripcion", "ejercicios": [3 a 5 ids que existan] }`.
- `teoria.md`: las mismas secciones que los temas existentes (En una frase, Lo esencial con subsecciones y ejemplos, Errores típicos, Chuleta, En la entrevista). Máximo lo que entra en una pantalla y media.
- `quiz.json`: 5 o más preguntas de opción múltiple con `pregunta`, `opciones`, `correcta` (índice) y `explicacion`.
- Valida con `npm run validar:aprender`.

## Reglas de trabajo

- No toques archivos fuera de tus carpetas asignadas. Otros agentes trabajan en paralelo en otras carpetas.
- No corras `npm run build`, no reinicies el servidor y no hagas commits.
- Termina con un reporte corto: qué creaste y la salida final del validador.
