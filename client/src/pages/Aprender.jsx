import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";
import estilos from "./Aprender.module.css";

export function Aprender() {
  const [temas, setTemas] = useState(null);

  useEffect(() => {
    api.temas().then(setTemas);
  }, []);

  if (!temas) return <p className={estilos.mensaje}>Cargando…</p>;

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

      {temas.length === 0 ? (
        <p className={estilos.mensaje}>Todavía no hay temas.</p>
      ) : (
        <ol className={estilos.temas}>
          {temas.map((t) => {
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
