import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { Pestanas } from "../components/Pestanas.jsx";
import { Markdown } from "../components/Markdown.jsx";
import { Tarjeta } from "../components/Tarjeta.jsx";
import { Simulacro } from "../components/Simulacro.jsx";
import { PitchStar } from "../components/PitchStar.jsx";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { AnilloProgreso } from "../components/AnilloProgreso.jsx";
import { AnimatedGroup } from "../components/ui/animated-group.jsx";
import { MagicCard } from "../components/ui/magic-card.jsx";
import { ShineBorder } from "../components/ui/shine-border.jsx";
import { SlidingNumber } from "../components/ui/sliding-number.jsx";
import estilos from "./Entrevistas.module.css";

export function Entrevistas() {
  const [resumen, setResumen] = useState(api.entrevistas.guardado);
  const [pestana, setPestana] = useState("tarjetas");
  const [sesion, setSesion] = useState(null); // { titulo, tarjetas, indice, notas }

  const cargar = () => api.entrevistas().then(setResumen);
  useEffect(() => {
    cargar();
  }, []);

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
    { id: "tarjetas", texto: "Tarjetas", extra: resumen.pendientesHoy ? `${resumen.pendientesHoy} hoy` : undefined },
    { id: "simulacro", texto: "Simulacro" },
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

      <div className={estilos.contenido}>
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
        {pestana === "personal" && <PitchStar guias={resumen.guias} />}
        {pestana === "guia" && (
          <article className={estilos.guia}>
            <Markdown>{resumen.guias.vozAlta}</Markdown>
          </article>
        )}
      </div>
    </section>
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
            <span>{hoy ? (hoy === 1 ? "tarjeta te toca hoy" : "tarjetas te tocan hoy") : "Nada pendiente. Practica una categoría nueva."}</span>
          </span>
          {hoy > 0 && <span className={estilos.ir}>Empezar →</span>}
        </button>
        <button
          type="button"
          className={estilos.mazo}
          onClick={() => alEmpezar("Repaso rápido de HTML y CSS", { categorias: resumen.categorias.filter((c) => /html|css/i.test(c.nombre)).map((c) => c.nombre), cantidad: 10 })}
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
            ✦
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
              <AnilloProgreso valor={c.total ? c.dominadas / c.total : 0} tamano={54} grosor={5} completo={c.total > 0 && c.dominadas === c.total}>
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
