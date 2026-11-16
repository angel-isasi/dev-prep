import { TaskItem } from "./TaskItem.jsx";

export function TaskList({ tasks, onToggle, onEdit, onDelete }) {
  if (tasks.length === 0) return <p className="empty">No hay tareas</p>;

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}
