// Map (el mapache de inglés) en la portada de Inglés y el aviso de una línea para Inicio y Hoy.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { hablar, useHayVoz } from "../../lib/voz.js";
import { CajaVacia, Mapache } from "./Mapache.jsx";
import estilos from "./TarjetaMapache.module.css";

/**
 * Lo que dice el mapache y qué pasa al tocarlo: despierto empieza con la frase del día y cada
 * toque pasa a la siguiente (y la dice en voz alta); dormido, cada toque cuenta otro sueño.
 */
export function useCharlaMapache(datos) {
  const voz = useHayVoz();
  const [toques, setToques] = useState(0);
  const dormido = datos?.estado === "dormido";
  const lista = (dormido ? datos?.suenos : datos?.frases) ?? [];
  const indice = dormido ? toques - 1 : toques;
  const dice = indice >= 0 && lista.length ? lista[indice % lista.length] : null;
  const tocar = () => {
    if (!lista.length) return;
    const siguiente = lista[(dormido ? toques : toques + 1) % lista.length];
    setToques((t) => t + 1);
    if (voz) hablar(siguiente.en);
  };
  return { dice, tocar, voz };
}

/**
 * Map en la portada de Inglés: lo que dice hoy (con su traducción a la vista) y la práctica del día
 * con él. Aquí no hay barra de hambre ni avisos: es un acceso a practicar, no una tarea más.
 */
export function TarjetaMap() {
  const [datos, setDatos] = useState(null);
  const { dice, tocar } = useCharlaMapache(datos);
  useEffect(() => {
    api.mapache?.().then(setDatos, () => {});
  }, []);
  if (!datos) return null;
  const frase = dice ?? datos.frase;
  const pendiente = !datos.pregunta.respondida;
  return (
    <div className={`textura ${estilos.tarjeta}`}>
      <div className={estilos.dibujo}>
        {datos.estado === "escapado" ? (
          <CajaVacia tamano={92} />
        ) : (
          <Mapache estado={datos.estado === "nuevo" ? "normal" : datos.estado} equipo={datos.equipo} tamano={92} alTocar={tocar} />
        )}
      </div>
      <div className={estilos.texto}>
        <div className={estilos.cabecera}>
          <strong>{datos.nombre}</strong>
          <span>práctica de hoy</span>
        </div>
        {frase && (
          <p key={frase.en} className={estilos.globo}>
            <span lang="en">{frase.en}</span>
            <small>{frase.es}</small>
          </p>
        )}
        <div className={estilos.acciones}>
          <Link to="/ingles/mapache" className="boton">
            {pendiente ? "Pregunta de hoy" : "Practicar con " + datos.nombre}
          </Link>
          <span className={estilos.dato} title="Frases de Repite conmigo dichas hoy">
            Repite conmigo <strong>{datos.repetidasHoy}</strong>
          </span>
          {datos.totalRobados > 0 && (
            <Link to="/ingles/mapache" className={estilos.robos}>
              {datos.totalRobados} {datos.totalRobados === 1 ? "palabra" : "palabras"} por recuperar
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
      ? "Llevas días sin inglés: vuelve con una lección corta."
      : r.robados > 0
        ? `Inglés: tienes ${r.robados} ${r.robados === 1 ? "repaso pendiente" : "repasos pendientes"} y hoy casi no practicaste.`
        : "Hoy casi no hubo inglés: 5 minutos bastan para no romper la racha.";
  return (
    <Link to="/ingles" className={estilos.aviso}>
      <Mapache estado={r.estado === "escapado" ? "triste" : r.estado} tamano={34} quieto />
      <span>{texto}</span>
      <span aria-hidden>→</span>
    </Link>
  );
}
