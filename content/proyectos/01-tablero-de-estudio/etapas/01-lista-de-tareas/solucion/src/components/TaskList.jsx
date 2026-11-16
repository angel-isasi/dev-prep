import { TaskItem } from "./TaskItem.jsx";

export function TaskList({ tasks }) {
  if (tasks.length === 0) return <p className="empty">No hay tareas</p>;

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        // key: el id identifica a cada tarea aunque cambie el orden
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
