# Etapa 1: lista de tareas con componentes

Tu tablero empieza mostrando las tareas de `src/data.js` (`initialTasks`). Cada tarea tiene `id`, `title`, `topic` y `done`.

## Qué hacer

1. Crea `src/components/TaskItem.jsx` y exporta `TaskItem({ task })`: un `<li>` con el título y el tema de la tarea, cada uno en su propio elemento (por ejemplo, dos `<span>`).
   - Si la tarea está hecha (`done: true`), el `<li>` lleva la clase `task--done` (además de `task`).
2. Crea `src/components/TaskList.jsx` y exporta `TaskList({ tasks })`: un `<ul>` con un `TaskItem` por tarea.
   - Si `tasks` está vacío, en lugar de la lista muestra un párrafo con el texto exacto `No hay tareas`.
3. En `src/App.jsx` (exportado por defecto) deja el `<h1>` "Tablero de estudio" y debajo muestra `<TaskList tasks={initialTasks} />`.

## Conceptos que practicas

- Componentes de función y props.
- Renderizar listas con `map` y la prop `key` (usa `task.id`, no el índice).
- Renderizado condicional (lista o mensaje vacío).
- Clases condicionales con un ternario.

## Pistas

1. En `TaskList`, revisa primero el caso vacío con un `if (tasks.length === 0) return ...;` y luego devuelve el `<ul>`. Así el código se lee de arriba abajo sin ternarios anidados.
2. Para la clase: `className={task.done ? "task task--done" : "task"}`. Los estilos de `styles.css` ya tachan el título de las tareas hechas.
