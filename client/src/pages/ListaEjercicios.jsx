import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { api } from "../lib/api.js";
import { ES_MOVIL } from "../lib/modo.js";
import { useEvento } from "../hooks/useEvento.js";
import { filtrarEjercicios } from "../lib/filtrarEjercicios.js";
import { nombreColeccion, nombreTema, numeroEjercicio } from "../lib/etiquetas.js";
import { buscarColeccion, ejercicioAlAzar, siguienteEjercicio } from "../lib/areas.js";
import { Selector } from "../components/Selector.jsx";
import { ListaAnimada } from "../components/ListaAnimada.jsx";
import { IconoFlechaIzq } from "../components/Iconos.jsx";
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


/** Agrupa por tema, respetando el orden en que aparecen. */
function agruparPorTema(lista) {
  const grupos = new Map();
  for (const ej of lista) {
    if (!grupos.has(ej.tema)) grupos.set(ej.tema, []);
    grupos.get(ej.tema).push(ej);
  }
  return [...grupos.entries()];
}

/** Los ejercicios de una colección (o de todas), agrupados por tema y con filtros. */
export function ListaEjercicios() {
  const [ejercicios, setEjercicios] = useState(api.ejercicios.guardado);
  const [error, setError] = useState(null);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const filtros = {
    texto: params.get("texto") ?? "",
    tema: params.get("tema") ?? "",
    nivel: params.get("nivel") ?? "",
    estado: params.get("estado") ?? "",
    coleccion: params.get("coleccion") ?? "",
  };
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

  const visibles = filtrarEjercicios(ejercicios, filtros);
  // En el celular se cuenta lo estudiado (resolver con tests es en la laptop).
  const hecho = (e) => (ES_MOVIL ? e.estado !== "pendiente" : e.estado === "resuelto");
  const resueltos = deColeccion.filter(hecho).length;
  const hayFiltros = filtros.texto || filtros.tema || filtros.nivel || filtros.estado;
  const siguiente = siguienteEjercicio(deColeccion);

  const titulo = encontrada ? encontrada.coleccion.nombre : "Todos los ejercicios";
  const subtitulo = encontrada ? encontrada.area.titulo : "Búsqueda en todas las colecciones";

  const pct = (resueltos / Math.max(deColeccion.length, 1)) * 100;
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
        <Selector
          etiqueta="Tema"
          valor={filtros.tema}
          alCambiar={(v) => cambiarFiltro("tema", v)}
          textoTodos="Todos los temas"
          opciones={temas.map((t) => ({ valor: t, texto: nombreTema(t) }))}
        />
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
        {hayFiltros && (
          <button type="button" className={estilos.limpiar} onClick={limpiar}>
            Limpiar
          </button>
        )}
      </div>

      {visibles.length === 0 ? (
        <p className={estilos.vacio}>Ningún ejercicio coincide con los filtros.</p>
      ) : (
        agruparPorTema(visibles).map(([tema, lista]) => (
          <div key={tema} className={estilos.grupo}>
            <h2 className={estilos.tituloGrupo}>
              {nombreTema(tema)}
              <span>
                {lista.filter(hecho).length}/{lista.length}
              </span>
            </h2>
            {/* Cada ejercicio es una ficha: número, nivel en rayitas, título y estado */}
            <ListaAnimada className={estilos.fichas}>
              {lista.map((e) => (
                <li key={e.id}>
                  <Link to={`/practicar/${e.id}`} className={estilos.ficha} data-estado={e.estado}>
                    <div className={estilos.fichaArriba}>
                      <span className={estilos.numero}>{numeroEjercicio(e.id)}</span>
                      <span className={estilos.nivel} data-nivel={e.nivel} title={NIVEL[e.nivel]} aria-label={`Nivel ${NIVEL[e.nivel]}`}>
                        <i />
                        <i />
                        <i />
                      </span>
                    </div>
                    <strong className={estilos.titulo}>{e.titulo}</strong>
                    {!encontrada && <span className={estilos.coleccion}>{nombreColeccion(e.coleccion)}</span>}
                    <div className={estilos.fichaAbajo}>
                      <span className={estilos.estado}>
                        <span className={estilos.punto} aria-hidden />
                        {TEXTO_ESTADO[e.estado] ?? e.estado}
                      </span>
                      {e.ultimoResultado && (
                        <span className={estilos.tests} title="Tests que pasan en tu último intento">
                          {e.ultimoResultado.pasan}/{e.ultimoResultado.total}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ListaAnimada>
          </div>
        ))
      )}
    </section>
  );
}
