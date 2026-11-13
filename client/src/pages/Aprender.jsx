import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { api } from "../lib/api.js";
import { Pestanas } from "../components/Pestanas.jsx";
import estilos from "./Aprender.module.css";

const AREAS = [
  { id: "javascript", texto: "JavaScript", intro: "La base de todo: sin esto, React no se entiende." },
  { id: "react", texto: "React", intro: "Cuando ya domines JavaScript: componentes, estado, efectos y hooks." },
];

export function Aprender() {
  const [temas, setTemas] = useState(null);
  const [error, setError] = useState(null);
  const [params, setParams] = useSearchParams();
  const area = params.get("area") ?? "javascript";

  useEffect(() => {
    api.temas().then(setTemas, (e) => setError(e.message));
  }, []);

  if (error) return <p className={estilos.mensaje}>No se pudo cargar: {error}. Cierra la app y vuelve a abrir iniciar.bat.</p>;
  if (!temas) return <p className={estilos.mensaje}>Cargando…</p>;

  const delArea = temas.filter((t) => t.area === area);
  const info = AREAS.find((a) => a.id === area) ?? AREAS[0];

  return (
    <section className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <h1>Aprender</h1>
          <p>Teoría de una pantalla, ejercicios guiados y un quiz para comprobar que lo entendiste.</p>
        </div>
        <Link to="/referencia" className="boton">
          Abrir la Referencia
        </Link>
      </header>

      <Pestanas
        pestanas={AREAS.map((a) => ({
          id: a.id,
          texto: a.texto,
          extra: String(temas.filter((t) => t.area === a.id).length),
        }))}
        activa={area}
        alCambiar={(id) => setParams({ area: id }, { replace: true })}
      />
      <p className={estilos.intro}>{info.intro}</p>

      {delArea.length === 0 ? (
        <p className={estilos.mensaje}>Todavía no hay temas en esta área.</p>
      ) : (
        <ol className={estilos.temas}>
          {delArea.map((t) => {
            const completo = t.resueltos === t.totalEjercicios && t.quiz && t.quiz.mejor === t.quiz.total;
            return (
              <li key={t.id}>
                <Link to={`/aprender/${t.id}`} className={estilos.tema} data-completo={!!completo}>
                  <span className={estilos.numero}>{String(t.orden).padStart(2, "0")}</span>
                  <div className={estilos.texto}>
                    <strong>{t.titulo}</strong>
                    <span>{t.descripcion}</span>
                  </div>
                  <div className={estilos.avance}>
                    <span>
                      {t.resueltos}/{t.totalEjercicios} ejercicios
                    </span>
                    <span>{t.quiz ? `quiz ${t.quiz.mejor}/${t.quiz.total}` : "quiz pendiente"}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
