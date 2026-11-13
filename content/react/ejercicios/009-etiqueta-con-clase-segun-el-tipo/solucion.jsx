// Tabla de búsqueda: tipo -> clase CSS.
const CLASES = {
  nuevo: "etiqueta verde",
  agotado: "etiqueta gris",
  picante: "etiqueta roja",
};

export function Etiqueta({ tipo }) {
  return <span className={CLASES[tipo] ?? "etiqueta"}>{tipo}</span>;
}
