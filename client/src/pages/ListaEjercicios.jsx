import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { api } from "../lib/api.js";
import { ES_MOVIL } from "../lib/modo.js";
import { useEvento } from "../hooks/useEvento.js";
import { agruparEjercicios, claveGrupo, filtrarEjercicios } from "../lib/filtrarEjercicios.js";
import { PATRONES, nombrePatron } from "../../../scripts/items/unidades.js";
import { nombreColeccion, nombreTema } from "../lib/etiquetas.js";
import { buscarColeccion, ejercicioAlAzar, siguienteEjercicio } from "../lib/areas.js";
import { Selector } from "../components/Selector.jsx";
import { ListaAnimada } from "../components/ListaAnimada.jsx";
import { IconoFlechaIzq } from "../components/Iconos.jsx";
import { esEsencial } from "../../../server/plan-junior.js";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { Buscador } from "../components/Buscador.jsx";
import { BotonAzar } from "../components/BotonAzar.jsx";
import { SlidingNumber } from "../components/ui/sliding-number.jsx";
import estilos from "./ListaEjercicios.module.css";

// En el celular no se resuelven ejercicios (eso es en la laptop): se estudian.
const ESTADOS = ES_MOVIL
  ? [
      ["pendiente", "Pendiente"],
      ["estudiado", "Estudiado"],
      ["repasar", "Para repasar"],
    ]
  : [
      ["pendiente", "Pendiente"],
      ["en-progreso", "En progreso"],
      ["resuelto", "Resuelto"],
      ["repasar", "Para repasar"],
    ];

const TEXTO_ESTADO = Object.fromEntries(ESTADOS);
const NIVEL = { 1: "Básico", 2: "Intermedio", 3: "Difícil" };
/** El estado de cada fila se ve como un icono (el texto queda para lectores de pantalla y el title). */
const ICONO_ESTADO = { pendiente: "○", "en-progreso": "◐", resuelto: "✓", estudiado: "✓", repasar: "↻" };

/**
 * Nombre legible de la colección de un ejercicio. Si etiquetas.js no la conoce devuelve la ruta
 * cruda ("Javascript/depurar"): en ese caso se usa el nombre que tiene en areas.js ("Depurar código roto").
 */
function coleccionLegible(id) {
  const nombre = nombreColeccion(id);
  if (!nombre.includes("/")) return nombre;
  return buscarColeccion(id)?.coleccion.nombre ?? "";
}


/**
 * Los ejercicios de una colección (o de todas), agrupados por tema y con filtros.
 * Los retos de algoritmos traen `patron`: en su colección se agrupan y filtran por patrón.
 */
export function ListaEjercicios() {
  const [ejercicios, setEjercicios] = useState(api.ejercicios.guardado);
  const [error, setError] = useState(null);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  // Grupos que abriste o cerraste a mano. Se guarda junto al "modo" (con o sin filtros) para que
  // lo que tocaste buscando no cambie cómo se ve la lista normal, y al revés.
  const [manual, setManual] = useState({ modo: "", temas: {} });
  const filtros = {
    texto: params.get("texto") ?? "",
    tema: params.get("tema") ?? "",
    patron: params.get("patron") ?? "",
    nivel: params.get("nivel") ?? "",
    estado: params.get("estado") ?? "",
    coleccion: params.get("coleccion") ?? "",
  };
  // "Plan junior": solo lo esencial para una entrevista junior; "crecer": lo que queda para después
  const filtroPlan = params.get("plan") ?? "";
  const encontrada = buscarColeccion(filtros.coleccion);

  useEffect(() => {
    api.ejercicios().then(setEjercicios, (e) => setError(e.message));
  }, []);

  // Cuando un ejercicio termina de correr, actualiza su fila sin recargar.
  useEvento("resultado", ({ id, progreso }) => {
    setEjercicios((lista) =>
      lista?.map((e) =>
        e.id === id ? { ...e, estado: progreso.estado, ultimoResultado: progreso.ultimoResultado } : e,
      ),
    );
  });

  const deColeccion = useMemo(
    () => (ejercicios ?? []).filter((e) => !filtros.coleccion || e.coleccion === filtros.coleccion),
    [ejercicios, filtros.coleccion],
  );
  const temas = useMemo(() => [...new Set(deColeccion.map((e) => e.tema))], [deColeccion]);
  // Solo dentro de una colección con patrones (los retos de algoritmos); en "Todos" se agrupa por tema
  const porPatron = !!filtros.coleccion && deColeccion.some((e) => e.patron);
  const patrones = useMemo(() => PATRONES.filter((p) => deColeccion.some((e) => e.patron === p.id)), [deColeccion]);

  function cambiarFiltro(nombre, valor) {
    const nuevos = new URLSearchParams(params);
    if (valor) nuevos.set(nombre, valor);
    else nuevos.delete(nombre);
    setParams(nuevos, { replace: true });
  }

  function limpiar() {
    setParams(filtros.coleccion ? { coleccion: filtros.coleccion } : {}, { replace: true });
  }

  if (error) return <p className={estilos.mensaje}>No se pudo cargar la lista: {error}</p>;
  if (!ejercicios) return <Esqueleto variante="lista" />;

  const visibles = filtrarEjercicios(ejercicios, filtros).filter((e) => !filtroPlan || esEsencial(e.id) === (filtroPlan === "junior"));
  // En el celular se cuenta lo estudiado (resolver con tests es en la laptop).
  const hecho = (e) => (ES_MOVIL ? e.estado !== "pendiente" : e.estado === "resuelto");
  const resueltos = deColeccion.filter(hecho).length;
  const hayFiltros = filtros.texto || filtros.tema || filtros.patron || filtros.nivel || filtros.estado || filtroPlan;
  const siguiente = siguienteEjercicio(deColeccion);

  const titulo = encontrada ? encontrada.coleccion.nombre : "Todos los ejercicios";
  const subtitulo = encontrada ? encontrada.area.titulo : "Búsqueda en todas las colecciones";

  const pct = (resueltos / Math.max(deColeccion.length, 1)) * 100;

  // Qué grupos se ven abiertos: con búsqueda o filtros, todos; si no, solo el del siguiente
  // ejercicio pendiente (o el primero). Lo que abras o cierres a mano manda sobre eso.
  const grupos = agruparEjercicios(visibles, { porPatron });
  const nombreGrupo = (g) => (g.patron ? nombrePatron(g.patron) : nombreTema(g.tema));
  const modo = hayFiltros ? "filtros" : "normal";
  const claveSiguiente = siguiente && claveGrupo(siguiente, porPatron);
  const grupoSiguiente = grupos.some((g) => g.clave === claveSiguiente) ? claveSiguiente : grupos[0]?.clave;
  const estaAbierto = (clave) => (manual.modo === modo ? manual.temas[clave] : undefined) ?? (hayFiltros ? true : clave === grupoSiguiente);
  const alternar = (clave, abrir) => setManual((m) => ({ modo, temas: { ...(m.modo === modo ? m.temas : {}), [clave]: abrir } }));
  const irA = (ej) => ej && navigate(`/practicar/${ej.id}`);

  return (
    <section className={estilos.pagina} data-area={encontrada?.area.id ?? "todas"}>
      <Link to="/practicar" className={estilos.volver}>
        <IconoFlechaIzq /> Practicar
      </Link>

      <CabeceraPagina
        etiqueta={subtitulo}
        titulo={titulo}
        acciones={
          <>
            <BotonAzar onClick={() => irA(ejercicioAlAzar(deColeccion))} />
            {siguiente && (
              <button type="button" className="boton boton-primario" onClick={() => irA(siguiente)}>
                {siguiente.estado === "en-progreso" ? "Continuar" : "Siguiente"}: {siguiente.titulo} →
              </button>
            )}
          </>
        }
      >
        {encontrada?.coleccion.descripcion}
      </CabeceraPagina>

      {/* Avance de la colección: número grande y barra del color del área */}
      <div className={estilos.avance}>
        <strong className={estilos.avanceNumero}>
          <SlidingNumber number={resueltos} />
          <small>/{deColeccion.length}</small>
        </strong>
        <div className={estilos.avanceTexto}>
          <span>{ES_MOVIL ? "estudiados" : "resueltos"}</span>
          <div className={estilos.barraProgreso}>
            <div style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span className={estilos.avancePct}>{Math.round(pct)}%</span>
      </div>

      <div className={estilos.filtros}>
        <Buscador
          valor={filtros.texto}
          alCambiar={(v) => cambiarFiltro("texto", v)}
          etiqueta="Buscar ejercicios"
          placeholder="Buscar por título o tag…"
          ancho="300px"
        />
        {porPatron ? (
          <Selector
            etiqueta="Patrón"
            valor={filtros.patron}
            alCambiar={(v) => cambiarFiltro("patron", v)}
            textoTodos="Todos los patrones"
            opciones={patrones.map((p) => ({ valor: p.id, texto: p.nombre }))}
          />
        ) : (
          <Selector
            etiqueta="Tema"
            valor={filtros.tema}
            alCambiar={(v) => cambiarFiltro("tema", v)}
            textoTodos="Todos los temas"
            opciones={temas.map((t) => ({ valor: t, texto: nombreTema(t) }))}
          />
        )}
        <Selector
          etiqueta="Nivel"
          valor={filtros.nivel}
          alCambiar={(v) => cambiarFiltro("nivel", v)}
          textoTodos="Todos los niveles"
          opciones={[
            { valor: "1", texto: "Básico" },
            { valor: "2", texto: "Intermedio" },
            { valor: "3", texto: "Difícil" },
          ]}
        />
        <Selector
          etiqueta="Estado"
          valor={filtros.estado}
          alCambiar={(v) => cambiarFiltro("estado", v)}
          textoTodos="Todos los estados"
          opciones={ESTADOS.map(([valor, texto]) => ({ valor, texto }))}
        />
        <Selector
          etiqueta="Para qué"
          valor={filtroPlan}
          alCambiar={(v) => cambiarFiltro("plan", v)}
          textoTodos="Todo"
          opciones={[
            { valor: "junior", texto: "Plan junior" },
            { valor: "crecer", texto: "Para crecer" },
          ]}
        />
        {hayFiltros && (
          <button type="button" className={estilos.limpiar} onClick={limpiar}>
            Limpiar
          </button>
        )}
      </div>

      {visibles.length === 0 ? (
        <p className={estilos.vacio}>Ningún ejercicio coincide con los filtros.</p>
      ) : (
        <div className={estilos.grupos}>
          {grupos.map(({ clave, lista, ...grupo }) => {
          const abierto = estaAbierto(clave);
          return (
            // Cada grupo (tema o patrón) es un <details> plegable. Lo controla React (open + clic en el
            // summary) para poder abrir por defecto el grupo del siguiente ejercicio, o todos si hay filtros.
            <details key={clave} className={estilos.grupo} open={abierto}>
              <summary
                className={estilos.tituloGrupo}
                onClick={(evento) => {
                  evento.preventDefault(); // el navegador no cambia "open": lo decide el estado
                  alternar(clave, !abierto);
                }}
              >
                <span className={estilos.flecha} aria-hidden>
                  ›
                </span>
                <span className={estilos.nombreGrupo}>{nombreGrupo(grupo)}</span>
                <span className={estilos.cuentaGrupo}>
                  {lista.filter(hecho).length}/{lista.length}
                </span>
              </summary>
              {/* Solo se pintan las filas del grupo abierto: con 390 ejercicios, la página queda liviana */}
              {abierto && (
                <ListaAnimada className={estilos.filas}>
                  {lista.map((e) => (
                    <li key={e.id}>
                      {/* Una línea por ejercicio: estado (icono), título, colección, tests y nivel (punto de color) */}
                      <Link to={`/practicar/${e.id}`} className={estilos.filaEj} data-estado={e.estado}>
                        <span className={estilos.icono} role="img" aria-label={TEXTO_ESTADO[e.estado] ?? e.estado} title={TEXTO_ESTADO[e.estado] ?? e.estado}>
                          {ICONO_ESTADO[e.estado] ?? "○"}
                        </span>
                        <strong className={estilos.titulo}>{e.titulo}</strong>
                        {esEsencial(e.id) && (
                          <span className="chip" data-tono="acento" title="Es parte de lo esencial para una entrevista junior">
                            Junior
                          </span>
                        )}
                        {!encontrada && coleccionLegible(e.coleccion) && <span className={estilos.coleccion}>{coleccionLegible(e.coleccion)}</span>}
                        {e.ultimoResultado && (
                          <span className={estilos.tests} title="Tests que pasan en tu último intento">
                            {e.ultimoResultado.pasan}/{e.ultimoResultado.total}
                          </span>
                        )}
                        <span className={estilos.nivel} data-nivel={e.nivel} role="img" aria-label={`Nivel ${NIVEL[e.nivel]}`} title={NIVEL[e.nivel]} />
                      </Link>
                    </li>
                  ))}
                </ListaAnimada>
              )}
            </details>
          );
        })}
        </div>
      )}
    </section>
  );
}
