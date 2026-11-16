# Guía de contenido: Inglés

La sección Inglés lleva a Angel desde lo básico hasta un inglés de trabajo para conseguir empleo como desarrollador frontend. Es para un hispanohablante de Perú: las explicaciones van en español neutro (tuteo, sin voseo) y lo que se aprende va en inglés estadounidense.

## Etapas

| Etapa | Carpeta | Nivel | Meta |
|---|---|---|---|
| Base | `content/ingles/basico/` | A1 a A2 | Entender y armar frases simples, presentarte, hablar de tu rutina y de tu pasado |
| Intermedio | `content/ingles/intermedio/` | B1 | Contar tu experiencia, leer documentación, escribir mensajes de trabajo |
| Trabajo | `content/ingles/trabajo/` | B1 alto a B2 | Entrevista completa, daily, revisión de código, conversación de equipo |

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
- `etapa`: `basico`, `intermedio` o `trabajo`.
- `nivel`: `A1`, `A2`, `B1` o `B2`.
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
