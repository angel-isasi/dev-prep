// El temario de inglés: las 6 etapas (de A1 a C2) como pestañas y, en la etapa elegida, sus unidades
// en una rejilla de fichas. Al tocar una ficha se ve su detalle (qué aprendes, cuánto llevas y qué
// hacer): al costado en pantallas anchas y debajo de la ficha en el celular.
// Reemplaza al camino de círculos: todo el curso se ve de un vistazo y nada se bloquea.
// Los datos (etapas, avance y estado de cada unidad) los arma temario.js.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { celebrar } from "../../lib/celebrar.js";
import { usePantallaGrande } from "../../hooks/usePantallaGrande.js";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import { IconoEstrella, IconoRegalo } from "../../components/Iconos.jsx";
import { armarTemario, ventanaDeUnidades } from "./temario.js";
import estilos from "./Temario.module.css";

/** @param {{ alCambiar?: () => void, examenPendiente?: boolean }} props */
export function Temario({ alCambiar, examenPendiente = false }) {
  const [datos, setDatos] = useState(null);
  const [etapa, setEtapa] = useState(null); // la que elegiste a mano; si no, la de tu unidad actual
  const [elegida, setElegida] = useState(null); // unidad con el detalle abierto
  const [cofre, setCofre] = useState(null); // premio del cofre recién abierto
  const [todas, setTodas] = useState(false); // celular: ver la etapa completa
  const grande = usePantallaGrande();

  const cargar = () => api.lecciones("ingles").then(setDatos);
  useEffect(() => {
    cargar();
  }, []);

  if (!datos) return <Esqueleto variante="lista" />;

  const { etapas, actual } = armarTemario(datos);
  if (!etapas.length) return null;
  const etapaActual = etapas.find((e) => e.unidades.some((u) => u.actual)) ?? etapas[0];
  const visible = etapas.find((e) => e.id === etapa) ?? etapaActual;
  // En pantalla ancha siempre hay una unidad a la vista (la actual, o la primera de la etapa)
  const porDefecto = visible.unidades.find((u) => u.actual) ?? visible.unidades.find((u) => !u.hecha) ?? visible.unidades[0];
  const abierta = visible.unidades.find((u) => u.id === elegida) ?? (grande ? porDefecto : null);

  // En el celular la etapa completa mide más de mil píxeles: se ven las unidades alrededor de donde vas
  const ventana = ventanaDeUnidades(visible.unidades.length, visible.unidades.indexOf(porDefecto));
  const corta = !grande && !todas && ventana.hasta - ventana.desde < visible.unidades.length;
  const aLaVista = corta ? visible.unidades.slice(ventana.desde, ventana.hasta) : visible.unidades;

  async function abrirCofre(id) {
    const premio = await api.abrirCofreUnidad(id);
    celebrar("logro");
    setCofre({ ...premio, unidad: id });
    await cargar();
    alCambiar?.();
  }

  async function hacerActual(id) {
    await api.elegirUnidadIngles(id);
    await cargar();
  }

  const detalle = abierta && (
    <DetalleUnidad
      u={abierta}
      cofre={cofre?.unidad === abierta.id ? cofre : null}
      alCofre={() => abrirCofre(abierta.id)}
      alHacerActual={() => hacerActual(abierta.id)}
    />
  );

  return (
    <section className={estilos.temario} aria-labelledby="temario-titulo">
      <header className={estilos.cabecera}>
        <div>
          <h2 id="temario-titulo">Temario</h2>
          <small>
            {datos.unidades.length} unidades, de A1 a C2. Vas en la {actual.numero}: {actual.titulo}.
          </small>
        </div>
        {examenPendiente && (
          <Link to="/ingles/examen" className="boton" title="Se adapta a ti (de A1 a C2) y marca como hechas las unidades que ya dominas.">
            ¿Ya sabes inglés? Examen de nivel
          </Link>
        )}
      </header>

      {/* Las etapas son a la vez el mapa de niveles y las pestañas del temario */}
      <div className={estilos.etapas} role="tablist" aria-label="Etapas del curso">
        {etapas.map((e) => (
          <button
            key={e.id}
            type="button"
            role="tab"
            aria-selected={e.id === visible.id}
            className={estilos.etapa}
            data-aqui={e.id === etapaActual.id}
            data-completa={e.hechas === e.unidades.length}
            onClick={() => {
              setEtapa(e.id);
              setElegida(null);
              setTodas(false);
            }}
          >
            <span className={estilos.etapaNivel}>{e.nivel}</span>
            <strong>{e.titulo}</strong>
            <span className={estilos.etapaCuenta}>
              {e.hechas}/{e.unidades.length}
              {e.id === etapaActual.id && <em>aquí vas</em>}
            </span>
            <span className={estilos.barra} aria-hidden>
              <i style={{ width: `${(e.hechas / e.unidades.length) * 100}%` }} />
            </span>
          </button>
        ))}
      </div>

      <div className={estilos.cuerpo}>
        <ol className={estilos.unidades}>
          {aLaVista.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                className={estilos.unidad}
                data-estado={u.estado}
                data-abierta={abierta?.id === u.id}
                aria-expanded={abierta?.id === u.id}
                onClick={() => setElegida(!grande && elegida === u.id ? null : u.id)}
              >
                <span className={estilos.numero}>
                  {u.legendaria ? <IconoEstrella tamano={18} llena /> : u.hecha ? "✓" : String(u.numero).padStart(2, "0")}
                </span>
                <span className={estilos.unidadTexto}>
                  <strong>{u.titulo}</strong>
                  <span className={estilos.unidadMeta}>
                    {u.nivel}
                    {u.actual && <em>Aquí vas</em>}
                  </span>
                </span>
                <span className={estilos.niveles} aria-label={`Nivel ${u.hecha ? 5 : u.avance.nivel} de 5`}>
                  {[0, 1, 2, 3, 4].map((n) => (
                    <i key={n} data-lleno={u.hecha || n < u.avance.nivel} />
                  ))}
                </span>
              </button>
              {/* En el celular el detalle se abre debajo de la ficha que tocaste */}
              {!grande && abierta?.id === u.id && detalle}
            </li>
          ))}
        </ol>
        {corta && (
          <button type="button" className={`boton ${estilos.verTodas}`} onClick={() => setTodas(true)}>
            Ver las {visible.unidades.length} unidades de esta etapa
          </button>
        )}
        {grande && <aside className={estilos.lado}>{detalle}</aside>}
      </div>
    </section>
  );
}

const ESTADOS = { hecha: "Hecha", actual: "Aquí vas", empezada: "Empezada", pendiente: "Sin empezar" };

function DetalleUnidad({ u, cofre, alCofre, alHacerActual }) {
  const av = u.avance;
  const leccion = (extra = "") => `/leccion?unidad=${encodeURIComponent(u.id)}&ambito=ingles${extra}`;
  return (
    <div className={estilos.detalle} data-estado={u.estado}>
      <p className={estilos.detalleMeta}>
        <span>
          Unidad {u.numero} · {u.nivel}
        </span>
        <span className={estilos.chipEstado} data-estado={u.estado}>
          {u.legendaria ? "Legendaria" : ESTADOS[u.estado]}
        </span>
      </p>
      <h3>{u.titulo}</h3>
      {u.descripcion && <p className={estilos.descripcion}>{u.descripcion}</p>}
      {u.aprobada && <p className={estilos.nota}>Aprobada en el examen de nivel. Puedes repasarla cuando quieras.</p>}

      <div className={estilos.medidas}>
        <div title="Los que ya respondiste bien">
          <span>
            Aprendidos <strong>{av.aprendidos}</strong> de {av.total}
          </span>
          <span className={estilos.barra} aria-hidden>
            <i style={{ width: `${av.porcentaje * 100}%` }} />
          </span>
        </div>
        <div title="Los que recordaste días después">
          <span>
            Fijados <strong>{av.fijados}</strong> de {av.total}
          </span>
          <span className={estilos.barra} data-tipo="fijados" aria-hidden>
            <i style={{ width: `${av.porcentajeFijados * 100}%` }} />
          </span>
        </div>
      </div>
      {av.leccionesFaltan > 0 && (
        <p className={estilos.nota}>
          Te faltan unas {av.leccionesFaltan} {av.leccionesFaltan === 1 ? "lección" : "lecciones"} para verla completa.
        </p>
      )}

      {cofre && (
        <div className={estilos.premio}>
          <strong>
            <IconoRegalo tamano={16} /> +{cofre.xp} XP{cofre.yaAbierto ? " (ya lo habías abierto)" : ""}
          </strong>
          {cofre.frase && (
            <p>
              Frase para el trabajo: <em lang="en">{cofre.frase.en}</em>
              <br />
              <small data-sin-inmersion>{cofre.frase.es}</small>
            </p>
          )}
        </div>
      )}

      <div className={estilos.acciones}>
        <Link to={leccion()} className="boton boton-primario" onClick={() => api.elegirUnidadIngles(u.id)}>
          {av.vistos > 0 ? "Seguir la lección" : "Empezar la lección"}
        </Link>
        {u.conTeoria && (
          <Link to={`/ingles/unidad/${u.id}`} className="boton">
            Teoría y palabras
          </Link>
        )}
        {!u.hecha && (
          <Link to={leccion("&modo=prueba")} className="boton" title="12 preguntas de toda la unidad. Con 10 bien, la unidad queda hecha y pasas a la siguiente." onClick={() => api.elegirUnidadIngles(u.id)}>
            Ya me la sé: saltar con prueba
          </Link>
        )}
        {av.completa && !u.cofreAbierto && (
          <button type="button" className="boton" onClick={alCofre}>
            <IconoRegalo tamano={16} /> Abrir cofre
          </button>
        )}
        {av.completa && (
          <Link to={leccion("&modo=legendario")} className="boton">
            <IconoEstrella tamano={16} llena /> {u.legendaria ? "Repetir legendario" : "Nivel legendario"}
          </Link>
        )}
      </div>
      <div className={estilos.secundarias}>
        {(u.historias > 0 || u.roleplays > 0) && <Link to="/ingles/historias">Historias de esta unidad</Link>}
        {!u.actual && (
          <button type="button" onClick={alHacerActual}>
            Marcar como mi unidad actual
          </button>
        )}
      </div>
    </div>
  );
}
