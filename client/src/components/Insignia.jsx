// Etiqueta pequeña de color para el estado o el nivel de un ejercicio:
//   <Insignia estado="resuelto" />   ->  "Resuelto" en verde
//   <Insignia nivel={2} />           ->  "Intermedio" en ámbar
// El color lo pone el CSS según el atributo data-variante.
import estilos from "./Insignia.module.css";

// Objetos como "tabla de búsqueda": más fácil de leer y ampliar que un switch.
const ESTADOS = {
  resuelto: { texto: "Resuelto", variante: "exito" },
  "en-progreso": { texto: "En progreso", variante: "aviso" },
  repasar: { texto: "Para repasar", variante: "error" },
  pendiente: { texto: "Pendiente", variante: "neutro" },
  estudiado: { texto: "Estudiado", variante: "exito" }, // solo en el celular
};

const NIVELES = {
  1: { texto: "Básico", variante: "exito" },
  2: { texto: "Intermedio", variante: "aviso" },
  3: { texto: "Difícil", variante: "error" },
};

export function Insignia({ estado, nivel }) {
  const { texto, variante } =
    estado !== undefined
      ? (ESTADOS[estado] ?? { texto: estado, variante: "neutro" })
      : (NIVELES[nivel] ?? { texto: String(nivel), variante: "neutro" });

  return (
    <span className={estilos.insignia} data-variante={variante}>
      {texto}
    </span>
  );
}
