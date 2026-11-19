// Lo que puedes hacer con el mapache. Cada actividad usa tu inglés de verdad y lo alimenta:
// pregunta del día, repite conmigo, objetos perdidos (tus repasos vencidos), tus errores reales,
// palabra del día, tienda, ropa, álbum de unidades, diario, postales, Trash panda y la entrevista.
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

function Tarjeta({ titulo, detalle, ancho, children }) {
  return (
    <section className={estilos.tarjeta} data-ancho={ancho}>
      <header>
        <h2>{titulo}</h2>
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
  const [ver, setVer] = useState(false);
  const micro = useMicrofono();

  async function enviar(e) {
    e.preventDefault();
    const r = await api.mapacheResponder(texto);
    setResultado(r);
    if (r.ok) alCambiar();
  }

  async function dictar() {
    const r = await micro.escuchar();
    if (r.opciones?.[0]) setTexto((t) => (t ? `${t} ${r.opciones[0]}` : r.opciones[0]));
  }

  // Con la respuesta enviada aparece la corrección con IA: la tarjeta ocupa todo el ancho y la
  // corrección va al lado de la pregunta, en vez de alargar la tarjeta hacia abajo
  const conIa = !!(resultado?.ok || (p.respondida && !resultado));
  return (
    <Tarjeta
      titulo="La pregunta del día"
      ancho={conIa}
      detalle={p.respondida ? `Nivel ${p.nivel} · respondida hoy` : `Nivel ${p.nivel} · al menos ${p.minimo} palabras`}
    >
      <div className={conIa ? estilos.dosColumnas : estilos.unaColumna}>
        <div className={estilos.columna}>
          <p className={estilos.preguntaEn} lang="en">
            {p.en}
          </p>
          <div className={estilos.fila}>
            <BotonOir texto={p.en} />
            <button type="button" className={estilos.enlace} onClick={() => setVer((v) => !v)}>
              {ver ? p.es : "¿Qué pregunta?"}
            </button>
          </div>
          <p className={estilos.reto}>
            <strong>Reto extra (+5 XP):</strong> {p.reto.texto} <em lang="en">Ej.: {p.reto.ejemplo}</em>
          </p>
          {p.respondida && !resultado ? (
            <div className={estilos.respondida}>
              <span>Tu respuesta</span>
              <p lang="en">{p.respondida.texto}</p>
              <span>Una forma de responder</span>
              <p lang="en">{p.modelo}</p>
            </div>
          ) : (
            <form onSubmit={enviar} className={estilos.formulario}>
              <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} placeholder="Answer in English..." lang="en" />
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
            </form>
          )}
          {resultado && (
            <div className={estilos.resultado} data-ok={resultado.ok}>
              {resultado.ok ? (
                <p>
                  ¡Bien! {resultado.xp ? `+${resultado.xp} XP y comida para ${datos.nombre}.` : "Ya habías respondido hoy."}
                  {resultado.reto ? " Cumpliste el reto extra." : " El reto extra no lo vi esta vez: pruébalo mañana."}
                  {resultado.usadas.length > 0 && ` Usaste palabras de tus unidades: ${resultado.usadas.join(", ")}.`}
                </p>
              ) : resultado.corto ? (
                <p>
                  Muy corto para tu nivel: escribiste {resultado.palabras} {resultado.palabras === 1 ? "palabra" : "palabras"} y se piden{" "}
                  {resultado.minimo}. Agrega un detalle o un porqué.
                </p>
              ) : (
                <p>Parece que no está en inglés. Inténtalo en inglés, aunque sea simple.</p>
              )}
              <span>Una forma de responder</span>
              <p lang="en">{p.modelo}</p>
            </div>
          )}
        </div>
        {/* Con tu respuesta ya enviada, la IA te la puede corregir frase por frase */}
        {conIa && (
          <EvaluadorIa
            tarea="ingles"
            idioma="en"
            respuestaFija={resultado?.ok ? texto : p.respondida.texto}
            pedido={{ pregunta: p.en, nivel: p.nivel }}
          />
        )}
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
    <Tarjeta titulo="Repeat after me" detalle={`${datos.repetidasHoy} bien dichas hoy`}>
      {!voz || !micro.hay ? (
        <p className={estilos.ayuda}>
          Para esto hace falta voz y micrófono (Chrome en el celular o la laptop). Mientras, léela en voz alta:
        </p>
      ) : (
        <p className={estilos.ayuda}>Escúchala, repítela imitando el ritmo y {datos.nombre} te dice si te entendió.</p>
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
      <div className={estilos.fila}>
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

  return (
    <Tarjeta titulo="Objetos perdidos" detalle={datos.totalRobados ? `${datos.totalRobados} por recuperar` : "Nada perdido"}>
      {!o ? (
        <p className={estilos.ayuda}>
          {recuperadas ? `¡Recuperaste ${recuperadas} hoy! ` : ""}
          {datos.nombre} no tiene nada tuyo escondido. Cuando una palabra te toque repasar, la va a esconder y aparecerá aquí.
        </p>
      ) : (
        <>
          <p className={estilos.ayuda}>
            {datos.nombre} escondió esta {o.tipo === "palabra" ? "palabra" : "frase"}. Adivina cuál falta y vuelve a ser tuya (cuenta como
            su repaso).
          </p>
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
                {elegida === o.correcta ? "¡La recuperaste! " : "Esa no. Vuelve a tus repasos para que no se te escape. "}
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
  if (!datos.errores.length)
    return (
      <Tarjeta titulo="Tus errores">
        <p className={estilos.ayuda}>
          Cuando falles un calco o una regla en una lección, {datos.nombre} te lo recordará aquí con lo que sí se dice.
        </p>
      </Tarjeta>
    );
  const claves = datos.errores.map((e) => e.clave).join(",");
  return (
    <Tarjeta titulo="Tus errores" detalle="Lo que fallaste la última vez">
      <p className={estilos.ayuda} lang="en">
        {datos.nombre} says: "Even a raccoon wouldn't let these slip through. Let's iron them out."
      </p>
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
      <Link to={`/leccion?ambito=ingles&claves=${encodeURIComponent(claves)}`} className="boton boton-primario">
        Repasar estos ahora
      </Link>
    </Tarjeta>
  );
}

export function PalabraDelDia({ datos }) {
  const w = datos.palabraDelDia;
  if (!w) return null;
  return (
    <Tarjeta titulo="Hoy te enseño" detalle="Palabra y expresión de B2 y C1">
      <p className={estilos.palabraGrande} lang="en">
        {w.en} <span>{w.pron}</span>
      </p>
      <p className={estilos.traduccion}>{w.es}</p>
      {w.ej && (
        <p className={estilos.ejemplo}>
          <span lang="en">{w.ej.en}</span> <em>{w.ej.es}</em>
        </p>
      )}
      <div className={estilos.fila}>
        <BotonOir texto={w.ej?.en ? `${w.en}. ${w.ej.en}` : w.en} />
      </div>
      {datos.expresionDelDia && (
        <div className={estilos.expresionDia}>
          <span>Expresión del día · nivel {datos.nivelMapache}</span>
          <p lang="en">
            <strong>{datos.expresionDelDia.en}</strong> = {datos.expresionDelDia.es}
          </p>
          <p className={estilos.ejemplo}>
            <span lang="en">{datos.expresionDelDia.ej.en}</span> <em>{datos.expresionDelDia.ej.es}</em>
          </p>
          <div className={estilos.fila}>
            <BotonOir texto={`${datos.expresionDelDia.en}. ${datos.expresionDelDia.ej.en}`} />
          </div>
        </div>
      )}
    </Tarjeta>
  );
}

/* ---------- Su casa ---------- */

export function Tienda({ datos, alCambiar }) {
  const [aviso, setAviso] = useState(null);
  async function comprar(t) {
    const r = await api.mapacheComprar(t.id);
    if (r.ok) {
      setAviso(`¡Listo! ${t.tipo === "ropa" ? `${datos.nombre} ya tiene` : "Ya está en su casa:"} ${t.en} (${t.es}).`);
      hablar(t.en);
    } else if (r.falta) setAviso("Te falta XP de inglés: lo ganas con lecciones, historias y cofres.");
    alCambiar();
  }
  return (
    <Tarjeta titulo="Tienda" detalle={`Tienes ${datos.xp} XP de inglés`} ancho>
      <p className={estilos.ayuda}>Se paga con el XP que ganas en inglés. Cada cosa tiene su nombre en inglés: tócalo para oírlo.</p>
      <div className={estilos.tienda}>
        {datos.tienda.map((t) => (
          <div key={t.id} className={estilos.producto} data-comprado={t.comprado}>
            <button type="button" className={estilos.nombreProducto} onClick={() => hablar(t.en)} lang="en">
              {t.en}
            </button>
            <small>
              {t.es} · {t.tipo === "ropa" ? "ropa" : "mueble"}
            </small>
            {t.comprado ? (
              <span className={estilos.comprado}>Ya es suyo</span>
            ) : (
              <button type="button" className="boton" disabled={datos.xp < t.precio} onClick={() => comprar(t)}>
                {t.precio} XP
              </button>
            )}
          </div>
        ))}
      </div>
      {aviso && <p className={estilos.aviso}>{aviso}</p>}
    </Tarjeta>
  );
}

const PARTES = { cabeza: "Cabeza", ojos: "Ojos", cuello: "Cuello", orejas: "Orejas", espalda: "Espalda" };

export function Ropa({ datos, alCambiar }) {
  if (!datos.ropa.length)
    return (
      <Tarjeta titulo="Su ropa">
        <p className={estilos.ayuda}>
          Todavía no tiene ropa. Cómprala en la tienda o sube de nivel: en B1 gana una mochila, en B2 lentes, en C1 corbata y en C2 un
          birrete.
        </p>
      </Tarjeta>
    );
  return (
    <Tarjeta titulo="Su ropa" detalle="Toca para ponérsela o quitársela">
      <div className={estilos.ropa}>
        {datos.ropa.map((r) => {
          const puesta = datos.equipo?.[r.parte] === r.id;
          return (
            <button
              key={r.id}
              type="button"
              className={estilos.prenda}
              aria-pressed={puesta}
              onClick={async () => {
                await api.mapacheEquipar(r.parte, puesta ? null : r.id);
                alCambiar();
              }}
            >
              <strong lang="en">{r.en}</strong>
              <small>
                {r.es} · {PARTES[r.parte]}
                {r.regalo ? " · regalo de nivel" : ""}
              </small>
            </button>
          );
        })}
      </div>
    </Tarjeta>
  );
}

export function Album({ datos }) {
  return (
    <Tarjeta titulo="Álbum de stickers" detalle={`${datos.unidadesCompletas} unidades completas`} ancho>
      <p className={estilos.ayuda}>
        Un sticker por cada unidad que completas. Cada página entera le da un trofeo a su casa, y cada unidad, un mueble nuevo.
      </p>
      {datos.album.map((pagina) => (
        <div key={pagina.id} className={estilos.paginaAlbum}>
          <h3>
            {pagina.titulo} {pagina.completa && <span className={estilos.completa}>Página completa</span>}
          </h3>
          <div className={estilos.stickers}>
            {pagina.stickers.map((s) => (
              <div key={s.id} className={estilos.sticker} data-tiene={s.tiene} title={`${s.titulo}: ${s.porcentaje}%`}>
                <strong>{String(s.orden).padStart(2, "0")}</strong>
                <span>{s.titulo}</span>
                {!s.tiene && <small>{s.porcentaje}%</small>}
              </div>
            ))}
          </div>
        </div>
      ))}
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
    <Tarjeta titulo={`El diario de ${datos.nombre}`} detalle="En inglés de nivel C1">
      <button type="button" className={estilos.enlace} onClick={() => setTraducir((t) => !t)}>
        {traducir ? "Ocultar traducción" : "Ver traducción"}
      </button>
      <ol className={estilos.diario}>
        {datos.diario.map((d) => (
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
    <Tarjeta titulo="Trash panda" detalle={`Récord: ${datos.trash.record}`}>
      <p className={estilos.ayuda}>Un minuto: tira cada palabra al tacho correcto. Verbo o sustantivo; presente o pasado.</p>
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
        <>
          {final && (
            <div className={estilos.resultado} data-ok>
              <p>
                {puntos} {puntos === 1 ? "punto" : "puntos"}
                {final.nuevoRecord ? " · ¡nuevo récord!" : ""} {final.xp ? `· +${final.xp} XP` : ""}
              </p>
            </div>
          )}
          <button type="button" className="boton boton-primario" onClick={empezar} disabled={!palabras.length}>
            {final ? "Jugar otra vez" : "Jugar"}
          </button>
        </>
      )}
    </Tarjeta>
  );
}

export function Entrevista({ datos }) {
  return (
    <Tarjeta titulo="Practice a job interview with me" detalle="Roleplays de B2 y C1">
      <p className={estilos.ayuda}>
        {datos.nombre} hace de entrevistador: eliges qué responder y te explica por qué una respuesta suena mejor que otra.
      </p>
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
