# Etapa 2: estado, marcar como hecha

Ahora las tareas cambian: quieres marcarlas como hechas y ver cuántas llevas.

## Qué hacer

1. En `TaskItem`, agrega una casilla (`<input type="checkbox">`) dentro de un `<label>` junto con el título, para que el nombre accesible de la casilla sea el título de la tarea.
   - La casilla está marcada si `task.done` es `true` (`checked={task.done}`).
   - Al cambiarla llama a la nueva prop `onToggle(task.id)`.
2. `TaskList` recibe `onToggle` y se lo pasa a cada `TaskItem`.
3. Crea `src/components/Summary.jsx` y exporta `Summary({ tasks })`: un párrafo con el texto `N de M hechas` (por ejemplo `1 de 2 hechas`).
4. En `App`, guarda las tareas en el estado (`useState(initialTasks)`), escribe `toggleTask(id)` que cambia `done` de esa tarea **sin mutar** el arreglo, y muestra `<Summary tasks={tasks} />` arriba de la lista.

## Conceptos que practicas

- `useState` y por qué el estado vive en el componente que lo necesita compartir (App).
- Actualizar arreglos sin mutar: `map` que devuelve un objeto nuevo solo para la tarea cambiada.
- Pasar funciones como props ("levantar el estado").
- Estado derivado: el resumen se calcula en cada render, no se guarda aparte.

## Pistas

1. `setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))`. Usar la forma con función (`prev`) evita errores cuando hay varias actualizaciones seguidas.
2. No guardes "cuántas hechas" en otro `useState`: calcúlalo en `Summary` con `tasks.filter((t) => t.done).length`. Si lo guardas aparte, tarde o temprano se desincroniza.
