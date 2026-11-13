import { useState } from "react";

export function BotonPagar({ pagar }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(false);

  async function manejarClic() {
    if (enviando) return; // segunda barrera, además de `disabled`
    setEnviando(true);
    setError(false);
    try {
      await pagar();
    } catch {
      setError(true);
    } finally {
      // Se ejecuta tanto si salió bien como si falló.
      setEnviando(false);
    }
  }

  return (
    <div>
      <button onClick={manejarClic} disabled={enviando}>
        {enviando ? "Pagando…" : "Pagar"}
      </button>
      {error && <p role="alert">No se pudo procesar el pago</p>}
    </div>
  );
}
