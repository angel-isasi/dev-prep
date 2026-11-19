// Entrevista por voz: el entrevistador (la IA) te hace la pregunta en voz alta, tú respondes hablando
// y él repregunta sobre lo que dijiste, como en una llamada real. No hay corrección en medio: el
// detalle de cada respuesta y el informe llegan al final, igual que en una entrevista de verdad.
//
// Piezas: la voz del navegador lee (lib/voz.js: decir), el reconocimiento del navegador transcribe
// (dictar) y cada respuesta se evalúa con la misma tarea "entrevista" de las tarjetas (lib/ia.js).
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { guardarClaveIa, pedirIa } from "../lib/ia.js";
import { feedback } from "../lib/feedback.js";
import { decir, dictar, hayVozEn, microDisponible } from "../lib/voz.js";
import { elegirPreguntas, TODAS_LAS_ETAPAS as TODO } from "../../../server/simulacro.js";
import { contextoPersonal, PuertaIa, UsoIa } from "./EvaluadorIa.jsx";
import { InformeIa } from "./InformeIa.jsx";
import { IconoAudio, IconoMicrofono } from "./Iconos.jsx";
import estilos from "./EntrevistaVoz.module.css";

const VEREDICTOS = { sabia: "Bien", dude: "Regular", no: "Floja" };
const contarPalabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;
const sinFormato = (t) => String(t ?? "").replaceAll("`", "");

/** @param {{ proceso: object }} props  proceso: las etapas de content/entrevistas/proceso.json */
export function EntrevistaVoz({ proceso }) {
  return <PuertaIa>{() => <Entrevista proceso={proceso} />}</PuertaIa>;
}

function Entrevista({ proceso }) {
  const [estado, setEstado] = useState("inicio"); // inicio | curso | fin
  const [config, setConfig] = useState({ etapa: TODO, cantidad: 3, repreguntas: 1, ingles: false });
  const [preguntas, setPreguntas] = useState([]);
  const [indice, setIndice] = useState(0);
  const [vuelta, setVuelta] = useState(0); // 0: la pregunta; 1 en adelante: repreguntas
  const [textoPregunta, setTextoPregunta] = useState("");
  const [fase, setFase] = useState("hablando"); // hablando | escuchando | pensando
  const [respuesta, setRespuesta] = useState("");
  const [dictando, setDictando] = useState(false);
  const [turnos, setTurnos] = useState([]); // { id, etapa, principal, pregunta, respuesta, r }
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [informe, setInforme] = useState(null);
  const [guardado, setGuardado] = useState(false);
  const [inicio, setInicio] = useState(0);

  const callar = useRef(null); // cancela lo que esté diciendo el entrevistador
  const dictado = useRef(null);
  const textoActual = useRef(""); // la respuesta al día, también para lo que llega justo al detener el dictado
  const contexto = useRef(null);
  // Cambia al terminar o salir: una respuesta de la IA que llega tarde ya no sigue la entrevista
  const ronda = useRef(0);
  const [pideClave, setPideClave] = useState(false);

  const idioma = config.ingles ? "en" : "es";
  const tituloEtapa = (id) => proceso?.etapas?.find((e) => e.id === id)?.titulo ?? id;

  function silencio() {
    callar.current?.();
    callar.current = null;
    dictado.current?.detener();
    dictado.current = null;
  }
  useEffect(
    () => () => {
      ronda.current++;
      silencio();
    },
    [],
  );

  function cambiarRespuesta(valor) {
    textoActual.current = valor;
    setRespuesta(valor);
  }

  function escuchar() {
    if (!microDisponible()) return;
    setError(null);
    dictado.current = dictar({
      lang: config.ingles ? "en-US" : "es-PE",
      alTexto: (t) => cambiarRespuesta(textoActual.current ? `${textoActual.current} ${t}` : t),
      alTerminar: (e) => {
        setDictando(false);
        if (e) setError(e.message);
      },
    });
    setDictando(!!dictado.current);
  }

  /** El entrevistador dice la pregunta y, al terminar, empieza a escucharte. */
  function preguntar(texto) {
    silencio();
    setTextoPregunta(texto);
    cambiarRespuesta("");
    setError(null);
    setFase("hablando");
    callar.current = decir(sinFormato(texto), {
      idioma,
      alTerminar: () => {
        setFase("escuchando");
        escuchar();
      },
    });
  }

  async function empezar() {
    setCargando(true);
    try {
      const elegidas = elegirPreguntas(await api.tarjetas({}), config);
      if (!elegidas.length) return setError("No hay preguntas para esa etapa.");
      contexto.current = await contextoPersonal();
      setPreguntas(elegidas);
      setIndice(0);
      setVuelta(0);
      setTurnos([]);
      setInforme(null);
      setGuardado(false);
      setInicio(Date.now());
      setEstado("curso");
      preguntar(textoDe(elegidas[0]));
    } finally {
      setCargando(false);
    }
  }

  const textoDe = (p) => (config.ingles && p.preguntaEn ? p.preguntaEn : p.pregunta);

  /** Vuelve a decir la pregunta sin borrar lo que ya respondiste. */
  function repetir() {
    silencio();
    setFase("hablando");
    callar.current = decir(sinFormato(textoPregunta), {
      idioma,
      alTerminar: () => {
        setFase("escuchando");
        escuchar();
      },
    });
  }

  function terminar() {
    ronda.current++;
    silencio();
    setEstado("fin");
  }

  function siguiente() {
    ronda.current++; // saltar también descarta la respuesta que estuviera en camino
    if (indice + 1 >= preguntas.length) return terminar();
    setIndice(indice + 1);
    setVuelta(0);
    preguntar(textoDe(preguntas[indice + 1]));
  }

  async function enviar() {
    const estabaDictando = dictando;
    const estaRonda = ++ronda.current;
    dictado.current?.detener();
    setFase("pensando");
    setError(null);
    // Al detener el dictado, el navegador todavía entrega la última frase: se le da un momento
    if (estabaDictando) await new Promise((r) => setTimeout(r, 600));
    const dicho = textoActual.current.trim();
    const p = preguntas[indice];
    const principal = vuelta === 0;
    try {
      const base = principal
        ? { pregunta: textoPregunta, claves: p.claves ?? [], modelo: config.ingles && p.respuestaEn ? p.respuestaEn : p.respuesta }
        : { pregunta: textoPregunta }; // en la repregunta no hay lista ni modelo: la IA evalúa con su criterio
      // Solo se pide lo que se va a mostrar: la versión mejorada va en la pregunta principal y la repregunta solo si queda turno
      const omitir = [...(principal ? [] : ["mejor"]), ...(vuelta < config.repreguntas ? [] : ["repregunta"])];
      const r = await pedirIa({ tarea: "entrevista", ...base, omitir, categoria: p.categoria, idioma, contexto: contexto.current ?? "", respuesta: dicho });
      // Si mientras tanto terminaste, saltaste o saliste, la respuesta se descarta: nada de voz ni micrófono fuera de lugar
      if (ronda.current !== estaRonda) return;
      setTurnos((t) => [...t, { id: p.id, etapa: p.etapa ?? "tecnica", principal, pregunta: textoPregunta, respuesta: dicho, r }]);
      // La nota de la pregunta (no la de las repreguntas) entra a tu repaso de tarjetas
      if (principal) await api.calificar(p.id, r.veredicto).catch(() => {});
      if (vuelta < config.repreguntas && r.repregunta) {
        setVuelta(vuelta + 1);
        preguntar(r.repregunta);
      } else {
        siguiente();
      }
    } catch (e) {
      if (ronda.current !== estaRonda) return;
      setError(e.message);
      // Contraseña rechazada a mitad de la entrevista: se pide aquí mismo, sin perder lo ya respondido
      if (e.clave) setPideClave(true);
      setFase("escuchando");
    }
  }

  function guardarClave(evento) {
    evento.preventDefault();
    const clave = new FormData(evento.currentTarget).get("clave")?.toString().trim();
    if (!clave) return;
    guardarClaveIa(clave);
    setPideClave(false);
    enviar();
  }

  async function guardar(nuevoInforme) {
    setInforme(nuevoInforme);
    const principales = turnos.filter((t) => t.principal);
    // Cuenta como simulacro si respondiste casi todo, no si lo cortaste en la primera pregunta
    if (guardado || principales.length < Math.min(3, preguntas.length)) return;
    setGuardado(true);
    feedback.logro("logro");
    await api.guardarSimulacro?.({
      segundos: Math.round((Date.now() - inicio) / 1000),
      voz: true,
      ingles: config.ingles,
      etapas: [...new Set(principales.map((t) => t.etapa))],
      pasos: principales.map((t) => ({ tipo: "pregunta", etapa: t.etapa, id: t.id, resultado: t.r.veredicto })),
      informe: { puntaje: nuevoInforme.puntaje, nivel: nuevoInforme.nivel, resumen: nuevoInforme.resumen, plan: nuevoInforme.plan },
    });
  }

  if (estado === "inicio") {
    const etapas = [{ id: TODO, titulo: "Un poco de todo" }, ...(proceso?.etapas ?? []).filter((e) => e.id !== "cierre")];
    const pedidos = config.cantidad * (1 + config.repreguntas) + 1;
    return (
      <div className={`textura ${estilos.panel}`}>
        <span className={estilos.etiqueta}>Entrevista por voz</span>
        <h2>Una llamada con el entrevistador</h2>
        <p>
          Él pregunta en voz alta, tú respondes hablando y repregunta sobre lo que dijiste. No te corrige en medio: al final ves cada
          respuesta evaluada y un informe con tu plan.
        </p>
        <div className={estilos.opciones}>
          <Grupo titulo="Sobre qué">
            {etapas.map((e) => (
              <Opcion key={e.id} activa={config.etapa === e.id} alElegir={() => setConfig({ ...config, etapa: e.id })}>
                {e.titulo}
              </Opcion>
            ))}
          </Grupo>
          <Grupo titulo="Preguntas">
            {[3, 5].map((n) => (
              <Opcion key={n} activa={config.cantidad === n} alElegir={() => setConfig({ ...config, cantidad: n })}>
                {n}
              </Opcion>
            ))}
          </Grupo>
          <Grupo titulo="Repreguntas por pregunta">
            {[1, 2].map((n) => (
              <Opcion key={n} activa={config.repreguntas === n} alElegir={() => setConfig({ ...config, repreguntas: n })}>
                {n}
              </Opcion>
            ))}
          </Grupo>
        </div>
        <label className={estilos.nota}>
          <input type="checkbox" checked={config.ingles} onChange={(e) => setConfig({ ...config, ingles: e.target.checked })} /> Hacerla en inglés
        </label>
        {!microDisponible() && <p className={estilos.aviso}>Este navegador no reconoce voz: vas a escribir tus respuestas. En Chrome sí funciona.</p>}
        {!hayVozEn(idioma) && <p className={estilos.aviso}>No hay una voz instalada para este idioma: vas a leer las preguntas en pantalla.</p>}
        {error && <p className={estilos.error}>{error}</p>}
        <div className={estilos.acciones}>
          <button type="button" className="boton boton-primario" disabled={cargando} onClick={empezar}>
            Empezar la entrevista
          </button>
          <span className={estilos.nota}>Unos {pedidos} pedidos de IA. Usa audífonos para que el micrófono no escuche al entrevistador.</span>
        </div>
        <UsoIa />
      </div>
    );
  }

  if (estado === "fin") {
    const principales = turnos.filter((t) => t.principal);
    const promedio = principales.length ? principales.reduce((a, t) => a + t.r.puntaje, 0) / principales.length : 0;
    const items = turnos.map((t) => ({ etapa: tituloEtapa(t.etapa), pregunta: t.pregunta, nota: t.r.veredicto, puntaje: t.r.puntaje, falta: t.r.falta, respuesta: t.respuesta }));
    return (
      <div className={estilos.final}>
        <div className={`${estilos.panel} ${estilos.cifras}`}>
          <div>
            <strong>{principales.length ? promedio.toFixed(1) : "0"}</strong>
            <span>promedio de 10</span>
          </div>
          <div>
            <strong>
              {principales.length}/{preguntas.length}
            </strong>
            <span>preguntas respondidas</span>
          </div>
          <div>
            <strong>{turnos.length - principales.length}</strong>
            <span>repreguntas</span>
          </div>
        </div>

        <InformeIa items={items} idioma={idioma} voz informe={informe} alInforme={guardar} automatico />

        <div className={estilos.turnos}>
          {turnos.map((t, i) => (
            <details key={i} className={estilos.turno} open={turnos.length <= 4}>
              <summary>
                <span className={estilos.turnoPregunta}>
                  {!t.principal && <small>Repregunta</small>}
                  {sinFormato(t.pregunta)}
                </span>
                <strong data-veredicto={t.r.veredicto}>
                  {t.r.puntaje}/10 · {VEREDICTOS[t.r.veredicto]}
                </strong>
              </summary>
              <p className={estilos.dicho}>
                <small>Dijiste</small>
                {t.respuesta}
              </p>
              {t.r.resumen && <p>{t.r.resumen}</p>}
              {t.r.falta.length > 0 && (
                <ul>
                  {t.r.falta.map((f, n) => (
                    <li key={n}>{f}</li>
                  ))}
                </ul>
              )}
              {t.r.mejor && (
                <p className={estilos.mejor} lang={idioma}>
                  <small>Así lo dirías mejor</small>
                  {t.r.mejor}
                </p>
              )}
            </details>
          ))}
        </div>

        <div className={estilos.acciones}>
          <button type="button" className="boton boton-primario" onClick={() => setEstado("inicio")}>
            Otra entrevista
          </button>
          {guardado && <span className={estilos.nota}>Guardada como simulacro. Las preguntas flojas ya están en tu repaso de tarjetas.</span>}
        </div>
      </div>
    );
  }

  const palabras = contarPalabras(respuesta);
  return (
    <div className={estilos.panel}>
      <div className={estilos.cabecera}>
        <span className={estilos.etiqueta}>
          Pregunta {indice + 1} de {preguntas.length}
          {vuelta > 0 ? " · repregunta" : ""}
        </span>
        <button type="button" className={estilos.enlace} onClick={terminar}>
          Terminar la entrevista
        </button>
      </div>

      <p className={estilos.pregunta} lang={idioma}>
        {sinFormato(textoPregunta)}
      </p>

      <p className={estilos.fase} data-fase={fase} role="status">
        {fase === "hablando" && (
          <>
            <IconoAudio tamano={16} /> El entrevistador está preguntando…
          </>
        )}
        {fase === "escuchando" &&
          (dictando ? (
            <>
              <IconoMicrofono tamano={16} /> Te escucho. Responde como en una entrevista.
            </>
          ) : (
            "Tu turno: dicta o escribe tu respuesta."
          ))}
        {fase === "pensando" && "Pensando lo siguiente… (unos segundos)"}
      </p>

      {fase !== "hablando" && (
        <textarea
          className={estilos.texto}
          rows={5}
          lang={idioma}
          value={respuesta}
          disabled={fase === "pensando"}
          onChange={(e) => cambiarRespuesta(e.target.value)}
          placeholder="Aquí aparece lo que vas diciendo. También puedes escribir o corregir."
        />
      )}
      {error && <p className={estilos.error}>{error}</p>}
      {pideClave && (
        <form className={estilos.acciones} onSubmit={guardarClave}>
          <input name="clave" type="password" autoComplete="off" aria-label="Código de acceso a la IA" placeholder="Código de acceso" className={estilos.clave} />
          <button type="submit" className="boton">
            Guardar y reenviar
          </button>
        </form>
      )}

      <div className={estilos.acciones}>
        {fase === "hablando" ? (
          <button
            type="button"
            className="boton"
            onClick={() => {
              callar.current?.();
              setFase("escuchando");
              escuchar();
            }}
          >
            Ya la leí, responder
          </button>
        ) : (
          <>
            <button type="button" className="boton boton-primario" disabled={fase === "pensando" || palabras < 3} onClick={enviar}>
              Enviar respuesta
            </button>
            {microDisponible() && fase === "escuchando" && (
              <button type="button" className="boton" data-activo={dictando} onClick={() => (dictando ? dictado.current?.detener() : escuchar())}>
                <IconoMicrofono tamano={16} /> {dictando ? "Pausar el micrófono" : "Seguir dictando"}
              </button>
            )}
            <button type="button" className="boton boton-fantasma" disabled={fase === "pensando"} onClick={repetir}>
              Repetir la pregunta
            </button>
            <button type="button" className="boton boton-fantasma" disabled={fase === "pensando"} onClick={siguiente}>
              Saltar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Grupo({ titulo, children }) {
  return (
    <div className={estilos.grupo}>
      <span className={estilos.grupoTitulo}>{titulo}</span>
      <div className={estilos.grupoOpciones}>{children}</div>
    </div>
  );
}

function Opcion({ activa, alElegir, children }) {
  return (
    <button type="button" className={estilos.opcion} aria-pressed={activa} onClick={alElegir}>
      {children}
    </button>
  );
}
