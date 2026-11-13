import { useState } from "react";

export function Votacion({ cortos, onVotar }) {
  const [voto, setVoto] = useState(null); // id del corto votado, o null
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function votar(id) {
    if (voto !== null || enviando) return; // segunda barrera contra el doble envío
    setEnviando(true);
    setError("");
    try {
      await onVotar(id);
      setVoto(id); // solo marcamos el voto cuando el servidor lo confirma
    } catch {
      setError("No se pudo registrar tu voto. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const bloqueado = voto !== null || enviando;

  return (
    <div>
      {cortos.map((corto) => (
        <button key={corto.id} type="button" disabled={bloqueado} onClick={() => votar(corto.id)}>
          {voto === corto.id ? `✓ Votaste por ${corto.titulo}` : `Votar por ${corto.titulo}`}
        </button>
      ))}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
