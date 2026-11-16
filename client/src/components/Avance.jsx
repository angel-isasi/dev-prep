// Piezas de avance (versión web, reglas en server/avance.js):
// - CuantoAvance: cómo resuelves ahora contra hace 1 y 3 meses.
// - RetoSemana: un reto con tiempo cada semana y tu marca personal.
// - PlanSemana: los objetivos de la semana armados con tus puntos débiles.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../lib/api.js";
import { mmss } from "./Cronometro.jsx";
import { useAhora } from "../hooks/useAhora.js";
import estilos from "./Avance.module.css";

const valor = (n, sufijo = "") => (n == null ? "–" : `${n}${sufijo}`);

export function CuantoAvance() {
  const [avance, setAvance] = useState(null);
  useEffect(() => {
    api.avance?.().then(setAvance, (e) => console.error("Cuánto avancé:", e));
  }, []);
  if (!avance) return null;
  const ventanas = avance.ventanas.filter((v) => !v.antesDeEmpezar);
  const filas = [
    ["Ejercicios resueltos", (v) => valor(v.resueltos)],
    ["Minutos por ejercicio", (v) => valor(v.minutosPorEjercicio)],
    ["Intentos por ejercicio", (v) => valor(v.intentosPorEjercicio)],
    ["Pistas por ejercicio", (v) => valor(v.pistasPorEjercicio)],
    ["Resueltos sin pistas", (v) => valor(v.sinPistas, " %")],
    ["Nivel promedio", (v) => valor(v.nivelPromedio)],
  ];
  return (
    <div className={estilos.tarjeta}>
      <div className={estilos.cabecera}>
        <span className={estilos.etiqueta}>Cuánto avancé</span>
        <small>Los ejercicios que resolviste en cada periodo</small>
      </div>
      {avance.frases.length > 0 ? (
        <ul className={estilos.frases}>
          {avance.frases.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ) : (
        <p className={estilos.nota}>
          {avance.suficiente
            ? "Vas parejo con el mes pasado. Prueba ejercicios de un nivel más para notar la diferencia."
            : "Cuando tengas al menos 3 ejercicios resueltos en dos periodos distintos, aquí verás cuánto mejoraste."}
        </p>
      )}
      <table className={estilos.tabla}>
        <thead>
          <tr>
            <th />
            {ventanas.map((v) => (
              <th key={v.id}>{v.titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map(([nombre, f]) => (
            <tr key={nombre}>
              <th scope="row">{nombre}</th>
              {ventanas.map((v) => (
                <td key={v.id}>{f(v)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RetoSemana() {
  const [reto, setReto] = useState(null);
  const navigate = useNavigate();
  const enCurso = reto?.resultado.estado === "en-curso";
  const ahora = useAhora(enCurso ? 1000 : 60_000);
  useEffect(() => {
    api.retoSemana?.().then(setReto, (e) => console.error("Reto de la semana:", e));
  }, []);
  if (!reto) return null;
  const { resultado, marca } = reto;
  const nivel = { 1: "básico", 2: "intermedio", 3: "difícil" }[reto.reto.nivel] ?? "";

  return (
    <div className={`${estilos.tarjeta} ${estilos.reto}`} data-estado={resultado.estado}>
      <div className={estilos.cabecera}>
        <span className={estilos.etiqueta}>Reto de la semana</span>
        {marca.mejor && <small>Tu marca: {marca.mejor.puntos} puntos</small>}
      </div>
      <strong className={estilos.titulo}>{reto.reto.titulo}</strong>
      <small className={estilos.nota}>
        Nivel {nivel} · mientras más rápido y con menos pistas, más puntos. Ver la solución lo deja en 0.
      </small>

      {resultado.estado === "sin-empezar" && (
        <button
          type="button"
          className="boton boton-primario"
          onClick={async () => {
            const nuevo = await api.empezarRetoSemana();
            setReto(nuevo);
            navigate(`/practicar/${nuevo.reto.id}`);
          }}
        >
          Empezar el reto (corre el tiempo)
        </button>
      )}
      {enCurso && (
        <div className={estilos.fila}>
          <span className={estilos.reloj}>{mmss(Math.max(0, (ahora - Date.parse(reto.inicio ?? ahora)) / 1000))}</span>
          <Link className="boton" to={`/practicar/${reto.reto.id}`}>
            Seguir con el reto
          </Link>
        </div>
      )}
      {resultado.estado === "resuelto" && (
        <div className={estilos.fila}>
          <span className={estilos.puntos}>{resultado.puntos} puntos</span>
          <small>
            en {mmss(resultado.segundos)}
            {resultado.pistas ? `, con ${resultado.pistas} ${resultado.pistas === 1 ? "pista" : "pistas"}` : ", sin pistas"}
            {marca.mejor && resultado.puntos > marca.mejor.puntos ? " · ¡nueva marca personal!" : ""}
          </small>
        </div>
      )}
      {resultado.estado === "solucion" && (
        <small className={estilos.nota}>Viste la solución: este reto queda en 0. La próxima semana hay otro.</small>
      )}
    </div>
  );
}

export function PlanSemana() {
  const [plan, setPlan] = useState(null);
  useEffect(() => {
    api.planSemana?.().then(setPlan, (e) => console.error("Plan de la semana:", e));
  }, []);
  if (!plan) return null;
  return (
    <div className={estilos.tarjeta}>
      <div className={estilos.cabecera}>
        <span className={estilos.etiqueta}>Plan de la semana</span>
        <small>Armado con tu mapa, tus errores y las ofertas que analizaste</small>
      </div>
      <ol className={estilos.plan}>
        {plan.objetivos.map((o) => (
          <li key={o.id}>
            <Link to={o.a}>
              <strong>{o.texto}</strong>
              <small>{o.detalle}</small>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
