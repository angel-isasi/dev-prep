import { useRef, useState } from "react";

// Cada filtro es una función: recibe una tarea y dice si se ve o no.
export const FILTROS = {
  todas: () => true,
  pendientes: (tarea) => !tarea.hecha,
  hechas: (tarea) => tarea.hecha,
};

export function TareasConFiltro() {
  const [tareas, setTareas] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const siguienteId = useRef(1);

  function agregar(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const texto = new FormData(formulario).get("texto").trim();
    if (!texto) return;
    const id = siguienteId.current++;
    setTareas((lista) => [...lista, { id, texto, hecha: false }]);
    formulario.reset();
  }

  function alternar(id) {
    setTareas((lista) =>
      lista.map((tarea) => (tarea.id === id ? { ...tarea, hecha: !tarea.hecha } : tarea)),
    );
  }

  // Estado derivado: se calcula en cada render.
  const visibles = tareas.filter(FILTROS[filtro]);
  const pendientes = tareas.filter(FILTROS.pendientes).length;

  return (
    <div>
      <form onSubmit={agregar}>
        <input name="texto" aria-label="Nueva tarea" />
        <button type="submit">Agregar</button>
      </form>

      {Object.keys(FILTROS).map((nombre) => (
        <button key={nombre} aria-pressed={filtro === nombre} onClick={() => setFiltro(nombre)}>
          {nombre}
        </button>
      ))}

      <ul>
        {visibles.map((tarea) => (
          <li key={tarea.id}>
            <label>
              <input type="checkbox" checked={tarea.hecha} onChange={() => alternar(tarea.id)} />
              {tarea.texto}
            </label>
          </li>
        ))}
      </ul>

      <p>{pendientes === 1 ? "Queda 1 tarea" : `Quedan ${pendientes} tareas`}</p>
      <button onClick={() => setTareas((lista) => lista.filter(FILTROS.pendientes))}>
        Borrar las hechas
      </button>
    </div>
  );
}
