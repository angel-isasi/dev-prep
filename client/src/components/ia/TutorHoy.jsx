// En Hoy: "Tu tutor hoy" (en qué enfocarte, según tus datos reales) y "Tu semana" (le cuentas cómo viene
// la universidad y la IA arma tu horario de estudio). Se ven como tableros, no como párrafos:
// el tutor son 2 o 3 fichas de enfoque y la semana son 7 fichas, una por día.
// El tutor se pide una vez por día y solo si hiciste algo nuevo; si no, muestra el último.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { claveIa, estadoIa } from "../../lib/ia.js";
import { leerErroresIngles } from "../../lib/errores-ingles.js";
import { lunesDe } from "../../../../server/metricas.js";
import { useIa } from "./useIa.js";
import base from "../EvaluadorIa.module.css";
import estilos from "./TutorHoy.module.css";

const DONDE = { aprender: "/aprender", practicar: "/practicar", tarjetas: "/tarjetas", ingles: "/ingles", entrevistas: "/entrevistas" };
const NOMBRE_DONDE = { aprender: "Aprender", practicar: "Practicar", tarjetas: "Tarjetas", ingles: "Inglés", entrevistas: "Entrevistas" };
const DIAS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
const NOMBRE_DIA = { lun: "Lun", mar: "Mar", mie: "Mié", jue: "Jue", vie: "Vie", sab: "Sáb", dom: "Dom" };
const CARGA = { libre: "Libre", poco: "Poco", normal: "Normal", mucho: "Mucho" };
const NIVEL_CARGA = { libre: 0, poco: 1, normal: 2, mucho: 3 };
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
  const dificiles = (tarjetas ?? []).filter((t) => (t.rep?.fallos ?? 0) >= 2).sort((a, b) => b.rep.fallos - a.rep.fallos);
  const ingles = leerErroresIngles().slice(-6);
  return [
    flojas.length ? `Temas flojos: ${flojas.slice(0, 5).map((u) => `${u.titulo} (${Math.round(u.valor * 100)}%; falta: ${u.falta.slice(0, 2).join(", ")})`).join("; ")}` : "Temas flojos: ninguno con datos todavía",
    `Temas dominados: ${unidades.filter((u) => u.estado === "verde").map((u) => u.titulo).join(", ") || "ninguno todavía"}`,
    errores?.length ? `Errores frecuentes al correr tests: ${errores.map((e) => `${e.nombre} (${e.veces} veces)`).join(", ")}` : "",
    dificiles.length ? `Tarjetas que más falla: ${dificiles.slice(0, 4).map((t) => `"${t.frente}" (${t.rep.fallos} fallos)`).join("; ")}` : "",
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

/** Los dos tableros, uno debajo del otro y a todo el ancho. Sin IA no se muestra nada. */
export function TutorHoy({ hoy, semana }) {
  const lista = useIaLista();
  if (!lista) return null;
  return (
    <div className={estilos.bloque}>
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
    <section className={`tarjeta ${estilos.tablero}`}>
      <header className={estilos.cabeza}>
        <div>
          <span className="etiqueta">Tu tutor hoy</span>
          <h2>{r ? "Enfócate en esto" : "Todavía sin datos"}</h2>
        </div>
        <button type="button" className="boton boton-fantasma" onClick={() => actualizar(true)} disabled={cargando}>
          {cargando ? "Mirando tus datos…" : "Actualizar"}
        </button>
      </header>
      {!r && !cargando && <p className={base.suave}>Cuando practiques un poco, aquí verás en qué enfocarte.</p>}
      {r && (
        <div className={estilos.focos}>
          {r.focos.map((f, i) => (
            // El porqué (con sus números) queda al pasar el mouse: la ficha muestra solo qué hacer
            <Link key={i} to={DONDE[f.donde] ?? "/"} className={estilos.foco} title={f.porque}>
              <span className={estilos.numero}>{i + 1}</span>
              <span className={estilos.focoTexto}>
                <strong>{f.tema}</strong>
                <span>{f.accion}</span>
              </span>
              <span className={estilos.ir}>{NOMBRE_DONDE[f.donde] ?? "Ir"} →</span>
            </Link>
          ))}
        </div>
      )}
      {error && <p className={base.error}>{error}</p>}
    </section>
  );
}

function PlanSemana({ hoy, semana }) {
  const { cargando, error, pedir } = useIa();
  const lunes = lunesDe(hoy);
  const [plan, setPlan] = useState(null);
  const [horario, setHorario] = useState(null);
  const [cargado, setCargado] = useState(false);
  const [texto, setTexto] = useState("");
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    api.planSemanaIa?.().then((p) => {
      setPlan(p?.lunes === lunes ? p : null);
      setCargado(true);
    });
    api.rutina?.().then((r) => setHorario(r?.horario ?? null), () => {});
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
    setHorario(r.horario);
    setEditando(false);
  }

  if (!cargado || !api.planSemanaIa) return null;
  const diaHoy = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"][new Date(`${hoy}T12:00:00`).getDay()];
  const cargas = plan?.horario ?? horario ?? {};
  const pidiendo = !plan || editando;

  return (
    <section className={`tarjeta ${estilos.tablero}`}>
      <header className={estilos.cabeza}>
        <div>
          <span className="etiqueta">Tu semana</span>
          <h2 title={plan?.consejo}>{plan ? "Tu plan de esta semana" : "Arma tu semana de estudio"}</h2>
        </div>
        {plan && !editando && (
          <button type="button" className="boton boton-fantasma" onClick={() => (setTexto(plan.texto ?? ""), setEditando(true))}>
            Cambió algo
          </button>
        )}
      </header>

      {/* Los 7 días, cada uno en su ficha: cuánto puedes estudiar (barritas) y en qué enfocarte */}
      <ol className={estilos.dias}>
        {DIAS.map((d) => {
          const carga = cargas[d] ?? "normal";
          const enfoque = plan?.dias?.find((x) => x.dia === d)?.enfoque;
          return (
            <li key={d} className={estilos.dia} data-hoy={d === diaHoy} data-libre={carga === "libre"}>
              <span className={estilos.diaCabeza}>
                <strong>{NOMBRE_DIA[d]}</strong>
                <span className={estilos.medidor} title={`Carga de estudio: ${CARGA[carga]}`} aria-label={CARGA[carga]}>
                  {[1, 2, 3].map((n) => (
                    <i key={n} data-lleno={n <= NIVEL_CARGA[carga]} />
                  ))}
                </span>
              </span>
              <span className={estilos.diaEnfoque}>{carga === "libre" ? "Descanso" : (enfoque ?? CARGA[carga])}</span>
            </li>
          );
        })}
      </ol>

      {pidiendo && (
        <form
          className={estilos.pedir}
          onSubmit={(e) => {
            e.preventDefault();
            if (texto.trim().length >= 3) armar();
          }}
        >
          <input
            className={base.entrada}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="¿Cómo viene tu semana en la universidad? Ej.: examen el miércoles, entrega el jueves, sábado libre"
            aria-label="Cómo viene tu semana en la universidad"
          />
          <button type="submit" className="boton boton-primario" disabled={cargando || texto.trim().length < 3}>
            {cargando ? "Armando…" : "Armar mi semana"}
          </button>
        </form>
      )}
      {error && <p className={base.error}>{error}</p>}
    </section>
  );
}
