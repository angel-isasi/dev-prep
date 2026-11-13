import { useState } from "react";

// Siempre devuelve un arreglo nuevo: filter para quitar, spread para agregar.
export function alternar(seleccion, id) {
  return seleccion.includes(id) ? seleccion.filter((x) => x !== id) : [...seleccion, id];
}

export function SelectorIngredientes({ opciones }) {
  const [seleccion, setSeleccion] = useState([]);

  return (
    <fieldset>
      <legend>Ingredientes extra</legend>
      {opciones.map((opcion) => (
        <label key={opcion}>
          <input
            type="checkbox"
            checked={seleccion.includes(opcion)}
            onChange={() => setSeleccion((actual) => alternar(actual, opcion))}
          />
          {opcion}
        </label>
      ))}
      <p>{seleccion.length > 0 ? `Elegiste: ${seleccion.join(", ")}` : "No elegiste nada"}</p>
    </fieldset>
  );
}
