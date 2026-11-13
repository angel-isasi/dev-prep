import { useState } from "react";

// Tabla de precios: fuera del componente porque no cambia nunca.
const PRECIOS = { S: 20, M: 28, L: 36 };

export function Tamano() {
  const [tamano, setTamano] = useState("M");

  return (
    <div>
      <label htmlFor="tamano">Tamaño</label>
      <select
        id="tamano"
        value={tamano}
        onChange={(evento) => setTamano(evento.target.value)}
      >
        <option value="S">Personal</option>
        <option value="M">Mediana</option>
        <option value="L">Familiar</option>
      </select>

      <p>Precio: S/ {PRECIOS[tamano]}</p>
    </div>
  );
}
