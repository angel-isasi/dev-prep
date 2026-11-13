import { useState } from "react";

// Componente controlado: no tiene estado, solo muestra y avisa.
export function Interruptor({ activo, onCambio, etiqueta }) {
  return (
    <button role="switch" aria-checked={activo} onClick={() => onCambio(!activo)}>
      {etiqueta}: {activo ? "sí" : "no"}
    </button>
  );
}

// El padre es dueño del estado, así que puede reaccionar a él.
export function Opciones() {
  const [delivery, setDelivery] = useState(false);

  return (
    <div>
      <Interruptor etiqueta="Delivery" activo={delivery} onCambio={setDelivery} />
      {delivery && <p>Costo de envío: S/ 5</p>}
    </div>
  );
}
