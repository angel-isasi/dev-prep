// API falsa del tablero: simula un servidor REST con los datos en memoria.
// No necesitas cambiar este archivo. Úsalo desde la etapa 4.
//
//   getTasks()              GET    /tasks        -> Promise<Task[]>
//   createTask(data)        POST   /tasks        -> Promise<Task>
//   updateTask(id, changes) PATCH  /tasks/:id    -> Promise<Task>
//   deleteTask(id)          DELETE /tasks/:id    -> Promise<{ id }>
//
// Cada función tarda un poco (como una red real) y devuelve copias: si cambias
// lo que te devuelve, el "servidor" no se entera. Para eso están las funciones.
import { initialTasks } from "./data.js";

const DELAY_MS = 30;

let database = [];
let nextId = 1;
let failNext = false;

/** Vuelve a dejar el servidor con estas tareas (los tests lo usan antes de cada caso). */
export function resetDatabase(tasks = initialTasks) {
  database = tasks.map((task) => ({ ...task }));
  nextId = Math.max(0, ...database.map((task) => task.id)) + 1;
  failNext = false;
}

/** Hace que la próxima petición falle, como si se cayera la red. */
export function failNextRequest() {
  failNext = true;
}

resetDatabase();

function respond(handler) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failNext) {
        failNext = false;
        reject(new Error("Error de red: el servidor no respondió"));
        return;
      }
      try {
        resolve(handler());
      } catch (error) {
        reject(error);
      }
    }, DELAY_MS);
  });
}

function findTask(id) {
  const task = database.find((t) => t.id === id);
  if (!task) throw new Error(`Error 404: no existe la tarea ${id}`);
  return task;
}

export function getTasks() {
  return respond(() => database.map((task) => ({ ...task })));
}

export function createTask({ title, topic }) {
  return respond(() => {
    if (typeof title !== "string" || title.trim() === "") {
      throw new Error("Error 400: el título es obligatorio");
    }
    const task = { id: nextId++, title: title.trim(), topic: topic ?? "JavaScript", done: false };
    database.push(task);
    return { ...task };
  });
}

export function updateTask(id, changes) {
  return respond(() => {
    const task = findTask(id);
    const { title, topic, done } = changes;
    if (title !== undefined) task.title = title;
    if (topic !== undefined) task.topic = topic;
    if (done !== undefined) task.done = done;
    return { ...task };
  });
}

export function deleteTask(id) {
  return respond(() => {
    findTask(id);
    database = database.filter((t) => t.id !== id);
    return { id };
  });
}
