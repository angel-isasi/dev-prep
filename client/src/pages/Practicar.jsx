import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { api } from "../lib/api.js";
import { useEvento } from "../hooks/useEvento.js";
import { filtrarEjercicios } from "../lib/filtrarEjercicios.js";
import { nombreColeccion, nombreTema } from "../lib/etiquetas.js";
import { Insignia } from "../components/Insignia.jsx";
import estilos from "./Practicar.module.css";

const ESTADOS = [
  ["pendiente", "Pendiente"],
  ["en-progreso", "En progreso"],
  ["resuelto", "Resuelto"],
  ["repasar", "Para repasar"],
];

export function Practicar() {
  const [ejercicios, setEjercicios] = useState(null);
  const [error, setError] = useState(null);
  // Los filtros viven en la URL (?tema=objetos): al volver de un ejercicio siguen puestos.
  const [params, setParams] = useSearchParams();
  const filtros = {
    texto: params.get("texto") ?? "",
    tema: params.get("tema") ?? "",
    nivel: params.get("nivel") ?? "",
    estado: params.get("estado") ?? "",
  };

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

  const temas = useMemo(() => [...new Set((ejercicios ?? []).map((e) => e.tema))].sort(), [ejercicios]);

  function cambiarFiltro(nombre, valor) {
    const nuevos = new URLSearchParams(params);
    if (valor) nuevos.set(nombre, valor);
    else nuevos.delete(nombre);
    setParams(nuevos, { replace: true });
  }

  if (error) return <p className={estilos.mensaje}>No se pudo cargar la lista: {error}</p>;
  if (!ejercicios) return <p className={estilos.mensaje}>Cargando…</p>;

  const visibles = filtrarEjercicios(ejercicios, filtros);
  const resueltos = ejercicios.filter((e) => e.estado === "resuelto").length;
  const hayFiltros = Object.values(filtros).some(Boolean);

  return (
    <section className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <h1>Practicar</h1>
          <p className={estilos.subtitulo}>
            {ejercicios.length} ejercicios · {resueltos} resueltos
          </p>
        </div>
        <div
          className={estilos.barraProgreso}
          role="progressbar"
          aria-label="Ejercicios resueltos"
          aria-valuenow={resueltos}
          aria-valuemin={0}
          aria-valuemax={ejercicios.length}
        >
          <div style={{ width: `${(resueltos / Math.max(ejercicios.length, 1)) * 100}%` }} />
        </div>
      </header>

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
          <button type="button" className={estilos.limpiar} onClick={() => setParams({}, { replace: true })}>
            Limpiar
          </button>
        )}
      </div>

      {visibles.length === 0 ? (
        <p className={estilos.vacio}>Ningún ejercicio coincide con los filtros.</p>
      ) : (
        <ul className={estilos.lista}>
          {visibles.map((e) => (
            <li key={e.id}>
              <Link to={`/practicar/${e.id}`} className={estilos.fila}>
                <span className={estilos.punto} data-estado={e.estado} aria-hidden />
                <span className={estilos.titulo}>
                  {e.titulo}
                  <span className={estilos.coleccion}>
                    {nombreColeccion(e.coleccion)} · {nombreTema(e.tema)}
                  </span>
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
      )}
    </section>
  );
}
