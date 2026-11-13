import { useState } from "react";

// Hijo: no sabe qué hará el padre, solo avisa qué pizza se eligió.
export function BotonAgregar({ pizza, onAgregar }) {
  return <button onClick={() => onAgregar(pizza)}>Agregar {pizza}</button>;
}

// Padre: dueño del estado. Le pasa al hijo la función que lo actualiza.
export function Tienda() {
  const [ultima, setUltima] = useState(null);

  return (
    <div>
      <BotonAgregar pizza="Margarita" onAgregar={setUltima} />
      <BotonAgregar pizza="Pepperoni" onAgregar={setUltima} />
      {ultima && <p>Agregaste {ultima}</p>}
    </div>
  );
}
