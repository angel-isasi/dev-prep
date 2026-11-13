import { useState } from "react";
import { createPortal } from "react-dom";

export function Modal({ children, onCerrar }) {
  // createPortal(qué dibujar, dónde dibujarlo)
  return createPortal(
    <div role="dialog" aria-modal="true">
      {children}
      <button onClick={onCerrar}>Cerrar</button>
    </div>,
    document.body,
  );
}

export function Pagina() {
  const [abierto, setAbierto] = useState(false);

  return (
    <div id="pagina">
      <button onClick={() => setAbierto(true)}>Ver pedido</button>
      {abierto && (
        <Modal onCerrar={() => setAbierto(false)}>
          <p>Tu pedido</p>
        </Modal>
      )}
    </div>
  );
}
