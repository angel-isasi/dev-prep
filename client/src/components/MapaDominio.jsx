// Mapa de lo que dominas (versión web): cada unidad en gris (sin empezar), rojo, amarillo o verde,
// según ejercicios resueltos, quiz e ítems de lección. Al tocar una ves qué te falta.
// Debajo: tus errores más frecuentes y el "Entrenamiento de hoy" con tus unidades más flojas.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";
import estilos from "./MapaDominio.module.css";

const AREAS = { javascript: "JavaScript", algoritmos: "Algoritmos", react: "React", typescript: "TypeScript", node: "Node.js y SQL" };
const LEYENDA = [
  ["verde", "La dominas"],
  ["amarillo", "A medias"],
  ["rojo", "Floja"],
  ["sin-empezar", "Sin empezar"],
];

export function MapaDominio() {
  const [mapa, setMapa] = useState(null);
  const [errores, setErrores] = useState([]);
  const [abierta, setAbierta] = useState(null);

  useEffect(() => {
    api.mapa().then(setMapa, () => setMapa(null));
    api.erroresFrecuentes().then(setErrores, () => {});
  }, []);

  if (!mapa) return null;
  const elegida = mapa.unidades.find((u) => u.id === abierta);

  return (
    <>
      <div className={estilos.bloque}>
        <div className={estilos.cabecera}>
          <h2>Lo que dominas</h2>
          <span>Toca un tema para ver qué te falta</span>
        </div>
        <div className={estilos.leyenda}>
          {LEYENDA.map(([estado, texto]) => (
            <span key={estado}>
              <i data-estado={estado} /> {texto}
            </span>
          ))}
        </div>
        {Object.entries(AREAS).map(([area, titulo]) => {
          const unidades = mapa.unidades.filter((u) => u.area === area);
          if (!unidades.length) return null;
          return (
            <div key={area} className={estilos.area} data-area={area}>
              <h3>{titulo}</h3>
              <div className={estilos.celdas}>
                {unidades.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className={estilos.celda}
                    data-estado={u.estado}
                    data-abierta={abierta === u.id}
                    onClick={() => setAbierta(abierta === u.id ? null : u.id)}
                    title={`${u.titulo}: ${Math.round(u.valor * 100)}%`}
                  >
                    <span>{u.titulo}</span>
                    <small>{Math.round(u.valor * 100)}%</small>
                  </button>
                ))}
              </div>
              {elegida && elegida.area === area && (
                <div className={estilos.detalle}>
                  <strong>{elegida.titulo}</strong>
                  {elegida.falta.length ? (
                    <ul>
                      {elegida.falta.map((f) => (
                        <li key={f}>Te falta: {f}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>La dominas. Sigue repasando para no olvidarla.</p>
                  )}
                  <div className={estilos.acciones}>
                    <Link to={`/aprender/${elegida.id}`} className="boton">
                      Teoría y quiz
                    </Link>
                    <Link to={`/leccion?unidad=${encodeURIComponent(elegida.id)}`} className="boton boton-primario">
                      Lección de este tema
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={estilos.bloque}>
        <div className={estilos.cabecera}>
          <h2>Entrenamiento de hoy</h2>
          <span>Lo más flojo primero</span>
        </div>
        {mapa.debiles.length ? (
          <div className={estilos.entrenamiento}>
            <p>
              Una lección armada con tus temas más flojos: <strong>{mapa.debiles.map((u) => u.titulo).join(", ")}</strong>.
            </p>
            <Link to="/leccion?modo=debiles" className="boton boton-primario">
              Entrenar mis puntos débiles
            </Link>
          </div>
        ) : (
          <p className={estilos.vacio}>Todavía no hay temas flojos: cuando empieces uno y te cueste, aparecerá aquí.</p>
        )}
        {errores.length > 0 && (
          <>
            <h3 className={estilos.subtitulo}>Tus errores más frecuentes</h3>
            <ol className={estilos.errores}>
              {errores.map((e) => (
                <li key={e.categoria}>
                  <span>{e.nombre}</span>
                  <strong>{e.veces}×</strong>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </>
  );
}
