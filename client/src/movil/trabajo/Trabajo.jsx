// "Conseguir trabajo": todo lo que va más allá de practicar. Pestañas: postulaciones (con las preguntas
// reales que te hicieron), ¿estoy listo para esta oferta?, tu CV, portafolio, y pruebas técnicas y proyecto.
import { useEffect, useState } from "react";
import { usePestanaUrl } from "../../hooks/usePestanaUrl.js";
import { api } from "../../lib/api.js";
import { ETAPAS, mensajeSeguimiento } from "../../../../server/postulaciones.js";
import { CabeceraPagina } from "../../components/CabeceraPagina.jsx";
import { ContenidoPestanas, Pestanas } from "../../components/Pestanas.jsx";
import { Tarjeta } from "../../components/Tarjeta.jsx";
import { Cv } from "./Cv.jsx";
import { Portafolio, PruebasYProyecto } from "./Proyectos.jsx";
import { ListaAnimada } from "../../components/ListaAnimada.jsx";
import { OfertasParaTi } from "./Ofertas.jsx";
import estilos from "./Trabajo.module.css";
import { Esqueleto } from "../../components/Esqueleto.jsx";

const nombreEtapa = Object.fromEntries(ETAPAS);
const vacia = { empresa: "", puesto: "", enlace: "", fuente: "", etapa: "por-postular", notas: "", proximo: "", proximoFecha: "" };
/** Sugerencias para el campo "Dónde la viste" (puedes escribir otra). */
const FUENTES = ["LinkedIn", "Get on Board", "Computrabajo", "Bumeran", "Remotive", "We Work Remotely", "Himalayas", "RemoteOK", "Arbeitnow", "Referido", "Web de la empresa"];

const PREGUNTAS_PARA_ELLOS = [
  "¿Cómo es un día normal de alguien junior en el equipo?",
  "¿Cómo acompañan a quien recién entra (mentoría, revisiones de código)?",
  "¿Qué tendría que lograr en mis primeros 3 meses para que digan que fue un buen ingreso?",
];

export function Trabajo() {
  // ?pestana=postulaciones: el aviso de seguimiento abre directo en tus postulaciones
  const [pestana, setPestana] = usePestanaUrl(["ofertas", "postulaciones", "oferta", "cv", "portafolio", "pruebas"]);
  const pestanas = [
    { id: "ofertas", texto: "Ofertas para ti" },
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
      <ContenidoPestanas activa={pestana} orden={pestanas.map((p) => p.id)} className={estilos.contenido}>
        {pestana === "ofertas" && <OfertasParaTi />}
        {pestana === "postulaciones" && <Postulaciones />}
        {pestana === "oferta" && <Oferta />}
        {pestana === "cv" && <Cv />}
        {pestana === "portafolio" && <Portafolio />}
        {pestana === "pruebas" && <PruebasYProyecto />}
      </ContenidoPestanas>
    </section>
  );
}

function Postulaciones() {
  const [lista, setLista] = useState(null);
  const [editando, setEditando] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [nueva, setNueva] = useState({ pregunta: "", empresa: "" });
  const [repaso, setRepaso] = useState(null);
  const [resumen, setResumen] = useState(null);

  const cargar = () => {
    api.postulaciones().then(setLista);
    api.preguntasPropias().then(setPreguntas);
    api.resumenPostulaciones?.().then(setResumen);
  };
  useEffect(() => {
    cargar();
  }, []);
  if (!lista) return <Esqueleto variante="lista" />;

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

      {resumen && <Seguimientos pendientes={resumen.pendientes} alCambiar={cargar} />}
      {resumen && <MetaSemanal meta={resumen.meta} alCambiar={cargar} />}

      {editando && (
        <form className={estilos.panel} onSubmit={guardar}>
          <div className={estilos.campos}>
            <label>
              Empresa
              <input required value={editando.empresa} onChange={(e) => setEditando({ ...editando, empresa: e.target.value })} />
            </label>
            <label>
              Puesto
              <input
                value={editando.puesto}
                onChange={(e) => setEditando({ ...editando, puesto: e.target.value })}
                placeholder="Frontend Developer Jr"
              />
            </label>
            <label>
              Enlace de la oferta
              <input value={editando.enlace} onChange={(e) => setEditando({ ...editando, enlace: e.target.value })} />
            </label>
            <label>
              Dónde la viste
              <input
                list="fuentes-postulacion"
                value={editando.fuente ?? ""}
                onChange={(e) => setEditando({ ...editando, fuente: e.target.value })}
                placeholder="LinkedIn"
              />
              <datalist id="fuentes-postulacion">
                {FUENTES.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
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
              <input
                value={editando.proximo}
                onChange={(e) => setEditando({ ...editando, proximo: e.target.value })}
                placeholder="Mandar la prueba técnica"
              />
            </label>
            <label>
              Para cuándo
              <input
                type="date"
                value={editando.proximoFecha}
                onChange={(e) => setEditando({ ...editando, proximoFecha: e.target.value })}
              />
            </label>
          </div>
          <label className={estilos.ancho}>
            Notas (qué investigaste de la empresa, con quién hablaste)
            <textarea rows={3} value={editando.notas} onChange={(e) => setEditando({ ...editando, notas: e.target.value })} />
          </label>
          <details className={estilos.ayuda}>
            <summary>Antes de la entrevista: investiga la empresa y lleva preguntas</summary>
            <p>
              Qué hace, a quién le vende, qué stack usa (mira su web y sus ofertas), y una noticia reciente. Tres preguntas para hacerles:
            </p>
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

      {lista.length === 0 && !editando && (
        <p className={estilos.ayuda}>Todavía no hay postulaciones. Cuando postules, anótala aquí para no perder el hilo.</p>
      )}
      <ListaAnimada className={estilos.lista}>
        {lista.map((p) => (
          <li key={p.id} className={estilos.item} data-etapa={p.etapa}>
            <div>
              <strong>{p.empresa}</strong> {p.puesto && <span className={estilos.tenue}>· {p.puesto}</span>}
              <small>
                {nombreEtapa[p.etapa] ?? p.etapa}
                {p.fuente && ` · ${p.fuente}`}
                {p.enviadaEl && p.etapa !== "por-postular" && ` · Enviada el ${p.enviadaEl}`}
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

      {resumen?.numeros.total > 0 && <Numeros numeros={resumen.numeros} />}

      <div className={estilos.fila}>
        <h2>Me preguntaron esto</h2>
        {pendientes.length > 0 && (
          <button type="button" className="boton boton-primario" onClick={() => setRepaso({ lista: pendientes, i: 0 })}>
            Repasar {pendientes.length}
          </button>
        )}
      </div>
      <p className={estilos.ayuda}>
        Las preguntas reales de tus entrevistas valen oro: anótalas apenas salgas y entran a tu repaso como tarjetas.
      </p>
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
        <input
          className={estilos.crece}
          value={nueva.pregunta}
          onChange={(e) => setNueva({ ...nueva, pregunta: e.target.value })}
          placeholder="¿Qué diferencia hay entre..."
        />
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

/** Postulaciones con 7 días o más sin respuesta: escribe un seguimiento o márcala como sin respuesta. */
function Seguimientos({ pendientes, alCambiar }) {
  const [copiado, setCopiado] = useState(null);
  if (!pendientes.length) return null;
  return (
    <div className={estilos.panel} data-estado="aviso">
      <strong>
        {pendientes.length === 1 ? "1 postulación espera tu seguimiento" : `${pendientes.length} postulaciones esperan tu seguimiento`}
      </strong>
      <p className={estilos.tenue}>
        Una semana sin respuesta es normal. Un mensaje corto y amable muestra interés; si después de otra semana sigue sin respuesta, márcala y
        sigue postulando.
      </p>
      <ul className={estilos.lista}>
        {pendientes.map((p) => (
          <li key={p.id} className={estilos.item} data-etapa="enviada">
            <div>
              <strong>{p.empresa}</strong>
              <small>
                {p.puesto && `${p.puesto} · `}
                {p.seguimientos > 0
                  ? `Le escribiste hace ${p.dias} días y sigue sin respuesta`
                  : `Enviada hace ${p.dias} días, sin respuesta`}
              </small>
            </div>
            <div className={estilos.acciones}>
              {p.seguimientos === 0 && (
                <>
                  <button
                    type="button"
                    className="boton"
                    onClick={async () => {
                      await navigator.clipboard?.writeText(mensajeSeguimiento(p, "es"));
                      setCopiado(`${p.id}-es`);
                    }}
                  >
                    {copiado === `${p.id}-es` ? "✓ Copiado" : "Copiar seguimiento"}
                  </button>
                  <button
                    type="button"
                    className="boton boton-fantasma"
                    onClick={async () => {
                      await navigator.clipboard?.writeText(mensajeSeguimiento(p, "en"));
                      setCopiado(`${p.id}-en`);
                    }}
                  >
                    {copiado === `${p.id}-en` ? "✓ Copied" : "In English"}
                  </button>
                  <button
                    type="button"
                    className="boton"
                    onClick={async () => {
                      await api.marcarSeguimiento(p.id);
                      alCambiar();
                    }}
                  >
                    Ya le escribí
                  </button>
                </>
              )}
              <button
                type="button"
                className={p.seguimientos > 0 ? "boton boton-primario" : "boton boton-fantasma"}
                onClick={async () => {
                  await api.marcarSinRespuesta(p.id);
                  alCambiar();
                }}
              >
                Sin respuesta
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Meta de postulaciones por semana (0 = apagada). Actívala cuando empieces a postular de verdad. */
function MetaSemanal({ meta, alCambiar }) {
  const [valor, setValor] = useState(meta.meta);
  useEffect(() => setValor(meta.meta), [meta.meta]);
  const guardar = async () => {
    await api.cambiarMetaPostulaciones(valor);
    alCambiar();
  };
  return (
    <div className={estilos.panel} data-estado={meta.cumplida ? "dominas" : undefined}>
      <div className={estilos.fila}>
        <strong>
          {meta.meta > 0
            ? meta.cumplida
              ? `✓ Meta de la semana cumplida: ${meta.hechas} de ${meta.meta} postulaciones`
              : `Esta semana: ${meta.hechas} de ${meta.meta} postulaciones (te ${meta.faltan === 1 ? "falta 1" : `faltan ${meta.faltan}`})`
            : "Meta semanal de postulaciones: apagada"}
        </strong>
        <label className={estilos.metaCampo}>
          Por semana
          <input type="number" min={0} max={20} value={valor} onChange={(e) => setValor(e.target.value)} onBlur={guardar} />
        </label>
      </div>
      {meta.meta > 0 ? (
        <div className={estilos.barraMeta} role="progressbar" aria-valuemin={0} aria-valuemax={meta.meta} aria-valuenow={meta.hechas}>
          <span style={{ width: `${Math.min(100, (meta.hechas / meta.meta) * 100)}%` }} />
        </div>
      ) : (
        <small className={estilos.tenue}>
          Actívala cuando empieces a postular de verdad (por ejemplo, 3 por semana). Cuenta las que pasas de "Por postular" a "Enviada".
        </small>
      )}
    </div>
  );
}

/** Tus números: postulaciones por semana, cuántas respondieron y qué fuente te responde más. */
function Numeros({ numeros }) {
  const maximo = Math.max(1, ...numeros.porSemana.map((s) => s.cantidad));
  return (
    <div className={estilos.panel}>
      <strong>Tus números</strong>
      <p className={estilos.tenue}>
        Enviaste {numeros.total} {numeros.total === 1 ? "postulación" : "postulaciones"} y {numeros.respondieron} te{" "}
        {numeros.respondieron === 1 ? "respondió" : "respondieron"} ({numeros.tasa}%). {numeros.esperando > 0 && `${numeros.esperando} siguen esperando. `}
        Que muchas no respondan es normal al buscar el primer trabajo: no te desanimes y fíjate qué fuente te responde más.
      </p>
      <div className={estilos.semanas} aria-label="Postulaciones por semana, las últimas 8">
        {numeros.porSemana.map((s) => (
          <div key={s.semana} title={`Semana del ${s.semana}: ${s.cantidad}`}>
            <span style={{ height: `${(s.cantidad / maximo) * 100}%` }} />
            <small>{s.cantidad}</small>
          </div>
        ))}
      </div>
      <small className={estilos.tenue}>Por semana, las últimas 8 (la de la derecha es esta).</small>
      {numeros.porFuente.length > 0 && (
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th>Fuente</th>
              <th>Enviadas</th>
              <th>Respondieron</th>
            </tr>
          </thead>
          <tbody>
            {numeros.porFuente.map((f) => (
              <tr key={f.fuente}>
                <td>{f.fuente}</td>
                <td>{f.enviadas}</td>
                <td>
                  {f.respondieron} ({Math.round((f.respondieron / f.enviadas) * 100)}%)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
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

const ESTADOS_OFERTA = {
  dominas: "Lo dominas",
  "en-progreso": "En progreso",
  "por-empezar": "Está en dev-prep: por empezar",
  "no-esta": "No está en dev-prep",
};

function Oferta() {
  const [texto, setTexto] = useState("");
  const [r, setR] = useState(null);
  return (
    <>
      <p className={estilos.ayuda}>
        Pega el texto de una oferta. Detecto las tecnologías que pide y las cruzo con lo que de verdad dominas (tu mapa).
      </p>
      <textarea
        className={estilos.oferta}
        rows={8}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscamos Frontend Developer Jr con React, TypeScript..."
      />
      <button
        type="button"
        className="boton boton-primario"
        disabled={!texto.trim()}
        onClick={async () => setR(await api.analizarOferta(texto))}
      >
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
            Consejo: si dominas la mayoría y lo demás está en progreso, postula igual. Las ofertas junior piden más de lo que de verdad
            exigen.
          </p>
        </div>
      )}
    </>
  );
}
