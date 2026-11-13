import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { api } from "../lib/api.js";
import { Markdown } from "../components/Markdown.jsx";
import estilos from "./Referencia.module.css";

const normalizar = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/** Puntaje de búsqueda: el nombre pesa más que la descripción. 0 = no coincide. */
function puntaje(entrada, palabras) {
  const nombre = normalizar(entrada.nombre);
  const resto = normalizar(`${entrada.descripcion} ${(entrada.tags ?? []).join(" ")} ${entrada.firma}`);
  let total = 0;
  for (const p of palabras) {
    if (nombre.includes(p)) total += 3;
    else if (resto.includes(p)) total += 1;
    else return 0; // todas las palabras deben aparecer
  }
  return total;
}

export function Referencia() {
  const [datos, setDatos] = useState(null);
  const [params, setParams] = useSearchParams();
  const texto = params.get("q") ?? "";
  const categoria = params.get("cat") ?? "";

  useEffect(() => {
    api.referencia().then(setDatos);
  }, []);

  const resultados = useMemo(() => {
    if (!datos) return [];
    const palabras = normalizar(texto).split(/\s+/).filter(Boolean);
    let lista = datos.entradas.filter((e) => !categoria || e.categoria === categoria);
    if (palabras.length) {
      lista = lista
        .map((e) => ({ e, p: puntaje(e, palabras) }))
        .filter((x) => x.p > 0)
        .sort((a, b) => b.p - a.p)
        .map((x) => x.e);
    }
    return lista;
  }, [datos, texto, categoria]);

  const cambiar = (clave, valor) => {
    const nuevos = new URLSearchParams(params);
    if (valor) nuevos.set(clave, valor);
    else nuevos.delete(clave);
    setParams(nuevos, { replace: true });
  };

  if (!datos) return <p className={estilos.mensaje}>Cargando…</p>;

  return (
    <section className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <h1>Referencia</h1>
        <p>Tu MDN sin internet: qué hace cada método, qué devuelve, un ejemplo y el error típico.</p>
      </header>

      <div className={estilos.buscador}>
        <input
          type="search"
          autoFocus
          aria-label="Buscar en la referencia"
          placeholder="Busca: slice, quitar duplicados, useEffect, promesas en paralelo…"
          value={texto}
          onChange={(e) => cambiar("q", e.target.value)}
        />
      </div>

      <div className={estilos.categorias}>
        <button type="button" data-activa={!categoria} onClick={() => cambiar("cat", "")}>
          Todas
        </button>
        {datos.categorias.map((c) => (
          <button
            key={c.nombre}
            type="button"
            data-activa={categoria === c.nombre}
            onClick={() => cambiar("cat", categoria === c.nombre ? "" : c.nombre)}
          >
            {c.nombre} <span>{c.total}</span>
          </button>
        ))}
      </div>

      {resultados.length === 0 ? (
        <p className={estilos.mensaje}>Nada coincide con "{texto}". Prueba con otra palabra.</p>
      ) : (
        <div className={estilos.entradas}>
          {resultados.map((e) => (
            <article key={e.id} className={estilos.entrada}>
              <header>
                <h2>{e.nombre}</h2>
                <span className={estilos.categoria}>{e.categoria}</span>
              </header>
              <code className={estilos.firma}>{e.firma}</code>
              <div className={estilos.descripcion}>
                <Markdown>{e.descripcion}</Markdown>
              </div>
              <Markdown>{"```" + (e.categoria === "React" ? "jsx" : "js") + "\n" + e.ejemplo + "\n```"}</Markdown>
              <dl className={estilos.detalles}>
                <dt>Devuelve</dt>
                <dd>
                  <Markdown>{e.devuelve}</Markdown>
                </dd>
                <dt>Error típico</dt>
                <dd className={estilos.error}>
                  <Markdown>{e.errorTipico}</Markdown>
                </dd>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
