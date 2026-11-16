# Tablero de estudio

Vas a construir, de a poco, una app React para organizar lo que estudias: tareas como "Repasar closures" o "Maquetar una tarjeta con Flexbox", cada una con su tema y su estado (pendiente o hecha).

## Qué vas a construir

Al final de las 9 etapas tu tablero va a:

- Mostrar tus tareas en una lista hecha con componentes.
- Marcar tareas como hechas y mostrar un resumen ("3 de 5 hechas").
- Crear tareas con un formulario que valida lo que escribes.
- Cargar las tareas desde una API (falsa, en `src/api.js`), con mensajes de carga y de error, y un botón para reintentar.
- Crear, editar y borrar contra la API, avisando si algo falla.
- Filtrar por estado (todas, pendientes, hechas) y buscar por título o tema.
- Tener la lógica de datos en un hook propio, `useTasks`.
- Recordar tus preferencias con `localStorage` y llevar una racha de días seguidos estudiando.
- Ser accesible: nombres claros para el lector de pantalla, foco bien manejado y anuncios de lo que pasa.

## Por qué es un buen proyecto de portafolio

Es pequeño de entender, pero toca casi todo lo que te preguntan en una entrevista de frontend junior:

- **Componentes y props**: cómo dividir una pantalla en piezas reutilizables.
- **Estado y eventos**: estado inmutable, estado derivado y formularios controlados.
- **Datos asíncronos**: `useEffect`, promesas, estados de carga y error, y qué hacer cuando la red falla.
- **CRUD contra una API**: lo mismo que harás en cualquier trabajo real.
- **Hooks propios**: separar la lógica de la vista, algo que un reclutador técnico nota enseguida.
- **Persistencia y accesibilidad**: los detalles que separan un proyecto de tutorial de uno profesional.
- **Tests**: cada etapa tiene tests con Testing Library, así que puedes decir "mi proyecto tiene tests" y explicar cómo funcionan.

## Cómo trabajar

1. Abre el proyecto en VS Code. Tu código va en `src/`; la API falsa (`src/api.js`) y los datos (`src/data.js`) ya están listos.
2. Cada etapa desbloquea tests nuevos en `tests/`. Los tests de las etapas anteriores se siguen corriendo: no rompas lo que ya funcionaba.
3. Lee el enunciado de la etapa, programa y guarda: los tests corren solos.
4. Cuando termines las 9 etapas, súbelo a GitHub con un buen README y capturas. Ese es tu proyecto estrella.
