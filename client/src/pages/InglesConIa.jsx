// Inglés > Con IA: las herramientas en un menú agrupado (hablar, escribir, repasar), la elegida al
// centro y su guía al lado. Mismo orden que Entrevistas > Simular (components/ia/MenuPanel.jsx).
import { Link } from "react-router";
import { usePestanaUrl } from "../hooks/usePestanaUrl.js";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { ComoSeDice, DailyIngles, EntrevistaIngles, ErroresDeSiempre, EscritoGuiado } from "../components/ia/InglesIa.jsx";
import { MenuPanel, estilosMenu } from "../components/ia/MenuPanel.jsx";
import { IconoChispa, IconoEntrevistas, IconoFlechaDer, IconoLibro, IconoMicrofono, IconoRepetir, IconoReloj } from "../components/Iconos.jsx";
import pagina from "./Entrevistas.module.css";

const HERRAMIENTAS = [
  {
    id: "entrevista",
    grupo: "Hablar",
    titulo: "Entrevista en inglés",
    detalle: "Distinta cada vez, con ayudas que vas quitando",
    minutos: "10 min",
    ia: true,
    Icono: IconoEntrevistas,
    Vista: EntrevistaIngles,
    pasos: ["Eliges cuánta ayuda quieres en cada pregunta.", "La reclutadora pregunta en inglés y tú respondes hablando o escribiendo.", "Al final te corrige los errores que más pesan."],
    consejos: ["Empieza leyendo la respuesta modelo en voz alta y cámbiala con tus datos.", "Cuando te sobre la ayuda, pasa a solo palabras clave y luego a sin ayuda."],
  },
  {
    id: "daily",
    grupo: "Hablar",
    titulo: "Tu daily",
    detalle: "Ayer, hoy y qué te bloquea",
    minutos: "3 min",
    ia: true,
    Icono: IconoMicrofono,
    Vista: DailyIngles,
    pasos: ["Dices o escribes tu actualización, como en una reunión real.", "La IA marca cada error con su corrección y el porqué.", "Ves tu versión más natural y la puedes escuchar."],
    consejos: ["Dilo con el botón Dictar: así practicas pronunciación también.", "Usa pasado para ayer (I fixed...) y futuro para hoy (I'm going to...)."],
  },
  {
    id: "dice",
    grupo: "Escribir",
    titulo: "¿Cómo se dice?",
    detalle: "Lo que quieres decir, en inglés natural",
    minutos: "1 min",
    ia: true,
    Icono: IconoChispa,
    Vista: ComoSeDice,
    pasos: ["Escribes en español lo que quieres decir.", "Recibes 2 o 3 formas naturales y cuándo usar cada una.", "Guardas la que te sirva como tarjeta de memoria."],
    consejos: ["Pregunta frases completas del trabajo, no palabras sueltas.", "Guarda en tarjetas las que vas a usar seguido."],
  },
  {
    id: "escrito",
    grupo: "Escribir",
    titulo: "Inglés escrito del trabajo",
    detalle: "Slack, pull requests, avisos y correos",
    minutos: "5 min",
    ia: true,
    Icono: IconoLibro,
    Vista: EscritoGuiado,
    pasos: ["Eliges la situación: Slack, un pull request, un aviso o un correo.", "Lo escribes como te salga, en español o en inglés a medias.", "Recibes el mensaje listo para enviar y cada cambio explicado."],
    consejos: ["Escríbelo primero como te salga: en español si hace falta.", "Mientras más inglés pongas tú, más correcciones útiles recibes."],
  },
  {
    id: "errores",
    grupo: "Repasar",
    titulo: "Tus errores de siempre",
    detalle: "Los que repites, en mini lecciones",
    minutos: "5 min",
    ia: true,
    Icono: IconoRepetir,
    Vista: ErroresDeSiempre,
    pasos: ["La app guarda los errores que te corrigen en Map, Conversa y aquí.", "La IA los agrupa en los patrones que más repites.", "Cada patrón trae su regla, ejemplos y una frase para practicar."],
    consejos: ["Necesitas al menos 3 errores corregidos para armar las lecciones.", "Practica la frase de cada lección en voz alta hasta que salga sola."],
  },
];

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
        <MenuPanel
          items={HERRAMIENTAS}
          elegida={elegidaId}
          alElegir={setElegida}
          etiqueta="Herramientas"
          extraMenu={
            // Las reuniones de trabajo viven en Conversa: aquí solo el acceso
            <div className={estilosMenu.grupo}>
              <span className="etiqueta">Reuniones</span>
              <Link to="/ingles/conversa" className={estilosMenu.item}>
                <span className={estilosMenu.icono} aria-hidden>
                  <IconoReloj />
                </span>
                <span className={estilosMenu.texto}>
                  <strong>Conversa</strong>
                  <small>Daily, revisión de código, planning, demo con un cliente</small>
                </span>
                <span className={estilosMenu.meta}>
                  <IconoFlechaDer />
                </span>
              </Link>
            </div>
          }
        >
          <Vista />
        </MenuPanel>
      </div>
    </section>
  );
}
