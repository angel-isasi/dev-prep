import { useRef, useState } from "react";
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
  // Lo que se le dice al lector de pantalla. La región viva está siempre en la página
  const [announcement, setAnnouncement] = useState("");
  const listHeadingRef = useRef(null);

  // Lo guardado puede venir de una versión vieja o estar mal: lo validamos
  const filter = isValidFilter(savedFilter) ? savedFilter : "all";
  const visibleTasks = filterTasks(tasks, filter, query);
  const isFiltering = filter !== "all" || query.trim() !== "";
  const ready = !loading && !error;

  async function handleAdd(newTask) {
    setActionError("");
    try {
      const created = await addTask(newTask);
      setAnnouncement(`Tarea creada: ${created.title}`);
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
    // El título se lee antes de borrar: después la tarea ya no está
    const title = tasks.find((task) => task.id === id)?.title ?? "";
    try {
      await removeTask(id);
      setAnnouncement(`Tarea borrada: ${title}`);
      // El botón pulsado desapareció con la tarea: llevamos el foco a un lugar con sentido
      listHeadingRef.current?.focus();
    } catch {
      setActionError("No se pudo borrar la tarea. Intenta de nuevo.");
    }
  }

  return (
    <div className="app">
      {/* Fuera de <main>, el <header> es el landmark "banner" */}
      <header className="app__header">
        <div>
          <h1>Tablero de estudio</h1>
          <p className="app__subtitle">Lo que vas a aprender, en un solo lugar.</p>
        </div>
        <StreakBadge days={currentStreak(streak, toDateKey())} />
      </header>

      <main className="app__main">
        <section className="panel" aria-labelledby="add-title">
          <h2 id="add-title">Agregar tarea</h2>
          <TaskForm onAdd={handleAdd} topics={TOPICS} />
        </section>

        <section className="panel" aria-labelledby="list-title" aria-busy={loading}>
          <div className="panel__top">
            <h2 id="list-title" ref={listHeadingRef} tabIndex={-1}>
              Mis tareas
            </h2>
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
              labelledBy="list-title"
              onToggle={handleToggle}
              onEdit={handleRename}
              onDelete={handleDelete}
              emptyMessage={isFiltering ? "No hay tareas que coincidan" : "No hay tareas"}
            />
          )}
        </section>
      </main>

      {/* role="status" = aria-live="polite": se lee cuando el lector termina lo que estaba diciendo */}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
