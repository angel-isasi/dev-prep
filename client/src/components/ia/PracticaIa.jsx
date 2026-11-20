// IA dentro de un ejercicio: pista que mira tu código, "¿Por qué falla?" en cada test en rojo y la
// pestaña "Entrénalo" (revisión de senior con comparación, di la complejidad, detecta el error y variante).
import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { EvaluadorIa } from "../EvaluadorIa.jsx";
import { TextoConCodigo } from "../TextoConCodigo.jsx";
import { CajaIa, CodigoIa, ListaIa, Veredicto, estilosIa as base } from "./CajaIa.jsx";
import { useIa } from "./useIa.js";
import estilos from "./Ia.module.css";

/** Tu código de workspace/ (y la solución oficial si ya lo resolviste). */
export function useMiCodigo(id, activo = true) {
  const [datos, setDatos] = useState(null);
  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    api.miCodigo?.(id)
      .then((d) => vivo && setDatos(d ?? null))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [id, activo]);
  return datos;
}

const leerCodigo = async (id) => (await api.miCodigo?.(id).catch(() => null))?.codigo ?? "";

// ---------------------------------------------------------------------------------------------
/** Pista nueva que mira tu código y los tests que fallan. Va debajo de las 3 pistas fijas. */
export function PistaIa({ id, enunciado, resultado, pistasVistas }) {
  const [pistas, setPistas] = useState([]);
  return (
    <CajaIa titulo="Pista con IA" detalle="Mira tu código y los tests que fallan, y te da una pista sin darte la solución." vacio={null}>
      {(olvidar) => <PistaIaContenido {...{ id, enunciado, resultado, pistasVistas, pistas, setPistas, olvidar }} />}
    </CajaIa>
  );
}

function PistaIaContenido({ id, enunciado, resultado, pistasVistas, pistas, setPistas, olvidar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  async function pedirPista() {
    const codigo = await leerCodigo(id);
    const fallos = (resultado?.casos ?? []).filter((c) => !c.ok).slice(0, 6);
    const r = await pedir({
      tarea: "pista",
      pregunta: enunciado,
      codigo,
      fallos: resultado?.error ? [{ nombre: "Error al correr", mensaje: resultado.error }, ...fallos] : fallos,
      pistasVistas: [...pistasVistas, ...pistas.map((p) => p.pista)],
    });
    if (r) setPistas((p) => [...p, r]);
  }
  return (
    <>
      {pistas.map((p, i) => (
        <div key={i} className={estilos.nota}>
          <p style={{ margin: 0 }}>
            <TextoConCodigo>{p.pista}</TextoConCodigo>
          </p>
          {p.mirar && (
            <small className={base.suave}>
              Mira: <TextoConCodigo>{p.mirar}</TextoConCodigo>
            </small>
          )}
        </div>
      ))}
      <div className={base.fila}>
        <button type="button" className="boton" onClick={pedirPista} disabled={cargando}>
          {cargando ? "Mirando tu código…" : pistas.length ? "Otra pista" : "Dame una pista para mi código"}
        </button>
      </div>
      {error && <p className={base.error}>{error}</p>}
    </>
  );
}

// ---------------------------------------------------------------------------------------------
/** Enlace "¿Por qué falla?" debajo de un test en rojo. Sin IA lista no se muestra. */
export function PorQueFalla({ id, enunciado, caso }) {
  const [abierto, setAbierto] = useState(false);
  if (!abierto) {
    return (
      <button type="button" className={estilos.enlinea} onClick={() => setAbierto(true)}>
        ¿Por qué falla?
      </button>
    );
  }
  return (
    <CajaIa titulo="¿Por qué falla?" vacio={<small className={base.suave}>La IA no está disponible.</small>}>
      {(olvidar) => <PorQueFallaContenido id={id} enunciado={enunciado} caso={caso} olvidar={olvidar} />}
    </CajaIa>
  );
}

function PorQueFallaContenido({ id, enunciado, caso, olvidar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  const [r, setR] = useState(null);
  useEffect(() => {
    let vivo = true;
    leerCodigo(id).then(async (codigo) => {
      const res = await pedir({ tarea: "por-que-falla", pregunta: enunciado, codigo, caso });
      if (vivo) setR(res);
    });
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (cargando) return <p className={base.suave}>Mirando tu código…</p>;
  if (error) return <p className={base.error}>{error}</p>;
  if (!r) return null;
  return (
    <div className={base.resultado}>
      <p>
        <TextoConCodigo>{r.explicacion}</TextoConCodigo>
      </p>
      {r.donde && (
        <p className={base.suave}>
          Dónde: <TextoConCodigo>{r.donde}</TextoConCodigo>
        </p>
      )}
      {r.siguiente && (
        <p className={estilos.nota}>
          <TextoConCodigo>{r.siguiente}</TextoConCodigo>
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
/**
 * Pestaña "Entrénalo" de un ejercicio resuelto: cuatro formas de sacarle más jugo, lado a lado.
 * @param {{ id: string, titulo: string, enunciado: string }} props
 */
export function Entrenar({ id, titulo, enunciado }) {
  const datos = useMiCodigo(id);
  const codigo = datos?.codigo ?? "";
  if (datos && !codigo) {
    return <p className={base.suave}>No se encontró tu archivo en workspace/. Ábrelo en VS Code desde la laptop para entrenarlo.</p>;
  }
  return (
    <div className={estilos.rejilla}>
      {codigo && (
        <EvaluadorIa tarea="codigo" respuestaFija={codigo} pedido={{ pregunta: enunciado, categoria: titulo, oficial: datos?.oficial ?? "" }} />
      )}
      <Complejidad enunciado={enunciado} codigo={codigo} />
      <DetectaError enunciado={enunciado} codigo={datos?.oficial || codigo} />
      <Variante id={id} titulo={titulo} enunciado={enunciado} codigo={codigo} />
    </div>
  );
}

const TEXTO_VEREDICTO = {
  bien: "Correcto",
  casi: "Casi",
  mal: "No es así",
  acerto: "Lo encontraste",
  no: "No era eso",
  resuelto: "Resuelve la variante",
};

function Complejidad({ enunciado, codigo }) {
  return (
    <CajaIa titulo="Di la complejidad" detalle="Como en la entrevista: ¿cuánto cuesta tu solución en tiempo y en espacio, y por qué?">
      {(olvidar) => <ComplejidadContenido enunciado={enunciado} codigo={codigo} olvidar={olvidar} />}
    </CajaIa>
  );
}

function ComplejidadContenido({ enunciado, codigo, olvidar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  const [texto, setTexto] = useState("");
  const [r, setR] = useState(null);
  if (r) {
    return (
      <div className={base.resultado}>
        <Veredicto valor={r.veredicto} texto={TEXTO_VEREDICTO[r.veredicto]} />
        <p>
          Tiempo: <code>{r.tiempo}</code> · Espacio: <code>{r.espacio}</code>
        </p>
        <p>
          <TextoConCodigo>{r.comentario}</TextoConCodigo>
        </p>
        <button type="button" className={base.enlace} onClick={() => setR(null)}>
          Intentar otra vez
        </button>
      </div>
    );
  }
  return (
    <>
      <textarea
        className={base.texto}
        rows={3}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Por ejemplo: O(n) en tiempo porque recorro el array una vez, y O(n) en espacio por el objeto que armo."
      />
      <div className={base.fila}>
        <button
          type="button"
          className="boton boton-primario"
          disabled={cargando || texto.trim().length < 4 || !codigo}
          onClick={async () => setR(await pedir({ tarea: "complejidad", pregunta: enunciado, codigo, respuesta: texto }))}
        >
          {cargando ? "Revisando…" : "Revisar"}
        </button>
      </div>
      {error && <p className={base.error}>{error}</p>}
    </>
  );
}

function DetectaError({ enunciado, codigo }) {
  return (
    <CajaIa titulo="Detecta el error" detalle="La IA mete un error escondido en la solución. Encuéntralo y di por qué falla.">
      {(olvidar) => <DetectaErrorContenido enunciado={enunciado} codigo={codigo} olvidar={olvidar} />}
    </CajaIa>
  );
}

function DetectaErrorContenido({ enunciado, codigo, olvidar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  const [reto, setReto] = useState(null);
  const [texto, setTexto] = useState("");
  const [r, setR] = useState(null);

  async function crear() {
    setR(null);
    setTexto("");
    setReto(await pedir({ tarea: "detecta-crear", pregunta: enunciado, codigo }));
  }

  if (!reto) {
    return (
      <div className={base.fila}>
        <button type="button" className="boton" onClick={crear} disabled={cargando || !codigo}>
          {cargando ? "Escondiendo el error…" : "Dame un código con un error"}
        </button>
        {error && <p className={base.error}>{error}</p>}
      </div>
    );
  }
  return (
    <>
      <CodigoIa codigo={reto.codigo} />
      {!r ? (
        <>
          <textarea
            className={base.texto}
            rows={2}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="En la línea... falla porque... con la entrada..."
          />
          <div className={base.fila}>
            <button
              type="button"
              className="boton boton-primario"
              disabled={cargando || texto.trim().length < 4}
              onClick={async () => setR(await pedir({ tarea: "detecta-evaluar", codigo: reto.codigo, ...reto, respuesta: texto }))}
            >
              {cargando ? "Revisando…" : "Comprobar"}
            </button>
          </div>
        </>
      ) : (
        <div className={base.resultado}>
          <Veredicto valor={r.veredicto} texto={TEXTO_VEREDICTO[r.veredicto] ?? "Casi"} />
          <p>
            <TextoConCodigo>{r.comentario}</TextoConCodigo>
          </p>
          <p className={estilos.nota}>
            Línea {reto.linea}: <TextoConCodigo>{reto.error}</TextoConCodigo>. <TextoConCodigo>{reto.porque}</TextoConCodigo>
          </p>
          <button type="button" className="boton" onClick={crear} disabled={cargando}>
            Otro error
          </button>
        </div>
      )}
      {error && <p className={base.error}>{error}</p>}
    </>
  );
}

const CLAVE_VARIANTES = (id) => `devprep.variantes.${id}`;

function Variante({ id, titulo, enunciado, codigo }) {
  return (
    <CajaIa titulo="Variante" detalle="El mismo ejercicio con un giro, para que no lo resuelvas de memoria.">
      {(olvidar) => <VarianteContenido {...{ id, titulo, enunciado, codigo, olvidar }} />}
    </CajaIa>
  );
}

function VarianteContenido({ id, titulo, enunciado, codigo, olvidar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  const [variante, setVariante] = useState(null);
  const [miCodigo, setMiCodigo] = useState("");
  const [r, setR] = useState(null);

  async function crear() {
    const anteriores = JSON.parse(localStorage.getItem(CLAVE_VARIANTES(id)) ?? "[]");
    const v = await pedir({ tarea: "variante", pregunta: enunciado, categoria: titulo, codigo, anteriores });
    if (!v) return;
    localStorage.setItem(CLAVE_VARIANTES(id), JSON.stringify([...anteriores, v.cambio].slice(-6)));
    setVariante(v);
    setMiCodigo("");
    setR(null);
  }

  if (!variante) {
    return (
      <div className={base.fila}>
        <button type="button" className="boton" onClick={crear} disabled={cargando}>
          {cargando ? "Creando la variante…" : "Crear una variante"}
        </button>
        {error && <p className={base.error}>{error}</p>}
      </div>
    );
  }
  const textoVariante = `${variante.enunciado}\n\nEjemplos:\n${variante.ejemplos.map((e) => `${e.entrada} → ${e.salida}`).join("\n")}`;
  return (
    <>
      <strong>{variante.titulo}</strong>
      <p className={estilos.nota}>{variante.cambio}</p>
      <p>
        <TextoConCodigo>{variante.enunciado}</TextoConCodigo>
      </p>
      <ul>
        {variante.ejemplos.map((e, i) => (
          <li key={i}>
            <code>{e.entrada}</code> → <code>{e.salida}</code>
          </li>
        ))}
      </ul>
      {!r ? (
        <>
          <textarea
            className={base.texto}
            rows={8}
            spellCheck={false}
            style={{ fontFamily: "var(--fuente-codigo)" }}
            value={miCodigo}
            onChange={(e) => setMiCodigo(e.target.value)}
            placeholder="Escribe aquí tu solución (o pégala desde VS Code)"
          />
          <div className={base.fila}>
            <button
              type="button"
              className="boton boton-primario"
              disabled={cargando || miCodigo.trim().length < 15}
              onClick={async () => setR(await pedir({ tarea: "revisar-variante", pregunta: textoVariante, codigo: miCodigo }))}
            >
              {cargando ? "Revisando…" : "Revisar mi solución"}
            </button>
            <button type="button" className={base.enlace} onClick={crear} disabled={cargando}>
              Otra variante
            </button>
          </div>
        </>
      ) : (
        <div className={base.resultado}>
          <Veredicto valor={r.veredicto} texto={TEXTO_VEREDICTO[r.veredicto] ?? "Casi"} />
          <p>{r.resumen}</p>
          <ListaIa titulo="Para corregir" items={r.problemas} tipo="falta" />
          {r.casoQueFalla && (
            <p className={estilos.nota}>
              Falla con: <TextoConCodigo>{r.casoQueFalla}</TextoConCodigo>
            </p>
          )}
          <div className={base.fila}>
            <button type="button" className="boton" onClick={() => setR(null)}>
              Corregir mi código
            </button>
            <button type="button" className={base.enlace} onClick={crear} disabled={cargando}>
              Otra variante
            </button>
          </div>
        </div>
      )}
      {error && <p className={base.error}>{error}</p>}
    </>
  );
}
