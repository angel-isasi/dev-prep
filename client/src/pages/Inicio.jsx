import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../lib/api.js";
import { useEvento } from "../hooks/useEvento.js";
import { nombreTema } from "../lib/etiquetas.js";
import { Insignia } from "../components/Insignia.jsx";
import { NumeroAnimado } from "../components/NumeroAnimado.jsx";
import { AnilloProgreso } from "../components/AnilloProgreso.jsx";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { useColorTema } from "../hooks/useColorTema.js";
import { AnimatedGroup } from "../components/ui/animated-group.jsx";
import { AuroraText } from "../components/ui/aurora-text.jsx";
import { BorderBeam } from "../components/ui/border-beam.jsx";
import { LiquidButton } from "../components/ui/liquid-button.jsx";
import { MagicCard } from "../components/ui/magic-card.jsx";
import { Particles } from "../components/ui/particles.jsx";
import { SlidingNumber } from "../components/ui/sliding-number.jsx";
import { Spotlight } from "../components/ui/spotlight.jsx";
import { TextEffect } from "../components/ui/text-effect.jsx";
import estilos from "./Inicio.module.css";

const RITMO = {
  "al-dia": { texto: "Vas al día", tipo: "exito" },
  atrasado: { texto: "Vas atrasado", tipo: "error" },
  vencido: { texto: "La fecha ya pasó", tipo: "error" },
  terminado: { texto: "¡Terminaste todo!", tipo: "exito" },
};

function fechaLarga(fecha) {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
}

export function Inicio() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const navegar = useNavigate();
  const colorAcento = useColorTema("--acento");
  const colorAviso = useColorTema("--aviso");

  const cargar = () => api.inicio().then(setDatos, (e) => setError(e.message));
  useEffect(() => {
    cargar();
  }, []);
  useEvento("resultado", (d) => {
    if (d.resueltoAhora || d.repasoCompletado) cargar();
  });

  if (error) return <p className={estilos.mensaje}>No se pudo cargar: {error}</p>;
  if (!datos) return <Esqueleto variante="tarjetas" />;

  const { config, meta, ayer, racha, preparacion, ritmo, semana, totales, repasos, continuar, siguiente, frase } = datos;
  const ritmoInfo = RITMO[ritmo.estado];
  const proximo = continuar ?? siguiente;
  const pctMeta = meta.objetivo ? Math.min(100, (meta.hecho / meta.objetivo) * 100) : 100;

  return (
    <div className={estilos.escena}>
      {/* Fondo de Inicio: foco de luz (Aceternity) y partículas que siguen al mouse (Magic UI) */}
      <Spotlight />
      <Particles className={estilos.particulas} quantity={45} color={colorAcento} staticity={40} />

    <section className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <p className={estilos.fecha}>{fechaLarga(datos.hoy)}</p>
        <h1 className={estilos.saludo}>
          {config.nombre ? (
            <>
              Hola, <AuroraText>{config.nombre}</AuroraText>
            </>
          ) : (
            <AuroraText>Hola</AuroraText>
          )}
        </h1>
        <TextEffect as="p" preset="fade-in-blur" per="word" delay={0.25} speedReveal={1.2} className={estilos.frase}>
          {frase}
        </TextEffect>
      </header>

      {config.objetivo ? (
        <blockquote className={estilos.objetivo}>
          <span>Tu objetivo</span>
          {config.objetivo}
        </blockquote>
      ) : (
        <Link to="/ajustes" className={estilos.objetivoVacio}>
          Escribe tu objetivo personal en Ajustes: tenerlo a la vista ayuda más de lo que crees →
        </Link>
      )}

      {meta.cumplio ? (
        <p className={estilos.aviso} data-tipo="exito">
          Meta de hoy cumplida. Si te quedan ganas, un repaso más nunca sobra.
        </p>
      ) : ayer && !ayer.cumplio ? (
        <p className={estilos.aviso} data-tipo="error">
          Ayer no cumpliste tu meta ({ayer.hecho} de {config.metaDiaria}). Hoy te toca {meta.objetivo}
          {meta.deuda > 0 && `, incluida una deuda de ${meta.deuda}`}.
        </p>
      ) : null}

      <AnimatedGroup preset="blur-slide" stagger={0.08} className={estilos.tarjetas} itemClassName={estilos.celda}>
        <MagicCard className={estilos.tarjeta} gradientFrom="var(--aviso)" gradientTo="var(--error)" gradientColor="var(--aviso-suave)">
          {/* Chispas que suben: más chispas cuanto más larga la racha */}
          <Particles className={estilos.chispas} quantity={Math.min(14 + racha * 3, 50)} color={colorAviso} vy={-0.35} size={0.6} staticity={80} />
          <div className={`${estilos.contenido} ${estilos.racha}`}>
          <span className={estilos.etiqueta}>Racha</span>
          <strong className={estilos.numeroGrande}>
            <SlidingNumber number={racha} />
          </strong>
          <span className={estilos.detalle}>
            {racha === 1 ? "día seguido" : "días seguidos"}
            {!meta.cumplio && racha > 0 && " · cumple hoy para mantenerla"}
          </span>
          </div>
        </MagicCard>

        <MagicCard className={estilos.tarjeta}>
          <div className={`${estilos.contenido} ${estilos.conAnillo}`}>
          <AnilloProgreso valor={pctMeta / 100} completo={meta.cumplio} tamano={70} grosor={7}>
            <strong className={estilos.numeroAnillo}>
              <NumeroAnimado valor={meta.hecho} />
              <small>/{meta.objetivo}</small>
            </strong>
          </AnilloProgreso>
          <div className={estilos.textoAnillo}>
            <span className={estilos.etiqueta}>Meta de hoy</span>
            <span className={estilos.detalle}>
              {meta.cumplio
                ? "¡Cumplida!"
                : meta.deuda > 0
                  ? `${config.metaDiaria} de meta + ${meta.deuda} de deuda`
                  : "resueltos + repasos"}
            </span>
          </div>
          </div>
        </MagicCard>

        <MagicCard className={estilos.tarjeta}>
          <div className={`${estilos.contenido} ${estilos.conAnillo}`}>
          <AnilloProgreso valor={preparacion / 100} tamano={70} grosor={7}>
            <strong className={estilos.numeroAnillo}>
              <NumeroAnimado valor={preparacion} decimales={preparacion % 1 ? 1 : 0} />
              <small>%</small>
            </strong>
          </AnilloProgreso>
          <div className={estilos.textoAnillo}>
            <span className={estilos.etiqueta}>Preparación</span>
            <span className={estilos.detalle}>
              {totales.resueltos} de {totales.total} dominados
            </span>
          </div>
          </div>
        </MagicCard>

        <MagicCard className={estilos.tarjeta}>
          <div className={estilos.contenido}>
          <span className={estilos.etiqueta}>Fecha meta</span>
          <strong className={estilos.numero}>
            <SlidingNumber number={Math.max(0, ritmo.diasRestantes)} />
            <small> días</small>
          </strong>
          <span className={estilos.chip} data-tipo={ritmoInfo.tipo}>
            {ritmoInfo.texto}
          </span>
          <span className={estilos.detalle}>
            Necesitas {ritmo.necesarioPorDia}/día · llevas {ritmo.promedioSemana}/día
          </span>
          </div>
        </MagicCard>
      </AnimatedGroup>

      <div className={estilos.columnas}>
        <div className={estilos.bloque}>
          <h2>Para hoy</h2>
          {proximo ? (
            <div className={estilos.siguiente}>
              <BorderBeam size={90} duration={7} />
              <div className={estilos.siguienteTexto}>
                <span className={estilos.etiqueta}>{continuar ? "Continuar" : "Siguiente ejercicio"}</span>
                <Link to={`/practicar/${proximo.id}`} className={estilos.siguienteTitulo}>
                  {proximo.titulo}
                </Link>
                <span className={estilos.detalle}>
                  {nombreTema(proximo.tema)} · <Insignia nivel={proximo.nivel} />
                </span>
              </div>
              <LiquidButton onClick={() => navegar(`/practicar/${proximo.id}`)}>
                {continuar ? "Continuar" : "Empezar"} →
              </LiquidButton>
            </div>
          ) : (
            <p className={estilos.vacio}>No quedan ejercicios pendientes. ¡Enorme!</p>
          )}

          <h3>Repasos de hoy {repasos.length > 0 && <span className={estilos.contador}>{repasos.length}</span>}</h3>
          {repasos.length === 0 ? (
            <p className={estilos.vacio}>Nada para repasar hoy.</p>
          ) : (
            <ul className={estilos.lista}>
              {repasos.map((r) => (
                <li key={r.id}>
                  <Link to={`/practicar/${r.id}`}>
                    {r.titulo}
                    <span className={estilos.detalle}>{nombreTema(r.tema)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={estilos.bloque}>
          <h2>Esta semana</h2>
          <dl className={estilos.semana}>
            <div>
              <dt>Resueltos</dt>
              <dd>
                <SlidingNumber number={semana.resueltos} />
              </dd>
            </div>
            <div>
              <dt>Repasos</dt>
              <dd>
                <SlidingNumber number={semana.repasos} />
              </dd>
            </div>
            <div>
              <dt>Minutos</dt>
              <dd>
                <SlidingNumber number={semana.minutos} />
              </dd>
            </div>
            <div>
              <dt>Preparación</dt>
              <dd>
                {semana.subioPreparacion >= 0 ? "+" : ""}
                {semana.subioPreparacion}%
              </dd>
            </div>
          </dl>
          <Link to="/progreso" className={estilos.verMas}>
            Ver todo tu progreso →
          </Link>
        </div>
      </div>
    </section>
    </div>
  );
}
