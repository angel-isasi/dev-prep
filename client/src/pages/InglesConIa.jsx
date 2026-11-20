// Inglés > Con IA: las herramientas en un menú agrupado (hablar, escribir, repasar) y la elegida al
// lado, con sus consejos arriba. Mismo orden que Entrevistas > Simular.
import { useMemo } from "react";
import { Link } from "react-router";
import { usePestanaUrl } from "../hooks/usePestanaUrl.js";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { ComoSeDice, DailyIngles, EntrevistaIngles, ErroresDeSiempre, EscritoGuiado } from "../components/ia/InglesIa.jsx";
import { IconoChispa, IconoEntrevistas, IconoFlechaDer, IconoLibro, IconoMicrofono, IconoRepetir, IconoReloj } from "../components/Iconos.jsx";
import pagina from "./Entrevistas.module.css";
import estilos from "./EntrevistasPartes.module.css";

const HERRAMIENTAS = [
  {
    id: "entrevista",
    grupo: "Hablar",
    titulo: "Entrevista en inglés",
    detalle: "Distinta cada vez, con ayudas que vas quitando",
    minutos: "10 min",
    Icono: IconoEntrevistas,
    Vista: EntrevistaIngles,
    consejos: ["Empieza leyendo la respuesta modelo en voz alta y cámbiala con tus datos.", "Cuando te sobre la ayuda, pasa a solo palabras clave y luego a sin ayuda."],
  },
  {
    id: "daily",
    grupo: "Hablar",
    titulo: "Tu daily",
    detalle: "Ayer, hoy y qué te bloquea",
    minutos: "3 min",
    Icono: IconoMicrofono,
    Vista: DailyIngles,
    consejos: ["Dilo con el botón Dictar: así practicas pronunciación también.", "Usa pasado para ayer (I fixed...) y futuro para hoy (I'm going to...)."],
  },
  {
    id: "dice",
    grupo: "Escribir",
    titulo: "¿Cómo se dice?",
    detalle: "Lo que quieres decir, en inglés natural",
    minutos: "1 min",
    Icono: IconoChispa,
    Vista: ComoSeDice,
    consejos: ["Pregunta frases completas del trabajo, no palabras sueltas.", "Guarda en tarjetas las que vas a usar seguido."],
  },
  {
    id: "escrito",
    grupo: "Escribir",
    titulo: "Inglés escrito del trabajo",
    detalle: "Slack, pull requests, avisos y correos",
    minutos: "5 min",
    Icono: IconoLibro,
    Vista: EscritoGuiado,
    consejos: ["Escríbelo primero como te salga: en español si hace falta.", "Mientras más inglés pongas tú, más correcciones útiles recibes."],
  },
  {
    id: "errores",
    grupo: "Repasar",
    titulo: "Tus errores de siempre",
    detalle: "Los que repites, en mini lecciones",
    minutos: "5 min",
    Icono: IconoRepetir,
    Vista: ErroresDeSiempre,
    consejos: ["Se arma con los errores que te corrigen en Map, Conversa, el daily y aquí.", "Practica la frase de cada lección en voz alta hasta que salga sola."],
  },
];

export function InglesConIa() {
  const [elegidaId, setElegida] = usePestanaUrl(
    HERRAMIENTAS.map((h) => h.id),
    "entrevista",
    "herramienta",
  );
  const elegida = HERRAMIENTAS.find((h) => h.id === elegidaId) ?? HERRAMIENTAS[0];
  const grupos = useMemo(() => [...new Set(HERRAMIENTAS.map((h) => h.grupo))], []);
  const { Vista } = elegida;

  return (
    <section className={pagina.pagina}>
      <CabeceraPagina etiqueta="Inglés para el trabajo" titulo="Inglés con IA" />
      <div className={`${estilos.simular} ${pagina.contenido}`}>
        <nav className={estilos.menu} aria-label="Herramientas">
          {grupos.map((g) => (
            <div key={g} className={estilos.menuGrupo}>
              <span className="etiqueta">{g}</span>
              {HERRAMIENTAS.filter((h) => h.grupo === g).map(({ id, titulo, detalle, minutos, Icono }) => (
                <button key={id} type="button" className={estilos.menuItem} data-activo={id === elegida.id} aria-current={id === elegida.id} onClick={() => setElegida(id)}>
                  <span className={estilos.accesoIcono} aria-hidden>
                    <Icono />
                  </span>
                  <span className={estilos.menuTexto}>
                    <strong>{titulo}</strong>
                    <small>{detalle}</small>
                  </span>
                  <span className={estilos.menuMeta}>{minutos}</span>
                </button>
              ))}
            </div>
          ))}
          {/* Las reuniones de trabajo viven en Conversa: aquí solo el acceso */}
          <div className={estilos.menuGrupo}>
            <span className="etiqueta">Reuniones</span>
            <Link to="/ingles/conversa" className={estilos.menuItem}>
              <span className={estilos.accesoIcono} aria-hidden>
                <IconoReloj />
              </span>
              <span className={estilos.menuTexto}>
                <strong>Conversa</strong>
                <small>Daily, revisión de código, planning, demo con un cliente</small>
              </span>
              <span className={estilos.menuMeta}>
                <IconoFlechaDer />
              </span>
            </Link>
          </div>
        </nav>

        <div className={estilos.panelPractica}>
          <aside className={estilos.consejos}>
            <span className="etiqueta">Para sacarle provecho</span>
            <ul>
              {elegida.consejos.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <small className={estilos.suave}>{elegida.minutos} · con IA</small>
          </aside>
          <div className={estilos.practicaPrincipal} key={elegida.id}>
            <Vista />
          </div>
        </div>
      </div>
    </section>
  );
}
