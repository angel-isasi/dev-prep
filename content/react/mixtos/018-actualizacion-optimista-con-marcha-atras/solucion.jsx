import { useState } from "react";

export function MeGusta({ guardar }) {
  const [activo, setActivo] = useState(false);
  const [error, setError] = useState(false);

  async function alternar() {
    // `anterior` queda guardado en el closure de ESTA llamada.
    const anterior = activo;
    const nuevo = !anterior;

    setActivo(nuevo); // optimista: cambia ya, sin esperar
    setError(false);
    try {
      await guardar(nuevo);
    } catch {
      setActivo(anterior); // marcha atrás
      setError(true);
    }
  }

  return (
    <div>
      <button aria-pressed={activo} onClick={alternar}>
        Me gusta
      </button>
      {error && <p role="alert">No se guardó. Inténtalo otra vez.</p>}
    </div>
  );
}
