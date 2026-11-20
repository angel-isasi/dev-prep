// Practicar > Entrena con IA: retos que la IA crea cada vez, distintos en cada vuelta.
// Mismo tablero que Inglés con IA (components/ia/MenuPanel.jsx).
import { Link } from "react-router";
import { usePestanaUrl } from "../hooks/usePestanaUrl.js";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { QueImprime, ReviewAlReves } from "../components/ia/RetosIa.jsx";
import { MenuPanel } from "../components/ia/MenuPanel.jsx";
import { IconoAlerta, IconoFlechaIzq, IconoLibro, IconoPracticar, IconoRevision } from "../components/Iconos.jsx";
import pagina from "./Entrevistas.module.css";

const RETOS = [
  {
    id: "imprime",
    titulo: "¿Qué imprime?",
    detalle: "La pregunta trampa más común en entrevistas",
    minutos: "3 min",
    ia: true,
    Icono: IconoPracticar,
    Vista: QueImprime,
    pasos: ["Eliges un tema", "Predices la salida", "Ves la salida real"],
    ejemplo: [
      { tipo: "codigo", texto: "for (var i = 0; i < 2; i++) {\n  setTimeout(() => console.log(i));\n}" },
      { tipo: "tu", texto: "Imprime 0 y 1" },
      { tipo: "bien", texto: "Imprime 2 y 2" },
      { tipo: "nota", texto: "El código se corre de verdad: la salida nunca es inventada." },
    ],
  },
  {
    id: "review",
    titulo: "Code review al revés",
    detalle: "Revisa el pull request de un compañero",
    minutos: "8 min",
    ia: true,
    Icono: IconoRevision,
    Vista: ReviewAlReves,
    pasos: ["Eliges un tema", "Revisas el código", "Ves qué se te pasó"],
    ejemplo: [
      { tipo: "codigo", texto: "let t = 0;\nitems.map((i) => (t += i.price));\nreturn t;" },
      { tipo: "tu", texto: "Línea 2: usa reduce, map no es para sumar." },
      { tipo: "puntaje", texto: "Encontraste 2 de 3" },
    ],
  },
];

/** Otras prácticas de lectura de código que no usan IA. */
const SIN_IA = [
  { a: "/leccion?modo=predice", titulo: "Lee y predice", detalle: "Las trampas clásicas, sin IA", Icono: IconoLibro },
  { a: "/practicar/lista?coleccion=javascript%2Fdepurar", titulo: "Depurar código roto", detalle: "Encuentra el error por su síntoma, sin IA", Icono: IconoAlerta },
];

export function EntrenaIa() {
  const [elegida, setElegida] = usePestanaUrl(
    RETOS.map((r) => r.id),
    "imprime",
    "reto",
  );
  const { Vista } = RETOS.find((r) => r.id === elegida) ?? RETOS[0];
  return (
    <section className={pagina.pagina}>
      <Link to="/practicar" className="boton boton-fantasma" style={{ marginBottom: "var(--espacio-3)" }}>
        <IconoFlechaIzq /> Practicar
      </Link>
      <CabeceraPagina etiqueta="Distinto cada vez" titulo="Entrena con IA" />
      <MenuPanel items={RETOS} elegida={elegida} alElegir={setElegida} etiqueta="Retos" enlaces={SIN_IA}>
        <Vista />
      </MenuPanel>
    </section>
  );
}
