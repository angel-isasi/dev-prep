// Inglés > Con IA: fichas para elegir la herramienta, sus 3 pasos y un ejemplo de lo que recibes.
// Mismo tablero que Entrevistas > Simular (components/ia/MenuPanel.jsx).
import { usePestanaUrl } from "../hooks/usePestanaUrl.js";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { ComoSeDice, DailyIngles, EntrevistaIngles, ErroresDeSiempre, EscritoGuiado } from "../components/ia/InglesIa.jsx";
import { MenuPanel } from "../components/ia/MenuPanel.jsx";
import { IconoChispa, IconoEntrevistas, IconoLibro, IconoMicrofono, IconoRepetir, IconoReloj } from "../components/Iconos.jsx";
import pagina from "./Entrevistas.module.css";

const HERRAMIENTAS = [
  {
    id: "entrevista",
    titulo: "Entrevista en inglés",
    detalle: "Distinta cada vez, con ayudas que vas quitando",
    minutos: "10 min",
    ia: true,
    Icono: IconoEntrevistas,
    Vista: EntrevistaIngles,
    pasos: ["Eliges la ayuda", "Respondes en inglés", "Te corrige al final"],
    ejemplo: [
      { tipo: "ia", texto: "Tell me about a project you built." },
      { tipo: "tu", texto: "I builded an app to practice interviews." },
      { tipo: "cambio", mal: "I builded", bien: "I built" },
      { tipo: "nota", texto: "Solo los errores que más pesan, con su porqué." },
    ],
  },
  {
    id: "daily",
    titulo: "Tu daily",
    detalle: "Ayer, hoy y qué te bloquea",
    minutos: "3 min",
    ia: true,
    Icono: IconoMicrofono,
    Vista: DailyIngles,
    pasos: ["Dices tu actualización", "Ves cada error corregido", "Escuchas la versión natural"],
    ejemplo: [
      { tipo: "tu", texto: "Yesterday I fix a bug in the login." },
      { tipo: "cambio", mal: "I fix", bien: "I fixed" },
      { tipo: "bien", texto: "Yesterday I fixed a login bug. Today I'm going to add tests." },
    ],
  },
  {
    id: "dice",
    titulo: "¿Cómo se dice?",
    detalle: "Lo que quieres decir, en inglés natural",
    minutos: "1 min",
    ia: true,
    Icono: IconoChispa,
    Vista: ComoSeDice,
    pasos: ["Lo escribes en español", "Recibes 2 o 3 formas", "Guardas una como tarjeta"],
    ejemplo: [
      { tipo: "tu", texto: "ya casi lo termino" },
      { tipo: "bien", texto: "I'm almost done." },
      { tipo: "bien", texto: "I'm nearly finished with it." },
      { tipo: "nota", texto: "Cada forma dice cuándo usarla." },
    ],
  },
  {
    id: "escrito",
    titulo: "Inglés escrito",
    detalle: "Slack, pull requests, avisos y correos",
    minutos: "5 min",
    ia: true,
    Icono: IconoLibro,
    Vista: EscritoGuiado,
    pasos: ["Eliges la situación", "Lo escribes como te salga", "Queda listo para enviar"],
    ejemplo: [
      { tipo: "tu", texto: "hola, necesito ayuda con un bug" },
      { tipo: "bien", texto: "Hi! Could you help me with a bug when you have a minute?" },
      { tipo: "nota", texto: "Y te explica cada cambio." },
    ],
  },
  {
    id: "errores",
    titulo: "Tus errores de siempre",
    detalle: "Los que repites, en mini lecciones",
    minutos: "5 min",
    ia: true,
    Icono: IconoRepetir,
    Vista: ErroresDeSiempre,
    pasos: ["La app guarda tus errores", "Se agrupan por patrón", "Practicas cada regla"],
    ejemplo: [
      { tipo: "cambio", mal: "I am agree", bien: "I agree" },
      { tipo: "cambio", mal: "people is", bien: "people are" },
      { tipo: "nota", texto: "Cada patrón trae su regla y una frase para practicar." },
    ],
  },
];

const ENLACES = [{ a: "/ingles/conversa", titulo: "Conversa", detalle: "Reuniones de trabajo: daily, revisión de código, planning, demo con un cliente", Icono: IconoReloj }];

export function InglesConIa() {
  const [elegidaId, setElegida] = usePestanaUrl(
    HERRAMIENTAS.map((h) => h.id),
    "entrevista",
    "herramienta",
  );
  const { Vista } = HERRAMIENTAS.find((h) => h.id === elegidaId) ?? HERRAMIENTAS[0];

  return (
    <section className={pagina.pagina}>
      <CabeceraPagina etiqueta="Inglés para el trabajo" titulo="Inglés con IA" />
      <div className={pagina.contenido}>
        <MenuPanel items={HERRAMIENTAS} elegida={elegidaId} alElegir={setElegida} etiqueta="Herramientas" enlaces={ENLACES}>
          <Vista />
        </MenuPanel>
      </div>
    </section>
  );
}
