// Tu CV de una columna, simple y legible por los filtros automáticos de las empresas (ATS).
// Las habilidades salen de lo que de verdad dominas (temas en verde). Se exporta a PDF con "Imprimir".
import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import estilos from "./Trabajo.module.css";

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

export function Cv() {
  const [cv, setCv] = useState(null);
  const [habilidades, setHabilidades] = useState([]);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    api.cv().then((r) => {
      setCv(r.datos);
      setHabilidades(r.habilidades);
    });
  }, []);
  if (!cv) return null;

  const cambiar = (campo) => (e) => {
    setCv({ ...cv, [campo]: e.target.value });
    setGuardado(false);
  };
  const proyectos = cv.proyectos ?? [];

  return (
    <div className={estilos.cv}>
      <form
        className={`${estilos.panel} ${estilos.noImprimir}`}
        onSubmit={async (e) => {
          e.preventDefault();
          await api.guardarCv(cv);
          setGuardado(true);
        }}
      >
        <div className={estilos.campos}>
          {[
            ["nombre", "Nombre completo"],
            ["titular", "Titular"],
            ["ciudad", "Ciudad"],
            ["correo", "Correo"],
            ["telefono", "Teléfono"],
            ["github", "GitHub (enlace)"],
            ["linkedin", "LinkedIn (enlace)"],
            ["idiomas", "Idiomas"],
          ].map(([campo, texto]) => (
            <label key={campo}>
              {texto}
              <input value={cv[campo] ?? ""} onChange={cambiar(campo)} />
            </label>
          ))}
        </div>
        <label className={estilos.ancho}>
          Sobre mí (3 líneas: qué haces, con qué y qué buscas)
          <textarea rows={3} value={cv.sobreMi ?? ""} onChange={cambiar("sobreMi")} />
        </label>
        <label className={estilos.ancho}>
          Estudios
          <input value={cv.estudios ?? ""} onChange={cambiar("estudios")} placeholder="Ingeniería de Sistemas, [universidad], 20XX a la fecha" />
        </label>
        <strong>Proyectos</strong>
        {proyectos.map((p, i) => (
          <div key={i} className={estilos.campos}>
            <input value={p.titulo} placeholder="Título" onChange={(e) => setCv({ ...cv, proyectos: proyectos.map((x, j) => (j === i ? { ...x, titulo: e.target.value } : x)) })} />
            <input value={p.enlace} placeholder="Enlace" onChange={(e) => setCv({ ...cv, proyectos: proyectos.map((x, j) => (j === i ? { ...x, enlace: e.target.value } : x)) })} />
            <input value={p.descripcion} placeholder="Qué hace y con qué" onChange={(e) => setCv({ ...cv, proyectos: proyectos.map((x, j) => (j === i ? { ...x, descripcion: e.target.value } : x)) })} />
          </div>
        ))}
        <div className={estilos.fila}>
          <button type="button" className="boton" onClick={() => setCv({ ...cv, proyectos: [...proyectos, { titulo: "", enlace: "", descripcion: "" }] })}>
            + Proyecto
          </button>
          <button type="submit" className="boton boton-primario">
            Guardar
          </button>
          <button type="button" className="boton" onClick={() => window.print()}>
            Descargar PDF (Imprimir → Guardar como PDF)
          </button>
          {guardado && <span className={estilos.tenue}>Guardado</span>}
        </div>
      </form>

      {/* Vista previa: es lo que se imprime */}
      <article className={estilos.hoja}>
        <h1>{cv.nombre || "Tu nombre"}</h1>
        <p className={estilos.titular}>{cv.titular}</p>
        <p className={estilos.contacto}>{[cv.ciudad, cv.correo, cv.telefono, cv.github, cv.linkedin].filter(Boolean).join(" · ")}</p>
        {cv.sobreMi && (
          <>
            <h2>Perfil</h2>
            <p>{cv.sobreMi}</p>
          </>
        )}
        <h2>Habilidades</h2>
        {habilidades.length ? (
          <ul>
            {habilidades.map((h) => (
              <li key={h.nombre}>
                <strong>{h.nombre}:</strong> {h.temas.join(", ")}
              </li>
            ))}
          </ul>
        ) : (
          <p className={estilos.noImprimir}>Cuando pongas temas en verde en tu mapa, aparecen aquí solos.</p>
        )}
        {proyectos.some((p) => p.titulo) && (
          <>
            <h2>Proyectos</h2>
            <ul>
              {proyectos
                .filter((p) => p.titulo)
                .map((p, i) => (
                  <li key={i}>
                    <strong>{p.titulo}</strong>
                    {p.enlace && ` · ${p.enlace}`}
                    {p.descripcion && `: ${p.descripcion}`}
                  </li>
                ))}
            </ul>
          </>
        )}
        {cv.estudios && (
          <>
            <h2>Estudios</h2>
            <p>{cv.estudios}</p>
          </>
        )}
        {cv.idiomas && (
          <>
            <h2>Idiomas</h2>
            <p>{cv.idiomas}</p>
          </>
        )}
      </article>

      <div className={`${estilos.panel} ${estilos.noImprimir}`}>
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
    </div>
  );
}
