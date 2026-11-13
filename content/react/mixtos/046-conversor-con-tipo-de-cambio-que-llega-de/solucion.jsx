import { useEffect, useState } from "react";

export function ConversorDolares({ obtenerTasa }) {
  const [tasa, setTasa] = useState({ fase: "cargando" });
  const [soles, setSoles] = useState("100");

  useEffect(() => {
    // Si el componente se desmonta antes de la respuesta, la ignoramos.
    let vigente = true;
    obtenerTasa().then(
      (valor) => {
        if (vigente) setTasa({ fase: "lista", valor });
      },
      () => {
        if (vigente) setTasa({ fase: "error" });
      },
    );
    return () => {
      vigente = false;
    };
  }, [obtenerTasa]);

  // Lo que viene del input siempre es texto: lo convertimos y validamos.
  const monto = Number(soles);
  const valido = soles.trim() !== "" && Number.isFinite(monto) && monto >= 0;

  return (
    <div>
      <label htmlFor="soles">Monto en soles</label>
      <input
        id="soles"
        inputMode="decimal"
        value={soles}
        onChange={(evento) => setSoles(evento.target.value)}
      />

      {tasa.fase === "cargando" && <p>Consultando el tipo de cambio…</p>}
      {tasa.fase === "error" && <p role="alert">No pudimos obtener el tipo de cambio.</p>}
      {tasa.fase === "lista" &&
        (valido ? (
          <p>Equivale a US$ {(monto / tasa.valor).toFixed(2)}</p>
        ) : (
          <p>Escribe un monto válido.</p>
        ))}
    </div>
  );
}
