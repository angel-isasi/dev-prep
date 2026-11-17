// Un ejercicio en el celular: se ESTUDIA (enunciado, pistas, solución explicada) y te autoevalúas.
// Resolverlo con tests es en la laptop. Regla acordada: ver la solución aquí no penaliza; tu
// autoevaluación agenda el repaso con las mismas cajas que las tarjetas de entrevista.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../lib/api.js";
import { buscarColeccion } from "../lib/areas.js";
import { nombreColeccion, nombreTema, numeroEjercicio } from "../lib/etiquetas.js";
import { Markdown } from "../components/Markdown.jsx";
import { EnunciadoOrganizado } from "../components/EnunciadoOrganizado.jsx";
import { Pestanas } from "../components/Pestanas.jsx";
import { Insignia } from "../components/Insignia.jsx";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { SeccionPistas } from "../components/SeccionPistas.jsx";
import { IconoFlechaIzq } from "../components/Iconos.jsx";
import estilos from "./EjercicioMovil.module.css";

const NOTAS = [
  { valor: "no", texto: "No", detalle: "Necesitaba la solución", tipo: "error" },
  { valor: "dude", texto: "Dudé", detalle: "Con pistas, sí", tipo: "aviso" },
  { valor: "sabia", texto: "Sí", detalle: "Sin ayuda", tipo: "exito" },
];

function fechaCorta(fecha) {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
}

export function EjercicioMovil() {
  const { id } = useParams();
  const [ej, setEj] = useState(null);
  const [error, setError] = useState(null);
  const [pestana, setPestana] = useState("enunciado");
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    setEj(null);
    setPestana("enunciado");
    setAviso(null);
    api.ejercicio(id).then(setEj, (e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className={estilos.pagina}>
        <p className={estilos.mensaje}>{error}</p>
        <Link to="/practicar">Volver a Practicar</Link>
      </div>
    );
  }
  if (!ej) return <Esqueleto variante="ejercicio" />;

  const area = buscarColeccion(ej.coleccion)?.area;

  async function accion(fn) {
    setOcupado(true);
    try {
      await fn();
      setEj(await api.ejercicio(id));
    } catch (e) {
      setAviso({ tipo: "error", texto: e.message });
    } finally {
      setOcupado(false);
    }
  }

  const verPista = (n) => accion(() => api.verPista(id, n));
  const verSolucion = () => accion(() => api.verSolucion(id));
  const autoevaluar = (nota) =>
    accion(async () => {
      const r = await api.autoevaluar(id, nota);
      setAviso({
        tipo: nota === "sabia" ? "exito" : "info",
        texto: `Anotado. Te lo vuelvo a mostrar el ${fechaCorta(r.proximo)}.`,
      });
    });

  const pestanas = [
    { id: "enunciado", texto: "Enunciado" },
    { id: "pistas", texto: "Pistas", extra: ej.totalPistas ? `${ej.pistas.length}/${ej.totalPistas}` : undefined },
    { id: "solucion", texto: "Solución", extra: ej.sinSolucion ? "laptop" : undefined },
  ];

  return (
    <div className={estilos.pagina} data-area={area?.id ?? "todas"}>
      <Link to={`/practicar/lista?coleccion=${encodeURIComponent(ej.coleccion)}`} className={estilos.volver}>
        <IconoFlechaIzq /> {nombreColeccion(ej.coleccion)}
      </Link>

      <header className={estilos.cabecera}>
        <p className={estilos.etiqueta}>
          <span className={estilos.numero}>#{numeroEjercicio(ej.id)}</span>
          {area?.titulo ?? nombreColeccion(ej.coleccion)} · {nombreTema(ej.tema)}
        </p>
        <h1>{ej.titulo}</h1>
        <div className={estilos.meta}>
          <Insignia nivel={ej.nivel} />
          <Insignia estado={ej.estado} />
        </div>
      </header>

      <div className={estilos.pestanas}>
        <Pestanas pestanas={pestanas} activa={pestana} alCambiar={setPestana} />
      </div>

      {pestana === "enunciado" && (
        <>
          <EnunciadoOrganizado markdown={ej.enunciado} />
          <p className={estilos.consejo}>
            Piensa cómo lo resolverías antes de mirar. Cuando tengas una idea, abre las pistas o la solución.
          </p>
          <button type="button" className={`boton boton-primario ${estilos.ancho}`} onClick={() => setPestana(ej.totalPistas ? "pistas" : "solucion")}>
            {ej.totalPistas ? "Ver pistas" : "Ver la solución"} →
          </button>
        </>
      )}

      {pestana === "pistas" && (
        <div className={estilos.bloquePlano}>
          <SeccionPistas pistas={ej.pistas} total={ej.totalPistas} alVer={verPista} ocupado={ocupado} />
          <button type="button" className={`boton ${estilos.ancho}`} onClick={() => setPestana("solucion")}>
            Ir a la solución →
          </button>
        </div>
      )}

      {pestana === "solucion" &&
        (ej.sinSolucion ? (
          <div className={estilos.laptop}>
            <strong>Este reto es para la laptop</strong>
            <p>
              Los retos de entrevista se resuelven con VS Code y tests, sin ver la solución antes. Aquí puedes leer el
              enunciado y las pistas para ir pensando.
            </p>
          </div>
        ) : !ej.solucion ? (
          <div className={estilos.revelar}>
            <p>¿Ya pensaste cómo resolverlo? Mirar la solución aquí no te quita puntos: después te calificas tú.</p>
            <button type="button" className={`boton boton-primario ${estilos.ancho}`} onClick={verSolucion} disabled={ocupado}>
              Ya lo pensé, ver la solución
            </button>
          </div>
        ) : (
          <>
            {/* En pantalla ancha: el código queda fijo a la izquierda mientras lees la explicación */}
            <div className={estilos.solucionLado}>
              <article className={`tarjeta ${estilos.bloque} ${estilos.codigoFijo}`}>
                <Markdown>{"```" + ej.solucion.lenguaje + "\n" + ej.solucion.codigo + "\n```"}</Markdown>
              </article>
              <EnunciadoOrganizado markdown={ej.solucion.explicacion} etiqueta="Por qué funciona" />
            </div>

            <div className={estilos.autoevaluacion}>
              <strong>¿Lo habrías resuelto sin ayuda?</strong>
              <div className={estilos.notas}>
                {NOTAS.map((n) => (
                  <button
                    key={n.valor}
                    type="button"
                    className={estilos.nota}
                    data-tipo={n.tipo}
                    data-elegida={ej.progreso?.ultima === n.valor}
                    onClick={() => autoevaluar(n.valor)}
                    disabled={ocupado}
                  >
                    {n.texto}
                    <small>{n.detalle}</small>
                  </button>
                ))}
              </div>
            </div>
          </>
        ))}

      {aviso && (
        <p className={estilos.aviso} data-tipo={aviso.tipo} role="status">
          {aviso.texto}
        </p>
      )}
    </div>
  );
}
