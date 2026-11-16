import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { Markdown } from "./Markdown.jsx";
import { Grabadora } from "./Grabadora.jsx";
import estilos from "./PitchStar.module.css";

const PALABRAS_POR_MINUTO = 140;

const PARTES = [
  { campo: "situacion", nombre: "Situación", ayuda: "Contexto: dónde, cuándo, qué pasaba." },
  { campo: "tarea", nombre: "Tarea", ayuda: "Qué te tocaba resolver a ti." },
  { campo: "accion", nombre: "Acción", ayuda: "Qué hiciste tú, paso a paso. La parte más larga." },
  { campo: "resultado", nombre: "Resultado", ayuda: "Qué pasó (con números si puedes) y qué aprendiste." },
];

const SUGERENCIAS = [
  "Un problema técnico difícil",
  "Un error que cometí",
  "Un conflicto con un compañero",
  "Algo que aprendí rápido y solo",
  "El proyecto del que estoy más orgulloso",
];

const contarPalabras = (texto) => texto.trim().split(/\s+/).filter(Boolean).length;

/** Tu pitch de 1 minuto y tus historias con el método STAR, guardados en tu PC. */
export function PitchStar({ guias }) {
  const [datos, setDatos] = useState(null);
  const [estado, setEstado] = useState("listo"); // listo | cambios | guardando | guardado
  const [abierta, setAbierta] = useState(null);

  useEffect(() => {
    api.misRespuestas().then(setDatos);
  }, []);

  if (!datos) return <p>Cargando…</p>;

  const cambiar = (nuevos) => {
    setDatos((d) => ({ ...d, ...nuevos }));
    setEstado("cambios");
  };

  const cambiarHistoria = (id, campo, valor) =>
    cambiar({ historias: datos.historias.map((h) => (h.id === id ? { ...h, [campo]: valor } : h)) });

  function agregar(titulo = "") {
    const id = `h${Date.now()}`;
    cambiar({ historias: [...datos.historias, { id, titulo, situacion: "", tarea: "", accion: "", resultado: "" }] });
    setAbierta(id);
  }

  async function guardar() {
    setEstado("guardando");
    setDatos(await api.guardarMisRespuestas(datos));
    setEstado("guardado");
  }

  const palabras = contarPalabras(datos.pitch);
  const segundos = Math.round((palabras / PALABRAS_POR_MINUTO) * 60);
  const faltantes = SUGERENCIAS.filter((s) => !datos.historias.some((h) => h.titulo === s));

  return (
    <div className={estilos.contenedor}>
      <div className={estilos.guardar}>
        <span>
          {estado === "cambios" && "Tienes cambios sin guardar"}
          {estado === "guardado" && "Guardado en tu PC"}
        </span>
        <button
          type="button"
          className="boton boton-primario"
          onClick={guardar}
          disabled={estado !== "cambios"}
        >
          Guardar
        </button>
      </div>

      <section className={estilos.bloque}>
        <h2>Tu pitch de 1 minuto</h2>
        <p className={estilos.ayuda}>Tu respuesta a "háblame de ti": quién eres hoy, qué has hecho y qué buscas.</p>
        <textarea
          className={estilos.texto}
          rows={7}
          aria-label="Tu pitch"
          placeholder="Soy estudiante de Ingeniería de Sistemas y me estoy enfocando en desarrollo frontend..."
          value={datos.pitch}
          onChange={(e) => cambiar({ pitch: e.target.value })}
        />
        <p className={estilos.medidor} data-ok={segundos >= 45 && segundos <= 75}>
          {palabras} palabras · unos {segundos} s hablando
          {palabras > 0 && segundos < 45 && " · se queda corto"}
          {segundos > 75 && " · demasiado largo, recórtalo"}
        </p>
        <Grabadora clave="pitch" maxSegundos={90} texto="Grabarme diciendo mi pitch" />
        <details className={estilos.guia}>
          <summary>Cómo armar tu pitch</summary>
          <Markdown>{guias.pitch}</Markdown>
        </details>
      </section>

      <section className={estilos.bloque}>
        <h2>Tus historias STAR</h2>
        <p className={estilos.ayuda}>
          Prepara 4 o 5 historias reales y adáptalas a cualquier pregunta de comportamiento.
        </p>

        {datos.historias.map((h) => (
          <div key={h.id} className={estilos.historia}>
            <button
              type="button"
              className={estilos.historiaCabecera}
              onClick={() => setAbierta(abierta === h.id ? null : h.id)}
              aria-expanded={abierta === h.id}
            >
              <span>{h.titulo || "Historia sin título"}</span>
              <span className={estilos.completo}>
                {PARTES.filter((p) => h[p.campo].trim()).length}/4
              </span>
            </button>
            {abierta === h.id && (
              <div className={estilos.historiaCuerpo}>
                <label>
                  <span>Título</span>
                  <input value={h.titulo} onChange={(e) => cambiarHistoria(h.id, "titulo", e.target.value)} />
                </label>
                {PARTES.map((p) => (
                  <label key={p.campo}>
                    <span>
                      {p.nombre} <small>{p.ayuda}</small>
                    </span>
                    <textarea
                      rows={p.campo === "accion" ? 4 : 2}
                      value={h[p.campo]}
                      onChange={(e) => cambiarHistoria(h.id, p.campo, e.target.value)}
                    />
                  </label>
                ))}
                <button
                  type="button"
                  className="boton boton-fantasma boton-peligro"
                  onClick={() => cambiar({ historias: datos.historias.filter((x) => x.id !== h.id) })}
                >
                  Eliminar historia
                </button>
              </div>
            )}
          </div>
        ))}

        <div className={estilos.sugerencias}>
          {faltantes.map((s) => (
            <button key={s} type="button" className="boton" onClick={() => agregar(s)}>
              + {s}
            </button>
          ))}
          <button type="button" className="boton boton-fantasma" onClick={() => agregar()}>
            + Otra historia
          </button>
        </div>

        <details className={estilos.guia}>
          <summary>Qué es el método STAR (con un ejemplo)</summary>
          <Markdown>{guias.star}</Markdown>
        </details>
      </section>
    </div>
  );
}
