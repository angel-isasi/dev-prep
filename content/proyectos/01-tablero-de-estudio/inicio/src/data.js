// Datos de ejemplo del tablero. La API falsa (src/api.js) arranca con estas tareas.
// Puedes cambiar los textos, pero deja al menos una tarea pendiente y una hecha.

export const TOPICS = ["JavaScript", "React", "CSS", "Git", "Inglés"];

export const initialTasks = [
  { id: 1, title: "Repasar closures y scope", topic: "JavaScript", done: true },
  { id: 2, title: "Hacer 2 ejercicios de métodos de array", topic: "JavaScript", done: false },
  { id: 3, title: "Leer la guía de useEffect", topic: "React", done: false },
  { id: 4, title: "Maquetar una tarjeta con Flexbox", topic: "CSS", done: true },
  { id: 5, title: "Practicar commits con mensajes claros", topic: "Git", done: false },
];
