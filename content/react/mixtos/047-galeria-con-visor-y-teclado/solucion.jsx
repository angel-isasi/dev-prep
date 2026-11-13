import { useEffect, useState } from "react";

export function Galeria({ fotos }) {
  // Índice de la foto abierta, o null si el visor está cerrado.
  const [abierta, setAbierta] = useState(null);
  const visorAbierto = abierta !== null;

  useEffect(() => {
    if (!visorAbierto) return;

    // Un objeto de teclas en vez de varios if. Las actualizaciones usan la
    // forma con función, así no necesitan leer `abierta` desde aquí.
    const teclas = {
      Escape: () => setAbierta(null),
      ArrowRight: () => setAbierta((i) => (i + 1) % fotos.length),
      ArrowLeft: () => setAbierta((i) => (i - 1 + fotos.length) % fotos.length),
    };

    const manejar = (evento) => teclas[evento.key]?.();
    document.addEventListener("keydown", manejar);
    return () => document.removeEventListener("keydown", manejar);
  }, [visorAbierto, fotos.length]);

  return (
    <div>
      {fotos.map((foto, i) => (
        <button key={foto} onClick={() => setAbierta(i)}>
          Ver {foto}
        </button>
      ))}

      {visorAbierto && (
        <div role="dialog" aria-label={`Foto ${abierta + 1} de ${fotos.length}`}>
          <p>{fotos[abierta]}</p>
          <button onClick={() => setAbierta(null)}>Cerrar</button>
        </div>
      )}
    </div>
  );
}
