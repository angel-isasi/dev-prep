# Kallpa Studio: tablero kanban

Prueba técnica para el puesto de **Desarrollador Frontend Junior**. Tiempo estimado: 4 horas.

Lee primero el enunciado completo: ahí están los textos exactos, las reglas de los títulos y adónde va el foco después de cada acción. Al terminar, reemplaza la sección "Mis decisiones" con lo tuyo.

## Cómo correrlo

El proyecto usa las dependencias de dev-prep (React 19, Vite, Vitest y Testing Library), así que no hace falta `npm install`.

Desde esta carpeta, en una terminal:

```bash
npx vitest        # corre los tests y los repite cada vez que guardas
npx vite          # levanta la app en http://localhost:5173
```

## Qué hay en la carpeta

```
src/
  data.js                      tareas de ejemplo (no lo modifiques)
  lib/board.js                 COLUMNS y normalize (hechos); reducer, reglas y contador (TODO)
  hooks/useBoard.js            une el reducer con la validación (TODO)
  components/NewTaskForm.jsx   crear tarea (TODO)
  components/SearchBox.jsx     buscador (TODO)
  components/Column.jsx        una columna con su contador (TODO)
  components/TaskCard.jsx      una tarjeta: mover, editar y borrar (TODO)
  components/ConfirmDialog.jsx diálogo de confirmación accesible (TODO)
  App.jsx, main.jsx, styles.css
tests/
  kanban.test.jsx              tests de aceptación: tu entrega debe pasarlos todos
```

## Sugerencia de orden

1. `lib/board.js`: `boardReducer`, `getMoves`, `validateTitle`, `matchesQuery` y `countLabel`. Son funciones puras: piensa los casos antes de escribir.
2. `hooks/useBoard.js`, `Column` y `TaskCard` sin edición: que se vean las columnas y se puedan mover las tareas.
3. `NewTaskForm` con sus errores.
4. La edición dentro de `TaskCard`.
5. `ConfirmDialog` y el borrado.
6. `SearchBox` y el contador con filtro.
7. El foco y los anuncios. Prueba todo solo con el teclado.
8. Estilos y este README.

## Mis decisiones

- (Escribe aquí qué decidiste y por qué.)

## Qué mejoraría con más tiempo

- (Escribe aquí.)
