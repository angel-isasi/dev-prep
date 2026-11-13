import { useReducer } from "react";

// Para cada estado: qué eventos acepta y a qué estado llevan.
export const TRANSICIONES = {
  carrito: { pagar: "pago" },
  pago: { confirmar: "confirmado", volver: "carrito" },
  confirmado: {},
};

// Reducer: si el evento no está permitido, se queda donde está.
export const siguiente = (estado, evento) => TRANSICIONES[estado]?.[evento] ?? estado;

export function Checkout() {
  const [estado, enviar] = useReducer(siguiente, "carrito");

  return (
    <div>
      <p>Paso: {estado}</p>
      {Object.keys(TRANSICIONES[estado]).map((evento) => (
        <button key={evento} onClick={() => enviar(evento)}>
          {evento}
        </button>
      ))}
    </div>
  );
}
