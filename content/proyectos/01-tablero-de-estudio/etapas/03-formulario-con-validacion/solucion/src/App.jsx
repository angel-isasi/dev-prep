import { useState } from "react";
import { initialTasks, TOPICS } from "./data.js";
import { Summary } from "./components/Summary.jsx";
import { TaskForm } from "./components/TaskForm.jsx";
import { TaskList } from "./components/TaskList.jsx";

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);

  function toggleTask(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function addTask({ title, topic }) {
    setTasks((prev) => [...prev, { id: Date.now(), title, topic, done: false }]);
  }

  return (
    <main className="app">
      <header className="app__header">
        <div>
          <h1>Tablero de estudio</h1>
          <p className="app__subtitle">Lo que vas a aprender, en un solo lugar.</p>
        </div>
      </header>

      <section className="panel">
        <h2>Agregar tarea</h2>
        <TaskForm onAdd={addTask} topics={TOPICS} />
      </section>

      <section className="panel">
        <div className="panel__top">
          <h2>Mis tareas</h2>
          <Summary tasks={tasks} />
        </div>
        <TaskList tasks={tasks} onToggle={toggleTask} />
      </section>
    </main>
  );
}
