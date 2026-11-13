import { useState } from "react";

// "Comunicación" -> "comunicacion"
function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function Buscador({ items }) {
  const [consulta, setConsulta] = useState("");

  const buscado = normalizar(consulta);
  const filtrados = items.filter((item) => normalizar(item).includes(buscado));

  return (
    <div>
      <input
        type="search"
        aria-label="Buscar"
        value={consulta}
        onChange={(evento) => setConsulta(evento.target.value)}
      />

      {filtrados.length > 0 ? (
        <ul>
          {filtrados.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>Sin resultados para "{consulta}"</p>
      )}
    </div>
  );
}
