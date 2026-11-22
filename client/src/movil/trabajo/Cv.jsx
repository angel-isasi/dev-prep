// Mi CV, todo en un lugar: tus datos de contacto, tu CV base (de donde la IA hace el CV de cada oferta)
// con su hoja lista para descargar en PDF, los CV que ya hiciste para ofertas, mensajes para copiar y la
// revisión con IA. Una columna, simple y legible por los filtros automáticos de las empresas (ATS).
import { useEffect, useState } from "react";
import { RevisarCv } from "../../components/ia/TrabajoIa.jsx";
import { Markdown } from "../../components/Markdown.jsx";
import { api } from "../../lib/api.js";
import { CV_BASE_INICIAL, MAX_CV_AUTO_DIA } from "../../../../server/cv-oferta.js";
import { ListaCvsOferta } from "./CvOferta.jsx";
import estilos from "./Trabajo.module.css";
import propio from "./CvOferta.module.css";
import { Esqueleto } from "../../components/Esqueleto.jsx";

const MENSAJES = [
  {
    titulo: "A un reclutador (LinkedIn)",
    texto:
      "Hola [nombre], vi la oferta de [puesto] en [empresa]. Soy desarrollador frontend junior: trabajo con JavaScript, React y TypeScript, y mis proyectos están en [GitHub]. Me encantaría conversar sobre cómo puedo aportar al equipo. ¡Gracias!",
  },
  {
    titulo: "Seguimiento después de la entrevista",
    texto:
      "Hola [nombre], gracias por la conversación de hoy. Me quedé con muchas ganas de sumarme a [equipo], sobre todo por [algo concreto que te contaron]. Quedo atento a los siguientes pasos.",
  },
  {
    titulo: "In English (recruiter)",
    texto:
      "Hi [name], I saw the [role] opening at [company]. I'm a junior frontend developer working with JavaScript, React and TypeScript; you can see my projects on [GitHub]. I'd love to talk about how I could help the team. Thanks!",
  },
];

const CONTACTO = [
  ["nombre", "Nombre completo"],
  ["titular", "Titular"],
  ["ciudad", "Ciudad"],
  ["telefono", "Teléfono"],
  ["correo", "Correo"],
  ["linkedin", "LinkedIn"],
  ["github", "GitHub"],
  ["portafolio", "Portafolio"],
];

/** En la hoja, cada "# Sección" del CV base es un subtítulo y cada "## Puesto" una línea en negrita. */
const paraHoja = (texto) => texto.replace(/^## /gm, "### ").replace(/^# /gm, "## ");

export function Cv() {
  const [cv, setCv] = useState(null);
  const [cvBase, setCvBase] = useState(null);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    api.cv().then((r) => setCv(r.datos));
    api.cvBase().then(setCvBase);
  }, []);
  if (!cv || !cvBase) return <Esqueleto variante="texto" />;

  const cambiarDato = (campo) => (e) => {
    setCv({ ...cv, [campo]: e.target.value });
    setGuardado(false);
  };
  const cambiarBase = (cambio) => {
    setCvBase({ ...cvBase, ...cambio });
    setGuardado(false);
  };
  const faltanDatos = !cv.telefono || !cv.correo || !cv.linkedin;

  return (
    <div className={propio.miCv}>
      <form
        className={`${estilos.panel} ${estilos.noImprimir}`}
        onSubmit={async (e) => {
          e.preventDefault();
          await Promise.all([api.guardarCv(cv), api.guardarCvBase(cvBase)]);
          setGuardado(true);
        }}
      >
        <details className={propio.contacto} open={faltanDatos}>
          <summary>
            Datos de contacto
            <small>{[cv.nombre, cv.telefono, cv.correo].filter(Boolean).join(" · ") || "Sin completar"}</small>
          </summary>
          <div className={estilos.campos}>
            {CONTACTO.map(([campo, texto]) => (
              <label key={campo}>
                {texto}
                <input value={cv[campo] ?? ""} onChange={cambiarDato(campo)} />
              </label>
            ))}
          </div>
        </details>

        <strong>Tu CV base</strong>
        <small className={estilos.tenue}>
          De aquí parte el CV de cada oferta: la IA lo reordena y lo reescribe, pero no agrega nada que no esté aquí. Mantenlo completo y al día.
        </small>
        <textarea className={propio.base} rows={22} value={cvBase.texto} onChange={(e) => cambiarBase({ texto: e.target.value })} />
        <label className={propio.umbral}>
          Hacer el CV solo cuando una oferta tenga
          <input type="number" min={50} max={100} value={cvBase.umbral} onChange={(e) => cambiarBase({ umbral: Math.max(50, Math.min(100, Number(e.target.value) || 80)) })} />
          de 100 o más (como mucho {MAX_CV_AUTO_DIA} por día)
        </label>
        <div className={estilos.fila}>
          <button type="submit" className="boton boton-primario">
            Guardar
          </button>
          <button type="button" className="boton" onClick={() => window.print()}>
            Descargar PDF
          </button>
          {cvBase.texto !== CV_BASE_INICIAL && (
            <button type="button" className="boton boton-fantasma" onClick={() => cambiarBase({ texto: CV_BASE_INICIAL })}>
              Volver al texto inicial
            </button>
          )}
          {guardado && <span className={estilos.tenue}>Guardado</span>}
        </div>
      </form>

      {/* Vista previa: es lo que se imprime (tu CV general, sin adaptar a ninguna oferta) */}
      <article className={`${estilos.hoja} ${propio.hojaBase}`}>
        <h1>{cv.nombre || "Tu nombre"}</h1>
        {cv.titular && <p className={estilos.titular}>{cv.titular}</p>}
        <p className={estilos.contacto}>{[cv.ciudad, cv.telefono, cv.correo].filter(Boolean).join(" • ")}</p>
        <p className={estilos.contacto}>{[cv.linkedin, cv.github, cv.portafolio].filter(Boolean).join(" • ")}</p>
        <Markdown>{paraHoja(cvBase.texto)}</Markdown>
      </article>

      <div className={`${propio.debajo} ${estilos.noImprimir}`}>
        <ListaCvsOferta />
        <div className={estilos.panel}>
          <strong>Mensajes listos para copiar</strong>
          {MENSAJES.map((m) => (
            <details key={m.titulo}>
              <summary>{m.titulo}</summary>
              <p className={estilos.tenue}>{m.texto}</p>
              <button type="button" className="boton boton-fantasma" onClick={() => navigator.clipboard?.writeText(m.texto)}>
                Copiar
              </button>
            </details>
          ))}
        </div>
        <RevisarCv />
      </div>
    </div>
  );
}
