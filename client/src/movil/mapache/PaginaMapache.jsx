// Map (/ingles/mapache): tu práctica diaria de inglés con el mapache. Arriba, una franja corta con lo
// que dice hoy y tu meta del día; debajo, tres pestañas: Hoy (pregunta del día, repite conmigo,
// palabra del día, repasos pendientes y tus errores), Leer (postales y su diario) y Jugar (Trash panda
// y la entrevista). La tienda, la ropa, el álbum y la escena de su casa se quitaron: no enseñaban.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { usePestanaUrl } from "../../hooks/usePestanaUrl.js";
import { hablar } from "../../lib/voz.js";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import { ContenidoPestanas, Pestanas } from "../../components/Pestanas.jsx";
import { IconoAudio, IconoFlechaIzq } from "../../components/Iconos.jsx";
import { CajaVacia, Mapache } from "./Mapache.jsx";
import { useCharlaMapache } from "./TarjetaMapache.jsx";
import { Diario, Entrevista, ExpresionDelDia, ObjetosPerdidos, PalabraDelDia, Postales, PreguntaDelDia, RepiteConmigo, TrashPanda, TusErrores } from "./Actividades.jsx";
import estilos from "./PaginaMapache.module.css";

export const TEXTO_ESTADO = {
  nuevo: "Acaba de llegar. Haz tu primera lección y empieza la racha.",
  feliz: "Meta de hoy cumplida.",
  normal: "Vas bien: te falta un poco para la meta de hoy.",
  hambriento: "Hoy casi no hubo inglés.",
  triste: "Se rompió la racha. Hoy empieza otra.",
  dormido: "Está dormido. Tócalo si quieres saber qué sueña.",
  escapado: "Llevas días sin inglés. Vuelve con una lección corta.",
};

/** El estado en una o dos palabras (la frase completa de arriba queda como ayuda al pasar el cursor). */
const ESTADO_CORTO = {
  nuevo: "Recién llegado",
  feliz: "Meta cumplida",
  normal: "Va bien",
  hambriento: "Con hambre",
  triste: "Racha rota",
  dormido: "Dormido",
  escapado: "Se fue",
};

const PESTANAS = [
  { id: "hoy", texto: "Hoy" },
  { id: "leer", texto: "Leer" },
  { id: "jugar", texto: "Jugar" },
];

export function PaginaMapache() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [pestana, setPestana] = usePestanaUrl(PESTANAS.map((p) => p.id));
  const [editando, setEditando] = useState(false);
  const { dice: charla, tocar: tocarMapache, voz } = useCharlaMapache(datos);

  const cargar = () => api.mapache().then(setDatos, (e) => setError(e.message));
  useEffect(() => {
    cargar();
  }, []);

  if (error) return <p className={estilos.mensaje}>{error}</p>;
  if (!datos) return <Esqueleto variante="tarjetas" />;

  // Tocarlo: cada vez dice otra frase; si está dormido, te cuenta qué soñaba (antes de tocarlo, su "Zzz")
  const dice = charla ?? datos.frase;

  async function renombrar(e) {
    e.preventDefault();
    await api.mapacheRenombrar(new FormData(e.currentTarget).get("nombre"));
    setEditando(false);
    cargar();
  }

  const comida = Math.min(1, datos.comidaHoy / datos.meta);

  return (
    <section className={estilos.pagina} data-area="ingles">
      <Link to="/ingles" className={estilos.volver}>
        <IconoFlechaIzq /> Inglés
      </Link>

      {/* Franja de arriba: quién es y qué dice | tu meta de hoy */}
      <div className={estilos.cabeza}>
        <div className={`textura ${estilos.quien}`}>
          <div className={estilos.retrato}>
            {datos.estado === "escapado" ? (
              <CajaVacia tamano={112} />
            ) : (
              <Mapache estado={datos.estado === "nuevo" ? "normal" : datos.estado} equipo={datos.equipo} tamano={112} alTocar={tocarMapache} />
            )}
          </div>
          <div className={estilos.quienTexto}>
            <div className={estilos.nombre}>
              {editando ? (
                <form onSubmit={renombrar} className={estilos.formNombre}>
                  <input name="nombre" defaultValue={datos.nombre} maxLength={20} autoFocus aria-label="Nombre de tu mapache" />
                  <button type="submit" className="boton boton-primario">
                    Guardar
                  </button>
                </form>
              ) : (
                <>
                  <h1>{datos.nombre}</h1>
                  <span className="chip" data-tono="area" title={TEXTO_ESTADO[datos.estado]}>
                    {ESTADO_CORTO[datos.estado] ?? datos.estado}
                  </span>
                </>
              )}
            </div>
            {dice && (
              <div className={estilos.globo}>
                <p key={dice.en} lang="en">
                  {dice.en}
                </p>
                {/* La traducción va siempre a la vista */}
                <small>{dice.es}</small>
                {dice.expresion && (
                  <span className={estilos.expresion}>
                    <strong lang="en">{dice.expresion.en}</strong> = {dice.expresion.es}
                  </span>
                )}
              </div>
            )}
            <div className={estilos.globoAcciones}>
              {voz && dice && (
                <button type="button" className={estilos.enlace} onClick={() => hablar(dice.en)}>
                  <IconoAudio tamano={15} /> Escuchar
                </button>
              )}
              <button type="button" className={estilos.enlace} onClick={tocarMapache}>
                Otra frase
              </button>
              {!editando && (
                <button type="button" className={estilos.enlaceSuave} onClick={() => setEditando(true)}>
                  Cambiar nombre
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={`textura ${estilos.meta}`}>
          <div className={estilos.metaCifras}>
            <div title="Sube con lo que aprendes: palabras nuevas, aciertos, lecciones, historias y lo que hagas aquí">
              <strong>
                {Math.floor(datos.comidaHoy)}
                <small> de {datos.meta}</small>
              </strong>
              <span>Meta de hoy</span>
            </div>
            <div>
              <strong>{datos.racha}</strong>
              <span>{datos.racha === 1 ? "día de racha" : "días de racha"}</span>
            </div>
          </div>
          <div className={estilos.barra} data-lleno={comida >= 1}>
            <i style={{ width: `${comida * 100}%` }} />
          </div>
          <div className={estilos.acciones}>
            <Link to="/leccion?ambito=ingles" className="boton boton-primario">
              Hacer la lección de hoy
            </Link>
            {datos.totalRobados > 0 && pestana !== "hoy" && (
              <button type="button" className="boton" onClick={() => setPestana("hoy")}>
                {datos.totalRobados} {datos.totalRobados === 1 ? "repaso pendiente" : "repasos pendientes"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={estilos.pestanas}>
        <Pestanas pestanas={PESTANAS} activa={pestana} alCambiar={setPestana} />
      </div>

      <ContenidoPestanas activa={pestana} orden={PESTANAS.map((p) => p.id)}>
        {pestana === "hoy" && (
          // Tres filas, cada una con fichas del mismo alto que llenan el ancho:
          // la pregunta | repetir, palabra y expresión | repasos y errores (solo si hay)
          <div className={estilos.filas}>
            <div className={estilos.rejilla}>
              <PreguntaDelDia datos={datos} alCambiar={cargar} />
            </div>
            <div className={estilos.rejilla}>
              <RepiteConmigo datos={datos} alCambiar={cargar} />
              <PalabraDelDia datos={datos} />
              <ExpresionDelDia datos={datos} />
            </div>
            <div className={estilos.rejilla}>
              <ObjetosPerdidos datos={datos} alCambiar={cargar} />
              <TusErrores datos={datos} />
            </div>
          </div>
        )}
        {pestana === "leer" && (
          <div className={estilos.rejilla}>
            <Postales datos={datos} alCambiar={cargar} />
            <Diario datos={datos} />
          </div>
        )}
        {pestana === "jugar" && (
          <div className={estilos.rejilla}>
            <TrashPanda datos={datos} alCambiar={cargar} />
            <Entrevista datos={datos} />
          </div>
        )}
      </ContenidoPestanas>
    </section>
  );
}
