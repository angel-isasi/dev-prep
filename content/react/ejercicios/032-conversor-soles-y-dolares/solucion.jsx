import { useState } from "react";

const TASA = 3.75; // soles por dólar

// Convierte el texto con la fórmula dada; "" si está vacío o no es número.
function convertir(texto, formula) {
  const numero = Number(texto);
  if (texto.trim() === "" || Number.isNaN(numero)) return "";
  return formula(numero).toFixed(2);
}

export function Conversor() {
  // Única fuente de verdad: qué input editó el usuario y qué escribió.
  const [editado, setEditado] = useState({ moneda: "soles", texto: "" });

  // El input editado muestra el texto tal cual; el otro se calcula.
  const soles =
    editado.moneda === "soles" ? editado.texto : convertir(editado.texto, (d) => d * TASA);
  const dolares =
    editado.moneda === "dolares" ? editado.texto : convertir(editado.texto, (s) => s / TASA);

  return (
    <div>
      <label>
        Soles
        <input
          inputMode="decimal"
          value={soles}
          onChange={(e) => setEditado({ moneda: "soles", texto: e.target.value })}
        />
      </label>
      <label>
        Dólares
        <input
          inputMode="decimal"
          value={dolares}
          onChange={(e) => setEditado({ moneda: "dolares", texto: e.target.value })}
        />
      </label>
    </div>
  );
}
