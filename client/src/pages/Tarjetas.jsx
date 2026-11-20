// Tarjetas de memoria (estilo Anki). Tres pestañas: Estudiar (una tarjeta a la vez), Mis tarjetas y Nueva.
// El algoritmo (FSRS, server/tarjetas-reglas.js) decide cuándo vuelve cada una, sin IA.
// La IA ayuda donde aporta: crea tarjetas de tus errores (tú apruebas), te pregunta de otra forma,
// sugiere el botón si respondes escribiendo o hablando, y te explica la tarjeta cuando la fallas.
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { fechaLocal } from "../../../server/fechas.js";
import { MAZOS, NOTAS, minutosCola, vistaPrevia } from "../../../server/tarjetas-reglas.js";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { Pestanas } from "../components/Pestanas.jsx";
import { Confirmar } from "../components/Confirmar.jsx";
import { CajaIa } from "../components/ia/CajaIa.jsx";
import { Propuestas } from "../components/ia/CrearTarjeta.jsx";
import { useIa } from "../components/ia/useIa.js";
import { claveIa } from "../lib/ia.js";
import { dictar, microDisponible } from "../lib/voz.js";
import { IconoMicrofono } from "../components/Iconos.jsx";
import base from "../components/EvaluadorIa.module.css";
import extra from "../components/ia/Ia.module.css";
import estilos from "../components/ia/Tarjetas.module.css";
import pagina from "./Entrevistas.module.css";

const NOMBRE_NOTA = { otra: "Otra vez", dificil: "Difícil", bien: "Bien", facil: "Fácil" };
const MAZOS_FILTRO = [["", "Todas"], ...Object.entries(MAZOS)];

function ChipsMazo({ mazo, alCambiar }) {
  return (
    <div className={extra.chips} role="radiogroup" aria-label="Mazo">
      {MAZOS_FILTRO.map(([id, nombre]) => (
        <button key={id} type="button" className={extra.chip} data-activo={mazo === id} aria-pressed={mazo === id} onClick={() => alCambiar(id)}>
          {nombre}
        </button>
      ))}
    </div>
  );
}

export function Tarjetas() {
  const [pestana, setPestana] = useState("estudiar");
  const [mazo, setMazo] = useState("");
  const [cola, setCola] = useState(null);
  const [sesion, setSesion] = useState(null); // { lista, indice, hechas }

  const cargar = useCallback(() => api.colaTarjetas?.(mazo || undefined).then(setCola), [mazo]);
  useEffect(() => {
    cargar();
  }, [cargar]);

  if (!api.colaTarjetas) {
    return <p className={base.suave}>Las tarjetas están en la versión web de dev-prep (el acceso directo del escritorio).</p>;
  }

  if (sesion) {
    return (
      <Sesion
        sesion={sesion}
        alTerminar={() => {
          setSesion(null);
          cargar();
        }}
      />
    );
  }

  return (
    <section className={`${pagina.pagina} ${estilos.pagina}`}>
      <CabeceraPagina
        etiqueta={cola ? (cola.cola.length ? `${cola.cola.length} para hoy · unos ${minutosCola(cola.cola.length)} min` : "Al día") : ""}
        titulo="Tarjetas"
      />
      <div className={estilos.barra}>
        <Pestanas
          pestanas={[
            { id: "estudiar", texto: "Estudiar", extra: cola?.cola.length ? String(cola.cola.length) : undefined },
            { id: "mias", texto: "Mis tarjetas", extra: cola ? String(cola.total) : undefined },
            { id: "nueva", texto: "Nueva" },
          ]}
          activa={pestana}
          alCambiar={setPestana}
        />
        <ChipsMazo mazo={mazo} alCambiar={setMazo} />
      </div>

      {pestana === "estudiar" && cola && (
        <div className={estilos.portada}>
          {/* Lo de hoy: el número grande, el botón y las tres cifras */}
          <section className={`tarjeta ${estilos.hoy}`}>
            <span className="etiqueta">Hoy</span>
            <div className={estilos.hoyCabeza}>
              <strong className={estilos.numeroHoy}>{cola.cola.length}</strong>
              <div>
                <h2>{cola.cola.length ? (cola.cola.length === 1 ? "tarjeta te toca hoy" : "tarjetas te tocan hoy") : cola.total ? "Estás al día" : "Todavía no tienes tarjetas"}</h2>
                <p className={base.suave}>
                  {cola.cola.length
                    ? `Unos ${minutosCola(cola.cola.length)} min. Una a la vez, sin nada alrededor.`
                    : cola.total
                      ? "Terminaste las de hoy. Vuelven cuando estén por olvidarse."
                      : "Crea la primera a mano o deja que la IA te la proponga cuando falles algo."}
                  {cola.esperando > 0 && ` ${cola.esperando} más esperan a mañana por el tope del día.`}
                </p>
              </div>
            </div>
            <div className={estilos.empezar}>
              {cola.cola.length > 0 ? (
                <button type="button" className="boton boton-primario" onClick={() => setSesion({ lista: cola.cola, indice: 0, hechas: 0 })}>
                  Empezar a repasar
                </button>
              ) : (
                <button type="button" className="boton boton-primario" onClick={() => setPestana("nueva")}>
                  Crear una tarjeta
                </button>
              )}
              {cola.total > 0 && (
                <button type="button" className="boton boton-fantasma" onClick={() => setPestana("mias")}>
                  Ver mis {cola.total} tarjetas
                </button>
              )}
            </div>
            <div className={estilos.resumen}>
              <div className={estilos.cifra}>
                <strong>{cola.repasos}</strong>
                <span>repasos para hoy</span>
              </div>
              <div className={estilos.cifra}>
                <strong>{cola.nuevas}</strong>
                <span>nuevas para hoy</span>
              </div>
              <div className={estilos.cifra}>
                <strong>{cola.hechasHoy.nuevas + cola.hechasHoy.repasos}</strong>
                <span>hechas hoy</span>
              </div>
            </div>
          </section>

          {/* Cómo funcionan, siempre a la vista: así el espacio explica en vez de quedar vacío */}
          <section className={`tarjeta ${estilos.como}`}>
            <span className="etiqueta">Cómo funcionan</span>
            <ol className={estilos.pasos}>
              <li>
                <strong>Ves la pregunta</strong>
                <span>Intenta recordar la respuesta antes de voltear. Puedes responder escribiendo o hablando.</span>
              </li>
              <li>
                <strong>Volteas y te calificas</strong>
                <span>Otra vez, Difícil, Bien o Fácil. Con el teclado: Espacio voltea y del 1 al 4 calificas.</span>
              </li>
              <li>
                <strong>Vuelve justo antes de que la olvides</strong>
                <span>Las que cuestan regresan pronto; las fáciles, en días o semanas.</span>
              </li>
            </ol>
            <p className={estilos.notaTope}>Como máximo 10 nuevas y 30 repasos al día: lo demás espera, no se te acumula encima.</p>
            <div className={estilos.origenes}>
              <span className={base.suave}>Se crean solas con el botón + Tarjeta en:</span>
              <span className="chip">correcciones de inglés</span>
              <span className="chip">entrevistas</span>
              <span className="chip">¿Qué imprime?</span>
              <span className="chip">quiz fallado</span>
            </div>
          </section>
        </div>
      )}
      {pestana === "mias" && <MisTarjetas mazo={mazo} alCambiar={cargar} />}
      {pestana === "nueva" && <NuevaTarjeta mazo={mazo || "js"} alGuardar={cargar} />}
    </section>
  );
}

// ---------------------------------------------------------------------------------------------
function Sesion({ sesion, alTerminar }) {
  const [lista, setLista] = useState(sesion.lista);
  const [indice, setIndice] = useState(0);
  const [volteada, setVolteada] = useState(false);
  const [repetidas, setRepetidas] = useState({}); // id -> veces que volvió hoy en esta sesión
  const [ayuda, setAyuda] = useState({}); // { pregunta, sugerencia, comentario, explicacion, ejemplo }
  const tarjeta = lista[indice];

  const calificar = useCallback(
    async (nombre) => {
      if (!tarjeta || !volteada) return;
      const nuevoRep = await api.calificarTarjeta(tarjeta.id, NOTAS[nombre]);
      // "Otra vez" la vuelve a poner al final de esta sesión (hasta 2 veces, para no quedarte en bucle)
      if (nombre === "otra" && (repetidas[tarjeta.id] ?? 0) < 2) {
        setLista((l) => [...l, { ...tarjeta, rep: nuevoRep }]);
        setRepetidas((r) => ({ ...r, [tarjeta.id]: (r[tarjeta.id] ?? 0) + 1 }));
      }
      setVolteada(false);
      setAyuda({});
      setIndice((i) => i + 1);
    },
    [tarjeta, volteada, repetidas],
  );

  useEffect(() => {
    function tecla(e) {
      if (e.target.closest?.("textarea, input")) return;
      if (e.code === "Space" && !volteada) {
        e.preventDefault();
        setVolteada(true);
      }
      const nombre = { 1: "otra", 2: "dificil", 3: "bien", 4: "facil" }[e.key];
      if (nombre && volteada) calificar(nombre);
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [volteada, calificar]);

  if (!tarjeta) {
    return (
      <section className={estilos.sesion}>
        <div className={estilos.tarjeta} style={{ minHeight: 0, textAlign: "center" }}>
          <p className={estilos.frente}>¡Listo por hoy!</p>
          <p className={base.suave}>Repasaste {lista.length} tarjetas. Las que costaron vuelven pronto; las fáciles, en días o semanas.</p>
          <button type="button" className="boton boton-primario" onClick={alTerminar} style={{ justifySelf: "center" }}>
            Volver
          </button>
        </div>
      </section>
    );
  }

  const previa = vistaPrevia(tarjeta.rep, fechaLocal());
  const conIa = !!claveIa();

  return (
    <section className={estilos.sesion}>
      <div className={estilos.avance} aria-label={`Tarjeta ${indice + 1} de ${lista.length}`}>
        <span style={{ width: `${(indice / lista.length) * 100}%` }} />
      </div>
      <article className={estilos.tarjeta}>
        <span className={estilos.mazo}>
          {MAZOS[tarjeta.mazo]} · {tarjeta.rep ? "repaso" : "nueva"}
        </span>
        <p className={estilos.frente}>{ayuda.pregunta ?? tarjeta.frente}</p>
        {ayuda.pregunta && <span className={estilos.original}>Original: {tarjeta.frente}</span>}
        {volteada && (
          <div className={estilos.reverso}>
            <span>{tarjeta.reverso}</span>
            {tarjeta.ejemplo && <code className={estilos.ejemplo}>{tarjeta.ejemplo}</code>}
            {ayuda.comentario && <p className={extra.nota}>{ayuda.comentario}</p>}
            {ayuda.explicacion && (
              <div className={extra.nota}>
                <p style={{ margin: 0 }}>{ayuda.explicacion}</p>
                {ayuda.ejemplo && <code className={estilos.ejemplo}>{ayuda.ejemplo}</code>}
              </div>
            )}
          </div>
        )}
      </article>

      {!volteada ? (
        <>
          <div className={estilos.acciones}>
            <button type="button" className="boton boton-primario" onClick={() => setVolteada(true)}>
              Mostrar respuesta
            </button>
          </div>
          {conIa && <AyudaIa key={`${tarjeta.id}-${indice}`} tarjeta={tarjeta} ayuda={ayuda} setAyuda={setAyuda} alResponder={() => setVolteada(true)} />}
        </>
      ) : (
        <>
          <div className={estilos.notas}>
            {Object.keys(NOTAS).map((nombre, i) => (
              <button key={nombre} type="button" className={estilos.nota} data-nota={nombre} data-sugerida={ayuda.sugerencia === nombre} onClick={() => calificar(nombre)}>
                <strong>{NOMBRE_NOTA[nombre]}</strong>
                <small>
                  {previa[nombre]} · {i + 1}
                </small>
              </button>
            ))}
          </div>
          {conIa && !ayuda.explicacion && <ExplicarIa tarjeta={tarjeta} ayuda={ayuda} setAyuda={setAyuda} />}
        </>
      )}
      <span className={estilos.teclas}>Espacio voltea · 1 a 4 califican</span>
      <button type="button" className="boton boton-fantasma" onClick={alTerminar}>
        Terminar por ahora
      </button>
    </section>
  );
}

/** Antes de voltear: "Pregúntamelo distinto" y "Responder" (escrito o dictado, la IA sugiere el botón). */
function AyudaIa({ tarjeta, ayuda, setAyuda, alResponder }) {
  const { cargando, error, pedir } = useIa();
  const [respondiendo, setRespondiendo] = useState(false);
  const [texto, setTexto] = useState("");
  const [dictando, setDictando] = useState(false);
  const dictado = useRef(null);
  useEffect(() => () => dictado.current?.detener(), []);

  return (
    <div className={estilos.acciones} style={{ flexDirection: "column", alignItems: "stretch" }}>
      {!respondiendo ? (
        <div className={estilos.acciones}>
          <button type="button" className="boton" onClick={() => setRespondiendo(true)}>
            Responder escribiendo o hablando
          </button>
          <button
            type="button"
            className="boton boton-fantasma"
            disabled={cargando}
            onClick={async () => {
              const r = await pedir({ tarea: "tarjeta-reformular", frente: tarjeta.frente, reverso: tarjeta.reverso, anteriores: ayuda.pregunta ? [ayuda.pregunta] : [] });
              if (r?.pregunta) setAyuda((a) => ({ ...a, pregunta: r.pregunta }));
            }}
          >
            {cargando ? "Pensando…" : "Pregúntamelo distinto"}
          </button>
        </div>
      ) : (
        <>
          <textarea className={base.texto} rows={3} autoFocus value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Tu respuesta…" lang={tarjeta.mazo === "ingles" ? "en" : "es"} />
          <div className={estilos.acciones}>
            {microDisponible() && (
              <button
                type="button"
                className="boton"
                data-activo={dictando}
                onClick={() => {
                  if (dictando) return dictado.current?.detener();
                  dictado.current = dictar({
                    lang: tarjeta.mazo === "ingles" ? "en-US" : "es-PE",
                    alTexto: (t) => setTexto((p) => (p ? `${p} ${t}` : t)),
                    alTerminar: () => setDictando(false),
                  });
                  setDictando(!!dictado.current);
                }}
              >
                <IconoMicrofono tamano={16} /> {dictando ? "Detener" : "Dictar"}
              </button>
            )}
            <button
              type="button"
              className="boton boton-primario"
              disabled={cargando || !texto.trim()}
              onClick={async () => {
                dictado.current?.detener();
                const r = await pedir({ tarea: "tarjeta-calificar", frente: ayuda.pregunta ?? tarjeta.frente, reverso: tarjeta.reverso, respuesta: texto });
                if (r) {
                  setAyuda((a) => ({ ...a, sugerencia: r.sugerencia, comentario: `Tu respuesta: ${r.comentario}`, respuesta: texto }));
                  alResponder();
                }
              }}
            >
              {cargando ? "Revisando…" : "Comprobar"}
            </button>
          </div>
        </>
      )}
      {error && <p className={base.error}>{error}</p>}
    </div>
  );
}

/** Después de voltear: "¿Por qué?" explica la tarjeta de otra forma. */
function ExplicarIa({ tarjeta, ayuda, setAyuda }) {
  const { cargando, error, pedir } = useIa();
  return (
    <div className={estilos.acciones}>
      <button
        type="button"
        className="boton boton-fantasma"
        disabled={cargando}
        onClick={async () => {
          const r = await pedir({ tarea: "tarjeta-explicar", frente: tarjeta.frente, reverso: tarjeta.reverso, respuesta: ayuda.respuesta ?? "" });
          if (r) setAyuda((a) => ({ ...a, explicacion: r.explicacion, ejemplo: r.ejemplo }));
        }}
      >
        {cargando ? "Explicando…" : "No me queda claro: explícamelo"}
      </button>
      {error && <p className={base.error}>{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
function MisTarjetas({ mazo, alCambiar }) {
  const [todas, setTodas] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);
  const recargar = () => api.misTarjetas().then(setTodas);
  useEffect(() => {
    recargar();
  }, []);
  if (!todas) return null;
  const texto = busqueda.trim().toLowerCase();
  const visibles = todas.filter((t) => (!mazo || t.mazo === mazo) && (!texto || `${t.frente} ${t.reverso}`.toLowerCase().includes(texto)));

  return (
    <>
      <input className={base.entrada} type="search" placeholder="Buscar en tus tarjetas" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ maxWidth: 360 }} />
      {editando && (
        <EditorTarjeta
          inicial={editando}
          alGuardar={async (t) => {
            await api.guardarTarjeta(t);
            setEditando(null);
            recargar();
            alCambiar();
          }}
          alCancelar={() => setEditando(null)}
        />
      )}
      {!visibles.length ? (
        <p className={base.suave}>{todas.length ? "Ninguna coincide." : "Todavía no tienes tarjetas."}</p>
      ) : (
        <div className={estilos.lista}>
          {visibles.map((t) => (
            <div key={t.id} className={estilos.fila}>
              <span className={estilos.mazo}>{MAZOS[t.mazo]}</span>
              <strong>{t.frente}</strong>
              <span>{t.reverso}</span>
              <div className={estilos.pie}>
                <span>{t.rep ? `Vuelve el ${t.rep.proxima} · ${t.rep.repasos} repasos${t.rep.fallos ? `, ${t.rep.fallos} fallos` : ""}` : "Nueva"}</span>
                <span>
                  <button type="button" className={base.enlace} onClick={() => setEditando(t)}>
                    Editar
                  </button>{" "}
                  <Confirmar
                    titulo="¿Borrar esta tarjeta?"
                    descripcion="Se borra en todos tus dispositivos."
                    textoConfirmar="Sí, borrar"
                    peligro
                    alConfirmar={async () => {
                      await api.borrarTarjeta(t.id);
                      recargar();
                      alCambiar();
                    }}
                    disparador={
                      <button type="button" className={base.enlace}>
                        Borrar
                      </button>
                    }
                  />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function EditorTarjeta({ inicial, alGuardar, alCancelar }) {
  const [t, setT] = useState(inicial);
  const [error, setError] = useState(null);
  const campo = (clave) => ({ value: t[clave] ?? "", onChange: (e) => setT({ ...t, [clave]: e.target.value }) });
  return (
    <form
      className={base.caja}
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await alGuardar(t);
        } catch (err) {
          setError(err.message);
        }
      }}
    >
      <label className={base.suave}>
        Mazo{" "}
        <select className={base.entrada} {...campo("mazo")}>
          {Object.entries(MAZOS).map(([id, nombre]) => (
            <option key={id} value={id}>
              {nombre}
            </option>
          ))}
        </select>
      </label>
      <textarea className={base.texto} rows={2} placeholder="Pregunta (frente)" {...campo("frente")} />
      <textarea className={base.texto} rows={3} placeholder="Respuesta (reverso)" {...campo("reverso")} />
      <textarea className={base.texto} rows={2} placeholder="Ejemplo (opcional)" {...campo("ejemplo")} />
      <div className={base.fila}>
        <button type="submit" className="boton boton-primario">
          Guardar
        </button>
        {alCancelar && (
          <button type="button" className="boton boton-fantasma" onClick={alCancelar}>
            Cancelar
          </button>
        )}
      </div>
      {error && <p className={base.error}>{error}</p>}
    </form>
  );
}

function NuevaTarjeta({ mazo, alGuardar }) {
  const [clave, setClave] = useState(0); // para vaciar el formulario tras guardar
  const [hecho, setHecho] = useState(false);
  return (
    <div className={estilos.formulario}>
      <div>
        <span className={base.etiqueta}>A mano</span>
        <EditorTarjeta
          key={clave}
          inicial={{ mazo, frente: "", reverso: "", ejemplo: "", origen: "a mano" }}
          alGuardar={async (t) => {
            await api.guardarTarjeta(t);
            setClave((c) => c + 1);
            setHecho(true);
            alGuardar();
          }}
        />
        {hecho && <small className={base.suave}>Guardada. Aparece en Estudiar como nueva.</small>}
      </div>
      <CajaIa titulo="Con IA" detalle="Pega lo que quieres recordar (un error, una explicación, una frase en inglés) y te propone tarjetas.">
        {(olvidar) => <CrearConIa olvidar={olvidar} alGuardar={alGuardar} />}
      </CajaIa>
    </div>
  );
}

function CrearConIa({ olvidar, alGuardar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  const [texto, setTexto] = useState("");
  const [propuestas, setPropuestas] = useState(null);
  if (propuestas) {
    return (
      <>
        <Propuestas
          propuestas={propuestas}
          origen="creada con IA"
          alTerminar={() => {
            alGuardar();
          }}
        />
        <button type="button" className={base.enlace} onClick={() => setPropuestas(null)}>
          Crear otras
        </button>
      </>
    );
  }
  return (
    <>
      <textarea className={base.texto} rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Por ejemplo: siempre olvido que map devuelve un array nuevo y forEach devuelve undefined" />
      <div className={base.fila}>
        <button
          type="button"
          className="boton boton-primario"
          disabled={cargando || texto.trim().length < 5}
          onClick={async () => {
            const r = await pedir({ tarea: "tarjeta-crear", contenido: texto, origen: "escrito por ti" });
            if (r?.tarjetas?.length) setPropuestas(r.tarjetas);
          }}
        >
          {cargando ? "Creando…" : "Proponer tarjetas"}
        </button>
      </div>
      {error && <p className={base.error}>{error}</p>}
    </>
  );
}
