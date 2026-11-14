import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../lib/api.js";
import { useEvento } from "../hooks/useEvento.js";
import { nombreTema } from "../lib/etiquetas.js";
import { Insignia } from "../components/Insignia.jsx";
import { NumeroAnimado } from "../components/NumeroAnimado.jsx";
import { AnilloProgreso } from "../components/AnilloProgreso.jsx";
import "../components/reactbits/DotGrid.css";
import "../components/reactbits/ElectricBorder.css";
import "../components/reactbits/SloshGauge.css";
import "../components/reactbits/SplitFlapText.css";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { useColorTema, usePorTema } from "../hooks/useColorTema.js";
import { AnimatedGroup } from "../components/ui/animated-group.jsx";
import { AuroraText } from "../components/ui/aurora-text.jsx";
import { BorderBeam } from "../components/ui/border-beam.jsx";
import { LiquidButton } from "../components/ui/liquid-button.jsx";
import { MagicCard } from "../components/ui/magic-card.jsx";
import { Particles } from "../components/ui/particles.jsx";
import { SlidingNumber } from "../components/ui/sliding-number.jsx";
import { AnimatedShinyText } from "../components/ui/animated-shiny-text.jsx";
import { CardBody, CardContainer, CardItem } from "../components/ui/card-3d.jsx";
import { ShineBorder } from "../components/ui/shine-border.jsx";
import { GraficoSemana } from "../components/GraficoSemana.jsx";
import DecryptedText from "../components/reactbits/DecryptedText.jsx";
import DotGrid from "../components/reactbits/DotGrid.jsx";
import ElectricBorder from "../components/reactbits/ElectricBorder.jsx";
import SloshGauge from "../components/reactbits/SloshGauge.jsx";
import SplitFlapText from "../components/reactbits/SplitFlapText.jsx";
import estilos from "./Inicio.module.css";

const RITMO = {
  empezando: { texto: "Recién empiezas", tipo: "neutro" },
  "al-dia": { texto: "Vas al día", tipo: "exito" },
  atrasado: { texto: "Vas atrasado", tipo: "error" },
  vencido: { texto: "La fecha ya pasó", tipo: "error" },
  terminado: { texto: "¡Terminaste todo!", tipo: "exito" },
};

function fechaCorta(fecha) {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
}

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
  const colorError = useColorTema("--error");
  const colorExito = useColorTema("--exito");
  const colorTexto = useColorTema("--texto");
  const tema = usePorTema({
    oscuro: { punto: "#1b1a22", vidrio: "#23212d", ficha: "#17161d" },
    claro: { punto: "#e3e1ea", vidrio: "#ebe9f1", ficha: "#ffffff" },
  });

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
      {/* Fondo de Inicio: rejilla de puntos que el mouse empuja; un clic manda una onda (React Bits) */}
      <DotGrid
        className={estilos.puntos}
        dotSize={3}
        gap={22}
        baseColor={tema.punto}
        activeColor={colorAcento}
        proximity={110}
        shockRadius={220}
        shockStrength={3}
        glow={0.15}
        fade={0.6}
        opacity={0.7}
      />

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
        <p className={estilos.frase}>
          <DecryptedText
            text={frase}
            animateOn="view"
            sequential
            revealDirection="start"
            speed={22}
            characters="abcdefghijklmnopqrstuvwxyz{}[]()<>=/;:.$_"
            encryptedClassName={estilos.cifrado}
          />
        </p>
      </header>

      {config.objetivo ? (
        <blockquote className={estilos.objetivo}>
          <span>Tu objetivo</span>
          {config.objetivo}
        </blockquote>
      ) : (
        <Link to="/ajustes" className={estilos.objetivoVacio}>
          <AnimatedShinyText>Escribe tu objetivo personal en Ajustes: tenerlo a la vista ayuda más de lo que crees →</AnimatedShinyText>
        </Link>
      )}

      {meta.cumplio ? (
        <p className={estilos.aviso} data-tipo="exito">
          <ShineBorder shineColor={["var(--exito)", "var(--acento)"]} duration={10} />
          Meta de hoy cumplida. Si te quedan ganas, un repaso más nunca sobra.
        </p>
      ) : ayer && !ayer.cumplio ? (
        <ElectricBorder
          className={estilos.electrico}
          color={colorError}
          borderRadius={8}
          thickness={0.9}
          strands={1}
          chaos={0.18}
          speed={0.6}
          glow={0.15}
          intensity={0.45}
          flicker={0.15}
          arcs={0}
          cursorRadius={70}
        >
          <p className={estilos.aviso} data-tipo="error">
            <span className={estilos.alerta} aria-hidden />
            Ayer no cumpliste tu meta ({ayer.hecho} de {config.metaDiaria}). Hoy te toca {meta.objetivo}
            {meta.deuda > 0 && `, incluida una deuda de ${meta.deuda}`}.
          </p>
        </ElectricBorder>
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
          <SloshGauge
            className={estilos.tanque}
            value={pctMeta}
            showValue={false}
            liquidColor={meta.cumplio ? colorExito : colorAcento}
            glassColor={tema.vidrio}
            width={40}
            height={84}
            radius={12}
            ticks={meta.objetivo > 1 ? meta.objetivo - 1 : 0}
            ariaLabel={`Meta de hoy: ${meta.hecho} de ${meta.objetivo}`}
          />
          <div className={estilos.textoAnillo}>
            <span className={estilos.etiqueta}>Meta de hoy</span>
            <strong className={estilos.numeroAnillo}>
              <NumeroAnimado valor={meta.hecho} />
              <small> / {meta.objetivo}</small>
            </strong>
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
          <span className={estilos.etiqueta}>Faltan para tu meta</span>
          <div className={estilos.tablero}>
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
          </div>
          <span className={estilos.chip} data-tipo={ritmoInfo.tipo}>
            {ritmoInfo.tipo === "error" && <span className={estilos.ping} aria-hidden />}
            {ritmoInfo.texto}
          </span>
          <span className={estilos.detalle}>
            {ritmo.estado === "empezando"
              ? `Meta: ${fechaCorta(config.fechaMeta)}. Necesitas ${ritmo.necesarioPorDia} ejercicios al día`
              : `Meta: ${fechaCorta(config.fechaMeta)}. Necesitas ${ritmo.necesarioPorDia}/día y llevas ${ritmo.promedioSemana}/día`}
          </span>
          </div>
        </MagicCard>
      </AnimatedGroup>

      <div className={estilos.columnas}>
        <div className={estilos.bloque}>
          <h2>Para hoy</h2>
          {proximo ? (
            <CardContainer intensidad={28}>
              <CardBody className={estilos.siguiente}>
                <BorderBeam size={90} duration={7} />
                <div className={estilos.siguienteTexto}>
                  <CardItem as="span" translateZ={20} className={estilos.etiqueta}>
                    {continuar ? "Continuar" : "Siguiente ejercicio"}
                  </CardItem>
                  <CardItem translateZ={45}>
                    <Link to={`/practicar/${proximo.id}`} className={estilos.siguienteTitulo}>
                      {proximo.titulo}
                    </Link>
                  </CardItem>
                  <CardItem as="span" translateZ={30} className={estilos.detalle}>
                    {nombreTema(proximo.tema)} · <Insignia nivel={proximo.nivel} />
                  </CardItem>
                </div>
                <CardItem translateZ={60}>
                  <LiquidButton onClick={() => navegar(`/practicar/${proximo.id}`)}>
                    {continuar ? "Continuar" : "Empezar"} →
                  </LiquidButton>
                </CardItem>
              </CardBody>
            </CardContainer>
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
          {semana.dias && <GraficoSemana dias={semana.dias} meta={config.metaDiaria} hoy={datos.hoy} />}
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
