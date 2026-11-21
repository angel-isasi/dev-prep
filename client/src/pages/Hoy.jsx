// Hoy: la pantalla de entrada, la misma en la laptop, la web y el celular.
// De arriba abajo: el estado del día y el saludo; una franja de cuatro datos (sesión, racha, puntos
// y días para tu objetivo); el boleto "Ahora te toca" con la lista de la sesión; y una fila de
// cuatro tarjetas (lo que viene después, la semana, el tiempo libre y Aksu).
// El plan junior completo y "cuánto dominas" viven en Progreso.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";
import { armarSesion } from "../../../server/sesion.js";
import { useEvento } from "../hooks/useEvento.js";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { SlidingNumber } from "../components/ui/sliding-number.jsx";
import { TiempoLibre } from "../components/TiempoLibre.jsx";
import { usePlan } from "../components/plan/Plan.jsx";
import { ESTADO_RUTA, useRuta } from "../components/Ruta.jsx";
import { FichaAksu } from "../aksu/Aksu.jsx";
import estilos from "./Hoy.module.css";

const RITMO = {
  empezando: { texto: "Recién empiezas" },
  "al-dia": { texto: "Vas al día" },
  atrasado: { texto: "Vas atrasado" },
  vencido: { texto: "La fecha ya pasó" },
  terminado: { texto: "Terminaste todo" },
};
const TIPO = { repaso: "Repaso", nuevo: "Nuevo", cierre: "Cierre" };
const LETRAS = ["L", "M", "M", "J", "V", "S", "D"];
const FILAS_SEMANA = 6; // la quinta fila (desde abajo) es la meta del día

const fecha = (iso, opciones) => {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-PE", opciones);
};
const dos = (n) => String(n).padStart(2, "0");

/** La app local no tiene lecciones ni inglés: su sesión son los repasos y el siguiente ejercicio. */
const sesionLocal = (inicio) =>
  armarSesion({
    meta: inicio.meta,
    repaso: { ejercicios: inicio.repasos },
    nuevo: { ejercicio: inicio.continuar ?? inicio.siguiente, continuar: !!inicio.continuar },
    conMotor: true,
    conDiario: false,
    // Aquí los puntos de hoy salen de ejercicios: con 25 o más ya resolviste al menos uno
    dia: { resueltos: (inicio.meta?.hecho ?? 0) >= 25 ? 1 : 0 },
  });

/** El estado del día en la línea de arriba: corto en pantalla, completo en title. */
function estadoDelDia(meta, ayer) {
  if (meta.pausa) return { corto: "Semana de exámenes", largo: "Semana de exámenes: hoy no suma deuda ni se rompe tu racha." };
  if (meta.cumplio) return { corto: "Meta cumplida", largo: "Meta de hoy cumplida. Lo que hagas de más adelanta mañana.", vivo: true };
  const falloAyer = ayer && !ayer.cumplio && ayer.estado !== "salvado";
  if (falloAyer)
    return {
      corto: `Ayer no cumpliste · hoy ${meta.objetivo} pts`,
      largo: `Ayer no cumpliste tu meta (${ayer.hecho} de ${ayer.meta} puntos). Hoy te tocan ${meta.objetivo}${meta.deuda > 0 ? `, con ${meta.deuda} de deuda` : ""}.`,
    };
  if (meta.deuda > 0) return { corto: `Deuda ${meta.deuda} · hoy ${meta.objetivo} pts`, largo: `Arrastras ${meta.deuda} puntos de deuda: hoy te tocan ${meta.objetivo}.` };
  return { corto: `Meta de hoy ${meta.objetivo} pts`, largo: `Tu meta de hoy: ${meta.objetivo} puntos. Llevas ${meta.hecho}.` };
}

/** El identificador real de lo que toca: el del ejercicio si el paso abre uno; si no, el del paso. */
const idDe = (paso) => (paso.a.match(/^\/practicar\/([^/?]+)/)?.[1] ?? paso.id).toUpperCase();

export function Hoy() {
  const [datos, setDatos] = useState(api.inicio.guardado);
  const [plan] = usePlan();
  const [sesion, setSesion] = useState(null);
  const [error, setError] = useState(null);
  const ruta = useRuta();

  const cargar = () => {
    api.inicio().then(
      (inicio) => {
        setDatos(inicio);
        if (!api.sesionDeHoy) setSesion(sesionLocal(inicio));
      },
      (e) => setError(e.message),
    );
    api.sesionDeHoy?.().then(setSesion, () => {});
  };
  useEffect(cargar, []);
  // Al resolver o repasar un ejercicio en VS Code, la pantalla se pone al día sola
  useEvento("resultado", (d) => {
    if (d.resueltoAhora || d.repasoCompletado) cargar();
  });

  if (error) return <p className={estilos.mensaje}>No se pudo cargar: {error}</p>;
  if (!datos) return <Esqueleto variante="tarjetas" />;

  const { config, meta, ayer, racha, ritmo, semana } = datos;
  const estado = estadoDelDia(meta, ayer);
  // Con la ruta (versión web), "vas al día" se mide por unidades; sin ella, con la regla de la app local
  const ritmoTexto = (ruta ? ESTADO_RUTA[ruta.estado] : RITMO[ritmo.estado])?.texto ?? "";
  const dias = semana.dias ?? [];
  const metaDia = meta.meta || config.metaDiaria * 25;
  const resumen = `Hoy sumaste ${meta.hecho} puntos${dias.length ? ` en ${dias.find((d) => d.fecha === datos.hoy)?.minutos ?? 0} min` : ""}. Racha: ${racha} ${racha === 1 ? "día" : "días"}.`;

  // Puntos: la regla mide hasta lo que sea mayor (lo hecho o el objetivo) y la marca señala el objetivo
  const escala = Math.max(meta.hecho, meta.objetivo, 1);
  const lleno = (meta.hecho / escala) * 100;
  const marca = (meta.objetivo / escala) * 100;
  const diasFaltan = String(Math.max(0, ritmo.diasRestantes));
  const pasos = sesion?.pasos ?? [];

  return (
    <section className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <p className={estilos.estado} title={estado.largo}>
            <span className={estilos.vivo} data-quieto={!estado.vivo} aria-hidden />
            <strong>{estado.corto}</strong>
            <span aria-hidden>/</span>
            <span>{fecha(datos.hoy, { weekday: "short", day: "numeric", month: "short" }).replace(/[.,]/g, "")}</span>
          </p>
          <h1 className={estilos.saludo}>
            {config.nombre ? `Hola, ${config.nombre}` : "Hola"}
            <span className={estilos.cursor} aria-hidden />
          </h1>
        </div>
        {datos.frase && <p className={estilos.frase}>{datos.frase}</p>}
      </header>

      <div className={estilos.neon} aria-hidden />

      {/* Franja de cuatro datos */}
      <section className={estilos.datos} aria-label="Tu día en cuatro datos">
        <div className={estilos.dato}>
          <p className={estilos.rotulo}>
            Sesión · {sesion ? `${sesion.hechos} de ${pasos.length}` : "..."}
          </p>
          <div className={estilos.perforaciones} aria-hidden>
            {pasos.map((p) => (
              <span key={p.id} data-estado={p.hecho ? "hecho" : p.id === sesion.siguiente?.id ? "ahora" : "falta"} title={p.titulo} />
            ))}
          </div>
          <p className={estilos.nota}>
            {!sesion
              ? "Armando tu sesión..."
              : sesion.completa || pasos.length === sesion.hechos
                ? "Sesión completa"
                : `Te ${pasos.length - sesion.hechos === 1 ? "falta 1 perforación" : `faltan ${pasos.length - sesion.hechos} perforaciones`}`}
          </p>
        </div>

        <div className={estilos.dato} title={!meta.cumplio && racha > 0 ? "Cumple tu meta de hoy para mantenerla" : undefined}>
          <p className={estilos.rotulo}>Racha</p>
          <p className={estilos.cifra}>
            <SlidingNumber number={racha} /> <small>{racha === 1 ? "día seguido" : "días seguidos"}</small>
          </p>
          <div className={estilos.pixeles} aria-hidden>
            {dias.map((d) => (
              <span key={d.fecha} data-encendido={d.hecho > 0} />
            ))}
          </div>
          <div className={estilos.letras} aria-hidden>
            {dias.map((d, i) => (
              <span key={d.fecha} data-hoy={d.fecha === datos.hoy}>
                {LETRAS[i]}
              </span>
            ))}
          </div>
        </div>

        <div className={estilos.dato} title={meta.deuda > 0 ? `${meta.meta} de meta + ${meta.deuda} de deuda` : "Tu meta de hoy"}>
          <p className={estilos.rotulo}>Puntos hoy</p>
          <p className={estilos.cifra}>
            <SlidingNumber number={meta.hecho} />
          </p>
          <div className={estilos.regla} role="img" aria-label={`Puntos de hoy: ${meta.hecho} de ${meta.objetivo}`}>
            <span className={estilos.reglaLlena} style={{ width: `${lleno}%` }} />
            <span className={estilos.reglaResto} />
            <i style={{ left: `${marca}%` }} />
          </div>
          <p className={estilos.marcaMeta} data-lado={marca > 70 ? "derecha" : "izquierda"} style={marca > 70 ? { paddingRight: `${100 - marca}%` } : { paddingLeft: `${marca}%` }}>
            ▲ Meta {meta.objetivo}
          </p>
        </div>

        <Link to="/progreso?pestana=ruta" className={estilos.dato} title={`Tu fecha meta: ${fecha(config.fechaMeta, { day: "numeric", month: "long", year: "numeric" })}. ${ritmoTexto}.`}>
          <p className={estilos.rotulo}>Faltan para tu objetivo</p>
          <div className={estilos.fichas}>
            {[...diasFaltan].map((c, i) => (
              <span key={i} className={estilos.ficha}>
                {c}
              </span>
            ))}
            <small>días</small>
          </div>
          <p className={estilos.nota}>{config.objetivo || "Escribe tu objetivo en Ajustes"}</p>
        </Link>
      </section>

      <Boleto sesion={sesion} resumen={resumen} />

      {/* Fila de cuatro tarjetas */}
      <div className={estilos.fila}>
        <Despues plan={plan} sugeridos={datos.sugeridos} desde={pasos.length} />

        <section className={estilos.tarjeta}>
          <header className={estilos.tarjetaCabeza}>
            <span>Esta semana</span>
            <strong>
              {semana.puntos ?? 0} pts · {semana.minutos} min
            </strong>
          </header>
          <div className={estilos.semana} role="img" aria-label={`Esta semana: ${dias.map((d, i) => `${LETRAS[i]} ${d.hecho} puntos`).join(", ")}`}>
            {Array.from({ length: FILAS_SEMANA }, (_, f) => {
              const fila = FILAS_SEMANA - f; // 6 arriba ... 1 abajo
              return (
                <div key={fila} className={estilos.semanaFila}>
                  {dias.map((d) => {
                    // 5 celdas = la meta del día; la sexta es pasarse de la meta
                    const llenas = d.hecho > 0 ? Math.max(1, Math.min(FILAS_SEMANA, Math.floor((d.hecho / metaDia) * 5))) : 0;
                    const estadoCelda = d.fecha > datos.hoy ? "futuro" : fila <= llenas ? (d.fecha === datos.hoy ? "hoy" : "hecho") : "vacio";
                    return <span key={d.fecha} data-estado={estadoCelda} />;
                  })}
                  <small>{fila === 5 ? "META" : ""}</small>
                </div>
              );
            })}
            <div className={`${estilos.semanaFila} ${estilos.semanaLetras}`}>
              {dias.map((d, i) => (
                <span key={d.fecha} data-hoy={d.fecha === datos.hoy}>
                  {LETRAS[i]}
                </span>
              ))}
              <small />
            </div>
          </div>
        </section>

        {datos.juego ? <TiempoLibre juego={datos.juego} meta={meta} salvados={datos.salvados} jefe={datos.jefe} /> : <section className={estilos.tarjeta} />}

        <FichaAksu nombre={config.nombre} />
      </div>
    </section>
  );
}

/** El boleto: a la izquierda lo que toca ahora, y a la derecha (tras la línea perforada) la sesión completa. */
function Boleto({ sesion, resumen }) {
  if (!sesion) return <div className={`${estilos.boleto} ${estilos.cargando}`} aria-busy="true" />;
  const { pasos, siguiente, hechos, minutos, completa, pausa } = sesion;
  const numero = siguiente ? pasos.findIndex((p) => p.id === siguiente.id) + 1 : pasos.length;
  const ultimo = siguiente && pasos.length - hechos === 1;

  return (
    <section className={estilos.boleto}>
      <span className={estilos.corredor} aria-hidden />
      <div className={estilos.ahora}>
        <p className={estilos.boletoCabeza}>
          <span>
            <span className={estilos.vivo} aria-hidden />
            {pausa ? "Semana de exámenes: sin presión" : siguiente ? "Ahora te toca" : "Tu sesión de hoy"}
          </span>
          {pasos.length > 0 && (
            <span>
              N.º {dos(numero)} / {dos(pasos.length)}
            </span>
          )}
        </p>
        <h2>{siguiente ? siguiente.titulo : completa ? "Sesión completa" : "Nada pendiente por ahora"}</h2>
        <p className={estilos.boletoTexto}>
          {siguiente
            ? ultimo
              ? "Es lo último que te falta para cerrar tu sesión de hoy."
              : `${hechos} de ${pasos.length} pasos listos. Te quedan unos ${minutos} min.`
            : completa
              ? `${resumen} Lo que sumes ahora adelanta mañana.`
              : "Elige un tema en Aprender o un ejercicio en Practicar."}
        </p>
        {siguiente && (
          <dl className={estilos.ficha3}>
            <div>
              <dt>Tipo</dt>
              <dd>{TIPO[siguiente.tipo] ?? "Paso"}</dd>
            </div>
            <div>
              <dt>Detalle</dt>
              <dd>{siguiente.detalle}</dd>
            </div>
            <div>
              <dt>Tiempo · puntos</dt>
              <dd>
                {siguiente.minutos} min{siguiente.puntos > 0 && ` · +${siguiente.puntos}`}
              </dd>
            </div>
          </dl>
        )}
        <div className={estilos.boletoPie}>
          {siguiente ? (
            <Link to={siguiente.a} className={`boton boton-primario ${estilos.continuar}`}>
              {hechos > 0 ? "Continuar" : "Empezar"} →
            </Link>
          ) : (
            <Link to="/practicar" className={`boton ${estilos.continuar}`}>
              Practicar más →
            </Link>
          )}
          {siguiente && (
            <div className={estilos.barras} aria-hidden>
              <span />
              <small>{idDe(siguiente)}</small>
            </div>
          )}
        </div>
      </div>

      <div className={estilos.perforado} aria-hidden>
        <span />
        <span />
      </div>

      <div className={estilos.sesion}>
        <p className={estilos.tarjetaCabeza}>
          <span>Tu sesión</span>
          <span>{siguiente ? `~${minutos} min restantes` : `${hechos} de ${pasos.length}`}</span>
        </p>
        {pasos.length === 0 && <p className={estilos.nota}>Todavía no hay pasos para hoy.</p>}
        <ol className={estilos.pasos}>
          {pasos.map((p, i) => (
            <li key={p.id} data-hecho={p.hecho} data-ahora={p.id === siguiente?.id}>
              <Link to={p.a} title={p.detalle}>
                <span className={estilos.num}>{dos(i + 1)}</span>
                <span className={estilos.pasoTitulo}>{p.titulo}</span>
                <span className={estilos.puntos} aria-hidden />
                <span className={estilos.valor}>{p.puntos > 0 ? `+${p.puntos}` : p.minutos > 0 ? `${p.minutos} min` : ""}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Lo que viene después de la sesión: las siguientes tareas de tu plan junior (o ejercicios sugeridos). */
function Despues({ plan, sugeridos = [], desde }) {
  const delPlan = plan?.activo ? plan.hoy.tareas.filter((t) => !t.hecha && t.destino).slice(0, 3) : [];
  const lista = delPlan.length
    ? delPlan.map((t) => ({ clave: t.clave, titulo: t.titulo, a: t.destino, valor: `${t.minutos} min` }))
    : (sugeridos ?? []).slice(0, 3).map((e) => ({ clave: e.id, titulo: e.titulo, a: `/practicar/${e.id}`, valor: "" }));
  return (
    <section className={`${estilos.tarjeta} ${estilos.vidrio}`}>
      <header className={estilos.tarjetaCabeza}>
        <span>Después</span>
        {plan !== null && <Link to="/plan">{plan?.activo ? "Plan completo →" : "Plan junior →"}</Link>}
      </header>
      {lista.length === 0 && <p className={estilos.nota}>{plan?.activo ? "Lo de hoy en tu plan ya está hecho." : "Nada más por ahora."}</p>}
      <ol className={`${estilos.pasos} ${estilos.pasosChicos}`}>
        {lista.map((t, i) => (
          <li key={t.clave}>
            <Link to={t.a}>
              <span className={estilos.num}>{dos(desde + i + 1)}</span>
              <span className={estilos.pasoTitulo}>{t.titulo}</span>
              <span className={estilos.puntos} aria-hidden />
              <span className={estilos.valor}>{t.valor}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
