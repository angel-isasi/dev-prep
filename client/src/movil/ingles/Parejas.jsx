// Parejas contrarreloj: 60 segundos para unir todas las palabras que puedas con su significado.
// Usa palabras que ya aprendiste (y si son pocas, las de tu unidad y las anteriores).
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { api } from "../../lib/api.js";
import { celebrar } from "../../lib/celebrar.js";
import { feedback } from "../../lib/feedback.js";
import { hablar, hayVoz } from "../../lib/voz.js";
import { barajar } from "../leccion/motor.js";
import { Bit } from "../../components/Bit.jsx";
import estilos from "./Historias.module.css";
import { IconoLlamita } from "../../components/Iconos.jsx";

const SEGUNDOS = 60;
const EN_TABLERO = 5;
const XP_POR_PAREJA = 2;

/** Palabras para jugar: primero las aprendidas; si hay menos de 15, las de tu unidad y anteriores. */
export function palabrasParaParejas(datos) {
  const pos = new Map(datos.unidades.map((u, i) => [u.id, i]));
  const hasta = pos.get(datos.unidadActual) ?? 0;
  const palabras = datos.items.filter((it) => it.concepto === "palabra" && it.es.length <= 32 && it.en.length <= 24 && it.en.toLowerCase() !== it.es.toLowerCase());
  const aprendidas = palabras.filter((it) => (datos.registros[it.clave]?.caja ?? 0) >= 1);
  const lista = aprendidas.length >= 15 ? aprendidas : palabras.filter((it) => (pos.get(it.unidad) ?? 0) <= hasta);
  // sin significados repetidos (dos fichas iguales confunden)
  const vistos = new Set();
  return lista.filter((p) => !vistos.has(p.es.toLowerCase()) && vistos.add(p.es.toLowerCase()));
}

export function ParejasMovil() {
  const navegar = useNavigate();
  const [mazo, setMazo] = useState(null);
  const [record, setRecord] = useState(0);
  const [estado, setEstado] = useState("inicio"); // inicio | jugando | fin
  const [tablero, setTablero] = useState([]); // palabras en juego
  const [ordenDer, setOrdenDer] = useState([]);
  const [izq, setIzq] = useState(null);
  const [mal, setMal] = useState(null);
  const [hechas, setHechas] = useState(new Set());
  const [parejas, setParejas] = useState(0);
  const [combo, setCombo] = useState(0);
  const [quedan, setQuedan] = useState(SEGUNDOS);
  const [resultado, setResultado] = useState(null);
  const siguiente = useRef(0);
  const restantes = useRef([]);
  const inicio = useRef(0); // para sumar solo los segundos que jugaste de verdad
  const enJuego = useRef(new Set()); // claves en el tablero (para no repetir una pareja visible)
  enJuego.current = new Set(tablero.map((p) => p.clave));

  useEffect(() => {
    Promise.all([api.lecciones("ingles"), api.inglesMotivacion()]).then(([d, m]) => {
      setMazo(barajar(palabrasParaParejas(d)));
      setRecord(m.parejasRecord);
    });
  }, []);

  useEffect(() => {
    if (estado !== "jugando") return;
    if (quedan <= 0) {
      terminar();
      return;
    }
    const t = setTimeout(() => setQuedan((q) => q - 1), 1000);
    return () => clearTimeout(t);
  }, [estado, quedan]);

  function tomar() {
    for (let intento = 0; intento < 20; intento++) {
      if (siguiente.current >= restantes.current.length) {
        restantes.current = barajar(mazo);
        siguiente.current = 0;
      }
      const p = restantes.current[siguiente.current++];
      if (!enJuego.current.has(p.clave)) {
        enJuego.current.add(p.clave);
        return p;
      }
    }
    return restantes.current[siguiente.current - 1];
  }

  function empezar() {
    restantes.current = barajar(mazo);
    siguiente.current = 0;
    enJuego.current = new Set();
    const inicial = Array.from({ length: EN_TABLERO }, tomar);
    setTablero(inicial);
    setOrdenDer(barajar(inicial.map((p) => p.clave)));
    setHechas(new Set());
    setParejas(0);
    setCombo(0);
    setQuedan(SEGUNDOS);
    inicio.current = Date.now();
    setEstado("jugando");
  }

  async function terminar() {
    setEstado("fin");
    const r = await api.terminarParejas(parejas, parejas * XP_POR_PAREJA, Math.min(SEGUNDOS, (Date.now() - inicio.current) / 1000));
    if (r.nuevoRecord && parejas > 0) celebrar("logro");
    setRecord(r.record);
    setResultado(r);
  }

  function elegirDer(clave) {
    if (!izq || hechas.has(clave)) return;
    if (izq === clave) {
      feedback.acierto();
      const palabra = tablero.find((p) => p.clave === clave);
      if (hayVoz()) hablar(palabra.en);
      setParejas((n) => n + 1);
      setCombo((c) => c + 1);
      setHechas((h) => new Set(h).add(clave));
      setIzq(null);
      // la pareja se va y entra otra en su lugar
      setTimeout(() => {
        const nueva = tomar();
        setTablero((t) => t.map((p) => (p.clave === clave ? nueva : p)));
        setOrdenDer((o) => {
          const sin = o.filter((c) => c !== clave);
          const lugar = Math.floor(Math.random() * (sin.length + 1));
          return [...sin.slice(0, lugar), nueva.clave, ...sin.slice(lugar)];
        });
        setHechas((h) => {
          const n = new Set(h);
          n.delete(clave);
          return n;
        });
      }, 350);
    } else {
      feedback.fallo();
      setCombo(0);
      setMal(clave);
      setTimeout(() => setMal(null), 350);
    }
  }

  if (!mazo) return <p className={estilos.mensaje}>Preparando palabras…</p>;
  if (mazo.length < EN_TABLERO) {
    return (
      <div className={estilos.inicioParejas}>
        <p>Necesitas algunas palabras más. Haz una lección primero.</p>
        <Link to="/ingles" className="boton">
          Volver
        </Link>
      </div>
    );
  }

  if (estado !== "jugando") {
    return (
      <div className={estilos.jugar}>
        <header className={estilos.barra}>
          <button type="button" className={estilos.cerrar} onClick={() => navegar("/ingles")} aria-label="Salir">
            ✕
          </button>
        </header>
        <div className={estilos.inicioParejas}>
          {estado === "fin" ? (
            <>
              <Bit animo={resultado?.nuevoRecord ? "fiesta" : "feliz"} tamano={80} dice={resultado?.nuevoRecord ? "¡Nuevo récord!" : `Tu récord: ${record}`} />
              <h1>{parejas} parejas</h1>
              <strong className={estilos.xp}>+{parejas * XP_POR_PAREJA} XP</strong>
            </>
          ) : (
            <>
              <Bit animo="pensando" tamano={80} dice="60 segundos. Une todas las que puedas." />
              <h1>Parejas contrarreloj</h1>
              <p className={estilos.ayuda}>Récord: {record} parejas</p>
            </>
          )}
          <div className={estilos.acciones}>
            <button type="button" className="boton boton-primario" onClick={empezar}>
              {estado === "fin" ? "Otra vez" : "¡Empezar!"}
            </button>
            <Link to="/ingles" className="boton">
              Volver a Inglés
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={estilos.jugar}>
      <header className={estilos.barra}>
        <button type="button" className={estilos.cerrar} onClick={() => setQuedan(0)} aria-label="Terminar">
          ✕
        </button>
        <div className={estilos.avance}>
          <motion.div animate={{ width: `${(quedan / SEGUNDOS) * 100}%` }} transition={{ ease: "linear", duration: 1 }} />
        </div>
        <span className={estilos.reloj} data-poco={quedan <= 10}>
          {quedan}s
        </span>
      </header>
      <div className={estilos.marcador}>
        <span>
          <strong>{parejas}</strong> parejas
        </span>
        {combo >= 3 && (
          <span>
            <strong>
<IconoLlamita tamano={16} /> {combo}
</strong> seguidas
          </span>
        )}
      </div>
      <div className={estilos.tablero}>
        <div className={estilos.columna}>
          {tablero.map((p) => (
            <button
              key={p.clave}
              type="button"
              lang="en"
              className={estilos.ficha}
              data-estado={hechas.has(p.clave) ? "bien" : izq === p.clave ? "elegida" : ""}
              onClick={() => !hechas.has(p.clave) && setIzq(p.clave)}
            >
              {p.en}
            </button>
          ))}
        </div>
        <div className={estilos.columna}>
          {ordenDer.map((clave) => {
            const p = tablero.find((x) => x.clave === clave);
            if (!p) return null;
            return (
              <button key={clave} type="button" className={estilos.ficha} data-estado={hechas.has(clave) ? "bien" : mal === clave ? "mal" : ""} onClick={() => elegirDer(clave)}>
                {p.es}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
