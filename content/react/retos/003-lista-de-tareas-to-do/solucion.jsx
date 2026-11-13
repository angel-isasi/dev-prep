import { useState } from "react";

export function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [texto, setTexto] = useState("");

  function agregar(evento) {
    evento.preventDefault();
    const limpio = texto.trim();
    if (!limpio) return;
    setTareas((anteriores) => [
      ...anteriores,
      { id: crypto.randomUUID(), texto: limpio, hecha: false },
    ]);
    setTexto("");
  }

  function alternar(id) {
    setTareas((anteriores) =>
      anteriores.map((tarea) => (tarea.id === id ? { ...tarea, hecha: !tarea.hecha } : tarea))
    );
  }

  function eliminar(id) {
    setTareas((anteriores) => anteriores.filter((tarea) => tarea.id !== id));
  }

  const pendientes = tareas.filter((tarea) => !tarea.hecha).length;

  return (
    <div>
      <form onSubmit={agregar}>
        <input
          aria-label="Nueva tarea"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
        />
        <button>Agregar</button>
      </form>

      <ul>
        {tareas.map((tarea) => (
          <li key={tarea.id}>
            <label>
              <input type="checkbox" checked={tarea.hecha} onChange={() => alternar(tarea.id)} />
              <span style={{ textDecoration: tarea.hecha ? "line-through" : "none" }}>
                {tarea.texto}
              </span>
            </label>
            <button onClick={() => eliminar(tarea.id)} aria-label={`Eliminar ${tarea.texto}`}>
              ×
            </button>
          </li>
        ))}
      </ul>

      <p>{pendientes} pendientes</p>
    </div>
  );
}
