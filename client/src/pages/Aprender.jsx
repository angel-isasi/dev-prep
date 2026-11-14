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
  { id: "react", texto: "React", intro: "Cuando ya domines JavaScript: componentes, estado, efectos y hooks." },
];

export function Aprender() {
  const [temas, setTemas] = useState(api.temas.guardado);
  const [error, setError] = useState(null);
  const [params, setParams] = useSearchParams();
  const area = params.get("area") ?? "javascript";

  useEffect(() => {
    api.temas().then(setTemas, (e) => setError(e.message));
  }, []);

  if (error) return <p className={estilos.mensaje}>No se pudo cargar: {error}. Cierra la app y vuelve a abrir iniciar.bat.</p>;
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
        Teoría de una pantalla, ejercicios guiados y un quiz para comprobar que lo entendiste.
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
            return (
              <MagicCard
                key={t.id}
                className={estilos.tarjeta}
                gradientFrom={completo ? "var(--exito)" : "var(--color-area)"}
                gradientTo="var(--acento)"
                gradientColor="var(--color-area-suave)"
              >
                <Link to={`/aprender/${t.id}`} className={estilos.tema} data-completo={completo}>
                  <div className={estilos.temaArriba}>
                    <span className={estilos.numero}>{String(t.orden).padStart(2, "0")}</span>
                    {completo && <span className={estilos.completo}>✓ Completo</span>}
                  </div>
                  <strong className={estilos.titulo}>{t.titulo}</strong>
                  <span className={estilos.descripcion}>{t.descripcion}</span>
                  <div className={estilos.avance}>
                    {/* Un punto por ejercicio guiado: lleno si lo resolviste */}
                    <span className={estilos.puntos} aria-label={`${t.resueltos} de ${t.totalEjercicios} ejercicios`}>
                      {Array.from({ length: t.totalEjercicios }, (_, i) => (
                        <i key={i} data-lleno={i < t.resueltos} />
                      ))}
                      <small>
                        {t.resueltos}/{t.totalEjercicios}
                      </small>
                    </span>
                    <span className={estilos.quiz} data-hecho={!!t.quiz}>
                      {t.quiz ? `Quiz ${t.quiz.mejor}/${t.quiz.total}` : "Quiz pendiente"}
                    </span>
                  </div>
                </Link>
              </MagicCard>
            );
          })}
        </AnimatedGroup>
      )}
    </section>
  );
}

function esCompleto(t) {
  return t.resueltos === t.totalEjercicios && !!t.quiz && t.quiz.mejor === t.quiz.total;
}
