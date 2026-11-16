import { useCallback, useEffect, useState } from "react";
import { createTask, deleteTask, getTasks, updateTask } from "../api.js";

/**
 * Toda la lógica de datos del tablero: cargar, crear, marcar, renombrar y borrar.
 * Las acciones no atrapan errores: si la API falla, la promesa se rechaza
 * y el estado queda como estaba. Quien usa el hook decide qué mostrar.
 */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "error" | "ready"

  const reload = useCallback(async () => {
    setStatus("loading");
    try {
      setTasks(await getTasks());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function addTask(newTask) {
    const created = await createTask(newTask);
    setTasks((prev) => [...prev, created]);
    return created;
  }

  async function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) throw new Error(`No existe la tarea ${id}`);
    const updated = await updateTask(id, { done: !task.done });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }

  async function renameTask(id, title) {
    const updated = await updateTask(id, { title });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }

  async function removeTask(id) {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return {
    tasks,
    loading: status === "loading",
    error: status === "error" ? "No se pudieron cargar las tareas." : null,
    reload,
    addTask,
    toggleTask,
    renameTask,
    removeTask,
  };
}
