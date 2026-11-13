import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../lib/api.js";
import { useEvento } from "../hooks/useEvento.js";
import { nombreColeccion, nombreTema } from "../lib/etiquetas.js";
import { Insignia } from "../components/Insignia.jsx";
import { Markdown } from "../components/Markdown.jsx";
import { PanelTests } from "../components/PanelTests.jsx";
import { IconoFlechaIzq, IconoVSCode } from "../components/Iconos.jsx";
import estilos from "./Ejercicio.module.css";

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

  useEffect(() => {
    setEjercicio(null);
    setError(null);
    setAviso(null);
    api.ejercicio(id).then(
      (datos) => {
        setEjercicio(datos);
        setResultado(datos.resultado);
        setCorriendo(datos.corriendo);
        const en = datos.progreso?.ultimoResultado?.en;
        setUltimaCorrida(datos.resultado && en ? Date.parse(en) : null);
      },
      (e) => setError(e.message),
    );
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
      setAviso({ tipo: "exito", texto: "¡Resuelto! Todos los tests pasan. Buen trabajo." });
    }
  });

  async function abrir() {
    setOcupado(true);
    setAviso(null);
    try {
      const { avisoVSCode } = await api.abrir(id);
      setEjercicio((e) => ({ ...e, preparado: true, estado: e.estado === "pendiente" ? "en-progreso" : e.estado }));
      if (avisoVSCode) setAviso({ tipo: "error", texto: avisoVSCode });
    } catch (e) {
      setAviso({ tipo: "error", texto: e.message });
    } finally {
      setOcupado(false);
    }
  }

  async function correr() {
    try {
      await api.correr(id);
    } catch (e) {
      setAviso({ tipo: "error", texto: e.message });
    }
  }

  async function reiniciar() {
    setConfirmarReinicio(false);
    try {
      const { respaldo } = await api.reiniciar(id);
      setAviso({
        tipo: "info",
        texto: respaldo
          ? `Volviste al archivo inicial. Tu versión anterior quedó en workspace/${respaldo.replaceAll("\\", "/")}`
          : "Volviste al archivo inicial.",
      });
    } catch (e) {
      setAviso({ tipo: "error", texto: e.message });
    }
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

  return (
    <div className={estilos.pagina}>
      <div className={estilos.principal}>
        <Link to="/practicar" className={estilos.volver}>
          <IconoFlechaIzq /> Practicar
        </Link>

        <header className={estilos.cabecera}>
          <h1>{ejercicio.titulo}</h1>
          <div className={estilos.meta}>
            <span>{nombreColeccion(ejercicio.coleccion)}</span>
            <span aria-hidden>·</span>
            <span>{nombreTema(ejercicio.tema)}</span>
            <Insignia nivel={ejercicio.nivel} />
            <Insignia estado={ejercicio.estado} />
            {ejercicio.progreso?.intentos > 0 && (
              <span className={estilos.intentos}>
                {ejercicio.progreso.intentos} {ejercicio.progreso.intentos === 1 ? "intento" : "intentos"}
              </span>
            )}
          </div>
        </header>

        <div className={estilos.acciones}>
          <button type="button" className="boton boton-primario" onClick={abrir} disabled={ocupado}>
            <IconoVSCode /> {ejercicio.preparado ? "Abrir en VS Code" : "Empezar en VS Code"}
          </button>
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
              <button type="button" className="boton boton-peligro" onClick={() => setConfirmarReinicio(true)}>
                Reiniciar
              </button>
            ))}
        </div>

        {ejercicio.preparado && (
          <p className={estilos.archivo}>
            Tu archivo: <code>workspace/{ejercicio.id}/{ejercicio.archivo}</code>
          </p>
        )}

        {aviso && (
          <p className={estilos.aviso} data-tipo={aviso.tipo} role="status">
            {aviso.texto}
          </p>
        )}

        <article className={estilos.enunciado}>
          <Markdown>{ejercicio.enunciado}</Markdown>
        </article>
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
