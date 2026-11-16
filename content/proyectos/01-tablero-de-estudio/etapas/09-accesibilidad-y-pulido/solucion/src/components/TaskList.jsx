import { TaskItem } from "./TaskItem.jsx";

/** labelledBy: id del título que le da nombre a la lista (así el lector dice "lista Mis tareas, 3 elementos"). */
export function TaskList({ tasks, onToggle, onEdit, onDelete, emptyMessage = "No hay tareas", labelledBy }) {
  if (tasks.length === 0) return <p className="empty">{emptyMessage}</p>;

  return (
    <ul className="task-list" aria-labelledby={labelledBy}>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}
