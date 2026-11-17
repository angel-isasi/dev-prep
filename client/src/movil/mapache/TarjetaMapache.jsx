// El mapache en la pantalla de Inglés (versión corta) y el aviso de una línea para Inicio y Hoy.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { hablar, useHayVoz } from "../../lib/voz.js";
import { CajaVacia, Mapache } from "./Mapache.jsx";
import estilos from "./TarjetaMapache.module.css";

const CORTO = {
  nuevo: "Acaba de llegar y tiene hambre de palabras.",
  feliz: "Está lleno y feliz.",
  normal: "Está bien, pero le cabe un poco más.",
  hambriento: "Tiene hambre.",
  triste: "Está triste.",
  dormido: "Está dormido.",
  escapado: "Se escapó a buscar comida.",
};

/** Versión corta para la pantalla de Inglés: el mapache, lo que dice y su pancita. */
export function TarjetaMapache() {
  const [datos, setDatos] = useState(null);
  const voz = useHayVoz();
  useEffect(() => {
    api.mapache?.().then(setDatos, () => {});
  }, []);
  if (!datos) return null;
  const comida = Math.min(1, datos.comidaHoy / datos.meta);
  const dice = datos.estado === "dormido" ? null : datos.frase;
  return (
    <div className={estilos.tarjeta}>
      <div className={estilos.dibujo}>
        {datos.estado === "escapado" ? (
          <CajaVacia tamano={104} />
        ) : (
          <Mapache estado={datos.estado === "nuevo" ? "normal" : datos.estado} equipo={datos.equipo} tamano={104} alTocar={() => voz && dice && hablar(dice.en)} />
        )}
      </div>
      <div className={estilos.texto}>
        <div className={estilos.cabecera}>
          <strong>{datos.nombre}</strong>
          <span>{CORTO[datos.estado]}</span>
        </div>
        {dice && (
          <p className={estilos.globo} lang="en" title={dice.es}>
            {dice.en}
          </p>
        )}
        <div className={estilos.barra} aria-label={`Comió ${Math.floor(datos.comidaHoy)} de ${datos.meta} hoy`}>
          <i style={{ width: `${comida * 100}%` }} />
        </div>
        <div className={estilos.acciones}>
          <Link to="/ingles/mapache" className="boton">
            Su casa
          </Link>
          {datos.totalRobados > 0 && (
            <Link to="/ingles/mapache" className={estilos.robos}>
              Te escondió {datos.totalRobados} {datos.totalRobados === 1 ? "palabra" : "palabras"}
            </Link>
          )}
          {!datos.pregunta.respondida && (
            <Link to="/ingles/mapache" className={estilos.robos}>
              Pregunta del día sin responder
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/** Una línea en Inicio y en Hoy, solo si el mapache necesita algo. Lleva a Inglés. */
export function AvisoMapache() {
  const [r, setR] = useState(null);
  useEffect(() => {
    api.mapacheResumen?.().then(setR, () => {});
  }, []);
  if (!r || !["hambriento", "triste", "escapado"].includes(r.estado)) return null;
  const texto =
    r.estado === "escapado"
      ? `${r.nombre} se escapó a buscar comida: vuelve con un poco de inglés.`
      : r.robados > 0
        ? `${r.nombre} tiene hambre y te escondió ${r.robados} ${r.robados === 1 ? "palabra" : "palabras"}.`
        : `${r.nombre} tiene hambre: hoy casi no hubo inglés.`;
  return (
    <Link to="/ingles" className={estilos.aviso}>
      <Mapache estado={r.estado === "escapado" ? "triste" : r.estado} tamano={34} quieto />
      <span>{texto}</span>
      <span aria-hidden>→</span>
    </Link>
  );
}
