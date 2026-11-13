import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../lib/api.js";
import { useEvento } from "../hooks/useEvento.js";
import { nombreColeccion, nombreTema } from "../lib/etiquetas.js";
import { Insignia } from "../components/Insignia.jsx";
import { Markdown } from "../components/Markdown.jsx";
import { PanelTests } from "../components/PanelTests.jsx";
import { Pestanas } from "../components/Pestanas.jsx";
import { SeccionPistas } from "../components/SeccionPistas.jsx";
import { SeccionSolucion } from "../components/SeccionSolucion.jsx";
import { SeccionExplicar } from "../components/SeccionExplicar.jsx";
import { IconoFlechaIzq, IconoVSCode } from "../components/Iconos.jsx";
import { Cronometro } from "../components/Cronometro.jsx";
import estilos from "./Ejercicio.module.css";

function fechaCorta(fecha) {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
}

function minutos(segundos) {
  const m = Math.round((segundos ?? 0) / 60);
  return m < 1 ? null : `${m} min de trabajo`;
}

export function Ejercicio() {
  const { id } = useParams();
  const [ejercicio, setEjercicio] = useState(null);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [corriendo, setCorriendo] = useState(false);
  const [ultimaCorrida, setUltimaCorrida] = useState(null);
  const [aviso, setAviso] = useState(null); // { tipo: "info" | "error" | "exito", texto }
  const [confirmarReinicio, setConfirmarReinicio] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [pestana, setPestana] = useState("enunciado");
  const [cronometro, setCronometro] = useState(null); // Date.now() al empezar el modo entrevista

  async function cargar() {
    const datos = await api.ejercicio(id);
    setEjercicio(datos);
    return datos;
  }

  useEffect(() => {
    setEjercicio(null);
    setError(null);
    setAviso(null);
    setPestana("enunciado");
    cargar().then(
      (datos) => {
        setResultado(datos.resultado);
        setCorriendo(datos.corriendo);
        const en = datos.progreso?.ultimoResultado?.en;
        setUltimaCorrida(datos.resultado && en ? Date.parse(en) : null);
      },
      (e) => setError(e.message),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEvento("corriendo", ({ ids }) => {
    if (ids.includes(id)) setCorriendo(true);
  });

  useEvento("resultado", (datos) => {
    if (datos.id !== id) return;
    setResultado(datos.resultado);
    setCorriendo(false);
    setUltimaCorrida(Date.now());
    setEjercicio((e) => e && { ...e, estado: datos.progreso.estado, progreso: datos.progreso, preparado: true });
    if (datos.resueltoAhora) {
      setAviso({ tipo: "exito", texto: "¡Resuelto! Todos los tests pasan. Ahora explícalo con tus palabras." });
      cargar(); // trae la solución y la explicación modelo, ya desbloqueadas
    } else if (datos.repasoCompletado) {
      setAviso({
        tipo: "exito",
        texto: `¡Repaso completado! Lo volverás a ver el ${fechaCorta(datos.progreso.repaso.proximo)}.`,
      });
      cargar();
    }
  });

  async function accion(fn) {
    setOcupado(true);
    try {
      await fn();
    } catch (e) {
      setAviso({ tipo: "error", texto: e.message });
    } finally {
      setOcupado(false);
    }
  }

  const abrir = () =>
    accion(async () => {
      setAviso(null);
      const { avisoVSCode } = await api.abrir(id);
      setEjercicio((e) => ({ ...e, preparado: true, estado: e.estado === "pendiente" ? "en-progreso" : e.estado }));
      if (avisoVSCode) setAviso({ tipo: "error", texto: avisoVSCode });
    });

  const correr = () => accion(() => api.correr(id));

  const reiniciar = () =>
    accion(async () => {
      setConfirmarReinicio(false);
      const { respaldo } = await api.reiniciar(id);
      setAviso({
        tipo: "info",
        texto: respaldo
          ? `Volviste al archivo inicial. Tu versión anterior quedó en workspace/${respaldo.replaceAll("\\", "/")}`
          : "Volviste al archivo inicial.",
      });
    });

  const empezarRepaso = () =>
    accion(async () => {
      const { progreso } = await api.repasar(id);
      setEjercicio((e) => ({ ...e, progreso, pistas: [], solucion: null, preparado: true }));
      setPestana("enunciado");
      setAviso({
        tipo: "info",
        texto: "Modo repaso: tu archivo volvió al inicio (con respaldo). Resuélvelo de nuevo sin mirar la solución.",
      });
      await api.abrir(id).catch(() => {});
    });

  const verPista = (n) =>
    accion(async () => {
      const { pistas, progreso } = await api.verPista(id, n);
      setEjercicio((e) => ({ ...e, pistas, progreso, estado: progreso.estado }));
    });

  const verSolucion = () =>
    accion(async () => {
      const { solucion, progreso } = await api.verSolucion(id);
      setEjercicio((e) => ({ ...e, solucion, progreso, estado: progreso.estado }));
    });

  async function guardarExplicacion(texto) {
    const { progreso, modelo } = await api.guardarExplicacion(id, texto);
    setEjercicio((e) => ({ ...e, progreso, modelo }));
  }

  if (error) {
    return (
      <div className={estilos.mensaje}>
        <p>{error}</p>
        <Link to="/practicar">Volver a Practicar</Link>
      </div>
    );
  }
  if (!ejercicio) return <p className={estilos.mensaje}>Cargando…</p>;

  const resuelto = ejercicio.estado === "resuelto";
  const progreso = ejercicio.progreso;
  const tiempo = minutos(progreso?.segundosActivos);

  const pestanas = [
    { id: "enunciado", texto: "Enunciado" },
    {
      id: "pistas",
      texto: "Pistas",
      extra: ejercicio.totalPistas ? `${ejercicio.pistas.length}/${ejercicio.totalPistas}` : undefined,
    },
    { id: "solucion", texto: "Solución", extra: ejercicio.solucion ? undefined : "bloqueada" },
    { id: "explicar", texto: "Explícalo", extra: progreso?.explicacion ? "✓" : undefined },
  ];

  return (
    <div className={estilos.pagina}>
      <div className={estilos.principal}>
        <Link to={`/practicar/lista?coleccion=${encodeURIComponent(ejercicio.coleccion)}`} className={estilos.volver}>
          <IconoFlechaIzq /> {nombreColeccion(ejercicio.coleccion)}
        </Link>

        <header className={estilos.cabecera}>
          <h1>{ejercicio.titulo}</h1>
          <div className={estilos.meta}>
            <span>{nombreColeccion(ejercicio.coleccion)}</span>
            <span aria-hidden>·</span>
            <span>{nombreTema(ejercicio.tema)}</span>
            <Insignia nivel={ejercicio.nivel} />
            <Insignia estado={ejercicio.estado} />
            {progreso?.intentos > 0 && (
              <span className={estilos.dato}>
                {progreso.intentos} {progreso.intentos === 1 ? "intento" : "intentos"}
              </span>
            )}
            {tiempo && <span className={estilos.dato}>{tiempo}</span>}
          </div>
        </header>

        <div className={estilos.acciones}>
          <button type="button" className="boton boton-primario" onClick={abrir} disabled={ocupado}>
            <IconoVSCode /> {ejercicio.preparado ? "Abrir en VS Code" : "Empezar en VS Code"}
          </button>
          {cronometro ? (
            <span className={estilos.cronometro}>
              <Cronometro inicio={cronometro} segundos={20 * 60} />
              <button type="button" className="boton boton-fantasma" onClick={() => setCronometro(null)}>
                Detener
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="boton"
              title="20 minutos, como en una entrevista en vivo"
              onClick={() => setCronometro(Date.now())}
            >
              Modo entrevista
            </button>
          )}
          {ejercicio.preparado && (
            <button type="button" className="boton" onClick={correr} disabled={corriendo}>
              Correr tests
            </button>
          )}
          {ejercicio.preparado &&
            (confirmarReinicio ? (
              <span className={estilos.confirmar}>
                ¿Volver al archivo inicial? Tu código se guarda en un respaldo.
                <button type="button" className="boton boton-peligro-lleno" onClick={reiniciar}>
                  Sí, reiniciar
                </button>
                <button type="button" className="boton" onClick={() => setConfirmarReinicio(false)}>
                  Cancelar
                </button>
              </span>
            ) : (
              <button type="button" className="boton boton-fantasma" onClick={() => setConfirmarReinicio(true)}>
                Reiniciar
              </button>
            ))}
        </div>

        {progreso?.repasando ? (
          <p className={estilos.aviso} data-tipo="info">
            <strong>Modo repaso.</strong> Resuélvelo sin mirar: la solución está bloqueada hasta que pasen todos los
            tests.
          </p>
        ) : (
          ejercicio.repasoPendiente && (
            <div className={estilos.repaso}>
              <div>
                <strong>Te toca repasar este ejercicio.</strong>
                <span>Resolverlo de nuevo días después es lo que hace que no se te olvide.</span>
              </div>
              <button type="button" className="boton boton-primario" onClick={empezarRepaso} disabled={ocupado}>
                Empezar repaso
              </button>
            </div>
          )
        )}

        {ejercicio.preparado && (
          <p className={estilos.archivo}>
            Tu archivo: <code>workspace/{ejercicio.id}/{ejercicio.archivo}</code>
          </p>
        )}

        {aviso && (
          <p className={estilos.aviso} data-tipo={aviso.tipo} role="status">
            {aviso.texto}
            {aviso.tipo === "exito" && pestana !== "explicar" && (
              <button type="button" className={estilos.enlaceAviso} onClick={() => setPestana("explicar")}>
                Explicarlo ahora
              </button>
            )}
          </p>
        )}

        <div className={estilos.pestanas}>
          <Pestanas pestanas={pestanas} activa={pestana} alCambiar={setPestana} />
        </div>

        {pestana === "enunciado" && (
          <article className={estilos.enunciado}>
            <Markdown>{ejercicio.enunciado}</Markdown>
          </article>
        )}
        {pestana === "pistas" && (
          <SeccionPistas pistas={ejercicio.pistas} total={ejercicio.totalPistas} alVer={verPista} ocupado={ocupado} />
        )}
        {pestana === "solucion" && (
          <SeccionSolucion solucion={ejercicio.solucion} resuelto={resuelto} alVer={verSolucion} ocupado={ocupado} />
        )}
        {pestana === "explicar" && (
          <SeccionExplicar
            key={ejercicio.id}
            resuelto={resuelto}
            textoGuardado={progreso?.explicacion ?? ""}
            modelo={ejercicio.modelo}
            alGuardar={guardarExplicacion}
          />
        )}
      </div>

      <div className={estilos.lateral}>
        <PanelTests
          resultado={resultado}
          corriendo={corriendo}
          preparado={ejercicio.preparado}
          ultimaCorrida={ultimaCorrida}
        />
      </div>
    </div>
  );
}
