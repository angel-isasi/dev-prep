import { useState } from "react";
import { TOPICS } from "./data.js";
import { FILTERS, filterTasks } from "./filters.js";
import { currentStreak, registerActivity, toDateKey } from "./streak.js";
import { useTasks } from "./hooks/useTasks.js";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { FilterBar } from "./components/FilterBar.jsx";
import { StreakBadge } from "./components/StreakBadge.jsx";
import { Summary } from "./components/Summary.jsx";
import { TaskForm } from "./components/TaskForm.jsx";
import { TaskList } from "./components/TaskList.jsx";

const isValidFilter = (value) => FILTERS.some((option) => option.value === value);

export default function App() {
  const { tasks, loading, error, reload, addTask, toggleTask, renameTask, removeTask } = useTasks();
  const [savedFilter, setFilter] = useLocalStorage("tablero:filtro", "all");
  const [streak, setStreak] = useLocalStorage("tablero:racha", null);
  const [actionError, setActionError] = useState("");
  const [query, setQuery] = useState("");

  // Lo guardado puede venir de una versión vieja o estar mal: lo validamos
  const filter = isValidFilter(savedFilter) ? savedFilter : "all";
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
      const updated = await toggleTask(id);
      // Solo cuenta para la racha cuando una tarea pasa a hecha
      if (updated.done) setStreak((prev) => registerActivity(prev, toDateKey()));
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
        <StreakBadge days={currentStreak(streak, toDateKey())} />
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
