import { useState } from "react";

export function Nombre() {
  const [nombre, setNombre] = useState("");

  return (
    <div>
      <label htmlFor="nombre">Tu nombre</label>
      <input
        id="nombre"
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
      />
      <p>{nombre ? `Pedido a nombre de ${nombre}` : "Escribe tu nombre"}</p>
    </div>
  );
}
