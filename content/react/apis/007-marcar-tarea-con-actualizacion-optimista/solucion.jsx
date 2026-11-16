import { useEffect, useState } from "react";

export function ListaTareas() {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  // ids de las tareas cuyo PATCH todavía no responde.
  const [pendientes, setPendientes] = useState(() => new Set());
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    let ignorar = false;
    fetch("/api/practica/tareas")
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then((lista) => {
        if (!ignorar) setTareas(lista);
      })
      .catch(() => {
        if (!ignorar) setErrorCarga(true);
      })
      .finally(() => {
        if (!ignorar) setCargando(false);
      });
    return () => {
      ignorar = true;
    };
  }, []);

  // Cambia SOLO el campo `hecha` de UNA tarea, partiendo del estado más reciente.
  function ponerHecha(id, hecha) {
    setTareas((actuales) => actuales.map((t) => (t.id === id ? { ...t, hecha } : t)));
  }

  function marcarPendiente(id, esta) {
    setPendientes((actuales) => {
      const copia = new Set(actuales);
      if (esta) copia.add(id);
      else copia.delete(id);
      return copia;
    });
  }

  async function alternar(tarea) {
    const nuevo = !tarea.hecha;
    setAviso(null);

    // 1. Optimista: la pantalla cambia YA, sin esperar al servidor.
    ponerHecha(tarea.id, nuevo);
    marcarPendiente(tarea.id, true);

    try {
      const respuesta = await fetch(`/api/practica/tareas/${tarea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hecha: nuevo }),
      });
      if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
    } catch {
      // 2. Falló: deshacemos SOLO esta tarea (no toda la lista) y avisamos.
      ponerHecha(tarea.id, tarea.hecha);
      setAviso(`No se pudo actualizar "${tarea.titulo}". Inténtalo de nuevo.`);
    } finally {
      marcarPendiente(tarea.id, false);
    }
  }

  if (cargando) return <p role="status">Cargando tareas...</p>;
  if (errorCarga) return <p role="alert">No se pudieron cargar las tareas.</p>;

  return (
    <div>
      {aviso && <p role="alert">{aviso}</p>}
      <ul>
        {tareas.map((tarea) => (
          <li key={tarea.id}>
            <label>
              <input
                type="checkbox"
                checked={tarea.hecha}
                disabled={pendientes.has(tarea.id)}
                onChange={() => alternar(tarea)}
              />
              {tarea.titulo}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
