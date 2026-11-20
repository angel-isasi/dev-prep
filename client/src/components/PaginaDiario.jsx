// Tu diario de una línea (/diario) como un tablero: la ficha de hoy, tu constancia (cifras y
// los últimos 14 días) y, debajo, cada día escrito en su propia ficha.
import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { CabeceraPagina } from "./CabeceraPagina.jsx";
import { IconoAlerta } from "./Iconos.jsx";
import estilos from "./PaginaDiario.module.css";

const DIAS_TIRA = 14;

/** Fecha local como "2026-11-20" (así se guardan las entradas). */
const claveDia = (d) => d.toLocaleDateString("en-CA");

/** Los últimos n días, del más antiguo a hoy. */
function ultimosDias(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - (n - 1 - i));
    return d;
  });
}

/** Días seguidos con entrada. Si hoy todavía no escribes, la racha se cuenta hasta ayer. */
function rachaDiario(fechas) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  if (!fechas.has(claveDia(d))) d.setDate(d.getDate() - 1);
  let racha = 0;
  while (fechas.has(claveDia(d))) {
    racha += 1;
    d.setDate(d.getDate() - 1);
  }
  return racha;
}

/** Día grande a la izquierda y, al lado, dos renglones cortos (se usa en "Hoy" y en cada entrada). */
function Fecha({ dia, titulo, detalle }) {
  return (
    <span className={estilos.fecha}>
      <strong>{dia}</strong>
      <span>
        <b>{titulo}</b>
        {detalle && <small>{detalle}</small>}
      </span>
    </span>
  );
}

export function PaginaDiario() {
  const [entradas, setEntradas] = useState([]);
  const [aprendi, setAprendi] = useState("");
  const [trabe, setTrabe] = useState("");
  const [guardado, setGuardado] = useState(false);

  const cargar = () =>
    api.diario().then((lista) => {
      setEntradas(lista);
      const hoy = lista.find((e) => e.fecha === claveDia(new Date()));
      if (hoy) {
        setAprendi(hoy.aprendi);
        setTrabe(hoy.trabe);
      }
    });
  useEffect(() => {
    cargar();
  }, []);

  async function guardar(e) {
    e.preventDefault();
    await api.guardarDiario({ aprendi, trabe });
    setGuardado(true);
    cargar();
  }

  const ahora = new Date();
  const hoy = claveDia(ahora);
  const fechas = new Set(entradas.map((e) => e.fecha));
  const escritoHoy = fechas.has(hoy);
  const tira = ultimosDias(DIAS_TIRA);
  const enTira = tira.filter((d) => fechas.has(claveDia(d))).length;
  const esteMes = entradas.filter((e) => e.fecha.startsWith(hoy.slice(0, 7))).length;
  const trabas = entradas.filter((e) => e.trabe?.trim()).length;
  const racha = rachaDiario(fechas);

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina etiqueta="Una línea al día" titulo="Tu diario">
        Escribir lo que aprendiste lo fija en la memoria, y lo que te trabó te dice qué repasar mañana.
      </CabeceraPagina>

      <div className={estilos.tablero}>
        {/* Fila 1, izquierda: la entrada de hoy */}
        <form onSubmit={guardar} className={`tarjeta ${estilos.hoy}`}>
          <header className={estilos.cabeza}>
            <Fecha dia={ahora.getDate()} titulo="Hoy" detalle={`${ahora.toLocaleDateString("es-PE", { weekday: "long" })} · ${ahora.toLocaleDateString("es-PE", { month: "long", year: "numeric" })}`} />
            <span className="chip" data-tono={escritoHoy ? "exito" : "aviso"}>
              {escritoHoy ? "Escrito" : "Pendiente"}
            </span>
          </header>
          <label className={estilos.campo}>
            <span className={estilos.icono} data-tono="exito" aria-hidden>
              ✓
            </span>
            <span className={estilos.campoTexto}>
              <strong>¿Qué aprendiste hoy?</strong>
              <input
                value={aprendi}
                onChange={(e) => setAprendi(e.target.value)}
                maxLength={280}
                placeholder="Por ejemplo: que map devuelve un arreglo nuevo"
              />
            </span>
          </label>
          <label className={estilos.campo}>
            <span className={estilos.icono} data-tono="aviso" aria-hidden>
              <IconoAlerta tamano={18} />
            </span>
            <span className={estilos.campoTexto}>
              <strong>¿Qué te trabó?</strong>
              <input
                value={trabe}
                onChange={(e) => setTrabe(e.target.value)}
                maxLength={280}
                placeholder="Por ejemplo: el orden de las promesas"
              />
            </span>
          </label>
          <footer className={estilos.pie}>
            <button type="submit" className="boton boton-primario" disabled={!aprendi.trim() && !trabe.trim()}>
              Guardar
            </button>
            {guardado && <span className={estilos.listo}>Guardado</span>}
          </footer>
        </form>

        {/* Fila 1, derecha: cifras y los últimos 14 días */}
        <section className={`tarjeta ${estilos.constancia}`}>
          <span className="etiqueta">Tu constancia</span>
          <dl className={estilos.cifras}>
            <div>
              <dt>Días escritos</dt>
              <dd>{entradas.length}</dd>
              <small>en total</small>
            </div>
            <div>
              <dt>Racha</dt>
              <dd>{racha}</dd>
              <small>{racha === 1 ? "día seguido" : "días seguidos"}</small>
            </div>
            <div>
              <dt>Este mes</dt>
              <dd>{esteMes}</dd>
              <small>de {ahora.getDate()} días</small>
            </div>
            <div>
              <dt>Trabas</dt>
              <dd>{trabas}</dd>
              <small>anotadas</small>
            </div>
          </dl>
          <div className={estilos.tiraCabeza}>
            <span>Últimos {DIAS_TIRA} días</span>
            <strong>
              {enTira} de {DIAS_TIRA}
            </strong>
          </div>
          <ol className={estilos.tira}>
            {tira.map((d) => {
              const clave = claveDia(d);
              const escrito = fechas.has(clave);
              return (
                <li
                  key={clave}
                  data-escrito={escrito}
                  data-hoy={clave === hoy}
                  title={`${d.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}: ${escrito ? "escrito" : "sin entrada"}`}
                >
                  <small aria-hidden>{d.toLocaleDateString("es-PE", { weekday: "narrow" })}</small>
                  <span>{d.getDate()}</span>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Fila 2: cada día en su ficha */}
        <section className={`tarjeta ${estilos.historial}`}>
          <header className={estilos.cabeza}>
            <span className="etiqueta">Tus entradas</span>
            <span className="chip">{entradas.length}</span>
          </header>
          <ol className={estilos.entradas}>
            {entradas.map((e) => {
              const d = new Date(`${e.fecha}T12:00:00`);
              return (
                <li key={e.fecha} className={`aparecer ${estilos.entrada}`}>
                  <Fecha
                    dia={d.getDate()}
                    titulo={d.toLocaleDateString("es-PE", { weekday: "long" })}
                    detalle={d.toLocaleDateString("es-PE", { month: "long", year: "numeric" })}
                  />
                  {e.aprendi && (
                    <p>
                      <span className={estilos.marca} data-tono="exito" role="img" aria-label="Aprendí">
                        ✓
                      </span>
                      {e.aprendi}
                    </p>
                  )}
                  {e.trabe && (
                    <p>
                      <span className={estilos.marca} data-tono="aviso" role="img" aria-label="Me trabó">
                        <IconoAlerta tamano={14} />
                      </span>
                      {e.trabe}
                    </p>
                  )}
                </li>
              );
            })}
            {/* Diario vacío: se ve dónde va a quedar cada día, en vez de una frase suelta */}
            {entradas.length === 0 &&
              ["Tu primera entrada", "Mañana", "Pasado mañana", "Y así, cada día"].map((texto, i) => (
                <li key={texto} className={`${estilos.entrada} ${estilos.fantasma}`} aria-hidden={i > 0}>
                  <Fecha dia={i + 1} titulo={texto} />
                  <i />
                  <i />
                </li>
              ))}
          </ol>
        </section>
      </div>
    </section>
  );
}
