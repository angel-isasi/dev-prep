// Estado derivado: se calcula en cada render a partir de las tareas.
export function Summary({ tasks }) {
  const done = tasks.filter((task) => task.done).length;
  return (
    <p className="summary">
      {done} de {tasks.length} hechas
    </p>
  );
}
