import { useEffect, useState } from "react";

export function BuscadorPizzas({ buscar }) {
  const [texto, setTexto] = useState("");
  // Un solo objeto para la fase y los resultados: siempre cambian juntos.
  const [estado, setEstado] = useState({ fase: "inicial", resultados: [] });

  useEffect(() => {
    const consulta = texto.trim();
    if (!consulta) {
      setEstado({ fase: "inicial", resultados: [] });
      return;
    }

    // `vigente` deja de ser true cuando el usuario escribe otra cosa.
    let vigente = true;

    const id = setTimeout(async () => {
      setEstado((anterior) => ({ ...anterior, fase: "cargando" }));
      try {
        const resultados = await buscar(consulta);
        if (vigente) setEstado({ fase: "listo", resultados });
      } catch {
        if (vigente) setEstado({ fase: "error", resultados: [] });
      }
    }, 300);

    // La limpieza hace dos trabajos: cancela la espera y marca la búsqueda como vieja.
    return () => {
      vigente = false;
      clearTimeout(id);
    };
  }, [texto, buscar]);

  return (
    <div>
      <input aria-label="Buscar pizza" value={texto} onChange={(evento) => setTexto(evento.target.value)} />

      {estado.fase === "inicial" && <p>Escribe el nombre de una pizza.</p>}
      {estado.fase === "cargando" && <p>Buscando…</p>}
      {estado.fase === "error" && <p role="alert">No pudimos buscar. Revisa tu conexión.</p>}
      {estado.fase === "listo" && estado.resultados.length === 0 && <p>No hay pizzas con “{texto.trim()}”.</p>}

      <ul>
        {estado.resultados.map((pizza) => (
          <li key={pizza}>{pizza}</li>
        ))}
      </ul>
    </div>
  );
}
