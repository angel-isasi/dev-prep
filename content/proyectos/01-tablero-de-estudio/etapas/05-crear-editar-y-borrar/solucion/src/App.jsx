import { useCallback, useEffect, useState } from "react";
import { TOPICS } from "./data.js";
import { createTask, deleteTask, getTasks, updateTask } from "./api.js";
import { Summary } from "./components/Summary.jsx";
import { TaskForm } from "./components/TaskForm.jsx";
import { TaskList } from "./components/TaskList.jsx";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "error" | "ready"
  const [actionError, setActionError] = useState("");

  const loadTasks = useCallback(async () => {
    setStatus("loading");
    try {
      setTasks(await getTasks());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Cada acción: primero el servidor; el estado cambia solo con lo que este confirma.
  async function addTask(newTask) {
    setActionError("");
    try {
      const created = await createTask(newTask);
      setTasks((prev) => [...prev, created]);
      return true;
    } catch {
      setActionError("No se pudo crear la tarea. Intenta de nuevo.");
      return false;
    }
  }

  async function toggleTask(id) {
    setActionError("");
    const task = tasks.find((t) => t.id === id);
    try {
      const updated = await updateTask(id, { done: !task.done });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      setActionError("No se pudo actualizar la tarea. Intenta de nuevo.");
    }
  }

  async function editTask(id, title) {
    setActionError("");
    try {
      const updated = await updateTask(id, { title });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return true;
    } catch {
      setActionError("No se pudo actualizar la tarea. Intenta de nuevo.");
      return false;
    }
  }

  async function removeTask(id) {
    setActionError("");
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setActionError("No se pudo borrar la tarea. Intenta de nuevo.");
    }
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

        {actionError && (
          <p role="alert" className="alert">
            {actionError}
          </p>
        )}

        {status === "loading" && <p className="info">Cargando tareas...</p>}

        {status === "error" && (
          <div role="alert" className="alert">
            <p>No se pudieron cargar las tareas.</p>
            <button type="button" onClick={loadTasks}>
              Reintentar
            </button>
          </div>
        )}

        {status === "ready" && (
          <TaskList tasks={tasks} onToggle={toggleTask} onEdit={editTask} onDelete={removeTask} />
        )}
      </section>
    </main>
  );
}
