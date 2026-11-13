import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";
import { useEvento } from "../hooks/useEvento.js";
import { nombreTema } from "../lib/etiquetas.js";
import { Insignia } from "../components/Insignia.jsx";
import { Esqueleto } from "../components/Esqueleto.jsx";
import estilos from "./Inicio.module.css";

const RITMO = {
  "al-dia": { texto: "Vas al día", tipo: "exito" },
  atrasado: { texto: "Vas atrasado", tipo: "error" },
  vencido: { texto: "La fecha ya pasó", tipo: "error" },
  terminado: { texto: "¡Terminaste todo!", tipo: "exito" },
};

function fechaLarga(fecha) {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
}

export function Inicio() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  const cargar = () => api.inicio().then(setDatos, (e) => setError(e.message));
  useEffect(() => {
    cargar();
  }, []);
  useEvento("resultado", (d) => {
    if (d.resueltoAhora || d.repasoCompletado) cargar();
  });

  if (error) return <p className={estilos.mensaje}>No se pudo cargar: {error}</p>;
  if (!datos) return <Esqueleto variante="tarjetas" />;

  const { config, meta, ayer, racha, preparacion, ritmo, semana, totales, repasos, continuar, siguiente, frase } = datos;
  const ritmoInfo = RITMO[ritmo.estado];
  const proximo = continuar ?? siguiente;
  const pctMeta = meta.objetivo ? Math.min(100, (meta.hecho / meta.objetivo) * 100) : 100;

  return (
    <section className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <p className={estilos.fecha}>{fechaLarga(datos.hoy)}</p>
        <h1>{config.nombre ? `Hola, ${config.nombre}` : "Hola"}</h1>
        <p className={estilos.frase}>{frase}</p>
      </header>

      {config.objetivo ? (
        <blockquote className={estilos.objetivo}>
          <span>Tu objetivo</span>
          {config.objetivo}
        </blockquote>
      ) : (
        <Link to="/ajustes" className={estilos.objetivoVacio}>
          Escribe tu objetivo personal en Ajustes: tenerlo a la vista ayuda más de lo que crees →
        </Link>
      )}

      {meta.cumplio ? (
        <p className={estilos.aviso} data-tipo="exito">
          Meta de hoy cumplida. Si te quedan ganas, un repaso más nunca sobra.
        </p>
      ) : ayer && !ayer.cumplio ? (
        <p className={estilos.aviso} data-tipo="error">
          Ayer no cumpliste tu meta ({ayer.hecho} de {config.metaDiaria}). Hoy te toca {meta.objetivo}
          {meta.deuda > 0 && `, incluida una deuda de ${meta.deuda}`}.
        </p>
      ) : null}

      <div className={estilos.tarjetas}>
        <div className={`${estilos.tarjeta} ${estilos.racha}`}>
          <span className={estilos.etiqueta}>Racha</span>
          <strong className={estilos.numeroGrande}>{racha}</strong>
          <span className={estilos.detalle}>
            {racha === 1 ? "día seguido" : "días seguidos"}
            {!meta.cumplio && racha > 0 && " · cumple hoy para mantenerla"}
          </span>
        </div>

        <div className={estilos.tarjeta}>
          <span className={estilos.etiqueta}>Meta de hoy</span>
          <strong className={estilos.numero}>
            {meta.hecho}
            <small>/{meta.objetivo}</small>
          </strong>
          <div className={estilos.barra}>
            <div style={{ width: `${pctMeta}%` }} data-ok={meta.cumplio} />
          </div>
          <span className={estilos.detalle}>
            {meta.deuda > 0 ? `${config.metaDiaria} de meta + ${meta.deuda} de deuda` : "resueltos + repasos"}
          </span>
        </div>

        <div className={estilos.tarjeta}>
          <span className={estilos.etiqueta}>Preparación</span>
          <strong className={estilos.numero}>
            {preparacion}
            <small>%</small>
          </strong>
          <div className={estilos.barra}>
            <div style={{ width: `${preparacion}%` }} />
          </div>
          <span className={estilos.detalle}>
            {totales.resueltos} de {totales.total} ejercicios dominados
          </span>
        </div>

        <div className={estilos.tarjeta}>
          <span className={estilos.etiqueta}>Fecha meta</span>
          <strong className={estilos.numero}>
            {Math.max(0, ritmo.diasRestantes)}
            <small> días</small>
          </strong>
          <span className={estilos.chip} data-tipo={ritmoInfo.tipo}>
            {ritmoInfo.texto}
          </span>
          <span className={estilos.detalle}>
            Necesitas {ritmo.necesarioPorDia}/día · llevas {ritmo.promedioSemana}/día
          </span>
        </div>
      </div>

      <div className={estilos.columnas}>
        <div className={estilos.bloque}>
          <h2>Para hoy</h2>
          {proximo ? (
            <Link to={`/practicar/${proximo.id}`} className={estilos.siguiente}>
              <span className={estilos.etiqueta}>{continuar ? "Continuar" : "Siguiente ejercicio"}</span>
              <strong>{proximo.titulo}</strong>
              <span className={estilos.detalle}>
                {nombreTema(proximo.tema)} · <Insignia nivel={proximo.nivel} />
              </span>
            </Link>
          ) : (
            <p className={estilos.vacio}>No quedan ejercicios pendientes. ¡Enorme!</p>
          )}

          <h3>Repasos de hoy {repasos.length > 0 && <span className={estilos.contador}>{repasos.length}</span>}</h3>
          {repasos.length === 0 ? (
            <p className={estilos.vacio}>Nada para repasar hoy.</p>
          ) : (
            <ul className={estilos.lista}>
              {repasos.map((r) => (
                <li key={r.id}>
                  <Link to={`/practicar/${r.id}`}>
                    {r.titulo}
                    <span className={estilos.detalle}>{nombreTema(r.tema)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={estilos.bloque}>
          <h2>Esta semana</h2>
          <dl className={estilos.semana}>
            <div>
              <dt>Resueltos</dt>
              <dd>{semana.resueltos}</dd>
            </div>
            <div>
              <dt>Repasos</dt>
              <dd>{semana.repasos}</dd>
            </div>
            <div>
              <dt>Minutos</dt>
              <dd>{semana.minutos}</dd>
            </div>
            <div>
              <dt>Preparación</dt>
              <dd>
                {semana.subioPreparacion >= 0 ? "+" : ""}
                {semana.subioPreparacion}%
              </dd>
            </div>
          </dl>
          <Link to="/progreso" className={estilos.verMas}>
            Ver todo tu progreso →
          </Link>
        </div>
      </div>
    </section>
  );
}
