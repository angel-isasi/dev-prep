// Una tarea. No guarda estado: avisa hacia arriba con onToggle.
export function TaskItem({ task, onToggle }) {
  return (
    <li className={task.done ? "task task--done" : "task"}>
      {/* El label envuelve la casilla: su nombre accesible es el título */}
      <label className="task__main">
        <input type="checkbox" checked={task.done} onChange={() => onToggle?.(task.id)} />
        <span className="task__title">{task.title}</span>
      </label>
      <span className="task__topic">{task.topic}</span>
    </li>
  );
}
