// Tiempo libre ganado: barra con lo ganado hoy, lo jugado y lo que queda. Se desbloquea al cumplir la
// meta del día. Si dev-prep está abierto en la laptop, el motor mide el juego y la barra se mueve en vivo.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useEvento } from "../hooks/useEvento.js";
import { ES_MOVIL } from "../lib/modo.js";
import estilos from "./TiempoLibre.module.css";
import { IconoCandado, IconoTrofeo } from "./Iconos.jsx";

const horas = (min) => (min >= 60 ? `${Math.floor(min / 60)} h ${min % 60 ? `${min % 60} min` : ""}`.trim() : `${min} min`);

/**
 * @param {{ juego: object, meta?: object, salvados?: { semana: number, maximo: number }, jefe?: object }} props
 */
export function TiempoLibre({ juego: inicial, meta, salvados, jefe }) {
  const [juego, setJuego] = useState(inicial);
  const [jugando, setJugando] = useState(false);
  useEffect(() => setJuego(inicial), [inicial]);
  useEvento("juego", (d) => {
    setJuego((j) => ({ ...j, ...d }));
    setJugando(!!d.jugando);
  });
  if (!juego) return null;

  const total = Math.max(juego.disponible, juego.jugado, 1);
  const pJugado = Math.min(100, (juego.jugado / total) * 100);
  const pRestante = Math.min(100 - pJugado, (juego.restante / total) * 100);

  return (
    <div className={estilos.tarjeta} data-bloqueado={juego.bloqueado} data-jugando={jugando}>
      <div className={estilos.cabecera}>
        <div>
          <span className={estilos.etiqueta}>{jugando ? "Jugando ahora" : "Tiempo libre de hoy"}</span>
          {juego.bloqueado ? (
            <strong>
              <IconoCandado tamano={14} /> Bloqueado · te {juego.faltaParaDesbloquear === 1 ? "falta 1 punto" : `faltan ${juego.faltaParaDesbloquear} puntos`} para tu meta
            </strong>
          ) : (
            <strong>
              {horas(juego.restante)} {juego.restante > 0 ? "para jugar" : "· ya lo usaste"}
            </strong>
          )}
        </div>
        <span className={estilos.ganado}>
          {juego.bloqueado && juego.ganado > 0 ? `${horas(juego.ganado)} esperando` : `${horas(juego.ganado)} de ${horas(juego.tope)}`}
        </span>
      </div>

      <div className={estilos.barra} aria-hidden>
        <span className={estilos.jugado} style={{ width: `${pJugado}%` }} />
        <span className={estilos.restante} style={{ width: `${pRestante}%` }} />
      </div>

      <ul className={estilos.notas}>
        {juego.jugado > 0 && <li>Jugaste {horas(juego.jugado)} hoy.</li>}
        {juego.deuda > 0 && <li>Deuda de ayer: {horas(juego.deuda)} (se descuenta de lo que ganes).</li>}
        {juego.exceso > 0 && <li data-tipo="error">Te pasaste {horas(juego.exceso)}: mañana se descuenta.</li>}
        {juego.mitad && <li data-tipo="aviso">Ayer no cumpliste tu meta: hoy ganas la mitad.</li>}
        {juego.finDeSemanaLargo && <li data-tipo="exito">Semana perfecta: hoy el tope sube a {horas(juego.tope)}.</li>}
      </ul>

      {meta && !meta.cumplio && !meta.pausa && (
        <div className={estilos.salvar}>
          <span>
            ¿Día pesado? Haz al menos algo y tu racha no se rompe
            {salvados ? ` (días salvados esta semana: ${salvados.semana} de ${salvados.maximo})` : ""}.
          </span>
          {ES_MOVIL && (
            <Link to="/leccion?modo=rapida" className="boton">
              Solo 10 minutos
            </Link>
          )}
        </div>
      )}

      {jefe && (
        <Link to={`/practicar/${jefe.id}`} className={estilos.jefe}>
          <span>
<IconoTrofeo tamano={16} /> Jefe de la semana · +45 min</span>
          <strong>{jefe.titulo} →</strong>
        </Link>
      )}
    </div>
  );
}
