import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../lib/api.js";
import { AREAS, ejercicioAlAzar, siguienteEjercicio } from "../lib/areas.js";
import { Esqueleto } from "../components/Esqueleto.jsx";
import estilos from "./Practicar.module.css";

/** Entrada de Practicar: áreas (JavaScript, Algoritmos, React) con sus colecciones. */
export function Practicar() {
  const [ejercicios, setEjercicios] = useState(api.ejercicios.guardado);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.ejercicios().then(setEjercicios, (e) => setError(e.message));
  }, []);

  if (error) return <p className={estilos.mensaje}>No se pudo cargar: {error}. Cierra la app y vuelve a abrir iniciar.bat.</p>;
  if (!ejercicios) return <Esqueleto variante="tarjetas" />;

  const deColeccion = (id) => ejercicios.filter((e) => e.coleccion === id);
  const deArea = (area) => area.colecciones.flatMap((c) => deColeccion(c.id));
  const resueltos = (lista) => lista.filter((e) => e.estado === "resuelto").length;
  const repasos = ejercicios.filter((e) => e.estado === "repasar");

  const ir = (ej) => ej && navigate(`/practicar/${ej.id}`);

  function buscar(evento) {
    evento.preventDefault();
    if (busqueda.trim()) navigate(`/practicar/lista?texto=${encodeURIComponent(busqueda.trim())}`);
  }

  return (
    <section className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <h1>Practicar</h1>
          <p className={estilos.subtitulo}>
            {ejercicios.length} ejercicios · {resueltos(ejercicios)} resueltos. Elige un área y una colección.
          </p>
        </div>
        <form onSubmit={buscar} className={estilos.buscar}>
          <input
            type="search"
            aria-label="Buscar en todos los ejercicios"
            placeholder="Buscar en todo: closure, useEffect, two sum…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </form>
      </header>

      {repasos.length > 0 && (
        <div className={estilos.repasos}>
          <div>
            <strong>
              {repasos.length} {repasos.length === 1 ? "ejercicio para repasar" : "ejercicios para repasar"}
            </strong>
            <span>Resolverlos de nuevo es lo que hace que no se te olviden.</span>
          </div>
          <div className={estilos.repasosAcciones}>
            <button type="button" className="boton boton-primario" onClick={() => ir(repasos[0])}>
              Repasar: {repasos[0].titulo}
            </button>
            {repasos.length > 1 && (
              <Link to="/practicar/lista?estado=repasar" className="boton">
                Ver todos
              </Link>
            )}
          </div>
        </div>
      )}

      {AREAS.map((area) => {
        const lista = deArea(area);
        if (lista.length === 0) return null;
        return (
          <section key={area.id} className={estilos.area} data-area={area.id}>
            <header className={estilos.areaCabecera}>
              <div>
                <h2>{area.titulo}</h2>
                <p>{area.descripcion}</p>
              </div>
              <div className={estilos.areaDatos}>
                <span>
                  {resueltos(lista)}/{lista.length}
                </span>
                <button type="button" className="boton boton-fantasma" onClick={() => ir(ejercicioAlAzar(lista))}>
                  Uno al azar
                </button>
              </div>
            </header>

            <div className={estilos.colecciones}>
              {area.colecciones.map((c) => {
                const ejs = deColeccion(c.id);
                if (ejs.length === 0) return null;
                const hechos = resueltos(ejs);
                const siguiente = siguienteEjercicio(ejs);
                const niveles = [1, 2, 3].map((n) => ejs.filter((e) => e.nivel === n).length);
                return (
                  <article key={c.id} className={estilos.coleccion}>
                    <Link to={`/practicar/lista?coleccion=${encodeURIComponent(c.id)}`} className={estilos.enlace}>
                      <h3>{c.nombre}</h3>
                      <p>{c.descripcion}</p>
                      <div className={estilos.niveles}>
                        <span data-nivel="1">{niveles[0]} básicos</span>
                        <span data-nivel="2">{niveles[1]} intermedios</span>
                        <span data-nivel="3">{niveles[2]} difíciles</span>
                      </div>
                      <div className={estilos.avance}>
                        <div className={estilos.barra}>
                          <div style={{ width: `${(hechos / ejs.length) * 100}%` }} />
                        </div>
                        <span>
                          {hechos}/{ejs.length}
                        </span>
                      </div>
                    </Link>
                    <button
                      type="button"
                      className={estilos.siguiente}
                      disabled={!siguiente}
                      onClick={() => ir(siguiente)}
                    >
                      {siguiente ? (
                        <>
                          <span>{siguiente.estado === "en-progreso" ? "Continuar" : "Siguiente"}</span>
                          {siguiente.titulo} →
                        </>
                      ) : (
                        "¡Colección completa!"
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className={estilos.mezcla}>
        <div>
          <strong>Práctica mezclada</strong>
          <span>
            En la entrevista no sabes qué te van a pedir. Te toca un ejercicio sin resolver al azar, de cualquier área.
          </span>
        </div>
        <button type="button" className="boton" onClick={() => ir(ejercicioAlAzar(ejercicios))}>
          Sorpréndeme
        </button>
      </div>
    </section>
  );
}
