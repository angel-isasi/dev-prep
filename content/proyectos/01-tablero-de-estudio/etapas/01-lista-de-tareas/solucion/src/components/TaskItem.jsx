// Una tarea: solo muestra datos, no tiene estado propio.
export function TaskItem({ task }) {
  return (
    <li className={task.done ? "task task--done" : "task"}>
      <span className="task__title">{task.title}</span>
      <span className="task__topic">{task.topic}</span>
    </li>
  );
}
