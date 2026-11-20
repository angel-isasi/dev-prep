// Lo que puedes hacer con Map. Cada actividad usa tu inglés de verdad y suma a tu meta del día:
// pregunta del día, repite conmigo, repasos pendientes (los vencidos), tus errores reales,
// palabra del día, diario, postales, Trash panda y la entrevista.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { escucharVoz, hablar, hayMicrofono, useHayVoz } from "../../lib/voz.js";
import { hablaCorrecta } from "../../../../scripts/items/ingles.js";
import { Markdown } from "../../components/Markdown.jsx";
import { IconoAudio, IconoMicrofono } from "../../components/Iconos.jsx";
import { EvaluadorIa } from "../../components/EvaluadorIa.jsx";
import { rondaNueva } from "./reglas.js";
import estilos from "./PaginaMapache.module.css";

/** Ficha de una actividad. `ayuda` explica cómo se usa: no ocupa lugar, sale al pasar el cursor por el título. */
function Tarjeta({ titulo, detalle, ancho, ayuda, children }) {
  return (
    <section className={estilos.tarjeta} data-ancho={ancho}>
      <header>
        <h2 title={ayuda}>{titulo}</h2>
        {detalle && <span>{detalle}</span>}
      </header>
      {children}
    </section>
  );
}

function BotonOir({ texto, lento, etiqueta = "Escuchar" }) {
  const voz = useHayVoz();
  if (!voz) return null;
  return (
    <button type="button" className={estilos.enlace} onClick={() => hablar(texto, { lento })}>
      <IconoAudio tamano={15} /> {etiqueta}
    </button>
  );
}

/** Escucha por el micrófono y devuelve lo que entendió (o un error). */
function useMicrofono() {
  const [escuchando, setEscuchando] = useState(false);
  const actual = useRef(null);
  useEffect(() => () => actual.current?.detener(), []);
  async function escuchar() {
    setEscuchando(true);
    const e = escucharVoz();
    actual.current = e;
    try {
      return { opciones: await e.promesa };
    } catch (error) {
      return { error: error.message };
    } finally {
      if (actual.current === e) setEscuchando(false);
    }
  }
  return { escuchando, escuchar, hay: hayMicrofono() };
}

/* ---------- Hoy ---------- */

export function PreguntaDelDia({ datos, alCambiar }) {
  const p = datos.pregunta;
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState(null);
  const [errorMicro, setErrorMicro] = useState(null);
  const micro = useMicrofono();

  async function enviar(e) {
    e.preventDefault();
    const r = await api.mapacheResponder(texto);
    setResultado(r);
    if (r.ok) alCambiar();
  }

  async function dictar() {
    setErrorMicro(null);
    const r = await micro.escuchar();
    // Sin permiso de micrófono o sin internet el dictado falla: se dice, en vez de no hacer nada
    if (r.error) return setErrorMicro(r.error);
    if (r.opciones?.[0]) setTexto((t) => (t ? `${t} ${r.opciones[0]}` : r.opciones[0]));
  }

  // Siempre a todo el ancho y en dos columnas: a la izquierda la pregunta (y, ya respondida, tu
  // respuesta); a la derecha, donde escribes y, después, la corrección de la IA.
  const respondida = !!(resultado?.ok || (p.respondida && !resultado));
  return (
    <Tarjeta
      titulo="La pregunta del día"
      ancho
      detalle={respondida ? `Nivel ${p.nivel} · respondida hoy` : `Nivel ${p.nivel} · al menos ${p.minimo} palabras`}
    >
      <div className={estilos.dosColumnas}>
        <div className={estilos.columna}>
          <p className={estilos.preguntaEn} lang="en">
            {p.en}
          </p>
          <small className={estilos.traduccion}>{p.es}</small>
          <div className={estilos.fila}>
            <BotonOir texto={p.en} />
          </div>
          <p className={estilos.reto}>
            <strong>Reto extra (+5 XP):</strong> {p.reto.texto} <em lang="en">Ej.: {p.reto.ejemplo}</em>
          </p>
          {respondida && (
            // Ya respondiste: se ve lo que enviaste (es lo que corrige la IA) y una forma de responder
            <div className={estilos.respondida}>
              <span>Tu respuesta</span>
              <p lang="en">{resultado?.ok ? texto : p.respondida.texto}</p>
              <span>Una forma de responder</span>
              <p lang="en">{p.modelo}</p>
            </div>
          )}
          {resultado?.ok && (
            <div className={estilos.resultado} data-ok>
              <p>
                {/* No felicita: solo confirma. La corrección de verdad es la de la IA, al lado */}
                Respuesta guardada. {resultado.xp ? `+${resultado.xp} XP.` : "Ya habías respondido hoy."}
                {resultado.reto ? " Cumpliste el reto extra." : " Sin reto extra esta vez."}
                {resultado.usadas.length > 0 && ` Usaste palabras de tus unidades: ${resultado.usadas.join(", ")}.`}
              </p>
            </div>
          )}
        </div>

        <div className={estilos.columna}>
          {respondida ? (
            <EvaluadorIa tarea="ingles" idioma="en" respuestaFija={resultado?.ok ? texto : p.respondida.texto} pedido={{ pregunta: p.en, nivel: p.nivel }} />
          ) : (
            <form onSubmit={enviar} className={estilos.formulario}>
              <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={5} placeholder="Answer in English..." lang="en" />
              <div className={estilos.fila}>
                {micro.hay && (
                  <button type="button" className="boton" onClick={dictar} disabled={micro.escuchando}>
                    <IconoMicrofono tamano={16} /> {micro.escuchando ? "Te escucho…" : "Decirlo en voz alta"}
                  </button>
                )}
                <button type="submit" className="boton boton-primario" disabled={!texto.trim()}>
                  Responder
                </button>
              </div>
              {errorMicro && <p className={estilos.ayuda}>{errorMicro}</p>}
              {resultado && !resultado.ok && (
                <div className={estilos.resultado} data-ok={false}>
                  <p>
                    {resultado.corto
                      ? `Muy corto: van ${resultado.palabras} de ${resultado.minimo} palabras. Agrega un detalle o un porqué.`
                      : "Parece que no está en inglés. Inténtalo en inglés, aunque sea simple."}
                  </p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </Tarjeta>
  );
}

export function RepiteConmigo({ datos, alCambiar }) {
  const frases = datos.repetir;
  const [i, setI] = useState(0);
  const [resultado, setResultado] = useState(null);
  const micro = useMicrofono();
  const voz = useHayVoz();
  const f = frases[i];
  if (!f) return null;

  async function repetir() {
    setResultado(null);
    const r = await micro.escuchar();
    if (r.error) return setResultado({ error: r.error });
    const bien = hablaCorrecta(f.en, r.opciones);
    setResultado({ bien, dicho: r.opciones[0] ?? "" });
    if (bien) {
      await api.mapacheRepetido(true);
      alCambiar();
    }
  }

  return (
    <Tarjeta titulo="Repite conmigo" detalle={`${datos.repetidasHoy} bien dichas hoy`} ayuda="Escucha y repite imitando el ritmo: te digo si se entendió.">
      {(!voz || !micro.hay) && (
        <p className={estilos.ayuda} title="Este navegador no tiene voz o micrófono. Con Chrome sí funciona.">
          Sin micrófono aquí: léela en voz alta.
        </p>
      )}
      <p className={estilos.fraseGrande} lang="en">
        {f.en}
      </p>
      <small className={estilos.traduccion}>{f.es}</small>
      <div className={estilos.fila}>
        <BotonOir texto={f.en} lento etiqueta="Escuchar lento" />
        <BotonOir texto={f.en} />
        {voz && micro.hay && (
          <button type="button" className="boton boton-primario" onClick={repetir} disabled={micro.escuchando}>
            <IconoMicrofono tamano={16} /> {micro.escuchando ? "Te escucho…" : "Repetir"}
          </button>
        )}
      </div>
      {resultado && (
        <div className={estilos.resultado} data-ok={!!resultado.bien}>
          {resultado.error ? (
            <p>{resultado.error}</p>
          ) : (
            <p>
              {resultado.bien ? `¡Te entendí! "${resultado.dicho}"` : `Entendí: "${resultado.dicho}". Inténtalo otra vez, más despacio.`}
            </p>
          )}
        </div>
      )}
      <div className={`${estilos.fila} ${estilos.pie}`}>
        <button type="button" className="boton boton-fantasma" disabled={i === 0} onClick={() => (setI(i - 1), setResultado(null))}>
          ← Anterior
        </button>
        <button type="button" className="boton" disabled={i + 1 >= frases.length} onClick={() => (setI(i + 1), setResultado(null))}>
          Otra frase →
        </button>
      </div>
    </Tarjeta>
  );
}

export function ObjetosPerdidos({ datos, alCambiar }) {
  const [elegida, setElegida] = useState(null);
  const [recuperadas, setRecuperadas] = useState(0);
  const [ayuda, setAyuda] = useState(false);
  const o = datos.robados[0];

  async function responder(i) {
    if (elegida != null) return;
    setElegida(i);
    const acierto = i === o.correcta;
    await api.mapacheRecuperar(o.clave, acierto);
    if (acierto) setRecuperadas((n) => n + 1);
  }

  function siguiente() {
    setElegida(null);
    setAyuda(false);
    alCambiar();
  }

  // Sin nada escondido la tarjeta no aparece: no explica algo que todavía no existe.
  // Solo se queda si acabas de recuperar algo, para que veas el resultado.
  if (!o && !recuperadas) return null;

  return (
    <Tarjeta titulo="Repasos pendientes" detalle={datos.totalRobados ? `${datos.totalRobados} por repasar` : "Al día"} ayuda="Lo que te toca repasar hoy: elige lo que falta en cada frase.">
      {!o ? (
        <p className={estilos.ayuda}>Repasaste {recuperadas} aquí hoy.</p>
      ) : (
        <>
          <p className={estilos.fraseGrande} lang="en">
            {o.pista}
          </p>
          {o.ayuda && (
            <button type="button" className={estilos.enlace} onClick={() => setAyuda((a) => !a)}>
              {ayuda ? o.ayuda : "Ver una pista en español"}
            </button>
          )}
          <div className={estilos.opciones}>
            {o.opciones.map((op, i) => (
              <button
                key={op + i}
                type="button"
                className={estilos.opcion}
                data-estado={elegida == null ? "" : i === o.correcta ? "bien" : i === elegida ? "mal" : ""}
                onClick={() => responder(i)}
                disabled={elegida != null}
                lang="en"
              >
                {op}
              </button>
            ))}
          </div>
          {elegida != null && (
            <div className={estilos.resultado} data-ok={elegida === o.correcta}>
              <p>
                {elegida === o.correcta ? "Correcto. " : "Esa no: volverá en tu próximo repaso. "}
                <strong lang="en">{o.en}</strong> = {o.es}
              </p>
              <button type="button" className="boton boton-primario" onClick={siguiente}>
                {datos.totalRobados > 1 ? "Siguiente" : "Listo"}
              </button>
            </div>
          )}
        </>
      )}
    </Tarjeta>
  );
}

export function TusErrores({ datos }) {
  // Sin errores guardados la tarjeta no aparece
  if (!datos.errores.length) return null;
  const claves = datos.errores.map((e) => e.clave).join(",");
  return (
    <Tarjeta titulo="Tus errores" detalle="Lo que fallaste la última vez">
      <ul className={estilos.errores}>
        {datos.errores.map((e) => (
          <li key={e.clave}>
            <span className={estilos.mal} lang="en">
              {e.mal}
            </span>
            <span className={estilos.bien} lang="en">
              {e.bien}
            </span>
          </li>
        ))}
      </ul>
      <div className={`${estilos.fila} ${estilos.pie}`}>
        <Link to={`/leccion?ambito=ingles&claves=${encodeURIComponent(claves)}`} className="boton boton-primario">
          Repasar estos ahora
        </Link>
      </div>
    </Tarjeta>
  );
}

export function PalabraDelDia({ datos }) {
  const w = datos.palabraDelDia;
  if (!w) return null;
  return (
    <Tarjeta titulo="Palabra del día" detalle="Nivel B1 y B2">
      <p className={estilos.palabraGrande} lang="en">
        {w.en} <span>{w.pron}</span>
      </p>
      <p className={estilos.traduccion}>{w.es}</p>
      {w.ej && (
        <p className={estilos.ejemplo}>
          <span lang="en">{w.ej.en}</span> <em>{w.ej.es}</em>
        </p>
      )}
      <div className={`${estilos.fila} ${estilos.pie}`}>
        <BotonOir texto={w.ej?.en ? `${w.en}. ${w.ej.en}` : w.en} />
      </div>
    </Tarjeta>
  );
}

/** La expresión del día, con la misma forma que la palabra del día (van una al lado de la otra). */
export function ExpresionDelDia({ datos }) {
  const x = datos.expresionDelDia;
  if (!x) return null;
  return (
    <Tarjeta titulo="Expresión del día" detalle={`Nivel ${datos.nivelMapache}`}>
      <p className={estilos.palabraGrande} lang="en">
        {x.en}
      </p>
      <p className={estilos.traduccion}>{x.es}</p>
      <p className={estilos.ejemplo}>
        <span lang="en">{x.ej.en}</span> <em>{x.ej.es}</em>
      </p>
      <div className={`${estilos.fila} ${estilos.pie}`}>
        <BotonOir texto={`${x.en}. ${x.ej.en}`} />
      </div>
    </Tarjeta>
  );
}

/* ---------- Leer ---------- */

const formatoDia = (fecha) => {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-PE", { weekday: "long", day: "numeric" });
};

export function Diario({ datos }) {
  const [traducir, setTraducir] = useState(false);
  return (
    <Tarjeta titulo={`El diario de ${datos.nombre}`} detalle="Lo que hiciste, contado en inglés">
      <button type="button" className={estilos.enlace} onClick={() => setTraducir((t) => !t)}>
        {traducir ? "Ocultar traducción" : "Ver traducción"}
      </button>
      <ol className={estilos.diario}>
        {datos.diario.slice(0, 4).map((d) => (
          <li key={d.fecha}>
            <span>{formatoDia(d.fecha)}</span>
            <p lang="en">{d.en}</p>
            {traducir && <small>{d.es}</small>}
          </li>
        ))}
      </ol>
    </Tarjeta>
  );
}

export function Postales({ datos, alCambiar }) {
  const [abierta, setAbierta] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [premio, setPremio] = useState(null);
  const postal = datos.postales.find((p) => p.nivel === abierta);

  async function responder(i, j) {
    if (respuestas[i] != null) return;
    const nuevas = { ...respuestas, [i]: j };
    setRespuestas(nuevas);
    if (Object.keys(nuevas).length === postal.preguntas.length) {
      const aciertos = postal.preguntas.filter((q, k) => nuevas[k] === q.correcta).length;
      const r = await api.mapacheLeerPostal(postal.nivel, aciertos);
      setPremio(r.xp ? `+${r.xp} XP. ${datos.nombre} está feliz de que leíste su postal.` : "Ya la habías leído antes.");
      alCambiar();
    }
  }

  return (
    <Tarjeta titulo="Postales de sus viajes" detalle="Seis ciudades, en B2 y C1">
      <div className={estilos.postales}>
        {datos.postales.map((p) => (
          <button
            key={p.nivel}
            type="button"
            className={estilos.postal}
            data-abierta={p.nivel === abierta}
            disabled={!p.abierta}
            onClick={() => {
              setAbierta(p.nivel === abierta ? null : p.nivel);
              setRespuestas({});
              setPremio(null);
            }}
          >
            <strong>{p.ciudad}</strong>
            <small>
              {p.abierta ? (p.leida ? `Leída · ${p.leida.aciertos}/2` : `Nivel ${p.etiqueta} · nueva`) : `Se abre en ${p.nivel}`}
            </small>
          </button>
        ))}
      </div>
      {postal && (
        <div className={estilos.postalAbierta}>
          <p lang="en">{postal.texto}</p>
          <div className={estilos.fila}>
            <BotonOir texto={postal.texto} lento etiqueta="Escuchar la postal" />
          </div>
          {postal.preguntas.map((q, i) => (
            <div key={i} className={estilos.preguntaPostal}>
              <strong lang="en">{q.pregunta}</strong>
              <div className={estilos.opciones}>
                {q.opciones.map((op, j) => (
                  <button
                    key={j}
                    type="button"
                    className={estilos.opcion}
                    data-estado={respuestas[i] == null ? "" : j === q.correcta ? "bien" : j === respuestas[i] ? "mal" : ""}
                    disabled={respuestas[i] != null}
                    onClick={() => responder(i, j)}
                    lang="en"
                  >
                    {op}
                  </button>
                ))}
              </div>
              {respuestas[i] != null && <small className={estilos.traduccion}>{q.explicacion}</small>}
            </div>
          ))}
          {premio && <p className={estilos.aviso}>{premio}</p>}
        </div>
      )}
    </Tarjeta>
  );
}

/* ---------- Jugar ---------- */

const SEGUNDOS = 60;

export function TrashPanda({ datos, alCambiar }) {
  const [jugando, setJugando] = useState(false);
  const [ronda, setRonda] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [restante, setRestante] = useState(SEGUNDOS);
  const [ultimo, setUltimo] = useState(null);
  const [final, setFinal] = useState(null);
  const palabras = datos.trash.palabras;
  const puntosRef = useRef(0);

  useEffect(() => {
    if (!jugando) return;
    const inicio = Date.now();
    const t = setInterval(() => {
      const quedan = Math.max(0, SEGUNDOS - Math.floor((Date.now() - inicio) / 1000));
      setRestante(quedan);
      if (quedan === 0) {
        clearInterval(t);
        setJugando(false);
        api.mapacheTrash(puntosRef.current, SEGUNDOS).then((r) => {
          setFinal(r);
          alCambiar();
        });
      }
    }, 250);
    return () => clearInterval(t);
  }, [jugando]);

  function empezar() {
    puntosRef.current = 0;
    setPuntos(0);
    setFinal(null);
    setUltimo(null);
    setRestante(SEGUNDOS);
    setRonda(rondaNueva(palabras));
    setJugando(true);
  }

  function tirar(i) {
    const bien = i === ronda.correcto;
    if (bien) {
      puntosRef.current += 1;
      setPuntos(puntosRef.current);
    }
    setUltimo({ bien, texto: ronda.texto, es: ronda.es, tacho: ronda.tachos[ronda.correcto] });
    setRonda(rondaNueva(palabras));
  }

  return (
    <Tarjeta titulo="Trash panda" detalle={`Récord: ${datos.trash.record}`} ayuda="¿Verbo o sustantivo? ¿Presente o pasado? Tienes 1 minuto para tirar cada palabra a su tacho.">

      {jugando && ronda ? (
        <div className={estilos.juego}>
          <div className={estilos.marcador}>
            <span>{restante}s</span>
            <strong>{puntos}</strong>
          </div>
          <p className={estilos.palabraJuego} lang="en">
            {ronda.texto}
          </p>
          {/* La traducción aclara las que pueden ser verbo o sustantivo (work: trabajar o trabajo) */}
          <small className={estilos.traduccion}>{ronda.es}</small>
          <div className={estilos.tachos}>
            {ronda.tachos.map((t, i) => (
              <button key={t} type="button" className={estilos.tacho} onClick={() => tirar(i)} lang="en">
                {t}
              </button>
            ))}
          </div>
          {ultimo && (
            <small className={estilos.traduccion} data-ok={ultimo.bien}>
              {ultimo.bien ? "✓" : "✗"} {ultimo.texto} ({ultimo.es}) iba en <strong lang="en">{ultimo.tacho}</strong>
            </small>
          )}
        </div>
      ) : (
        <div className={estilos.juego}>
          <p className={estilos.palabraJuego}>{final ? puntos : "1:00"}</p>
          <small className={estilos.traduccion}>
            {final
              ? `${puntos === 1 ? "punto" : "puntos"}${final.nuevoRecord ? " · ¡nuevo récord!" : ""}${final.xp ? ` · +${final.xp} XP` : ""}`
              : "Cada palabra a su tacho"}
          </small>
          <button type="button" className="boton boton-primario" onClick={empezar} disabled={!palabras.length}>
            {final ? "Jugar otra vez" : "Jugar"}
          </button>
        </div>
      )}
    </Tarjeta>
  );
}

export function Entrevista({ datos }) {
  return (
    <Tarjeta
      titulo="Entrevista en inglés"
      detalle="Roleplays de B2 y C1"
      ayuda={`${datos.nombre} hace de entrevistador: eliges qué responder y ves por qué una respuesta suena mejor que otra.`}
    >
      <div className={estilos.entrevistas}>
        {datos.entrevistas.map((e) => (
          <Link key={e.id} to={`/ingles/roleplay/${e.id}`} className={estilos.entrevistaOpcion}>
            <strong>{e.titulo}</strong>
            <small>Nivel {e.nivel}</small>
          </Link>
        ))}
      </div>
    </Tarjeta>
  );
}
