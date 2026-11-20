// Un componente por tipo de ítem de lección. Casi todos se responden tocando; en inglés también
// hay escribir (sin banco de palabras) y hablar (reconocimiento de voz).
// Cada uno avisa su respuesta al padre (LeccionMovil), que corrige con motor.js.
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Markdown } from "../../components/Markdown.jsx";
import { Tarjeta } from "../../components/Tarjeta.jsx";
import { api } from "../../lib/api.js";
import { escucharVoz, hablar, hablarVarias, hayVoz } from "../../lib/voz.js";
import { hablaCorrecta } from "../../../../scripts/items/ingles.js";
import { barajar, semilla } from "./motor.js";
import estilos from "./Items.module.css";
import { IconoAudio, IconoMicrofono } from "../../components/Iconos.jsx";
import { feedback } from "../../lib/feedback.js";

const TITULOS = {
  quiz: "Responde",
  metodo: "¿Qué usarías?",
  devuelve: "¿Qué devuelve?",
  ts: "¿TypeScript lo acepta?",
  hueco: "Completa el hueco",
  ordenar: "Ordena las líneas",
  emparejar: "Une cada par",
  tarjeta: "¿Cómo lo resolverías?",
  entrevista: "Pregunta de entrevista",
  palabra: "¿Qué significa?",
  inversa: "¿Cómo se dice?",
  gramatica: "Elige la correcta",
  escuchar: "Escucha",
  traducir: "Traduce",
  dictado: "Escucha y arma",
  dialogo: "Escucha el diálogo",
  natural: "¿Natural o traducido?",
  oido: "Oído fino",
  escribir: "Escríbelo",
  hablar: "Dilo en voz alta",
};

export const tituloDe = (paso) => TITULOS[paso.item?.subtipo ?? paso.tipo] ?? "Responde";

/** Código con una línea marcada (la que se pregunta). */
function Codigo({ codigo }) {
  if (!codigo) return null;
  const lineas = codigo.texto.split("\n");
  const texto =
    codigo.marcar != null && lineas[codigo.marcar] !== undefined
      ? lineas.map((l, i) => (i === codigo.marcar ? `${l}   // ← esta` : l)).join("\n")
      : codigo.texto;
  return (
    <div className={estilos.codigo}>
      <Markdown>{"```" + (codigo.lenguaje ?? "js") + "\n" + texto + "\n```"}</Markdown>
    </div>
  );
}

/** Botón de audio en inglés (la voz del dispositivo). Con `auto`, se oye apenas aparece. */
export function BotonAudio({ texto, auto = false, grande = false, etiqueta = "Escuchar" }) {
  useEffect(() => {
    if (auto && texto) {
      const t = setTimeout(() => hablar(texto), 250);
      return () => clearTimeout(t);
    }
  }, [auto, texto]);
  if (!texto || !hayVoz()) return null;
  return (
    <div className={estilos.audios} data-grande={grande}>
      <button type="button" className={estilos.audio} onClick={() => hablar(texto)} aria-label={etiqueta}>
        <IconoAudio tamano={18} /> {grande ? etiqueta : null}
      </button>
      <button type="button" className={estilos.audio} data-lento onClick={() => hablar(texto, { lento: true })} aria-label="Escuchar lento">
        <span className={estilos.lento}>lento</span>
      </button>
    </div>
  );
}

/** Diálogo: cada línea con su botón de audio, y "Escuchar todo". La traducción aparece al responder. */
function Dialogo({ dialogo, traducir }) {
  // Con voz, el diálogo se escucha: el texto aparece al responder (o si tocas "Ver texto").
  const [verTexto, setVerTexto] = useState(false);
  if (!dialogo) return null;
  const oculto = hayVoz() && !traducir && !verTexto;
  return (
    <div className={estilos.dialogo}>
      {dialogo.situacion && <p className={estilos.ayuda}>{dialogo.situacion}</p>}
      {hayVoz() && (
        <div className={estilos.dialogoBotones}>
          <button type="button" className="boton boton-primario" onClick={() => hablarVarias(dialogo.lineas.map((l) => l.en))}>
            <IconoAudio tamano={16} /> Escuchar todo
          </button>
          {oculto && (
            <button type="button" className="boton boton-fantasma" onClick={() => setVerTexto(true)}>
              Ver texto
            </button>
          )}
        </div>
      )}
      {dialogo.lineas.map((l, i) => (
        <div key={i} className={estilos.lineaDialogo}>
          <strong>{l.quien}</strong>
          <span>
            {oculto ? <span className={estilos.oculto}>Escucha la línea</span> : l.en}
            {traducir && <small data-sin-inmersion>{l.es}</small>}
          </span>
          {hayVoz() && (
            <button type="button" className={estilos.audio} onClick={() => hablar(l.en)} aria-label="Escuchar esta línea">
              <IconoAudio tamano={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/** Opciones barajadas de forma estable (misma clave, mismo orden aunque retomes la lección). */
export function useOpciones(item) {
  return useMemo(() => {
    const indices = item.opciones.map((_, i) => i);
    // "Compila / Da error" se queda en su orden; lo demás se baraja.
    return item.subtipo === "ts" ? indices : barajar(indices, semilla(item.clave));
  }, [item]);
}

/** Opción múltiple (quiz, ¿qué método?, ¿qué devuelve?, TypeScript) y completar el hueco. */
export function ItemOpcion({ item, elegida, alElegir, bloqueado, correcta }) {
  const orden = useOpciones(item);
  const [verPista, setVerPista] = useState(false);
  return (
    <div className={estilos.item}>
      {item.pregunta && (
        <div className={estilos.pregunta}>
          <Markdown>{item.pregunta}</Markdown>
        </div>
      )}
      {item.pista &&
        (verPista || bloqueado ? (
          <p className={estilos.pista}>{item.pista}</p>
        ) : (
          <button type="button" className={`boton boton-fantasma ${estilos.verPista}`} onClick={() => setVerPista(true)}>
            Ver traducción
          </button>
        ))}
      {item.audio && <BotonAudio texto={item.audio} auto grande={item.soloAudio} />}
      <Dialogo dialogo={item.dialogo} traducir={bloqueado} />
      <Codigo codigo={item.codigo} />
      <div className={estilos.opciones} data-dos={item.opciones.length === 2}>
        {orden.map((i) => {
          const estado = bloqueado ? (i === correcta ? "correcta" : i === elegida ? "incorrecta" : "") : i === elegida ? "elegida" : "";
          return (
            <motion.button
              key={i}
              type="button"
              className={estilos.opcion}
              data-estado={estado}
              disabled={bloqueado}
              onClick={() => alElegir(i)}
              whileTap={{ scale: 0.97 }}
            >
              <Markdown>{item.opciones[i]}</Markdown>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/** Emparejar: tocas uno de la izquierda y luego su pareja de la derecha. */
export function ItemEmparejar({ item, alCompletar }) {
  const izquierda = useMemo(() => barajar(item.pares.map((_, i) => i), semilla(item.clave + "i")), [item]);
  const derecha = useMemo(() => barajar(item.pares.map((_, i) => i), semilla(item.clave + "d")), [item]);
  const [elegido, setElegido] = useState(null);
  const [hechos, setHechos] = useState([]);
  const [error, setError] = useState(null);
  const [errores, setErrores] = useState(0);

  useEffect(() => {
    if (hechos.length === item.pares.length) {
      const t = setTimeout(() => alCompletar(errores), 350);
      return () => clearTimeout(t);
    }
  }, [hechos, item.pares.length, errores, alCompletar]);

  function tocarDerecha(i) {
    if (elegido === null || hechos.includes(i)) return;
    if (i === elegido) {
      setHechos((h) => [...h, i]);
      feedback.toque();
    } else {
      setErrores((e) => e + 1);
      setError(i);
      feedback.fallo();
      setTimeout(() => setError(null), 450);
    }
    setElegido(null);
  }

  return (
    <div className={estilos.item}>
      <p className={estilos.ayuda}>{item.fuente?.tipo === "ingles" ? "Toca una palabra y luego su significado." : "Toca un método y luego lo que hace."}</p>
      <div className={estilos.pares}>
        <div className={estilos.columna}>
          {izquierda.map((i) => (
            <button
              key={i}
              type="button"
              className={estilos.ficha}
              data-estado={hechos.includes(i) ? "hecho" : elegido === i ? "elegida" : ""}
              disabled={hechos.includes(i)}
              onClick={() => setElegido(i)}
            >
              <Markdown>{item.pares[i].izq}</Markdown>
            </button>
          ))}
        </div>
        <div className={estilos.columna}>
          {derecha.map((i) => (
            <button
              key={i}
              type="button"
              className={estilos.ficha}
              data-estado={hechos.includes(i) ? "hecho" : error === i ? "error" : ""}
              disabled={hechos.includes(i)}
              onClick={() => tocarDerecha(i)}
            >
              <Markdown>{item.pares[i].der}</Markdown>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Armar una frase en inglés tocando palabras (traducir o dictado). Tocar una elegida la devuelve. */
export function ItemArmar({ item, elegidas, alCambiar, bloqueado }) {
  const usadas = new Set(elegidas);
  return (
    <div className={estilos.item}>
      <div className={estilos.pregunta}>
        <Markdown>{item.pregunta}</Markdown>
      </div>
      {item.audio && <BotonAudio texto={item.audio} auto grande />}
      {item.soloAudio && !hayVoz() && (
        <p className={estilos.ayuda}>
          Este dispositivo no tiene voz en inglés. {item.es ? `Arma la frase que significa: "${item.es}"` : "Arma la frase con las palabras de abajo."}
        </p>
      )}
      <div className={estilos.fraseArmada}>
        {elegidas.length === 0 && <span className={estilos.vacia}>Toca las palabras en orden</span>}
        {elegidas.map((i, pos) => (
          <button key={`${i}-${pos}`} type="button" className={estilos.palabraFicha} disabled={bloqueado} onClick={() => alCambiar(elegidas.filter((_, p) => p !== pos))}>
            {item.fichas[i]}
          </button>
        ))}
      </div>
      <div className={estilos.bancoPalabras}>
        {item.fichas.map((ficha, i) => (
          <button
            key={i}
            type="button"
            className={estilos.palabraFicha}
            data-usada={usadas.has(i)}
            disabled={bloqueado || usadas.has(i)}
            onClick={() => alCambiar([...elegidas, i])}
          >
            {ficha}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Ordenar líneas: tocas las líneas del banco en orden; tocar una línea elegida la devuelve. */
export function ItemOrdenar({ item, elegidas, alCambiar, bloqueado }) {
  const banco = useMemo(() => barajar(item.lineas.map((_, i) => i), semilla(item.clave)), [item]);
  const usadas = new Set(elegidas);
  return (
    <div className={estilos.item}>
      {item.pregunta && (
        <div className={estilos.pregunta}>
          <Markdown>{item.pregunta}</Markdown>
        </div>
      )}
      <div className={estilos.respuestaOrden}>
        {elegidas.length === 0 && <span className={estilos.vacia}>Toca las líneas en orden</span>}
        {elegidas.map((i, pos) => (
          <button
            key={`${i}-${pos}`}
            type="button"
            className={estilos.linea}
            disabled={bloqueado}
            onClick={() => alCambiar(elegidas.filter((_, p) => p !== pos))}
          >
            <code>{item.lineas[i]}</code>
          </button>
        ))}
      </div>
      <div className={estilos.banco}>
        {banco.map((i) =>
          usadas.has(i) ? null : (
            <button key={i} type="button" className={estilos.linea} disabled={bloqueado} onClick={() => alCambiar([...elegidas, i])}>
              <code>{item.lineas[i].trim()}</code>
            </button>
          ),
        )}
      </div>
    </div>
  );
}

const NOTAS = [
  { valor: "no", texto: "No", detalle: "No me salía", tipo: "error" },
  { valor: "dude", texto: "Dudé", detalle: "A medias", tipo: "aviso" },
  { valor: "sabia", texto: "Sí", detalle: "Lo tenía", tipo: "exito" },
];

/** Tarjeta de ejercicio: piensas la idea, la revelas y te calificas. */
export function ItemTarjeta({ item, alCalificar }) {
  const [tarjeta, setTarjeta] = useState(null);
  const [revelada, setRevelada] = useState(false);
  const [completo, setCompleto] = useState(false);

  useEffect(() => {
    setRevelada(false);
    setCompleto(false);
    api.tarjetaEjercicio(item.ejercicio).then(setTarjeta, () => setTarjeta(null));
  }, [item.ejercicio]);

  if (!tarjeta) return <div className={estilos.item}>Cargando…</div>;

  return (
    <div className={estilos.item}>
      <div className={estilos.tarjetaEj}>
        <strong className={estilos.tarjetaTitulo}>{tarjeta.titulo}</strong>
        <div className={estilos.enunciado} data-completo={completo}>
          <Markdown>{tarjeta.enunciado}</Markdown>
        </div>
        {!completo && (
          <button type="button" className={estilos.verMas} onClick={() => setCompleto(true)}>
            Ver el enunciado completo
          </button>
        )}
      </div>

      {!revelada ? (
        <>
          <p className={estilos.ayuda}>Piensa la idea para resolverlo (no hace falta escribir código). Luego revela.</p>
          <button type="button" className={`boton boton-primario ${estilos.ancho}`} onClick={() => setRevelada(true)}>
            Revelar la idea y la solución
          </button>
        </>
      ) : (
        <motion.div className={estilos.reverso} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {tarjeta.idea && (
            <div className={estilos.bloque}>
              <span>Idea clave</span>
              <Markdown>{tarjeta.idea}</Markdown>
            </div>
          )}
          <div className={estilos.codigo}>
            <Markdown>{"```" + tarjeta.lenguaje + "\n" + tarjeta.codigo + "\n```"}</Markdown>
          </div>
          {tarjeta.modelo && (
            <div className={estilos.bloque}>
              <span>Cómo explicarlo en la entrevista</span>
              <Markdown>{tarjeta.modelo}</Markdown>
            </div>
          )}
          <strong className={estilos.preguntaNota}>¿Se te ocurrió esa idea?</strong>
          <div className={estilos.notas}>
            {NOTAS.map((n) => (
              <button key={n.valor} type="button" className={estilos.nota} data-tipo={n.tipo} onClick={() => alCalificar(n.valor)}>
                {n.texto}
                <small>{n.detalle}</small>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/** Tarjeta de entrevista: la misma de la pantalla Entrevistas. */
export function ItemEntrevista({ pregunta, alCalificar }) {
  return (
    <div className={estilos.item}>
      <Tarjeta key={pregunta.id} pregunta={pregunta} alCalificar={alCalificar} />
    </div>
  );
}

/** Escribir sin banco de palabras: Enter comprueba. */
export function ItemEscribir({ item, valor, alCambiar, alEnviar, bloqueado }) {
  return (
    <div className={estilos.item}>
      <div className={estilos.pregunta}>
        <Markdown>{item.pregunta}</Markdown>
      </div>
      <textarea
        className={estilos.escribir}
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (valor.trim()) alEnviar();
          }
        }}
        disabled={bloqueado}
        autoFocus
        rows={2}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        lang="en"
        placeholder="Escribe en inglés"
      />
      <p className={estilos.ayuda}>No importan mayúsculas ni signos, y puedes usar o no contracciones (I'm o I am).</p>
    </div>
  );
}

/**
 * Hablar: lees la frase en voz alta y el navegador te escucha.
 * Si no puedes hablar ahora, se salta sin contar en contra.
 */
export function ItemHablar({ item, alResultado, alSaltar, bloqueado }) {
  const [estado, setEstado] = useState("listo"); // listo | escuchando | error
  const [mensaje, setMensaje] = useState("");
  const [dicho, setDicho] = useState("");
  // escucha en curso: si sales del ejercicio, se detiene y su resultado ya no califica el siguiente paso
  const escucha = useRef(null);
  useEffect(
    () => () => {
      escucha.current?.detener();
      escucha.current = null;
    },
    [],
  );

  async function escuchar() {
    setEstado("escuchando");
    setMensaje("");
    const actual = escucharVoz();
    escucha.current = actual;
    try {
      const opciones = await actual.promesa;
      if (escucha.current !== actual) return;
      setDicho(opciones[0] ?? "");
      setEstado("listo");
      alResultado(hablaCorrecta(item.texto, opciones), opciones[0] ?? "");
    } catch (error) {
      if (escucha.current !== actual) return;
      setEstado("error");
      setMensaje(error.message);
    }
  }

  return (
    <div className={estilos.item}>
      <div className={estilos.hablarFrase}>
        <strong lang="en">{item.texto}</strong>
        <span>{item.traduccion}</span>
      </div>
      <BotonAudio texto={item.texto} etiqueta="Oír cómo se dice" grande />
      <button type="button" className={estilos.microfono} data-estado={estado} onClick={escuchar} disabled={bloqueado || estado === "escuchando"}>
        <IconoMicrofono tamano={20} />
        {estado === "escuchando" ? "Te escucho…" : "Toca y habla"}
      </button>
      {dicho && <p className={estilos.ayuda}>Entendí: “{dicho}”</p>}
      {mensaje && <p className={estilos.aviso}>{mensaje}</p>}
      {!bloqueado && estado !== "escuchando" && (
        <button type="button" className="boton boton-fantasma" onClick={alSaltar}>
          Ahora no puedo hablar
        </button>
      )}
    </div>
  );
}
