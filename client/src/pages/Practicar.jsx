import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { api } from "../lib/api.js";
import { ES_MOVIL } from "../lib/modo.js";
import { AREAS, ejercicioAlAzar, siguienteEjercicio } from "../lib/areas.js";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { Buscador } from "../components/Buscador.jsx";
import { BotonAzar } from "../components/BotonAzar.jsx";
import { AnimatedGroup } from "../components/ui/animated-group.jsx";
import { MagicCard } from "../components/ui/magic-card.jsx";
import { ShineBorder } from "../components/ui/shine-border.jsx";
import { SlidingNumber } from "../components/ui/sliding-number.jsx";
import { RetoSemana } from "../components/Avance.jsx";
import estilos from "./Practicar.module.css";
import selector from "./Aprender.module.css";

/** "Aprender mejor" (solo en la versión web): sesiones cortas que no son ejercicios de VS Code. */
const HERRAMIENTAS = [
  { a: "/leccion?modo=predice", titulo: "Lee y predice", texto: "¿Qué imprime este código?" },
  { a: "/practicar/lista?coleccion=javascript%2Fdepurar", titulo: "Depurar código roto", texto: "Encuentra el error por su síntoma" },
];

const NIVELES = [
  { n: 1, nombre: "básicos" },
  { n: 2, nombre: "intermedios" },
  { n: 3, nombre: "difíciles" },
];

/** Entrada de Practicar: áreas (JavaScript, Algoritmos, React) con sus colecciones. */
export function Practicar() {
  const [ejercicios, setEjercicios] = useState(api.ejercicios.guardado);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    api.ejercicios().then(setEjercicios, (e) => setError(e.message));
  }, []);

  if (error) return <p className={estilos.mensaje}>No se pudo cargar: {error}. Recarga la página.</p>;
  if (!ejercicios) return <Esqueleto variante="tarjetas" />;

  const deColeccion = (id) => ejercicios.filter((e) => e.coleccion === id);
  const deArea = (area) => area.colecciones.flatMap((c) => deColeccion(c.id));
  const resueltos = (lista) => lista.filter((e) => e.estado === "resuelto").length;
  // En el celular no se resuelve: se cuenta lo estudiado.
  const hechos = (lista) => (ES_MOVIL ? lista.filter((e) => e.estado !== "pendiente").length : resueltos(lista));
  const palabraHechos = ES_MOVIL ? "estudiados" : "resueltos";
  const repasos = ejercicios.filter((e) => e.estado === "repasar");

  const ir = (ej) => ej && navigate(`/practicar/${ej.id}`);

  // Se muestra un área a la vez (queda en la dirección: ?area=react), en vez de las cinco una debajo de otra
  const conEjercicios = AREAS.filter((a) => deArea(a).length > 0);
  const areaActiva = conEjercicios.find((a) => a.id === params.get("area")) ?? conEjercicios[0];

  function buscar(evento) {
    evento.preventDefault();
    if (busqueda.trim()) navigate(`/practicar/lista?texto=${encodeURIComponent(busqueda.trim())}`);
  }

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina
        etiqueta={`${ejercicios.length} ejercicios · ${hechos(ejercicios)} ${palabraHechos}`}
        titulo="Practicar"
        acciones={
          <Buscador
            valor={busqueda}
            alCambiar={setBusqueda}
            onSubmit={buscar}
            etiqueta="Buscar en todos los ejercicios"
            placeholder="Buscar: closure, useEffect, two sum…"
          />
        }
      >
        {/* En la web no hay subtítulo: la pantalla se explica sola */}
        {ES_MOVIL ? null : "Elige un área y una colección. Cada ejercicio se abre en VS Code y los tests corren solos al guardar."}
      </CabeceraPagina>

      {repasos.length > 0 && (
        <div className={estilos.repasos}>
          <ShineBorder shineColor={["var(--aviso)", "var(--error)"]} duration={12} />
          <span className={estilos.repasosNumero}>
            <SlidingNumber number={repasos.length} />
          </span>
          <div className={estilos.repasosTexto}>
            <strong>{repasos.length === 1 ? "ejercicio para repasar" : "ejercicios para repasar"}</strong>
          </div>
          <div className={estilos.repasosAcciones}>
            {repasos.length > 1 && (
              <Link to="/practicar/lista?estado=repasar" className="boton boton-fantasma">
                Ver todos
              </Link>
            )}
            <button type="button" className="boton boton-primario" onClick={() => ir(repasos[0])}>
              Repasar: {repasos[0].titulo} →
            </button>
          </div>
        </div>
      )}

      {/* Atajos en una sola fila en la laptop: Lee y predice, Depurar y el reto de la semana (versión web).
          En el celular se apilan. Si no hay reto, su celda vacía no ocupa lugar. */}
      <div className={estilos.atajos}>
        {ES_MOVIL &&
          HERRAMIENTAS.map((h) => (
            <Link key={h.a} to={h.a} className={`brillo ${estilos.atajo}`}>
              <strong>{h.titulo} →</strong>
              <small>{h.texto}</small>
            </Link>
          ))}
        <div className={estilos.retoSemana}>
          <RetoSemana />
        </div>
      </div>

      <div className={selector.areas} role="tablist" aria-label="Área">
        {conEjercicios.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            data-area={a.id}
            aria-selected={a.id === areaActiva?.id}
            className={selector.areaBoton}
            onClick={() => setParams({ area: a.id }, { replace: true })}
          >
            <span className={selector.areaPunto} aria-hidden />
            {a.titulo}
            <small>
              {hechos(deArea(a))}/{deArea(a).length}
            </small>
          </button>
        ))}
      </div>

      {(areaActiva ? [areaActiva] : []).map((area) => {
        const lista = deArea(area);
        const hechosArea = hechos(lista);
        return (
          <section key={area.id} className={estilos.area} data-area={area.id}>
            <header className={estilos.areaCabecera}>
              <div>
                <h2>
                  <span className={estilos.punto} aria-hidden />
                  {area.titulo}
                </h2>
                <p>{area.descripcion}</p>
              </div>
              <div className={estilos.areaDatos}>
                <span className={estilos.areaCuenta}>
                  <strong>{hechosArea}</strong>/{lista.length} {palabraHechos}
                </span>
                <BotonAzar onClick={() => ir(ejercicioAlAzar(lista))} />
              </div>
            </header>

            <AnimatedGroup preset="slide" stagger={0.06} className={estilos.colecciones} itemClassName={estilos.celda}>
              {area.colecciones
                .map((c) => ({ c, ejs: deColeccion(c.id) }))
                .filter(({ ejs }) => ejs.length > 0)
                .map(({ c, ejs }) => {
                  const hechosCol = hechos(ejs);
                  const siguiente = siguienteEjercicio(ejs);
                  const niveles = NIVELES.map(({ n, nombre }) => ({ n, nombre, total: ejs.filter((e) => e.nivel === n).length }));
                  const pct = (hechosCol / ejs.length) * 100;
                  return (
                    <MagicCard
                      key={c.id}
                      className={estilos.coleccion}
                      gradientFrom="var(--color-area)"
                      gradientTo="var(--acento)"
                      gradientColor="var(--color-area-suave)"
                    >
                      <div className={estilos.interior}>
                        <Link to={`/practicar/lista?coleccion=${encodeURIComponent(c.id)}`} className={estilos.enlace}>
                          <div className={estilos.coleccionCabeza}>
                            <h3>{c.nombre}</h3>
                            <span className={estilos.cuenta}>
                              <strong>{hechosCol}</strong>
                              <small>/{ejs.length}</small>
                            </span>
                          </div>
                          <p>{c.descripcion}</p>

                          {/* Barra de niveles: cada tramo mide lo que pesa ese nivel en la colección */}
                          <div className={estilos.niveles} aria-label="Ejercicios por nivel">
                            <div className={estilos.tramos}>
                              {niveles
                                .filter((x) => x.total > 0)
                                .map((x) => (
                                  <span key={x.n} data-nivel={x.n} style={{ flexGrow: x.total }} />
                                ))}
                            </div>
                            <div className={estilos.leyenda}>
                              {niveles.map((x) => (
                                <span key={x.n} data-nivel={x.n} data-vacio={x.total === 0}>
                                  {x.total} {x.nombre}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className={estilos.avance} aria-label={`${Math.round(pct)}% resuelto`}>
                            <div style={{ width: `${pct}%` }} />
                          </div>
                        </Link>
                        <button type="button" className={estilos.siguiente} disabled={!siguiente} onClick={() => ir(siguiente)}>
                          {siguiente ? (
                            <>
                              <span>{siguiente.estado === "en-progreso" ? "Continuar" : "Siguiente"}</span>
                              <strong>{siguiente.titulo}</strong>
                              <i aria-hidden>→</i>
                            </>
                          ) : (
                            "¡Colección completa!"
                          )}
                        </button>
                      </div>
                    </MagicCard>
                  );
                })}
            </AnimatedGroup>
          </section>
        );
      })}

      <div className={estilos.mezcla}>
        <div>
          <strong>Práctica mezclada</strong>
          <span>Un ejercicio sin resolver al azar, de cualquier área.</span>
        </div>
        <BotonAzar onClick={() => ir(ejercicioAlAzar(ejercicios))}>Sorpréndeme</BotonAzar>
      </div>
    </section>
  );
}
