import { useState } from "react";
import { TOPICS } from "./data.js";
import { filterTasks } from "./filters.js";
import { useTasks } from "./hooks/useTasks.js";
import { FilterBar } from "./components/FilterBar.jsx";
import { Summary } from "./components/Summary.jsx";
import { TaskForm } from "./components/TaskForm.jsx";
import { TaskList } from "./components/TaskList.jsx";

export default function App() {
  // Los datos vienen del hook; App solo se ocupa de la vista
  const { tasks, loading, error, reload, addTask, toggleTask, renameTask, removeTask } = useTasks();
  const [actionError, setActionError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const visibleTasks = filterTasks(tasks, filter, query);
  const isFiltering = filter !== "all" || query.trim() !== "";
  const ready = !loading && !error;

  async function handleAdd(newTask) {
    setActionError("");
    try {
      await addTask(newTask);
      return true;
    } catch {
      setActionError("No se pudo crear la tarea. Intenta de nuevo.");
      return false;
    }
  }

  async function handleToggle(id) {
    setActionError("");
    try {
      await toggleTask(id);
    } catch {
      setActionError("No se pudo actualizar la tarea. Intenta de nuevo.");
    }
  }

  async function handleRename(id, title) {
    setActionError("");
    try {
      await renameTask(id, title);
      return true;
    } catch {
      setActionError("No se pudo actualizar la tarea. Intenta de nuevo.");
      return false;
    }
  }

  async function handleDelete(id) {
    setActionError("");
    try {
      await removeTask(id);
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
        <TaskForm onAdd={handleAdd} topics={TOPICS} />
      </section>

      <section className="panel">
        <div className="panel__top">
          <h2>Mis tareas</h2>
          {ready && <Summary tasks={tasks} />}
        </div>

        <FilterBar filter={filter} onFilterChange={setFilter} query={query} onQueryChange={setQuery} />

        {actionError && (
          <p role="alert" className="alert">
            {actionError}
          </p>
        )}

        {loading && <p className="info">Cargando tareas...</p>}

        {error && (
          <div role="alert" className="alert">
            <p>{error}</p>
            <button type="button" onClick={reload}>
              Reintentar
            </button>
          </div>
        )}

        {ready && (
          <TaskList
            tasks={visibleTasks}
            onToggle={handleToggle}
            onEdit={handleRename}
            onDelete={handleDelete}
            emptyMessage={isFiltering ? "No hay tareas que coincidan" : "No hay tareas"}
          />
        )}
      </section>
    </main>
  );
}
