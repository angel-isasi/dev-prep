import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { api } from "../lib/api.js";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { AnimatedGroup } from "../components/ui/animated-group.jsx";
import { MagicCard } from "../components/ui/magic-card.jsx";
import estilos from "./Aprender.module.css";

const AREAS = [
  { id: "javascript", texto: "JavaScript", intro: "La base de todo: sin esto, React no se entiende." },
  { id: "algoritmos", texto: "Algoritmos", intro: "Los patrones de la parte de lógica de las entrevistas: Big O, tabla hash, dos punteros, ventana, pilas y más." },
  { id: "react", texto: "React", intro: "Cuando ya domines JavaScript: componentes, estado, efectos y hooks." },
  { id: "typescript", texto: "TypeScript", intro: "JavaScript con tipos: el error aparece mientras escribes, no en producción." },
  { id: "node", texto: "Node.js y SQL", intro: "JavaScript fuera del navegador: servidores, APIs y bases de datos." },
];

export function Aprender() {
  const [temas, setTemas] = useState(api.temas.guardado);
  const [error, setError] = useState(null);
  // El mapa de dominio (solo en la versión web): pinta cada tema según cuánto lo dominas
  const [dominio, setDominio] = useState(() => new Map());
  const [params, setParams] = useSearchParams();
  const area = params.get("area") ?? "javascript";

  useEffect(() => {
    api.temas().then(setTemas, (e) => setError(e.message));
    api.mapa?.().then(
      (mapa) => setDominio(new Map(mapa.unidades.map((u) => [u.id, u]))),
      () => {},
    );
  }, []);

  if (error) return <p className={estilos.mensaje}>No se pudo cargar: {error}. Recarga la página.</p>;
  if (!temas) return <Esqueleto variante="lista" />;

  const delArea = temas.filter((t) => t.area === area);
  const info = AREAS.find((a) => a.id === area) ?? AREAS[0];

  const completos = delArea.filter(esCompleto).length;

  return (
    <section className={estilos.pagina} data-area={area}>
      <CabeceraPagina
        etiqueta={`${completos} de ${delArea.length} temas completos`}
        titulo="Aprender"
        acciones={
          <Link to="/referencia" className="boton">
            Abrir la Referencia
          </Link>
        }
      >
        Cada tema reúne su teoría, lecciones, ejercicios, quiz y lo que te preguntan en entrevistas. El color dice cuánto lo dominas.
      </CabeceraPagina>

      {/* Selector de área: JavaScript (amarillo) o React (celeste) */}
      <div className={estilos.areas} role="tablist" aria-label="Área">
        {AREAS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            data-area={a.id}
            aria-selected={a.id === area}
            className={estilos.areaBoton}
            onClick={() => setParams({ area: a.id }, { replace: true })}
          >
            <span className={estilos.areaPunto} aria-hidden />
            {a.texto}
            <small>{temas.filter((t) => t.area === a.id).length} temas</small>
          </button>
        ))}
        <p className={estilos.intro}>{info.intro}</p>
      </div>

      {delArea.length === 0 ? (
        <p className={estilos.mensaje}>Todavía no hay temas en esta área.</p>
      ) : (
        <AnimatedGroup key={area} preset="slide" stagger={0.04} as="ol" asChild="li" className={estilos.temas} itemClassName={estilos.celda}>
          {delArea.map((t) => {
            const completo = esCompleto(t);
            const d = dominio.get(t.id);
            return (
              <MagicCard
                key={t.id}
                className={estilos.tarjeta}
                gradientFrom={completo ? "var(--exito)" : "var(--color-area)"}
                gradientTo="var(--acento)"
                gradientColor="var(--color-area-suave)"
              >
                <Link to={`/aprender/${t.id}`} viewTransition onClick={marcarTitulo} className={estilos.tema} data-completo={completo}>
                  <div className={estilos.temaArriba}>
                    <span className={estilos.numero}>{String(t.orden).padStart(2, "0")}</span>
                    {/* Cuánto dominas el tema (el mismo cálculo del mapa de Progreso); el símbolo acompaña al color */}
                    {d ? (
                      <span className="chip" data-tono={TONO[d.estado]} title={ESTADO[d.estado]}>
                        {SIMBOLO[d.estado]} {Math.round(d.valor * 100)}%
                      </span>
                    ) : (
                      completo && <span className={estilos.completo}>✓ Completo</span>
                    )}
                  </div>
                  <strong className={estilos.titulo} data-titulo>
                    {t.titulo}
                  </strong>
                  <span className={estilos.descripcion}>{t.descripcion}</span>
                  <div className={estilos.avance}>
                    {/* Un punto por ejercicio guiado: lleno si lo resolviste */}
                    <span
                      className={estilos.puntos}
                      aria-label={`${t.resueltos} de ${t.totalEjercicios} ejercicios resueltos${t.conAyuda ? `, ${t.conAyuda} con ayuda` : ""}`}
                      title={t.conAyuda ? `${t.conAyuda} hechos viendo la solución: cuentan cuando los resuelvas en el repaso` : undefined}
                    >
                      {Array.from({ length: t.totalEjercicios }, (_, i) => (
                        <i key={i} data-lleno={i < t.resueltos} data-ayuda={i >= t.resueltos && i < t.resueltos + (t.conAyuda ?? 0)} />
                      ))}
                      <small>
                        {t.resueltos}/{t.totalEjercicios}
                      </small>
                    </span>
                    <span className={estilos.quiz} data-hecho={!!t.quiz}>
                      {t.quiz ? `Quiz ${t.quiz.mejor}/${t.quiz.total}` : "Quiz pendiente"}
                    </span>
                  </div>
                  {d && (
                    <span className={estilos.barraDominio} data-estado={d.estado} aria-hidden>
                      <i style={{ width: `${Math.round(d.valor * 100)}%` }} />
                    </span>
                  )}
                </Link>
              </MagicCard>
            );
          })}
        </AnimatedGroup>
      )}
    </section>
  );
}

/**
 * Al tocar una tarjeta, su título recibe el nombre que comparte con el título de la página del
 * tema: así el navegador lo mueve y lo agranda de un lugar al otro (View Transitions). Se pone
 * justo antes de navegar para que solo lo lleve la tarjeta tocada.
 */
function marcarTitulo(evento) {
  const titulo = evento.currentTarget.querySelector("[data-titulo]");
  if (titulo) titulo.style.viewTransitionName = "titulo-tema";
}

// El estado de cada tema se lee por su símbolo, no solo por el color
const SIMBOLO = { verde: "✓", amarillo: "◐", rojo: "○", "sin-empezar": "○" };
const ESTADO = { verde: "Lo dominas", amarillo: "A medias", rojo: "Flojo", "sin-empezar": "Sin empezar" };
const TONO = { verde: "exito", amarillo: "aviso", rojo: "error", "sin-empezar": undefined };

function esCompleto(t) {
  return t.resueltos === t.totalEjercicios && !!t.quiz && t.quiz.mejor === t.quiz.total;
}
