# Guía de contenido: Inglés

La sección Inglés lleva a Angel desde lo básico hasta un inglés de trabajo para conseguir empleo como desarrollador frontend. Es para un hispanohablante de Perú: las explicaciones van en español neutro (tuteo, sin voseo) y lo que se aprende va en inglés estadounidense.

## Etapas

| Etapa | Carpeta | Nivel | Meta |
|---|---|---|---|
| Base | `content/ingles/basico/` | A1 a A2 | Entender y armar frases simples, presentarte, hablar de tu rutina y de tu pasado |
| Intermedio | `content/ingles/intermedio/` | B1 | Contar tu experiencia, leer documentación, escribir mensajes de trabajo |
| Trabajo | `content/ingles/trabajo/` | B1 alto a B2 | Entrevista completa, daily, revisión de código, conversación de equipo |
| Avanzado | `content/ingles/avanzado/` | B2 | Gramática general de B2 aplicada al trabajo: estilo indirecto, condicionales mixtos, relativos, gerundio o infinitivo, futuros, wish, pasado perfecto, modales de deducción |
| Superior | `content/ingles/superior/` | C1 | Matices y registro: inversión y énfasis, suavizar, participios, colocaciones, idioms de trabajo, negociar, escribir y presentar |
| Dominio | `content/ingles/dominio/` | C2 | (pendiente) Naturalidad casi nativa |

En C1 y C2 las frases pueden tener hasta 16 palabras y las palabras pueden ser expresiones o colocaciones completas.

**Examen de nivel** (`client/src/movil/ingles/examen.js`): toma los ejercicios de gramática, los calcos ("¿cuál suena natural?") y el significado de las palabras de cada unidad. Por eso cada unidad necesita ejercicios que de verdad midan su nivel.

## Una unidad

Cada unidad es una carpeta `NN-slug` dentro de su etapa, por ejemplo `content/ingles/basico/05-presente-simple/`. Archivos:

| Archivo | Obligatorio | Contenido |
|---|---|---|
| `meta.json` | sí | `{ "id", "titulo", "etapa", "orden", "nivel", "descripcion" }` |
| `teoria.md` | sí | Explicación corta en español (máximo una pantalla de celular por sección) |
| `palabras.json` | sí | Vocabulario de la unidad |
| `frases.json` | sí | Frases completas para traducir, armar y escuchar |
| `ejercicios.json` | no | Preguntas de opción múltiple de gramática o uso |
| `dialogos.json` | no | Diálogos cortos con preguntas de comprensión |

- `id`: `en-` + etapa + número, por ejemplo `en-basico-05`. Único en toda la sección.
- `etapa`: `basico`, `intermedio`, `trabajo`, `avanzado`, `superior` o `dominio`.
- `nivel`: `A1`, `A2`, `B1`, `B2`, `C1` o `C2`.
- `titulo` y `descripcion` en español, por ejemplo `"Presente simple"` y `"Hablar de rutinas y hechos: I work, she works, do you...?"`.

### `teoria.md`

Secciones `##` en este orden:
1. `## En una frase`: para qué sirve lo de esta unidad.
2. `## Cómo se forma`: la regla con una tabla o lista corta y ejemplos `inglés → español`.
3. `## Errores típicos`: los errores que comete un hispanohablante, con la forma incorrecta y la correcta (por ejemplo "I have 20 years" ✗ → "I am 20" ✓).
4. `## Pronunciación`: 2 a 4 notas de pronunciación de palabras de la unidad, escritas para un hispanohablante.

En las unidades solo de vocabulario, `## Cómo se forma` puede explicar cómo agrupar o recordar las palabras.

### `palabras.json`

```json
[
  { "id": "en-basico-05-w01", "en": "work", "es": "trabajar", "pron": "uérk", "tipo": "verbo",
    "ejemplo": { "en": "I work from home.", "es": "Trabajo desde casa." } }
]
```

- `pron`: pronunciación aproximada escrita con letras del español, con tilde en la sílaba fuerte (`computer` → `kompiúter`, `height` → `jáit`, `queue` → `kiú`).
- `tipo`: `sustantivo`, `verbo`, `adjetivo`, `adverbio`, `expresion`, `pronombre`, `preposicion`, `conector` o `numero`.
- Verbos irregulares: además `"formas": { "pasado": "went", "participio": "gone" }`.
- Una palabra no se repite en toda la sección (compara `en` sin mayúsculas). Si la necesitas en otra unidad, úsala en frases, no la vuelvas a listar.
- `es`: la traducción más común y corta. Si hay dos sentidos importantes, sepáralos con " / ".

### `frases.json`

```json
[
  { "id": "en-basico-05-f01", "en": "She works at a bank.", "es": "Ella trabaja en un banco." }
]
```

- Entre 4 y 12 palabras en inglés. Solo usan gramática de esta unidad o de las anteriores.
- `es` es una traducción natural, no palabra por palabra.
- Sin nombres propios raros: usa Ana, Luis, Carlos, María, Lima, Cusco, o nombres comunes en inglés (Tom, Sarah).
- Una sola forma correcta en inglés (evita frases que admitan dos órdenes o contracciones opcionales; usa siempre la contracción natural: `I'm`, `don't`, `it's`).

### `ejercicios.json`

```json
[
  { "id": "en-basico-05-e01", "pregunta": "She ___ at a bank.", "opciones": ["work", "works", "working", "is work"],
    "correcta": 1, "explicacion": "Con he, she e it el verbo lleva **-s** en presente simple: she works." }
]
```

- `pregunta` en markdown. Puede tener `___` para el hueco o ser una pregunta en español ("¿Cuál está bien escrita?").
- 3 o 4 opciones, una sola correcta, sin repetidas. La explicación dice por qué la correcta está bien y por qué falla la trampa más tentadora.

### `dialogos.json`

```json
[
  { "id": "en-basico-05-d01", "titulo": "En la oficina", "situacion": "Dos compañeros hablan un lunes.",
    "lineas": [ { "quien": "Tom", "en": "Do you work on Saturdays?", "es": "¿Trabajas los sábados?" } ],
    "preguntas": [ { "pregunta": "¿Qué días trabaja Ana?", "opciones": ["...", "...", "..."], "correcta": 0, "explicacion": "..." } ] }
]
```

- 4 a 8 líneas, dos personas. En la etapa básica, frases cortas y lentas.
- 2 o 3 preguntas de comprensión en español sobre el contenido (no sobre gramática).

## Cantidades por unidad (etapa básica)

- `palabras.json`: 50 a 70 palabras (las unidades de tecnología: 90 a 110).
- `frases.json`: 25 a 35.
- `ejercicios.json`: 10 a 15 (en unidades de vocabulario puede faltar).
- `dialogos.json`: 2.

## Calidad

- Inglés correcto y natural de Estados Unidos; nada inventado ni literal del español.
- Vocabulario útil para la vida diaria y para trabajar en tecnología, priorizando las palabras más frecuentes del idioma.
- Nada de rayas largas en los textos en español; usa dos puntos o comas.
- Valida con `npm run validar:ingles` (forma, ids únicos, opciones sin repetir, una sola respuesta, palabras sin repetir).

## Archivos extra (opcionales) para lecciones más variadas

### `historia.json`: una historia corta por unidad (estilo "Stories")

```json
[
  { "id": "en-basico-10-h01", "titulo": "Un bug en la línea 12", "situacion": "Ana empieza su primer día en una startup.",
    "pasos": [
      { "quien": "Tom", "en": "Welcome, Ana! There's a desk for you near the window.", "es": "¡Bienvenida, Ana! Hay un escritorio para ti cerca de la ventana." },
      { "tipo": "pregunta", "pregunta": "¿Dónde está el escritorio de Ana?", "opciones": ["Cerca de la ventana", "En la cocina", "No hay escritorio"], "correcta": 0, "explicacion": "Tom dice \"near the window\"." },
      { "tipo": "completa", "quien": "Ana", "en": "Thanks! Are ___ any laptops for the team?", "opciones": ["there", "they", "their"], "correcta": 0, "explicacion": "Pregunta con **are there**: ¿hay...?" }
    ] }
]
```

- Personajes fijos en toda la sección: **Ana** (desarrolladora junior de Lima, la protagonista), **Tom** (tech lead, Estados Unidos), **Sarah** (compañera frontend), **Luis** (amigo de Ana). Así las historias forman una serie: Ana estudia, postula, entra a trabajar y crece.
- 8 a 14 líneas de diálogo con 3 a 5 pasos de `pregunta` (comprensión, en español) o `completa` (la línea tiene `___` y opciones en inglés) intercalados. Solo gramática de la unidad y anteriores.
- Al menos una línea con tema de trabajo en tecnología.

### `roleplay.json`: conversación guiada donde tú eliges qué decir

```json
[
  { "id": "en-trabajo-08-r01", "titulo": "Tu primer daily", "situacion": "Tom te pregunta en qué estás trabajando.", "tu": "Ana",
    "turnos": [
      { "quien": "Tom", "en": "Morning, Ana! What did you work on yesterday?", "es": "¡Buenos días, Ana! ¿En qué trabajaste ayer?" },
      { "opciones": [
          { "en": "Yesterday I fixed the login bug.", "es": "Ayer arreglé el bug del login.", "correcta": true, "explicacion": "Pasado simple y directo: así se habla en un daily." },
          { "en": "Yesterday I have fixed the login bug.", "es": "", "correcta": false, "explicacion": "Con *yesterday* va pasado simple (fixed), no presente perfecto." },
          { "en": "I am fix the login bug yesterday.", "es": "", "correcta": false, "explicacion": "Mezcla de tiempos: es *I fixed*." }
        ] },
      { "quien": "Tom", "en": "Great. Any blockers?", "es": "Genial. ¿Algún bloqueo?" }
    ] }
]
```

- 3 a 6 turnos tuyos (`opciones`, 3 cada uno, una sola `correcta: true`), alternados con líneas del otro personaje. `es` solo hace falta en la opción correcta.
- Las incorrectas son errores típicos de hispanohablantes o respuestas fuera de lugar (demasiado informales, que no responden lo que se preguntó).

### `calcos.json`: ¿natural o traducido del español?

```json
[
  { "id": "en-basico-02-c01", "es": "Tengo 20 años.", "natural": "I'm 20 years old.", "calco": "I have 20 years.",
    "explicacion": "La edad va con **to be**: *I'm 20*. *Have* es el calco de \"tener\"." }
]
```

- 3 a 5 por unidad, solo de lo que se ve en esa unidad o antes. Errores reales que comete un hispanohablante.

### `pares.json` (solo en `basico/22-sonidos-dificiles-para-hispanohablantes`): pares mínimos

```json
[
  { "id": "en-basico-22-p01", "a": "ship", "aEs": "barco", "b": "sheep", "bEs": "oveja", "sonido": "i corta / i larga",
    "nota": "**ship** es una i corta y relajada; **sheep** es una i larga, como sonriendo." }
]
```

- Palabras reales y frecuentes, las dos con significado. 30 a 40 pares de los contrastes difíciles: i/ii, a/e (bad/bed), b/v, s/z, sh/ch, th/t, th/d, final consonante (cap/cab), vocales con r.

### Frases de trabajo en `frases.json`

Una frase puede llevar `"trabajo": true` cuando usa la gramática de la unidad en una situación de trabajo en tecnología (por ejemplo, en *there is / there are*: "There's a bug in line 12."). En las etapas básica e intermedia, cada unidad tiene 4 a 6.
