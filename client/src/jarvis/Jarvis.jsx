// Jarvis en pantalla: la burbuja fija en toda la app, su panel de conversación y el "observador"
// que mira lo que haces (pantalla abierta, tests al guardar, tiempo) y decide con reglas.js cuándo hablar.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "react-router";
import { api } from "../lib/api.js";
import { dictar, microDisponible } from "../lib/voz.js";
import { useEvento } from "../hooks/useEvento.js";
import { IconoChispa, IconoFlechaDer, IconoMicrofono } from "../components/Iconos.jsx";
import {
  actividad, anotarGuardada, anotarResuelto, estaTrabado, marcar, marcarFrenado, marcarHecho, marcarPausa, marcarPregunta, marcarTrabado, NIVELES, NOMBRE_NIVEL,
  pasoElTiempo, puede, sesionNueva, sigueAhi, TEXTOS, tocaCierre, tocaInforme, tocaPausa, tocaPregunta, tocaSorpresa, vaCorriendo, yaHizo,
} from "./reglas.js";
import { abrir, cambiar, cerrar, decirle, hablar, hayIa, NOMBRE_DESTINO, olvidarPlan, pedirAvisos, pensar, rutaDe, silencio, suscribir, verEstado } from "./jarvis.js";
import estilos from "./Jarvis.module.css";

const useJarvis = () => useSyncExternalStore(suscribir, verEstado);
const aVeces = (nivel) => puede(nivel, "ingles") && Math.random() < 0.2;

/** El primer test que falla, contado para la IA. */
function fallo(resultado) {
  if (resultado?.error) return `Error al correr: ${String(resultado.error).slice(0, 300)}`;
  const c = (resultado?.casos ?? []).find((x) => !x.ok);
  if (!c) return "";
  const v = (x) => (typeof x === "string" ? x : JSON.stringify(x));
  return [`"${c.nombre}"`, c.esperado != null ? `esperado: ${v(c.esperado)}` : "", c.recibido != null ? `recibido: ${v(c.recibido)}` : "", c.mensaje ? `mensaje: ${String(c.mensaje).slice(0, 200)}` : ""].filter(Boolean).join(" · ");
}

/** Mira lo que haces y dispara las intervenciones. No dibuja nada. */
function useObservador() {
  const { pathname } = useLocation();

  // Qué pantalla y qué ejercicio tienes abierto
  useEffect(() => {
    const m = pathname.match(/^\/practicar\/([^/]+)$/);
    const id = m && m[1] !== "ia" && m[1] !== "lista" ? m[1] : null;
    cambiar({ pantalla: pathname, ...(id ? {} : { ejercicio: null, sesion: null }) });
    if (!id) return;
    let vivo = true;
    api.ejercicio?.(id).then(
      (ej) => {
        if (!vivo) return;
        cambiar((e) => ({
          ejercicio: { id: ej.id, titulo: ej.titulo, nivel: ej.nivel, estado: ej.estado, enunciado: ej.enunciado, pistas: ej.pistas, totalPistas: ej.totalPistas },
          sesion: e.sesion?.id === ej.id ? e.sesion : sesionNueva(ej.id, ej.nivel, Date.now()),
        }));
      },
      () => {},
    );
    return () => {
      vivo = false;
    };
  }, [pathname]);

  // Actividad: un clic o una tecla (como mucho una vez cada 30 segundos)
  useEffect(() => {
    let ultima = 0;
    const alTocar = () => {
      const ahora = Date.now();
      if (ahora - ultima < 30_000) return;
      ultima = ahora;
      cambiar((e) => ({ dia: actividad(e.dia, ahora) }));
    };
    window.addEventListener("pointerdown", alTocar);
    window.addEventListener("keydown", alTocar);
    return () => {
      window.removeEventListener("pointerdown", alTocar);
      window.removeEventListener("keydown", alTocar);
    };
  }, []);

  // Cada vez que guardas en VS Code y corren los tests (solo con la laptop conectada)
  useEvento("resultado", (d) => {
    const e = verEstado();
    const ahora = Date.now();
    const esElAbierto = e.sesion?.id === d.id;
    let dia = actividad(e.dia, ahora);
    let sesion = esElAbierto ? anotarGuardada(e.sesion, d.resultado, ahora) : e.sesion;
    const titulo = esElAbierto ? e.ejercicio?.titulo : d.id;

    if (d.resueltoAhora) {
      const p = d.progreso ?? {};
      dia = anotarResuelto(dia, { id: d.id, pistas: p.pistasVistas ?? 0, solucion: !!p.vioSolucion }, ahora);
      const corre = puede(e.nivel, "frena") && vaCorriendo(dia);
      if (corre) dia = marcarFrenado(dia);
      const pregunta = puede(e.nivel, "pregunta") && tocaPregunta(dia);
      if (pregunta) dia = marcarPregunta(dia);
      cambiar({ dia, sesion, ejercicio: esElAbierto && e.ejercicio ? { ...e.ejercicio, estado: "resuelto" } : e.ejercicio });
      olvidarPlan();
      if (puede(e.nivel, "resuelto")) {
        pensar({
          pro: true,
          conCodigo: esElAbierto,
          tipo: "resuelto",
          momento: [
            `Acaba de resolver el ejercicio "${titulo}": pasan todos los tests.`,
            `Intentos: ${p.intentos ?? "?"}. Pistas vistas: ${p.pistasVistas ?? 0}.${p.vioSolucion ? " Vio la solución antes de resolverlo." : ""}`,
            corre ? "Va corriendo: 3 de sus últimos 4 ejercicios salieron con varias pistas o mirando la solución. Díselo." : "",
            pregunta ? "Toca pregunta de entrevista: en \"pregunta\" hazle una del tema de este ejercicio, en vez de la repregunta sobre su código." : "Después de responderte, que lo explique en voz alta en 30 segundos.",
          ]
            .filter(Boolean)
            .join(" "),
        });
      }
      return;
    }

    if (!esElAbierto) return cambiar({ dia });
    const fallan = sesion.guardadas.at(-1).fallan;
    if (puede(e.nivel, "trabado") && estaTrabado(sesion)) {
      sesion = marcarTrabado(sesion);
      cambiar({ dia, sesion });
      pensar({ pro: true, conCodigo: true, tipo: "trabado", momento: `Está trabado: lleva 3 guardadas seguidas fallando exactamente los mismos tests (${fallan.slice(0, 5).join("; ")}). Detalle del primero: ${fallo(d.resultado)}` });
      return;
    }
    cambiar({ dia, sesion });
    if (!fallan.length) return;
    if (puede(e.nivel, "guardar") && sesion.guardadas.length % 3 === 0) pensar({ pro: true, conCodigo: true, momento: "Acaba de guardar su código y siguen fallando tests. Mira si tiene un error típico y dilo en una frase." });
    else if (puede(e.nivel, "test")) pensar({ momento: `Acaba de guardar y falla este test: ${fallo(d.resultado)}. Tradúcelo a lenguaje humano en una frase.` });
  });

  // El reloj: tiempo en el ejercicio, pausas, inactividad, cierre del día y pregunta sorpresa
  useEffect(() => {
    const revisar = () => {
      const e = verEstado();
      const ahora = Date.now();
      const pendiente = e.sesion && e.ejercicio && e.ejercicio.estado !== "resuelto";
      if (pendiente && puede(e.nivel, "tiempo") && pasoElTiempo(e.sesion, ahora)) {
        cambiar({ sesion: marcar(e.sesion, "tiempo") });
        return hablar({ texto: TEXTOS.tiempo(e.sesion, ahora), destino: "pistas", tipo: "tiempo" });
      }
      if (pendiente && puede(e.nivel, "inactivo") && sigueAhi(e.sesion, e.dia, ahora)) {
        cambiar({ sesion: marcar(e.sesion, "inactivo") });
        return hablar({ texto: TEXTOS.inactivo(), tipo: "inactivo" });
      }
      if (puede(e.nivel, "pausa") && tocaPausa(e.dia, ahora)) {
        cambiar({ dia: marcarPausa(e.dia, ahora) });
        return hablar({ texto: TEXTOS.pausa(), tipo: "pausa" });
      }
      if (puede(e.nivel, "cierre") && tocaCierre(e.dia, new Date().getHours())) {
        cambiar({ dia: marcarHecho(e.dia, "cierre") });
        return pensar({ pro: true, tipo: "cierre", momento: "Cierre del día: ya es de noche. Dile qué hizo hoy, qué quedó, qué toca mañana y déjale una pregunta para pensar." });
      }
      if (puede(e.nivel, "sorpresa") && tocaSorpresa(e.dia, ahora)) {
        cambiar({ dia: marcarHecho(e.dia, "sorpresa") });
        return pensar({ tipo: "sorpresa", ingles: aVeces(e.nivel), momento: "Pregunta sorpresa: hazle una pregunta corta sobre un tema que ya terminó o que hizo ayer, para ver si quedó." });
      }
    };
    const reloj = setInterval(revisar, 30_000);
    return () => clearInterval(reloj);
  }, []);

  // Al abrir la app: arranque del día e informe de la semana
  useEffect(() => {
    let vivo = true;
    const empezar = async () => {
      if (!(await hayIa()) || !vivo) return;
      const e = verEstado();
      if (puede(e.nivel, "arranque") && !yaHizo(e.dia, "arranque")) {
        cambiar({ dia: marcarHecho(e.dia, "arranque") });
        await pensar({ tipo: "arranque", ingles: aVeces(e.nivel), momento: "Arranque del día: acaba de abrir la app. Dile por dónde empezar, con un dato real de su avance." });
      }
      const semana = puede(e.nivel, "informe") ? tocaInforme(verEstado().dia.fecha, verEstado().informe) : null;
      if (semana && vivo) {
        cambiar({ informe: semana });
        await pensar({ pro: true, tipo: "informe", momento: `Informe semanal de la semana del ${semana}: qué mejoró, qué sigue flojo y un solo foco para la semana que viene. Usa tu cuaderno y su plan.` });
      }
    };
    const espera = setTimeout(empezar, 2500);
    return () => {
      vivo = false;
      clearTimeout(espera);
    };
  }, []);
}

/** Un mensaje de la conversación. */
function Mensaje({ m, alIr }) {
  const ruta = m.destino ? rutaDe(m.destino) : null;
  return (
    <li className={estilos.mensaje} data-de={m.de}>
      <p>{m.texto}</p>
      {m.pregunta && <p className={estilos.suPregunta}>{m.pregunta}</p>}
      {ruta && (
        <button type="button" className={estilos.ir} onClick={() => alIr(ruta)}>
          {NOMBRE_DESTINO[m.destino] ?? "Abrir"} <IconoFlechaDer tamano={14} />
        </button>
      )}
    </li>
  );
}

/** La burbuja y su panel. Se monta una sola vez, en el marco de la app. */
export function Jarvis() {
  const e = useJarvis();
  useObservador();
  const navegar = useNavigate();
  const [texto, setTexto] = useState("");
  const [vista, setVista] = useState("charla"); // charla | cuaderno
  const [oyendo, setOyendo] = useState(null);
  const [globo, setGlobo] = useState(null);
  const fin = useRef(null);
  const ultimo = e.mensajes.findLast?.((m) => m.de === "jarvis");

  // Con el panel cerrado, lo último que dijo se asoma unos segundos
  useEffect(() => {
    if (!ultimo || e.abierto || Date.now() - ultimo.en > 4000) return;
    setGlobo(ultimo);
    const t = setTimeout(() => setGlobo(null), 12_000);
    return () => clearTimeout(t);
  }, [ultimo?.en, e.abierto]);

  useEffect(() => {
    if (e.abierto) fin.current?.scrollIntoView({ block: "end" });
  }, [e.abierto, e.mensajes.length, e.pensando, vista]);

  // Alt + J abre y cierra
  useEffect(() => {
    const alTeclear = (ev) => {
      if (ev.altKey && ev.key.toLowerCase() === "j") {
        ev.preventDefault();
        verEstado().abierto ? cerrar() : abrir();
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, []);

  const enviar = (ev) => {
    ev?.preventDefault();
    const t = texto.trim();
    if (!t || e.pensando) return;
    setTexto("");
    decirle(t);
  };
  /** Un atajo: queda como algo que dijiste tú y va con las opciones que necesita. */
  const atajo = (frase, opciones) => {
    if (e.pensando) return;
    cambiar((s) => ({ mensajes: [...s.mensajes, { de: "yo", texto: frase, en: Date.now() }] }));
    pensar({ pregunta: frase, ...opciones });
  };
  const ir = (ruta) => {
    navegar(ruta);
    if (window.innerWidth < 900) cerrar();
  };
  const microfono = () => {
    if (oyendo) {
      oyendo.detener();
      return setOyendo(null);
    }
    silencio();
    let dicho = "";
    const sesion = dictar({
      lang: "es-PE",
      alTexto: (t) => {
        dicho = `${dicho} ${t}`.trim();
        setTexto(dicho);
      },
      alTerminar: () => {
        setOyendo(null);
        if (dicho) {
          setTexto("");
          decirle(dicho);
        }
      },
    });
    setOyendo(sesion);
  };
  const cambiarAvisos = async () => {
    if (e.avisos) return cambiar({ avisos: false });
    cambiar({ avisos: await pedirAvisos() });
  };

  if (!e.abierto) {
    return (
      <div className={estilos.cerrado}>
        {globo && (
          <button type="button" className={estilos.globo} onClick={abrir}>
            {globo.texto}
            {globo.pregunta && <strong>{globo.pregunta}</strong>}
          </button>
        )}
        <button type="button" className={estilos.burbuja} onClick={abrir} aria-label="Abrir a Jarvis (Alt + J)" title="Jarvis (Alt + J)" data-pensando={e.pensando}>
          <IconoChispa tamano={22} />
          {e.sinLeer > 0 && <b>{e.sinLeer}</b>}
        </button>
      </div>
    );
  }

  return (
    <aside className={estilos.panel} aria-label="Jarvis">
      <header className={estilos.cabeza}>
        <span className={estilos.avatar} data-pensando={e.pensando} aria-hidden>
          <IconoChispa tamano={18} />
        </span>
        <div>
          <strong>Jarvis</strong>
          <small>{e.pensando ? "pensando..." : oyendo ? "te escucho..." : NOMBRE_NIVEL[e.nivel]}</small>
        </div>
        <button type="button" className={estilos.enlace} onClick={() => setVista(vista === "charla" ? "cuaderno" : "charla")}>
          {vista === "charla" ? "Cuaderno" : "Conversación"}
        </button>
        <button type="button" className={estilos.cerrar} onClick={cerrar} aria-label="Cerrar">
          ×
        </button>
      </header>

      <div className={estilos.ajustes}>
        <div className={estilos.niveles} role="radiogroup" aria-label="Cuánto interviene">
          {NIVELES.map((n) => (
            <button key={n} type="button" role="radio" aria-checked={e.nivel === n} data-activo={e.nivel === n} onClick={() => cambiar({ nivel: n })}>
              {NOMBRE_NIVEL[n]}
            </button>
          ))}
        </div>
        <button type="button" className={estilos.interruptor} data-activo={e.voz} onClick={() => (e.voz ? (silencio(), cambiar({ voz: false })) : cambiar({ voz: true }))} title="Que hable en voz alta">
          Voz
        </button>
        <button type="button" className={estilos.interruptor} data-activo={e.avisos} onClick={cambiarAvisos} title="Avisos del sistema cuando la app está en otra pestaña">
          Avisos
        </button>
      </div>

      {vista === "cuaderno" ? (
        <div className={estilos.cuerpo}>
          <p className={estilos.vacio}>Lo que Jarvis ha observado de ti. Lo usa para aconsejarte mejor.</p>
          {e.cuaderno.length === 0 && <p className={estilos.vacio}>Todavía no hay notas.</p>}
          <ul className={estilos.notas}>
            {e.cuaderno
              .slice()
              .reverse()
              .map((n, i) => (
                <li key={i}>
                  <small>{n.fecha}</small>
                  {n.texto}
                  <button type="button" aria-label="Borrar nota" onClick={() => cambiar((s) => ({ cuaderno: s.cuaderno.filter((x) => x !== n) }))}>
                    ×
                  </button>
                </li>
              ))}
          </ul>
          <div ref={fin} />
        </div>
      ) : (
        <div className={estilos.cuerpo}>
          {e.mensajes.length === 0 && <p className={estilos.vacio}>Te acompaño mientras estudias. Pregúntame lo que sea, o sigue con lo tuyo: si te trabas, te aviso.</p>}
          <ul className={estilos.mensajes}>
            {e.mensajes.map((m, i) => (
              <Mensaje key={i} m={m} alIr={ir} />
            ))}
            {e.pensando && (
              <li className={estilos.mensaje} data-de="jarvis" data-pensando>
                <p>...</p>
              </li>
            )}
          </ul>
          <div ref={fin} />
        </div>
      )}

      {vista === "charla" && (
        <>
          <div className={estilos.atajos}>
            <button type="button" onClick={() => atajo("¿Qué sigue?")}>¿Qué sigue?</button>
            {e.ejercicio && e.ejercicio.estado !== "resuelto" && (
              <button type="button" onClick={() => atajo("Estoy trabado", { pro: true, conCodigo: true, momento: "Dice que está trabado: mira su código y los tests que fallan, y dale un empujón sin la solución." })}>
                Estoy trabado
              </button>
            )}
            {e.ejercicio && (
              <button type="button" onClick={() => atajo("Revisa mi código", { pro: true, conCodigo: true, momento: "Te pide revisar su código como un senior: dos frases y una repregunta de entrevistador." })}>
                Revisa mi código
              </button>
            )}
            <button type="button" onClick={() => atajo("Hazme una pregunta de entrevista", { momento: "Hazle una pregunta de entrevista del tema que está viendo hoy, en \"pregunta\"." })}>Pregúntame</button>
            <button type="button" onClick={() => atajo("Cierra mi día", { pro: true, tipo: "cierre", momento: "Cierre del día: qué hizo hoy, qué quedó, qué toca mañana y una pregunta para pensar." })}>Cierra mi día</button>
          </div>
          <form className={estilos.escribir} onSubmit={enviar}>
            <input value={texto} onChange={(ev) => setTexto(ev.target.value)} placeholder="Escríbele o háblale" aria-label="Mensaje para Jarvis" maxLength={800} autoFocus />
            {microDisponible() && (
              <button type="button" className={estilos.micro} data-activo={!!oyendo} onClick={microfono} aria-label={oyendo ? "Dejar de escuchar" : "Hablarle"}>
                <IconoMicrofono tamano={16} />
              </button>
            )}
            <button type="submit" className="boton boton-primario" disabled={!texto.trim() || e.pensando}>
              Enviar
            </button>
          </form>
        </>
      )}
    </aside>
  );
}

/** Lo último que dijo Jarvis, como ficha (va en el plan y en Hoy). */
export function FichaJarvis() {
  const e = useJarvis();
  const ultimo = e.mensajes.findLast?.((m) => m.de === "jarvis");
  return (
    <section className={`tarjeta ${estilos.ficha}`}>
      <header>
        <span className="etiqueta">Jarvis</span>
        <small>{NOMBRE_NIVEL[e.nivel]}</small>
      </header>
      {ultimo ? (
        <>
          <p className={estilos.fichaTexto}>{ultimo.texto}</p>
          {ultimo.pregunta && <p className={estilos.suPregunta}>{ultimo.pregunta}</p>}
        </>
      ) : (
        <p className={estilos.fichaTexto} data-suave>
          {e.pensando ? "Mirando tu plan..." : "Te acompaño mientras estudias: te digo qué sigue, te destrabo y te pregunto como en una entrevista."}
        </p>
      )}
      <button type="button" className="boton" onClick={abrir}>
        Hablar con Jarvis
      </button>
    </section>
  );
}
