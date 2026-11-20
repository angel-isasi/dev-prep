// En Hoy: "Tu tutor hoy" (en qué enfocarte, según tus datos reales) y "Tu semana" (le cuentas cómo viene
// la universidad y la IA arma tu horario de estudio y el enfoque de cada día).
// El tutor se pide una vez por día y solo si hiciste algo nuevo; si no, muestra el último.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { claveIa, estadoIa } from "../../lib/ia.js";
import { leerErroresIngles } from "../../lib/errores-ingles.js";
import { lunesDe } from "../../../../server/metricas.js";
import { useIa } from "./useIa.js";
import base from "../EvaluadorIa.module.css";
import estilos from "./Ia.module.css";

const DONDE = { aprender: "/aprender", practicar: "/practicar", tarjetas: "/tarjetas", ingles: "/ingles", entrevistas: "/entrevistas" };
const NOMBRE_DIA = { lun: "Lunes", mar: "Martes", mie: "Miércoles", jue: "Jueves", vie: "Viernes", sab: "Sábado", dom: "Domingo" };
const CARGA = { libre: "Libre", poco: "Poco", normal: "Normal", mucho: "Mucho" };
const CLAVE_TUTOR = "devprep.tutorDia";

/** Tus datos reales en texto, para el tutor y el plan. */
async function datosTutor(semana) {
  const [mapa, errores, tarjetas] = await Promise.all([
    api.mapa?.().catch(() => null),
    api.erroresFrecuentes?.().catch(() => []),
    api.misTarjetas?.().catch(() => []),
  ]);
  const unidades = mapa?.unidades ?? [];
  const flojas = unidades.filter((u) => u.estado === "rojo" || u.estado === "amarillo").sort((a, b) => a.valor - b.valor);
  const difíciles = (tarjetas ?? []).filter((t) => (t.rep?.fallos ?? 0) >= 2).sort((a, b) => b.rep.fallos - a.rep.fallos);
  const ingles = leerErroresIngles().slice(-6);
  return [
    flojas.length ? `Temas flojos: ${flojas.slice(0, 5).map((u) => `${u.titulo} (${Math.round(u.valor * 100)}%; falta: ${u.falta.slice(0, 2).join(", ")})`).join("; ")}` : "Temas flojos: ninguno con datos todavía",
    `Temas dominados: ${unidades.filter((u) => u.estado === "verde").map((u) => u.titulo).join(", ") || "ninguno todavía"}`,
    errores?.length ? `Errores frecuentes al correr tests: ${errores.map((e) => `${e.nombre} (${e.veces} veces)`).join(", ")}` : "",
    difíciles.length ? `Tarjetas que más falla: ${difíciles.slice(0, 4).map((t) => `"${t.frente}" (${t.rep.fallos} fallos)`).join("; ")}` : "",
    ingles.length ? `Errores de inglés recientes: ${ingles.map((e) => `${e.original} → ${e.corregido}`).join("; ")}` : "",
    semana?.dias ? `Últimos días (puntos, minutos): ${semana.dias.map((d) => `${d.fecha}: ${d.puntos ?? 0} pts, ${d.minutos ?? 0} min`).join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function useIaLista() {
  const [lista, setLista] = useState(false);
  useEffect(() => {
    if (!claveIa()) return;
    estadoIa().then((e) => setLista(e.configurada));
  }, []);
  return lista;
}

/** Las dos tarjetas lado a lado. Sin IA no se muestra nada. */
export function TutorHoy({ hoy, semana }) {
  const lista = useIaLista();
  if (!lista) return null;
  return (
    <div className={estilos.rejilla} style={{ marginTop: "var(--espacio-4)", gap: "var(--espacio-4)" }}>
      <TutorDia hoy={hoy} semana={semana} />
      <PlanSemana hoy={hoy} semana={semana} />
    </div>
  );
}

function TutorDia({ hoy, semana }) {
  const { cargando, error, pedir } = useIa();
  const [guardado, setGuardado] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_TUTOR) ?? "null");
    } catch {
      return null;
    }
  });

  async function actualizar(forzar = false) {
    const datos = await datosTutor(semana);
    // Una vez por día, y solo si hay algo nuevo desde la última vez
    if (!forzar && guardado?.fecha === hoy) return;
    if (!forzar && guardado?.datos === datos) return;
    const r = await pedir({ tarea: "tutor-dia", datos });
    if (!r) return;
    const nuevo = { fecha: hoy, datos, r };
    localStorage.setItem(CLAVE_TUTOR, JSON.stringify(nuevo));
    setGuardado(nuevo);
  }

  useEffect(() => {
    actualizar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoy]);

  const r = guardado?.r;
  return (
    <section className={`tarjeta ${base.caja} ${estilos.caja}`}>
      <div className={base.cabecera}>
        <span className={base.etiqueta}>Tu tutor hoy</span>
        <button type="button" className={base.enlace} onClick={() => actualizar(true)} disabled={cargando}>
          {cargando ? "Mirando tus datos…" : "Actualizar"}
        </button>
      </div>
      {!r && !cargando && <p className={base.suave}>Cuando practiques un poco, aquí verás en qué enfocarte.</p>}
      {r && (
        <>
          <p style={{ margin: 0 }}>{r.resumen}</p>
          <ol style={{ margin: 0, paddingLeft: "1.2em", display: "grid", gap: "var(--espacio-2)" }}>
            {r.focos.map((f, i) => (
              <li key={i}>
                <strong>{f.tema}:</strong> {f.accion}{" "}
                <Link to={DONDE[f.donde] ?? "/"} className={base.enlace}>
                  Ir →
                </Link>
                <br />
                <small className={base.suave}>{f.porque}</small>
              </li>
            ))}
          </ol>
        </>
      )}
      {error && <p className={base.error}>{error}</p>}
    </section>
  );
}

function PlanSemana({ hoy, semana }) {
  const { cargando, error, pedir } = useIa();
  const lunes = lunesDe(hoy);
  const [plan, setPlan] = useState(null);
  const [cargado, setCargado] = useState(false);
  const [texto, setTexto] = useState("");
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    api.planSemanaIa?.().then((p) => {
      setPlan(p?.lunes === lunes ? p : null);
      setCargado(true);
    });
  }, [lunes]);

  async function armar() {
    const rutina = await api.rutina?.().catch(() => null);
    const config = await api.config?.().catch(() => null);
    const datos = [
      await datosTutor(semana),
      rutina?.metaDiaria ? `Meta diaria: ${rutina.metaDiaria} ejercicios` : "",
      config?.fechaMeta ? `Fecha meta para postular: ${config.fechaMeta}` : "",
      `Hoy es ${hoy}. La semana empieza el ${lunes}.`,
    ]
      .filter(Boolean)
      .join("\n");
    const r = await pedir({ tarea: "plan-semana", universidad: texto, datos });
    if (!r) return;
    const nuevo = { lunes, texto, ...r };
    await api.guardarPlanSemanaIa?.(nuevo);
    // El horario manda en tu meta de cada día (ver Ajustes > Tu rutina)
    await api.guardarHorario?.(r.horario);
    setPlan(nuevo);
    setEditando(false);
  }

  if (!cargado || !api.planSemanaIa) return null;
  const diaHoy = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"][new Date(`${hoy}T12:00:00`).getDay()];

  return (
    <section className={`tarjeta ${base.caja} ${estilos.caja}`}>
      <div className={base.cabecera}>
        <span className={base.etiqueta}>Tu semana</span>
        {plan && !editando && (
          <button type="button" className={base.enlace} onClick={() => (setTexto(plan.texto), setEditando(true))}>
            Cambió algo
          </button>
        )}
      </div>
      {!plan || editando ? (
        <>
          <p className={base.suave} style={{ margin: 0 }}>
            ¿Cómo viene tu semana en la universidad? Exámenes, entregas, días pesados. Con eso armo tu horario de estudio.
          </p>
          <textarea className={base.texto} rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Por ejemplo: el miércoles tengo examen de cálculo, el jueves entrego un informe y el sábado estoy libre" />
          <div className={base.fila}>
            <button type="button" className="boton boton-primario" disabled={cargando || texto.trim().length < 3} onClick={armar}>
              {cargando ? "Armando tu semana…" : "Armar mi semana"}
            </button>
          </div>
        </>
      ) : (
        <>
          {plan.resumen && <p className={base.suave} style={{ margin: 0 }}>{plan.resumen}</p>}
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 4 }}>
            {Object.keys(NOMBRE_DIA).map((d) => {
              const enfoque = plan.dias?.find((x) => x.dia === d)?.enfoque;
              return (
                <li key={d} style={{ display: "grid", gridTemplateColumns: "6.5em 4.5em 1fr", gap: 8, fontWeight: d === diaHoy ? 600 : undefined }}>
                  <span>{NOMBRE_DIA[d]}</span>
                  <span className={base.suave}>{CARGA[plan.horario?.[d]] ?? "Normal"}</span>
                  <span>{plan.horario?.[d] === "libre" ? "Descanso" : (enfoque ?? "")}</span>
                </li>
              );
            })}
          </ul>
          {plan.consejo && <p className={estilos.nota}>{plan.consejo}</p>}
        </>
      )}
      {error && <p className={base.error}>{error}</p>}
    </section>
  );
}
