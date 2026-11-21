// Tiempo libre ganado: cuánto te queda para jugar, en una regla de marcas de 0 al tope del día.
// Se desbloquea al cumplir la meta. Si dev-prep está abierto en la laptop, el motor mide el juego y
// la regla se mueve en vivo.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useEvento } from "../hooks/useEvento.js";
import { ES_MOVIL } from "../lib/modo.js";
import estilos from "./TiempoLibre.module.css";
import { IconoCandado } from "./Iconos.jsx";

const horas = (min) => (min >= 60 ? `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}m` : `${min} min`);
const marca = (min) => (min === 0 ? "0" : min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? min % 60 : ""}` : String(min));

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

  const tope = Math.max(juego.tope, 1);
  const pGanado = Math.min(100, (juego.ganado / tope) * 100);
  // "1/2": días salvados esta semana de los que se permiten
  const cuenta = salvados ? ` · ${salvados.semana}/${salvados.maximo}` : "";
  const ayudaSalvar = `¿Día pesado? Haz al menos algo y tu racha no se rompe${salvados ? `. Días salvados esta semana: ${salvados.semana} de ${salvados.maximo}` : ""}.`;
  const notas = [
    juego.jugado > 0 && { texto: `Jugaste ${horas(juego.jugado)} hoy.` },
    juego.deuda > 0 && { texto: `Deuda de ayer: ${horas(juego.deuda)}.` },
    juego.exceso > 0 && { texto: `Te pasaste ${horas(juego.exceso)}: mañana se descuenta.`, tipo: "error" },
    juego.mitad && { texto: "Ayer no cumpliste tu meta: hoy ganas la mitad." },
    juego.finDeSemanaLargo && { texto: `Semana perfecta: hoy el tope sube a ${horas(juego.tope)}.` },
  ].filter(Boolean);

  return (
    <section className={estilos.tarjeta} data-bloqueado={juego.bloqueado} data-jugando={jugando}>
      <p className={estilos.rotulo}>{jugando ? "Jugando ahora" : juego.bloqueado ? "Tiempo libre · bloqueado" : "Tiempo libre ganado"}</p>
      <p className={estilos.cifra}>
        {juego.bloqueado && <IconoCandado tamano={20} />}
        {horas(juego.bloqueado ? juego.ganado : juego.restante)}
      </p>
      <div className={estilos.regla} role="img" aria-label={`Ganaste ${horas(juego.ganado)} de ${horas(juego.tope)}`}>
        <span style={{ width: `${pGanado}%` }} />
        <span />
      </div>
      <div className={estilos.escala} aria-hidden>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <span key={f}>{marca(Math.round((tope * f) / 5) * 5)}</span>
        ))}
      </div>

      <div className={estilos.pie}>
        {juego.bloqueado && (
          <p>
            Te {juego.faltaParaDesbloquear === 1 ? "falta 1 punto" : `faltan ${juego.faltaParaDesbloquear} puntos`} para tu meta: ahí se desbloquea.
          </p>
        )}
        {notas.map((n) => (
          <p key={n.texto} data-tipo={n.tipo}>
            {n.texto}
          </p>
        ))}
        {/* Día pesado: una línea corta; la explicación completa va en title */}
        {meta && !meta.cumplio && !meta.pausa && (
          <p title={ayudaSalvar}>
            {ES_MOVIL ? (
              <Link to="/leccion?modo=rapida" aria-label={`Solo 10 minutos. ${ayudaSalvar}`}>
                Día pesado: solo 10 minutos{cuenta} →
              </Link>
            ) : (
              <>Día pesado: haz algo corto y salvas la racha{cuenta}</>
            )}
          </p>
        )}
        {jefe && (
          <p>
            +45 min si vences al jefe de la semana: <Link to={`/practicar/${jefe.id}`}>{jefe.titulo}</Link>
          </p>
        )}
      </div>
    </section>
  );
}
