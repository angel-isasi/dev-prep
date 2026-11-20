// Practicar > Entrena con IA: retos que la IA crea cada vez, distintos en cada vuelta.
// Mismo orden que Inglés con IA (components/ia/MenuPanel.jsx): menú, herramienta y guía.
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
    grupo: "Distinto cada vez",
    titulo: "¿Qué imprime este código?",
    detalle: "La pregunta trampa más común en entrevistas",
    minutos: "3 min",
    ia: true,
    Icono: IconoPracticar,
    Vista: QueImprime,
    pasos: ["Eliges un tema (o Sorpréndeme).", "Lees el código y escribes qué imprime y por qué.", "Ves la salida real (el código se corre de verdad) y la explicación."],
    consejos: ["Razona en voz alta línea por línea, como en la entrevista.", "Si fallas, guárdalo como tarjeta: estas trampas se repiten mucho."],
  },
  {
    id: "review",
    grupo: "Distinto cada vez",
    titulo: "Code review al revés",
    detalle: "Revisa el pull request de un compañero",
    minutos: "8 min",
    ia: true,
    Icono: IconoRevision,
    Vista: ReviewAlReves,
    pasos: ["Eliges un tema y recibes el código de un compañero.", "Escribes qué cambiarías y por qué, como en un pull request real.", "Ves qué problemas encontraste y cuáles se te pasaron."],
    consejos: ["Señala la línea y explica el porqué, no solo el qué.", "Sé respetuoso y concreto: así se revisa en un equipo de verdad."],
  },
];

/** Otras prácticas de lectura de código que no usan IA, como acceso directo en el menú. */
const SIN_IA = [
  { a: "/leccion?modo=predice", grupo: "Sin IA", titulo: "Lee y predice", detalle: "Las trampas clásicas de siempre", Icono: IconoLibro },
  { a: "/practicar/lista?coleccion=javascript%2Fdepurar", grupo: "Sin IA", titulo: "Depurar código roto", detalle: "Encuentra el error por su síntoma", Icono: IconoAlerta },
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
      <MenuPanel
        items={RETOS}
        elegida={elegida}
        alElegir={setElegida}
        etiqueta="Retos"
        enlaces={SIN_IA}
      >
        <Vista />
      </MenuPanel>
    </section>
  );
}
