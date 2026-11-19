import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ES_MOVIL } from "../lib/modo.js";
import { usePestanaUrl } from "../hooks/usePestanaUrl.js";
import { api } from "../lib/api.js";
import { ContenidoPestanas, Pestanas } from "../components/Pestanas.jsx";
import { EnunciadoOrganizado } from "../components/EnunciadoOrganizado.jsx";
import { Tarjeta } from "../components/Tarjeta.jsx";
import { Simulacro } from "../components/Simulacro.jsx";
import { EntrevistaVoz } from "../components/EntrevistaVoz.jsx";
import { PitchStar } from "../components/PitchStar.jsx";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { AnilloProgreso } from "../components/AnilloProgreso.jsx";
import { AnimatedGroup } from "../components/ui/animated-group.jsx";
import { MagicCard } from "../components/ui/magic-card.jsx";
import { ShineBorder } from "../components/ui/shine-border.jsx";
import { SlidingNumber } from "../components/ui/sliding-number.jsx";
import estilos from "./Entrevistas.module.css";
import { IconoChispa } from "../components/Iconos.jsx";

export function Entrevistas() {
  const [resumen, setResumen] = useState(api.entrevistas.guardado);
  const [pestana, setPestana] = usePestanaUrl(["etapas", "tarjetas", "simulacro", "voz", "personal", "guia"]);
  const [params] = useSearchParams();
  const preguntaPedida = params.get("pregunta");
  const [sesion, setSesion] = useState(null); // { titulo, tarjetas, indice, notas }

  const cargar = () => api.entrevistas().then(setResumen);
  useEffect(() => {
    cargar();
  }, []);

  // ?pregunta=ent-031 (desde el buscador): abre esa pregunta sola, lista para responder
  useEffect(() => {
    if (!preguntaPedida) return;
    api.tarjetas({}).then((todas) => {
      const una = todas.find((p) => p.id === preguntaPedida);
      if (una) setSesion({ titulo: una.categoria, tarjetas: [una], indice: 0, notas: [] });
    });
  }, [preguntaPedida]);

  async function empezar(titulo, filtro) {
    const tarjetas = await api.tarjetas(filtro);
    setSesion({ titulo, tarjetas: tarjetas.slice(0, filtro.cantidad ?? 15), indice: 0, notas: [] });
  }

  async function calificar(nota) {
    const actual = sesion.tarjetas[sesion.indice];
    await api.calificar(actual.id, nota);
    setSesion((s) => ({ ...s, indice: s.indice + 1, notas: [...s.notas, nota] }));
  }

  function terminar() {
    setSesion(null);
    cargar();
  }

  if (!resumen) return <Esqueleto variante="tarjetas" />;

  const pestanas = [
    { id: "etapas", texto: "Por etapa" },
    { id: "tarjetas", texto: "Tarjetas", extra: resumen.pendientesHoy ? `${resumen.pendientesHoy} hoy` : undefined },
    { id: "simulacro", texto: "Simulacro" },
    { id: "voz", texto: "Por voz" },
    { id: "personal", texto: "Pitch y STAR" },
    { id: "guia", texto: "Cómo pensar en voz alta" },
  ];

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina
        etiqueta={`${resumen.categorias.reduce((a, c) => a + c.dominadas, 0)} de ${resumen.categorias.reduce((a, c) => a + c.total, 0)} preguntas dominadas`}
        titulo="Entrevistas"
      >
        Preguntas reales de entrevistas junior, con la respuesta que conviene dar. Respóndelas en voz alta.
      </CabeceraPagina>

      <Pestanas pestanas={pestanas} activa={pestana} alCambiar={(p) => (setPestana(p), setSesion(null))} />

      <ContenidoPestanas activa={pestana} orden={pestanas.map((p) => p.id)} className={estilos.contenido}>
        {pestana === "etapas" &&
          (sesion ? (
            <SesionTarjetas sesion={sesion} alCalificar={calificar} alTerminar={terminar} />
          ) : (
            <PorEtapa resumen={resumen} alEmpezar={empezar} alIr={setPestana} />
          ))}
        {pestana === "tarjetas" &&
          (sesion ? (
            <SesionTarjetas sesion={sesion} alCalificar={calificar} alTerminar={terminar} />
          ) : (
            <ElegirMazo resumen={resumen} alEmpezar={empezar} />
          ))}
        {pestana === "simulacro" && (
          <Simulacro
            proceso={resumen.proceso}
            alIr={setPestana}
            alRepasar={(categoria) => {
              setPestana("tarjetas");
              empezar(categoria, { categoria });
            }}
          />
        )}
        {pestana === "voz" && <EntrevistaVoz proceso={resumen.proceso} />}
        {pestana === "personal" && <PitchStar guias={resumen.guias} />}
        {pestana === "guia" && (
          <EnunciadoOrganizado markdown={resumen.guias.vozAlta} primeraDestacada />
        )}
      </ContenidoPestanas>
    </section>
  );
}

/**
 * Todo lo que sirve para practicar entrevistas, ordenado por las etapas del proceso. Antes estaba
 * repartido en seis secciones (Entrevistas, Trabajo, los roleplays y el mapache de Inglés, el
 * Glosario y las chuletas); aquí cada etapa junta sus tarjetas y los enlaces a lo demás.
 * Lo marcado con `web` solo existe en la versión publicada.
 */
const PRACTICA_POR_ETAPA = {
  rrhh: [
    { pestana: "personal", titulo: "Tu pitch y tus historias STAR", texto: "Escríbelos una vez, con tus proyectos reales" },
    { a: "/ingles/historias", titulo: "Roleplays en inglés", texto: "Entrevistas y llamadas de trabajo, por turnos", web: true },
    { a: "/ingles/mapache?pestana=jugar", titulo: "Entrevista en inglés con el mapache", texto: "Preguntas de trabajo en B2 y C1", web: true },
    { a: "/trabajo?pestana=postulaciones", titulo: "Preguntas reales de tus postulaciones", texto: "Las que ya te hicieron, con tu respuesta", web: true },
  ],
  tecnica: [
    { pestana: "voz", titulo: "Entrevista por voz", texto: "El entrevistador pregunta y repregunta en voz alta", web: true },
    { a: "/practicar/lista?coleccion=javascript%2Fretos", titulo: "Retos de entrevista con tests", texto: "Debounce, memoize, deep clone: lo que piden en vivo" },
    { a: "/leccion?modo=predice", titulo: "Lee y predice", texto: "¿Qué imprime este código? Trampas clásicas", web: true },
    { a: "/glosario", titulo: "Glosario", texto: "Cada término con una frase lista para decir", web: true },
    { pestana: "guia", titulo: "Cómo pensar en voz alta", texto: "Entender, ejemplos, plan, código y probar" },
  ],
  proyecto: [
    { pestana: "personal", titulo: "Tu pitch de un minuto", texto: "Lo primero que te van a pedir" },
    { a: "/trabajo?pestana=portafolio", titulo: "Tu portafolio", texto: "Fichas listas para publicar de lo que construiste", web: true },
  ],
  cierre: [
    { pestana: "simulacro", titulo: "Tus preguntas al entrevistador", texto: "Se practican en el cierre del simulacro" },
    { a: "/trabajo?pestana=postulaciones", titulo: "Seguimiento de tus postulaciones", texto: "A quién escribirle y cuándo", web: true },
  ],
};

function PorEtapa({ resumen, alEmpezar, alIr }) {
  const etapas = resumen.proceso?.etapas ?? [];
  const hoy = resumen.pendientesHoy;
  return (
    <>
      {hoy > 0 && (
        <button type="button" className={`${estilos.mazo} ${estilos.destacado} ${estilos.repasoEtapas}`} onClick={() => alEmpezar("Repaso de hoy", { modo: "repaso" })}>
          <span className={estilos.numeroGrande}>
            <SlidingNumber number={hoy} />
          </span>
          <span className={estilos.mazoTexto}>
            <strong>Repaso de hoy</strong>
            <span>{hoy === 1 ? "tarjeta te toca hoy" : "tarjetas te tocan hoy"}, de todas las etapas</span>
          </span>
          <span className={estilos.ir}>Empezar →</span>
        </button>
      )}

      <div className={estilos.etapas}>
        {etapas.map((etapa, i) => {
          const categorias = resumen.categorias.filter((c) => c.etapa === etapa.id);
          const total = categorias.reduce((s, c) => s + c.total, 0);
          const dominadas = categorias.reduce((s, c) => s + c.dominadas, 0);
          const practicas = (PRACTICA_POR_ETAPA[etapa.id] ?? []).filter((p) => ES_MOVIL || !p.web);
          return (
            <section key={etapa.id} className={`tarjeta ${estilos.etapa}`}>
              <header>
                <span className={estilos.etapaNumero}>{i + 1}</span>
                <div>
                  <h2>{etapa.titulo}</h2>
                  <p>
                    {etapa.minutos} min · {etapa.descripcion}
                  </p>
                </div>
              </header>

              {categorias.length > 0 && (
                <div className={estilos.etapaMazos}>
                  <span className="etiqueta">
                    Tarjetas · {dominadas} de {total} dominadas
                  </span>
                  {categorias.map((c) => (
                    <button key={c.nombre} type="button" className={estilos.etapaMazo} onClick={() => alEmpezar(c.nombre, { categoria: c.nombre })}>
                      <strong>{c.nombre}</strong>
                      <span>
                        {c.dominadas}/{c.total}
                        {c.pendientes > 0 && ` · ${c.pendientes} para hoy`}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <ul className={estilos.etapaEnlaces}>
                {practicas.map((p) => (
                  <li key={p.titulo}>
                    {p.pestana ? (
                      <button type="button" onClick={() => alIr(p.pestana)}>
                        <strong>{p.titulo} →</strong>
                        <span>{p.texto}</span>
                      </button>
                    ) : (
                      <Link to={p.a}>
                        <strong>{p.titulo} →</strong>
                        <span>{p.texto}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              <button type="button" className={`boton ${estilos.simular}`} onClick={() => alIr("simulacro")}>
                Simular esta etapa
              </button>
            </section>
          );
        })}
      </div>
    </>
  );
}

function ElegirMazo({ resumen, alEmpezar }) {
  const hoy = resumen.pendientesHoy;
  return (
    <>
      <div className={estilos.principales}>
        {/* Repaso de hoy: el número grande es lo primero que ves */}
        <button
          type="button"
          className={`${estilos.mazo} ${estilos.destacado}`}
          disabled={hoy === 0}
          onClick={() => alEmpezar("Repaso de hoy", { modo: "repaso" })}
        >
          {hoy > 0 && <ShineBorder shineColor={["var(--acento)", "var(--exito)"]} duration={12} />}
          <span className={estilos.numeroGrande}>
            <SlidingNumber number={hoy} />
          </span>
          <span className={estilos.mazoTexto}>
            <strong>Repaso de hoy</strong>
            <span>
              {hoy ? (hoy === 1 ? "tarjeta te toca hoy" : "tarjetas te tocan hoy") : "Nada pendiente. Practica una categoría nueva."}
            </span>
          </span>
          {hoy > 0 && <span className={estilos.ir}>Empezar →</span>}
        </button>
        <button
          type="button"
          className={estilos.mazo}
          onClick={() =>
            alEmpezar("Repaso rápido de HTML y CSS", {
              categorias: resumen.categorias.filter((c) => /html|css/i.test(c.nombre)).map((c) => c.nombre),
              cantidad: 10,
            })
          }
        >
          <span className={estilos.mazoIcono} aria-hidden>
            {"</>"}
          </span>
          <span className={estilos.mazoTexto}>
            <strong>Repaso rápido de HTML y CSS</strong>
            <span>10 tarjetas para no olvidarlo, sin volver a estudiarlo todo</span>
          </span>
        </button>
        <button type="button" className={estilos.mazo} onClick={() => alEmpezar("Preguntas nuevas", { modo: "nuevas" })}>
          <span className={estilos.mazoIcono} aria-hidden>
            <IconoChispa />
          </span>
          <span className={estilos.mazoTexto}>
            <strong>Preguntas nuevas</strong>
            <span>Las que nunca respondiste, de todas las categorías</span>
          </span>
        </button>
      </div>

      <h2 className={estilos.subtitulo}>Por categoría</h2>
      <AnimatedGroup preset="slide" stagger={0.04} className={estilos.categorias} itemClassName={estilos.celda}>
        {resumen.categorias.map((c) => (
          <MagicCard key={c.nombre} className={estilos.tarjetaCategoria}>
            <button type="button" className={estilos.categoria} onClick={() => alEmpezar(c.nombre, { categoria: c.nombre })}>
              <AnilloProgreso
                valor={c.total ? c.dominadas / c.total : 0}
                tamano={54}
                grosor={5}
                completo={c.total > 0 && c.dominadas === c.total}
              >
                <span className={estilos.anilloTexto}>{c.dominadas}</span>
              </AnilloProgreso>
              <span className={estilos.mazoTexto}>
                <strong>{c.nombre}</strong>
                <span>
                  {c.vistas}/{c.total} vistas · {c.dominadas} dominadas
                </span>
                {c.pendientes > 0 && <span className={estilos.paraHoy}>{c.pendientes} para hoy</span>}
              </span>
            </button>
          </MagicCard>
        ))}
      </AnimatedGroup>
    </>
  );
}

function SesionTarjetas({ sesion, alCalificar, alTerminar }) {
  const { tarjetas, indice, notas, titulo } = sesion;

  if (tarjetas.length === 0) {
    return (
      <div className={estilos.final}>
        <p>No hay tarjetas en este mazo.</p>
        <button type="button" className="boton" onClick={alTerminar}>
          Volver
        </button>
      </div>
    );
  }

  if (indice >= tarjetas.length) {
    const cuenta = (n) => notas.filter((x) => x === n).length;
    return (
      <div className={estilos.final}>
        <span className={estilos.finalEtiqueta}>Terminaste</span>
        <h2>{titulo}</h2>
        <dl className={estilos.cuentas}>
          <div data-tipo="exito">
            <dt>Lo sabías</dt>
            <dd>{cuenta("sabia")}</dd>
          </div>
          <div data-tipo="aviso">
            <dt>Dudaste</dt>
            <dd>{cuenta("dude")}</dd>
          </div>
          <div data-tipo="error">
            <dt>No lo sabías</dt>
            <dd>{cuenta("no")}</dd>
          </div>
        </dl>
        <p className={estilos.nota}>Las que no sabías vuelven mañana; las que sabías, en unos días.</p>
        <button type="button" className="boton boton-primario" onClick={alTerminar}>
          Volver a los mazos
        </button>
      </div>
    );
  }

  return (
    <div className={estilos.sesion}>
      <div className={estilos.sesionCabecera}>
        <span>{titulo}</span>
        <button type="button" className="boton boton-fantasma" onClick={alTerminar}>
          Salir
        </button>
      </div>
      <Tarjeta
        key={tarjetas[indice].id}
        pregunta={tarjetas[indice]}
        alCalificar={alCalificar}
        posicion={`${indice + 1}/${tarjetas.length}`}
      />
    </div>
  );
}
