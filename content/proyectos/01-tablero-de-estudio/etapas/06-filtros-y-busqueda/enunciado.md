# Etapa 6: filtros y búsqueda

Con muchas tareas necesitas encontrar rápido lo que buscas. La lista y el filtro son el pan de cada día en las pruebas técnicas.

## Qué hacer

1. Crea `src/filters.js` con:
   - `FILTERS`: `[{ value: "all", label: "Todas" }, { value: "pending", label: "Pendientes" }, { value: "done", label: "Hechas" }]`.
   - `normalize(text)`: quita tildes, pasa a minúsculas y quita espacios de los extremos.
   - `filterTasks(tasks, filter, query)`: devuelve las tareas que cumplen el filtro de estado **y** cuyo título o tema contienen la búsqueda (comparando ya normalizado). Con la búsqueda vacía no filtra por texto.
2. Crea `src/components/FilterBar.jsx` con `FilterBar({ filter, onFilterChange, query, onQueryChange })`:
   - Un botón por filtro, con su `label` como texto y `aria-pressed` en `true` solo para el activo.
   - Un campo `type="search"` con `aria-label="Buscar tareas"`.
3. En `App`, guarda `filter` (empieza en `"all"`) y `query` (empieza en `""`), muestra la barra y pasa a la lista `filterTasks(tasks, filter, query)`. El resumen sigue contando **todas** las tareas.
4. `TaskList` recibe una prop `emptyMessage` (por defecto `No hay tareas`). Si hay un filtro o una búsqueda activa y no queda nada, muestra `No hay tareas que coincidan`.

## Conceptos que practicas

- Estado derivado: la lista filtrada se calcula, no se guarda en otro estado.
- Funciones puras fáciles de probar (`filterTasks`).
- Normalizar texto con `normalize("NFD")` para ignorar tildes.
- `aria-pressed` para botones que funcionan como interruptores.

## Pistas

1. Para quitar tildes: `text.normalize("NFD").replace(/[̀-ͯ]/g, "")`. "Guía" queda como "Guia" y así "guia" la encuentra.
2. En `filterTasks`, descarta primero por estado (`if (filter === "done" && !task.done) return false;`) y luego mira el texto. Dos condiciones simples se leen mejor que una larga.
