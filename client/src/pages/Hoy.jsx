// Hoy: la pantalla de entrada, la misma en la laptop, la web y el celular.
// Una sola cosa manda: tu sesión de hoy, con un único botón para seguir. Alrededor, cuatro
// números (puntos, racha, tiempo libre y fecha meta) y la semana. Todo lo demás vive en Progreso.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";
import { armarSesion } from "../../../server/sesion.js";
import { useEvento } from "../hooks/useEvento.js";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { AuroraText } from "../components/ui/aurora-text.jsx";
import { SlidingNumber } from "../components/ui/sliding-number.jsx";
import SloshGauge from "../components/reactbits/SloshGauge.jsx";
import SplitFlapText from "../components/reactbits/SplitFlapText.jsx";
import { useColorTema, usePorTema } from "../hooks/useColorTema.js";
import { GraficoSemana } from "../components/GraficoSemana.jsx";
import { Llama } from "../components/Llama.jsx";
import { TiempoLibre } from "../components/TiempoLibre.jsx";
import { AvisoMapache } from "../movil/mapache/TarjetaMapache.jsx";
import { ESTADO_RUTA, useRuta } from "../components/Ruta.jsx";
import estilos from "./Hoy.module.css";

const RITMO = {
  empezando: { texto: "Recién empiezas", tono: "acento" },
  "al-dia": { texto: "Vas al día", tono: "exito" },
  atrasado: { texto: "Vas atrasado", tono: "error" },
  vencido: { texto: "La fecha ya pasó", tono: "error" },
  terminado: { texto: "¡Terminaste todo!", tono: "exito" },
};

const fecha = (iso, opciones) => {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-PE", opciones);
};

/** La app local no tiene lecciones ni inglés: su sesión son los repasos y el siguiente ejercicio. */
const sesionLocal = (inicio) =>
  armarSesion({
    meta: inicio.meta,
    repaso: { ejercicios: inicio.repasos },
    nuevo: { ejercicio: inicio.continuar ?? inicio.siguiente, continuar: !!inicio.continuar },
    conMotor: true,
  });

export function Hoy() {
  const [datos, setDatos] = useState(api.inicio.guardado);
  const [sesion, setSesion] = useState(null);
  const [error, setError] = useState(null);
  const ruta = useRuta();
  // Colores del tema para el tanque y el tablero de fichas (se dibujan en canvas)
  const colorAcento = useColorTema("--acento");
  const colorExito = useColorTema("--exito");
  const colorTexto = useColorTema("--texto");
  const tema = usePorTema({ oscuro: { vidrio: "#23212d", ficha: "#17161d" }, claro: { vidrio: "#ebe9f1", ficha: "#ffffff" } });

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
  // Con la ruta (versión web), "vas al día" se mide por unidades; sin ella, con la regla de la app local
  const ritmoInfo = ruta ? ESTADO_RUTA[ruta.estado] : RITMO[ritmo.estado];
  const estaSemana = ruta?.estaSemana ?? [];
  const falloAyer = ayer && !ayer.cumplio && ayer.estado !== "salvado" && !meta.cumplio;

  return (
    <section className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <p className={estilos.fecha}>{fecha(datos.hoy, { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className={estilos.saludo}>
            {config.nombre ? (
              <>
                Hola, <AuroraText>{config.nombre}</AuroraText>
              </>
            ) : (
              <AuroraText>Hola</AuroraText>
            )}
          </h1>
        </div>
        {/* Tu objetivo, escrito por ti: siempre a la vista, sin ocupar una tarjeta */}
        {config.objetivo ? (
          <blockquote className={estilos.objetivo}>
            <span className="etiqueta">Tu objetivo</span>
            {config.objetivo}
          </blockquote>
        ) : (
          <Link to="/ajustes" className={estilos.objetivo}>
            Escribe tu objetivo en Ajustes: tenerlo a la vista ayuda más de lo que crees →
          </Link>
        )}
      </header>

      {/* Avisos: como mucho una línea de presión y, si hace falta, la del mapache */}
      {meta.pausa ? (
        <p className={estilos.aviso} data-tono="acento">
          Semana de exámenes: hoy no suma deuda ni se rompe tu racha.
        </p>
      ) : meta.cumplio ? (
        <p className={estilos.aviso} data-tono="exito">
          Meta de hoy cumplida. Lo que hagas de más adelanta mañana.
        </p>
      ) : falloAyer ? (
        <p className={estilos.aviso} data-tono="error">
          Ayer no cumpliste tu meta ({ayer.hecho} de {ayer.meta} puntos). Hoy te tocan {meta.objetivo}
          {meta.deuda > 0 && `, con ${meta.deuda} de deuda`}.
        </p>
      ) : meta.deuda > 0 ? (
        <p className={estilos.aviso} data-tono="aviso">
          Arrastras {meta.deuda} puntos de deuda: hoy te tocan {meta.objetivo}.
        </p>
      ) : null}
      <AvisoMapache />

      <div className={estilos.principal}>
        <Sesion sesion={sesion} frase={datos.frase} />

        <div className={estilos.numeros}>
          {/* Puntos de hoy: el tanque se llena hacia el objetivo (meta más deuda); cada marca son 25 puntos */}
          <div className={`tarjeta ${estilos.numero} ${estilos.puntos}`}>
            <SloshGauge
              className={estilos.tanque}
              value={meta.objetivo ? Math.min(100, (meta.hecho / meta.objetivo) * 100) : 100}
              showValue={false}
              liquidColor={meta.cumplio ? colorExito : colorAcento}
              glassColor={tema.vidrio}
              width={44}
              height={92}
              radius={12}
              ticks={Math.max(0, Math.round(meta.objetivo / 25) - 1)}
              ariaLabel={`Puntos de hoy: ${meta.hecho} de ${meta.objetivo}`}
            />
            <div>
              <span className="etiqueta">Puntos de hoy</span>
              <strong className={estilos.cifra}>
                <SlidingNumber number={meta.hecho} />
                <small> / {meta.objetivo}</small>
              </strong>
              <span className={estilos.detalle}>{meta.cumplio ? "¡Cumplida!" : meta.deuda > 0 ? `${meta.meta} de meta + ${meta.deuda} de deuda` : "Tu meta de hoy"}</span>
            </div>
          </div>

          <div className={`tarjeta ${estilos.numero}`} data-encendida={racha > 0}>
            <span className="etiqueta">
              <Llama encendida={racha > 0} tamano={16} /> Racha
            </span>
            <strong className={estilos.cifra} data-tono={racha > 0 ? "aviso" : undefined}>
              <SlidingNumber number={racha} />
            </strong>
            <span className={estilos.detalle}>
              {racha === 1 ? "día seguido" : "días seguidos"}
              {!meta.cumplio && racha > 0 && " · cumple hoy para mantenerla"}
            </span>
          </div>

          <Link to="/progreso#ruta" className={`tarjeta ${estilos.numero}`}>
            <span className="etiqueta">Faltan para tu meta</span>
            {/* Los días que faltan, en un tablero de fichas */}
            <span className={estilos.tablero}>
              <SplitFlapText
                text={String(Math.max(0, ritmo.diasRestantes))}
                loop={false}
                padTo={String(Math.max(0, ritmo.diasRestantes)).length}
                charset="numeric"
                fontSize={30}
                tileColor={tema.ficha}
                textColor={colorTexto}
                tileRadius={5}
                gap={3}
                flipsPerChar={10}
                glare={0.25}
              />
              <small>días</small>
            </span>
            <span className={estilos.detalle}>
              <span className="chip" data-tono={ritmoInfo.tono}>
                {ritmoInfo.texto}
              </span>{" "}
              {fecha(config.fechaMeta, { day: "numeric", month: "short", year: "numeric" })}
            </span>
            {estaSemana.length > 0 && (
              <span className={estilos.detalle}>
                Esta semana: {estaSemana.slice(0, 2).map((u) => u.titulo).join(", ")}
                {estaSemana.length > 2 && ` y ${estaSemana.length - 2} más`}
              </span>
            )}
          </Link>

          <Link to="/progreso" className={`tarjeta ${estilos.numero}`}>
            <span className="etiqueta">Cuánto dominas</span>
            <strong className={estilos.cifra}>
              {ruta ? ruta.dominio : datos.preparacion}
              <small> %</small>
            </strong>
            <span className={estilos.detalle}>{ruta ? `${ruta.listas} de ${ruta.total} unidades listas` : "Lo que dominas de verdad"} · ver progreso →</span>
          </Link>
        </div>
      </div>

      <div className={estilos.abajo}>
        {datos.juego && <TiempoLibre juego={datos.juego} meta={meta} salvados={datos.salvados} jefe={datos.jefe} />}

        <div className={`tarjeta ${estilos.semana}`}>
          <div className={estilos.semanaCabeza}>
            <h2>Esta semana</h2>
            <span className={estilos.detalle}>
              {semana.puntos ?? 0} puntos · {semana.minutos} min
            </span>
          </div>
          {semana.dias && <GraficoSemana dias={semana.dias} meta={meta.meta || config.metaDiaria * 25} hoy={datos.hoy} />}
        </div>
      </div>
    </section>
  );
}

/** El bloque protagonista: qué sigue, cuánto falta y la lista completa de la sesión. */
function Sesion({ sesion, frase }) {
  if (!sesion) return <div className={`tarjeta-protagonista ${estilos.sesion} ${estilos.cargando}`} aria-busy="true" />;
  const { pasos, siguiente, hechos, minutos, completa, pausa } = sesion;
  const empezo = hechos > 0;

  return (
    <article className={`tarjeta-protagonista ${estilos.sesion}`}>
      <div className={estilos.sesionCabeza}>
        <div className={estilos.sesionTexto}>
          <span className="etiqueta">{pausa ? "Semana de exámenes: sin presión" : "Tu sesión de hoy"}</span>
          <h2>{siguiente ? siguiente.titulo : completa ? "Sesión completa" : "Nada pendiente por ahora"}</h2>
          <p>
            {siguiente
              ? `${hechos} de ${pasos.length} pasos listos · te quedan unos ${minutos} min`
              : completa
                ? "Hiciste todo lo de hoy. Lo que sumes ahora adelanta mañana."
                : "Elige un tema en Aprender o un ejercicio en Practicar."}
          </p>
        </div>
        {siguiente ? (
          <Link to={siguiente.a} className={`boton boton-primario ${estilos.empezar}`}>
            {empezo ? "Continuar" : "Empezar"} →
          </Link>
        ) : (
          <Link to="/practicar" className={`boton ${estilos.empezar}`}>
            Practicar más →
          </Link>
        )}
      </div>

      {pasos.length > 0 && (
        <ol className={estilos.pasos}>
          {pasos.map((p) => (
            <li key={p.id} data-hecho={p.hecho} data-siguiente={p.id === siguiente?.id}>
              <Link to={p.a}>
                <span className={estilos.check} aria-hidden>
                  {p.hecho ? "✓" : ""}
                </span>
                <span className={estilos.pasoTexto}>
                  <strong>{p.titulo}</strong>
                  <small>{p.detalle}</small>
                </span>
                <span className={estilos.pasoValor}>
                  {p.puntos > 0 && <strong>+{p.puntos}</strong>}
                  {!p.hecho && p.minutos > 0 && <small>{p.minutos} min</small>}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {frase && <p className={estilos.frase}>{frase}</p>}
    </article>
  );
}
