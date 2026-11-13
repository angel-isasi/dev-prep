import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { api } from "../lib/api.js";
import { useEvento } from "../hooks/useEvento.js";
import { filtrarEjercicios } from "../lib/filtrarEjercicios.js";
import { nombreColeccion, nombreTema } from "../lib/etiquetas.js";
import { buscarColeccion, ejercicioAlAzar, siguienteEjercicio } from "../lib/areas.js";
import { Insignia } from "../components/Insignia.jsx";
import { IconoFlechaIzq } from "../components/Iconos.jsx";
import estilos from "./ListaEjercicios.module.css";

const ESTADOS = [
  ["pendiente", "Pendiente"],
  ["en-progreso", "En progreso"],
  ["resuelto", "Resuelto"],
  ["repasar", "Para repasar"],
];

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
  const [ejercicios, setEjercicios] = useState(null);
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
  if (!ejercicios) return <p className={estilos.mensaje}>Cargando…</p>;

  const visibles = filtrarEjercicios(ejercicios, filtros);
  const resueltos = deColeccion.filter((e) => e.estado === "resuelto").length;
  const hayFiltros = filtros.texto || filtros.tema || filtros.nivel || filtros.estado;
  const siguiente = siguienteEjercicio(deColeccion);

  const titulo = encontrada ? encontrada.coleccion.nombre : "Todos los ejercicios";
  const subtitulo = encontrada ? encontrada.area.titulo : "Búsqueda en todas las colecciones";

  return (
    <section className={estilos.pagina}>
      <Link to="/practicar" className={estilos.volver}>
        <IconoFlechaIzq /> Practicar
      </Link>

      <header className={estilos.cabecera}>
        <div>
          <span className={estilos.area}>{subtitulo}</span>
          <h1>{titulo}</h1>
          {encontrada && <p className={estilos.descripcion}>{encontrada.coleccion.descripcion}</p>}
          <p className={estilos.subtitulo}>
            {deColeccion.length} ejercicios · {resueltos} resueltos
          </p>
        </div>
        <div className={estilos.acciones}>
          {siguiente && (
            <button type="button" className="boton boton-primario" onClick={() => navigate(`/practicar/${siguiente.id}`)}>
              {siguiente.estado === "en-progreso" ? "Continuar" : "Siguiente"}: {siguiente.titulo}
            </button>
          )}
          <button
            type="button"
            className="boton"
            onClick={() => {
              const azar = ejercicioAlAzar(deColeccion);
              if (azar) navigate(`/practicar/${azar.id}`);
            }}
          >
            Uno al azar
          </button>
        </div>
      </header>

      <div className={estilos.barraProgreso}>
        <div style={{ width: `${(resueltos / Math.max(deColeccion.length, 1)) * 100}%` }} />
      </div>

      <div className={estilos.filtros}>
        <input
          type="search"
          className={estilos.buscador}
          placeholder="Buscar por título o tag…"
          aria-label="Buscar ejercicios"
          value={filtros.texto}
          onChange={(e) => cambiarFiltro("texto", e.target.value)}
        />
        <select aria-label="Tema" value={filtros.tema} onChange={(e) => cambiarFiltro("tema", e.target.value)}>
          <option value="">Todos los temas</option>
          {temas.map((t) => (
            <option key={t} value={t}>
              {nombreTema(t)}
            </option>
          ))}
        </select>
        <select aria-label="Nivel" value={filtros.nivel} onChange={(e) => cambiarFiltro("nivel", e.target.value)}>
          <option value="">Todos los niveles</option>
          <option value="1">Básico</option>
          <option value="2">Intermedio</option>
          <option value="3">Difícil</option>
        </select>
        <select aria-label="Estado" value={filtros.estado} onChange={(e) => cambiarFiltro("estado", e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(([valor, texto]) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </select>
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
                {lista.filter((e) => e.estado === "resuelto").length}/{lista.length}
              </span>
            </h2>
            <ul className={estilos.lista}>
              {lista.map((e) => (
                <li key={e.id}>
                  <Link to={`/practicar/${e.id}`} className={estilos.fila}>
                    <span className={estilos.punto} data-estado={e.estado} aria-hidden />
                    <span className={estilos.titulo}>
                      {e.titulo}
                      {!encontrada && <span className={estilos.coleccion}>{nombreColeccion(e.coleccion)}</span>}
                    </span>
                    <Insignia nivel={e.nivel} />
                    <span className={estilos.resultado}>
                      {e.ultimoResultado ? `${e.ultimoResultado.pasan}/${e.ultimoResultado.total}` : ""}
                    </span>
                    <Insignia estado={e.estado} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
