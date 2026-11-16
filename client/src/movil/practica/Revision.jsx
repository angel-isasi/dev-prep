// Revisión de código: lees código "de un compañero", marcas las líneas con problemas y luego ves
// lo que habría marcado un senior. Puntaje: hallazgos encontrados menos falsas alarmas.
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../../lib/api.js";
import { celebrar } from "../../lib/celebrar.js";
import { puntuarRevision, TIPOS_HALLAZGO } from "../../../../server/revision.js";
import { CabeceraPagina } from "../../components/CabeceraPagina.jsx";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import estilos from "./Practica.module.css";

const LENGUAJES = { js: "JavaScript", jsx: "React" };

/** Lista de casos con tu mejor resultado. */
export function ListaRevision() {
  const [casos, setCasos] = useState(null);
  const [hechas, setHechas] = useState({});

  useEffect(() => {
    api.revision().then(setCasos, () => setCasos([]));
    api.revisionesHechas().then(setHechas, () => {});
  }, []);

  if (!casos) return <Esqueleto variante="lista" />;
  return (
    <section className={estilos.pagina}>
      <CabeceraPagina etiqueta="Aprender mejor" titulo="Revisión de código">
        Un compañero te pide revisar su código. Marca las líneas con problemas (errores, casos borde, nombres, accesibilidad) y compara con lo que vería un senior.
      </CabeceraPagina>
      <div className={estilos.lista}>
        {casos.map((c) => {
          const hecha = hechas[c.id];
          return (
            <Link key={c.id} to={`/revision/${c.id}`} className={estilos.fila}>
              <span className={estilos.chip}>{LENGUAJES[c.lenguaje] ?? c.lenguaje}</span>
              <span className={estilos.filaTitulo}>
                {c.titulo}
                <small>{"●".repeat(c.nivel ?? 1)}</small>
              </span>
              <span className={estilos.resultado} data-bien={hecha && hecha.encontrados === hecha.total && !hecha.falsasAlarmas}>
                {hecha ? `${hecha.encontrados}/${hecha.total}` : "Pendiente"}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** Un caso: marcar líneas y revisar. */
export function CasoRevision() {
  const { id } = useParams();
  const [caso, setCaso] = useState(null);
  const [marcadas, setMarcadas] = useState([]);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    setMarcadas([]);
    setResultado(null);
    api.revision().then((lista) => setCaso(lista.find((c) => c.id === id) ?? false));
  }, [id]);

  const lineas = useMemo(() => (caso ? caso.codigo.split("\n") : []), [caso]);
  if (caso === null) return <Esqueleto variante="ejercicio" />;
  if (caso === false) return <p className={estilos.pagina}>No existe ese caso.</p>;

  const porLinea = new Map(caso.hallazgos.map((h) => [h.linea, h]));
  const alternar = (n) => !resultado && setMarcadas((m) => (m.includes(n) ? m.filter((x) => x !== n) : [...m, n]));

  async function revisar() {
    const r = puntuarRevision(caso, marcadas);
    setResultado(r);
    await api.guardarRevision(caso.id, r);
    if (r.encontrados === r.total && r.falsasAlarmas === 0) celebrar();
  }

  return (
    <section className={estilos.pagina}>
      <Link to="/revision" className={estilos.volver}>
        ← Revisión de código
      </Link>
      <h1 className={estilos.titulo}>{caso.titulo}</h1>
      <p className={estilos.ayuda}>{caso.contexto}</p>
      <p className={estilos.ayuda}>
        Toca las líneas que corregirías. Hay entre 3 y 5 problemas. {!resultado && `Marcadas: ${marcadas.length}.`}
      </p>

      <div className={estilos.codigo} role="list">
        {lineas.map((texto, i) => {
          const n = i + 1;
          const hallazgo = resultado ? porLinea.get(n) : null;
          const estado = !resultado
            ? marcadas.includes(n)
              ? "marcada"
              : ""
            : hallazgo
              ? marcadas.includes(n)
                ? "acierto"
                : "omitida"
              : marcadas.includes(n)
                ? "falsa"
                : "";
          return (
            <button key={n} type="button" role="listitem" className={estilos.lineaCodigo} data-estado={estado} onClick={() => alternar(n)} disabled={!!resultado}>
              <span className={estilos.numero}>{n}</span>
              <code>{texto || " "}</code>
            </button>
          );
        })}
      </div>

      {!resultado ? (
        <button type="button" className="boton boton-primario" onClick={revisar} disabled={marcadas.length === 0}>
          Revisar
        </button>
      ) : (
        <>
          <div className={estilos.marcador}>
            <strong>
              {resultado.encontrados} de {resultado.total}
            </strong>{" "}
            problemas encontrados
            {resultado.falsasAlarmas > 0 && ` · ${resultado.falsasAlarmas} ${resultado.falsasAlarmas === 1 ? "falsa alarma" : "falsas alarmas"}`}
          </div>
          <ol className={estilos.hallazgos}>
            {caso.hallazgos.map((h) => (
              <li key={h.linea} data-encontrado={marcadas.includes(h.linea)}>
                <span className={estilos.chip}>
                  Línea {h.linea} · {TIPOS_HALLAZGO[h.tipo] ?? h.tipo}
                </span>
                <strong>{h.titulo}</strong>
                <p>{h.detalle}</p>
                {h.arreglo && <code className={estilos.arreglo}>{h.arreglo}</code>}
              </li>
            ))}
          </ol>
          <div className={estilos.acciones}>
            <button
              type="button"
              className="boton"
              onClick={() => {
                setMarcadas([]);
                setResultado(null);
              }}
            >
              Intentar de nuevo
            </button>
            <Link to="/revision" className="boton boton-primario">
              Otro caso
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
