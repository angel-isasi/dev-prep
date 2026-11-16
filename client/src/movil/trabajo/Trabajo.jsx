// "Conseguir trabajo": todo lo que va más allá de practicar. Pestañas: postulaciones (con las preguntas
// reales que te hicieron), ¿estoy listo para esta oferta?, tu CV, portafolio, y pruebas técnicas y proyecto.
import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { CabeceraPagina } from "../../components/CabeceraPagina.jsx";
import { Pestanas } from "../../components/Pestanas.jsx";
import { Tarjeta } from "../../components/Tarjeta.jsx";
import { Cv } from "./Cv.jsx";
import { Portafolio, PruebasYProyecto } from "./Proyectos.jsx";
import { ListaAnimada } from "../../components/ListaAnimada.jsx";
import estilos from "./Trabajo.module.css";

const ETAPAS = [
  ["por-postular", "Por postular"],
  ["enviada", "Enviada"],
  ["prueba", "Prueba técnica"],
  ["entrevista", "Entrevista"],
  ["oferta", "Oferta"],
  ["rechazo", "No siguió"],
];
const nombreEtapa = Object.fromEntries(ETAPAS);
const vacia = { empresa: "", puesto: "", enlace: "", etapa: "por-postular", notas: "", proximo: "", proximoFecha: "" };

const PREGUNTAS_PARA_ELLOS = [
  "¿Cómo es un día normal de alguien junior en el equipo?",
  "¿Cómo acompañan a quien recién entra (mentoría, revisiones de código)?",
  "¿Qué tendría que lograr en mis primeros 3 meses para que digan que fue un buen ingreso?",
];

export function Trabajo() {
  const [pestana, setPestana] = useState("postulaciones");
  const pestanas = [
    { id: "postulaciones", texto: "Postulaciones" },
    { id: "oferta", texto: "¿Estoy listo?" },
    { id: "cv", texto: "Mi CV" },
    { id: "portafolio", texto: "Portafolio" },
    { id: "pruebas", texto: "Pruebas y proyecto" },
  ];
  return (
    <section className={estilos.pagina}>
      <CabeceraPagina etiqueta="Del estudio al trabajo" titulo="Conseguir trabajo">
        Tus postulaciones, qué te falta para una oferta, tu CV, tu portafolio y pruebas técnicas como las de las empresas.
      </CabeceraPagina>
      <Pestanas pestanas={pestanas} activa={pestana} alCambiar={setPestana} />
      <div className={estilos.contenido}>
        {pestana === "postulaciones" && <Postulaciones />}
        {pestana === "oferta" && <Oferta />}
        {pestana === "cv" && <Cv />}
        {pestana === "portafolio" && <Portafolio />}
        {pestana === "pruebas" && <PruebasYProyecto />}
      </div>
    </section>
  );
}

function Postulaciones() {
  const [lista, setLista] = useState(null);
  const [editando, setEditando] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [nueva, setNueva] = useState({ pregunta: "", empresa: "" });
  const [repaso, setRepaso] = useState(null);

  const cargar = () => {
    api.postulaciones().then(setLista);
    api.preguntasPropias().then(setPreguntas);
  };
  useEffect(() => {
    cargar();
  }, []);
  if (!lista) return null;

  async function guardar(e) {
    e.preventDefault();
    await api.guardarPostulacion(editando);
    setEditando(null);
    cargar();
  }

  const pendientes = preguntas.filter((p) => p.pendiente);
  if (repaso) {
    const actual = repaso.lista[repaso.i];
    if (!actual) {
      return (
        <div className={estilos.panel}>
          <p>Repasaste tus preguntas reales. Volverán cuando toque.</p>
          <button type="button" className="boton" onClick={() => (setRepaso(null), cargar())}>
            Volver
          </button>
        </div>
      );
    }
    return (
      <Tarjeta
        key={actual.id}
        pregunta={actual}
        grabar
        posicion={`${repaso.i + 1}/${repaso.lista.length}`}
        alCalificar={async (nota) => {
          await api.calificarPropia(actual.id, nota);
          setRepaso((r) => ({ ...r, i: r.i + 1 }));
        }}
      />
    );
  }

  return (
    <>
      <div className={estilos.fila}>
        <h2>Tus postulaciones</h2>
        <button type="button" className="boton boton-primario" onClick={() => setEditando({ ...vacia })}>
          + Nueva
        </button>
      </div>

      {editando && (
        <form className={estilos.panel} onSubmit={guardar}>
          <div className={estilos.campos}>
            <label>
              Empresa
              <input required value={editando.empresa} onChange={(e) => setEditando({ ...editando, empresa: e.target.value })} />
            </label>
            <label>
              Puesto
              <input value={editando.puesto} onChange={(e) => setEditando({ ...editando, puesto: e.target.value })} placeholder="Frontend Developer Jr" />
            </label>
            <label>
              Enlace de la oferta
              <input value={editando.enlace} onChange={(e) => setEditando({ ...editando, enlace: e.target.value })} />
            </label>
            <label>
              Etapa
              <select value={editando.etapa} onChange={(e) => setEditando({ ...editando, etapa: e.target.value })}>
                {ETAPAS.map(([v, t]) => (
                  <option key={v} value={v}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Próximo paso
              <input value={editando.proximo} onChange={(e) => setEditando({ ...editando, proximo: e.target.value })} placeholder="Mandar la prueba técnica" />
            </label>
            <label>
              Para cuándo
              <input type="date" value={editando.proximoFecha} onChange={(e) => setEditando({ ...editando, proximoFecha: e.target.value })} />
            </label>
          </div>
          <label className={estilos.ancho}>
            Notas (qué investigaste de la empresa, con quién hablaste)
            <textarea rows={3} value={editando.notas} onChange={(e) => setEditando({ ...editando, notas: e.target.value })} />
          </label>
          <details className={estilos.ayuda}>
            <summary>Antes de la entrevista: investiga la empresa y lleva preguntas</summary>
            <p>Qué hace, a quién le vende, qué stack usa (mira su web y sus ofertas), y una noticia reciente. Tres preguntas para hacerles:</p>
            <ul>
              {PREGUNTAS_PARA_ELLOS.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </details>
          <div className={estilos.fila}>
            <button type="submit" className="boton boton-primario">
              Guardar
            </button>
            <button type="button" className="boton boton-fantasma" onClick={() => setEditando(null)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {lista.length === 0 && !editando && <p className={estilos.ayuda}>Todavía no hay postulaciones. Cuando postules, anótala aquí para no perder el hilo.</p>}
      <ListaAnimada className={estilos.lista}>
        {lista.map((p) => (
          <li key={p.id} className={estilos.item} data-etapa={p.etapa}>
            <div>
              <strong>{p.empresa}</strong> {p.puesto && <span className={estilos.tenue}>· {p.puesto}</span>}
              <small>
                {nombreEtapa[p.etapa]}
                {p.proximo && ` · Próximo: ${p.proximo}${p.proximoFecha ? ` (${p.proximoFecha})` : ""}`}
              </small>
            </div>
            <div className={estilos.acciones}>
              {p.enlace && (
                <a href={p.enlace} target="_blank" rel="noreferrer" className="boton boton-fantasma">
                  Oferta
                </a>
              )}
              <button type="button" className="boton" onClick={() => setEditando({ ...vacia, ...p })}>
                Editar
              </button>
              <button
                type="button"
                className="boton boton-fantasma"
                onClick={async () => {
                  if (window.confirm(`¿Borrar la postulación a ${p.empresa}?`)) {
                    await api.borrarPostulacion(p.id);
                    cargar();
                  }
                }}
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ListaAnimada>

      <div className={estilos.fila}>
        <h2>Me preguntaron esto</h2>
        {pendientes.length > 0 && (
          <button type="button" className="boton boton-primario" onClick={() => setRepaso({ lista: pendientes, i: 0 })}>
            Repasar {pendientes.length}
          </button>
        )}
      </div>
      <p className={estilos.ayuda}>Las preguntas reales de tus entrevistas valen oro: anótalas apenas salgas y entran a tu repaso como tarjetas.</p>
      <form
        className={estilos.fila}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!nueva.pregunta.trim()) return;
          await api.guardarPreguntaPropia(nueva);
          setNueva({ pregunta: "", empresa: "" });
          cargar();
        }}
      >
        <input className={estilos.crece} value={nueva.pregunta} onChange={(e) => setNueva({ ...nueva, pregunta: e.target.value })} placeholder="¿Qué diferencia hay entre..." />
        <input value={nueva.empresa} onChange={(e) => setNueva({ ...nueva, empresa: e.target.value })} placeholder="Empresa" />
        <button type="submit" className="boton">
          Agregar
        </button>
      </form>
      <ul className={estilos.lista}>
        {preguntas.map((p) => (
          <PreguntaPropia key={p.id} pregunta={p} alCambiar={cargar} />
        ))}
      </ul>
    </>
  );
}

function PreguntaPropia({ pregunta, alCambiar }) {
  const [abierta, setAbierta] = useState(false);
  const [respuesta, setRespuesta] = useState(pregunta.respuesta);
  return (
    <li className={estilos.item}>
      <div>
        <strong>{pregunta.pregunta}</strong>
        {pregunta.empresa && <small>{pregunta.empresa}</small>}
        {abierta && (
          <>
            <textarea rows={4} value={respuesta} onChange={(e) => setRespuesta(e.target.value)} />
            <button
              type="button"
              className="boton"
              onClick={async () => {
                await api.guardarPreguntaPropia({ id: pregunta.id, pregunta: pregunta.pregunta, respuesta, empresa: pregunta.empresa });
                setAbierta(false);
                alCambiar();
              }}
            >
              Guardar respuesta
            </button>
          </>
        )}
      </div>
      <div className={estilos.acciones}>
        <button type="button" className="boton" onClick={() => setAbierta((v) => !v)}>
          {abierta ? "Cerrar" : "Tu respuesta"}
        </button>
        <button
          type="button"
          className="boton boton-fantasma"
          onClick={async () => {
            await api.borrarPreguntaPropia(pregunta.id);
            alCambiar();
          }}
        >
          Borrar
        </button>
      </div>
    </li>
  );
}

const ESTADOS_OFERTA = { dominas: "Lo dominas", "en-progreso": "En progreso", "por-empezar": "Está en dev-prep: por empezar", "no-esta": "No está en dev-prep" };

function Oferta() {
  const [texto, setTexto] = useState("");
  const [r, setR] = useState(null);
  return (
    <>
      <p className={estilos.ayuda}>Pega el texto de una oferta. Detecto las tecnologías que pide y las cruzo con lo que de verdad dominas (tu mapa).</p>
      <textarea className={estilos.oferta} rows={8} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscamos Frontend Developer Jr con React, TypeScript..." />
      <button type="button" className="boton boton-primario" disabled={!texto.trim()} onClick={async () => setR(await api.analizarOferta(texto))}>
        Analizar
      </button>
      {r && (
        <div className={estilos.panel}>
          <strong>
            Dominas {r.resumen.dominas} de {r.resumen.total} cosas que pide
          </strong>
          <ul className={estilos.lista}>
            {r.tecnologias.map((t) => (
              <li key={t.nombre} className={estilos.item} data-estado={t.estado}>
                <span>{t.nombre}</span>
                <small>
                  {ESTADOS_OFERTA[t.estado]}
                  {t.valor != null && ` · ${Math.round(t.valor * 100)}%`}
                </small>
              </li>
            ))}
          </ul>
          <p className={estilos.ayuda}>
            Consejo: si dominas la mayoría y lo demás está en progreso, postula igual. Las ofertas junior piden más de lo que de verdad exigen.
          </p>
        </div>
      )}
    </>
  );
}
