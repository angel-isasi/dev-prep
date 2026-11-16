import { useCallback, useEffect, useState } from "react";
import { TOPICS } from "./data.js";
import { getTasks } from "./api.js";
import { Summary } from "./components/Summary.jsx";
import { TaskForm } from "./components/TaskForm.jsx";
import { TaskList } from "./components/TaskList.jsx";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "error" | "ready"

  // useCallback: la misma función en cada render, así el efecto corre solo al montar
  const loadTasks = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await getTasks();
      setTasks(data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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
          {status === "ready" && <Summary tasks={tasks} />}
        </div>

        {status === "loading" && <p className="info">Cargando tareas...</p>}

        {status === "error" && (
          <div role="alert" className="alert">
            <p>No se pudieron cargar las tareas.</p>
            <button type="button" onClick={loadTasks}>
              Reintentar
            </button>
          </div>
        )}

        {status === "ready" && <TaskList tasks={tasks} onToggle={toggleTask} />}
      </section>
    </main>
  );
}
