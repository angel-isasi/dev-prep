import { useState } from "react";

export function Terminos() {
  const [acepta, setAcepta] = useState(false);

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={acepta}
          onChange={(evento) => setAcepta(evento.target.checked)}
        />
        Acepto los términos
      </label>

      <button disabled={!acepta}>Confirmar pedido</button>
    </div>
  );
}
