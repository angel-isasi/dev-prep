import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../lib/api.js";
import { useEvento } from "../hooks/useEvento.js";
import { nombreColeccion, nombreTema, numeroEjercicio } from "../lib/etiquetas.js";
import { Insignia } from "../components/Insignia.jsx";
import { EnunciadoOrganizado } from "../components/EnunciadoOrganizado.jsx";
import { PanelTests } from "../components/PanelTests.jsx";
import { Pestanas } from "../components/Pestanas.jsx";
import { SeccionSolucion } from "../components/SeccionSolucion.jsx";
import { SeccionExplicar } from "../components/SeccionExplicar.jsx";
import { Entrenar, PistaIa } from "../components/ia/PracticaIa.jsx";
import { IconoCandado, IconoFlechaIzq, IconoVSCode } from "../components/Iconos.jsx";
import { Cronometro } from "../components/Cronometro.jsx";
import { Confirmar } from "../components/Confirmar.jsx";
import { celebrar } from "../lib/celebrar.js";
import { Ayuda } from "../components/Ayuda.jsx";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { buscarColeccion } from "../lib/areas.js";
import { MentorPaso } from "../components/plan/Plan.jsx";
import { esEsencial } from "../../../server/plan-junior.js";
import { Markdown } from "../components/Markdown.jsx";
import estilos from "./Ejercicio.module.css";

const NOMBRES_PISTA = ["Hacia dónde mirar", "Qué herramienta usar", "Esqueleto de la solución"];

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
      celebrar();
      setAviso({ tipo: "exito", texto: "¡Resuelto! Todos los tests pasan. Ahora explícalo con tus palabras." });
      cargar(); // trae la solución y la explicación modelo, ya desbloqueadas
    } else if (datos.repasoCompletado) {
      celebrar();
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
  if (!ejercicio) return <Esqueleto variante="ejercicio" />;

  const resuelto = ejercicio.estado === "resuelto";
  const progreso = ejercicio.progreso;
  const tiempo = minutos(progreso?.segundosActivos);


  const pestanas = [
    { id: "enunciado", texto: "Enunciado" },
    { id: "solucion", texto: "Solución", extra: ejercicio.solucion ? undefined : "bloqueada" },
    { id: "explicar", texto: "Explícalo", extra: progreso?.explicacion ? "✓" : undefined },
    ...(resuelto ? [{ id: "entrenar", texto: "Entrénalo", extra: "IA" }] : []),
  ];

  return (
    <div className={estilos.pagina} data-area={buscarColeccion(ejercicio.coleccion)?.area.id ?? "todas"}>
      <div className={estilos.principal}>
        <Link to={`/practicar/lista?coleccion=${encodeURIComponent(ejercicio.coleccion)}`} className={estilos.volver}>
          <IconoFlechaIzq /> {nombreColeccion(ejercicio.coleccion)}
        </Link>

        <div className={estilos.encabezado}>
        <header className={estilos.cabecera}>
          <p className={estilos.etiqueta}>
            <span className={estilos.numero}>#{numeroEjercicio(ejercicio.id)}</span>
            {buscarColeccion(ejercicio.coleccion)?.area.titulo ?? nombreColeccion(ejercicio.coleccion)} · {nombreTema(ejercicio.tema)}
          </p>
          <h1>{ejercicio.titulo}</h1>
          <div className={estilos.meta}>
            <Insignia nivel={ejercicio.nivel} />
            <Insignia estado={ejercicio.estado} />
            {esEsencial(ejercicio.id) && (
              <span className="chip" data-tono="acento" title="Es parte de lo esencial para una entrevista junior">
                Plan junior
              </span>
            )}
            {ejercicio.preparado && (
              <code className={estilos.archivo} title="Tu archivo de trabajo">
                workspace/{ejercicio.id}/{ejercicio.archivo}
              </code>
            )}
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
            <Ayuda texto="Cronómetro de 20 minutos, como en una entrevista en vivo">
              <button type="button" className="boton" onClick={() => setCronometro(Date.now())}>
                Modo entrevista
              </button>
            </Ayuda>
          )}
          {ejercicio.preparado && (
            <button type="button" className="boton" onClick={correr} disabled={corriendo}>
              Correr tests
            </button>
          )}
          {ejercicio.preparado && (
            <Confirmar
              titulo="¿Volver al archivo inicial?"
              descripcion="Tu código actual se guarda en un respaldo (workspace/.respaldos), así que no lo pierdes."
              textoConfirmar="Sí, reiniciar"
              peligro
              alConfirmar={reiniciar}
              disparador={
                <button type="button" className="boton boton-fantasma">
                  Reiniciar
                </button>
              }
            />
          )}
        </div>
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
        {aviso?.tipo === "exito" && resuelto && <MentorPaso key={ejercicio.id} ejercicio={ejercicio} />}

        <div className={estilos.pestanas}>
          <Pestanas pestanas={pestanas} activa={pestana} alCambiar={setPestana} />
        </div>

        {pestana === "enunciado" && (
          <div className={estilos.enunciado}>
            <EnunciadoOrganizado
              markdown={ejercicio.enunciado}
              parejo
              extra={
                <section className={`tarjeta ${estilos.pistas}`}>
                  <header>
                    <span className="etiqueta">Pistas</span>
                    <small>
                      {ejercicio.pistas.length} de {ejercicio.totalPistas ?? 0} vistas
                    </small>
                  </header>
                  {ejercicio.totalPistas ? (
                    <ol>
                      {Array.from({ length: ejercicio.totalPistas }, (_, i) => {
                        const vista = ejercicio.pistas[i];
                        const toca = i === ejercicio.pistas.length;
                        return (
                          <li key={i} data-estado={vista ? "vista" : toca ? "toca" : "cerrada"}>
                            <b>{i + 1}</b>
                            <div>
                              <strong>{NOMBRES_PISTA[i] ?? `Pista ${i + 1}`}</strong>
                              {vista && <Markdown>{vista}</Markdown>}
                            </div>
                            {toca && (
                              <button type="button" className="boton" onClick={() => verPista(i + 1)} disabled={ocupado}>
                                Ver
                              </button>
                            )}
                            {!vista && !toca && <IconoCandado tamano={14} />}
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className={estilos.dato}>Este ejercicio no tiene pistas.</p>
                  )}
                  {ejercicio.preparado && !resuelto && (
                    <PistaIa key={ejercicio.id} id={ejercicio.id} enunciado={ejercicio.enunciado} resultado={resultado} pistasVistas={ejercicio.pistas} />
                  )}
                </section>
              }
            />
          </div>
        )}
        {pestana === "entrenar" && resuelto && (
          <div className={estilos.seccionTablero}>
            <Entrenar key={ejercicio.id} id={ejercicio.id} titulo={ejercicio.titulo} enunciado={ejercicio.enunciado} />
          </div>
        )}
        {pestana === "solucion" && (
          <SeccionSolucion solucion={ejercicio.solucion} resuelto={resuelto} alVer={verSolucion} ocupado={ocupado} />
        )}
        {pestana === "explicar" && (
          <SeccionExplicar
            key={ejercicio.id}
            id={ejercicio.id}
            resuelto={resuelto}
            titulo={ejercicio.titulo}
            enunciado={ejercicio.enunciado}
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
          conIa={ejercicio.preparado && !resuelto ? { id: ejercicio.id, enunciado: ejercicio.enunciado } : undefined}
        />

        <section className={`tarjeta ${estilos.recorrido}`}>
          <span className="etiqueta">Tu recorrido</span>
          <ol>
            {[
              { id: "enunciado", texto: "Enunciado", detalle: resuelto ? "Resuelto: tests en verde" : "Qué hay que hacer", hecho: resuelto },
              { id: "solucion", texto: "Solución", detalle: ejercicio.solucion ? "Con su explicación" : "Bloqueada hasta que la pidas" },
              { id: "explicar", texto: "Explícalo", detalle: progreso?.explicacion ? "Guardado" : "Con tus palabras, como en la entrevista", hecho: !!progreso?.explicacion },
              { id: "entrenar", texto: "Entrénalo con IA", detalle: resuelto ? "Variante, error escondido, complejidad" : "Se abre al resolverlo", bloqueado: !resuelto },
            ].map((p, i) => (
              <li key={p.id}>
                <button type="button" data-hecho={!!p.hecho} data-activo={pestana === p.id} disabled={p.bloqueado} onClick={() => setPestana(p.id)}>
                  <b>{p.hecho ? "✓" : i + 1}</b>
                  <span>
                    <strong>{p.texto}</strong>
                    <small>{p.detalle}</small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <dl className={estilos.cifras}>
            <div>
              <dt>Intentos</dt>
              <dd>{progreso?.intentos ?? 0}</dd>
            </div>
            <div>
              <dt>Tiempo</dt>
              <dd>{tiempo || "–"}</dd>
            </div>
            <div>
              <dt>Pistas</dt>
              <dd>
                {ejercicio.pistas.length}/{ejercicio.totalPistas ?? 0}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
