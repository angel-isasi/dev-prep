# Guía de contenido: pruebas técnicas, proyecto guiado y portafolio

Para conseguir trabajo: lo que las empresas piden a un junior de frontend. Todo en español neutro (tuteo, sin voseo), sin rayas largas; el código y los nombres técnicos en inglés como en un proyecto real.

Los proyectos se copian a `workspace/proyectos/<id>/`, dentro de dev-prep: usan sus `node_modules` (React 19, Vitest, Testing Library, jsdom). **No uses dependencias que no estén en el `package.json` de dev-prep**, ni `package.json` propios. Los tests de componentes llevan `// @vitest-environment jsdom` en la primera línea, como los ejercicios (`content/react/ejercicios/001-saludo/tests.test.jsx`). Importa con rutas relativas (`../src/App.jsx`).

## 1. Prueba técnica para casa: `content/pruebas/NN-slug/`

| Archivo | Contenido |
|---|---|
| `meta.json` | `{ "id": "prueba-01", "titulo", "horas": 3, "nivel": 2, "descripcion", "tecnologias": ["React", "fetch"] }` |
| `enunciado.md` | `## Contexto` (la empresa ficticia y para qué es), `## Requisitos` (lista con `- [ ]`), `## Lo que se valora`, `## Entrega` (qué entregar y cómo presentarlo) |
| `rubrica.json` | `[{ "criterio", "puntos", "descripcion" }]`, de 5 a 8 criterios que suman 100 (funciona, casos borde, código legible, componentes bien divididos, accesibilidad, estilos, README) |
| `inicio/` | Punto de partida: `src/` con los archivos a completar (con comentarios `// TODO`), datos o una API falsa en `src/api.js` (promesas con `setTimeout` cortos), `README.md` del candidato y `tests/*.test.jsx` (tests de aceptación que el candidato ve) |
| `solucion/` | Solo los archivos que cambian respecto de `inicio/`, con la solución completa |

- Duración real de 2 a 4 horas. Lo que de verdad mandan: lista con búsqueda y filtros que consume una API, formulario con validación, carrito o checkout, tablero con estados de carga y error.
- Al menos 6 tests de aceptación que prueban comportamiento visible (Testing Library: `screen.getByRole`, `findByText` y `@testing-library/user-event`).
- El punto de partida no pasa los tests y `inicio` + `solucion` los pasa todos.

## 2. Proyecto guiado por etapas: `content/proyectos/NN-slug/`

| Archivo | Contenido |
|---|---|
| `meta.json` | `{ "id": "proyecto-tablero", "titulo", "descripcion", "tecnologias" }` |
| `enunciado.md` | Qué vas a construir y por qué es un buen proyecto de portafolio |
| `inicio/` | Esqueleto del proyecto (`src/main.jsx`, `src/App.jsx` vacío, `index.html`, `README.md`) |
| `etapas/NN-slug/meta.json` | `{ "titulo", "objetivo" }` |
| `etapas/NN-slug/enunciado.md` | Qué hacer en esta etapa, conceptos que practica y 2 pistas |
| `etapas/NN-slug/tests/*.test.jsx` | Tests nuevos de esta etapa (se suman a los anteriores) |
| `etapas/NN-slug/solucion/` | Archivos de la solución acumulada hasta esta etapa |

- Las etapas van de simple a completo, y cada una suma tests sin romper los anteriores: la solución de la etapa N pasa los tests de las etapas 1 a N.

## 3. Portafolio: `content/portafolio/<id-del-ejercicio>.json`

```json
{ "ejercicio": "react-ej-012", "titulo": "Buscador de pizzas", "descripcion": "Un párrafo para el README: qué hace y qué demuestra.",
  "aprendido": ["Estado controlado", "Filtrar sin mutar"], "demo": "import { Buscador } from \"./Buscador.jsx\";\n\nexport default function App() {\n  return <Buscador pizzas={[...]} />;\n}" }
```

- `demo` es el `App.jsx` del mini proyecto: usa el componente del ejercicio con datos de ejemplo realistas, importándolo desde `./<Nombre>.jsx` (el nombre del componente exportado en la solución).
- Solo ejercicios de `react/ejercicios`, `react/mixtos` o `react/retos` que sean componentes visibles e interesantes de mostrar (buscador, modal, carrito, formulario, lista con datos, tres en raya).

## Verificación

`npm run validar:proyectos` (o `-- prueba-01` para uno): el inicio no pasa, la solución sí; en el proyecto guiado, cada etapa con su solución acumulada pasa todos sus tests.
