import { useState } from "react";

export function NuevaTarea({ alCrear }) {
  const [titulo, setTitulo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [creada, setCreada] = useState(null);

  async function enviar(evento) {
    evento.preventDefault(); // sin esto, el navegador recarga la página
    if (enviando) return; // segunda defensa contra el doble envío

    const limpio = titulo.trim();
    if (!limpio) {
      // Validamos antes de molestar al servidor (que igual valida por su lado).
      setError("Escribe un título");
      return;
    }

    setEnviando(true);
    setError(null);
    setCreada(null);
    try {
      const respuesta = await fetch("/api/practica/tareas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: limpio }),
      });
      const cuerpo = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        // Un 400 trae el motivo en el cuerpo: se lo mostramos al usuario tal cual.
        setError(cuerpo?.error ?? `Error ${respuesta.status}`);
        return; // dejamos el texto para que pueda corregirlo
      }

      setTitulo("");
      setCreada(cuerpo.titulo);
      alCrear?.(cuerpo); // la tarea que devolvió el servidor, con su id
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar}>
      <label>
        Título
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </label>
      <button type="submit" disabled={enviando}>
        {enviando ? "Guardando..." : "Agregar"}
      </button>

      {error && <p role="alert">{error}</p>}
      {creada && <p role="status">Tarea creada: {creada}</p>}
    </form>
  );
}
