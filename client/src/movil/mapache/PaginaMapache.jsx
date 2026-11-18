// La casa del mapache (/ingles/mapache): su escena, lo que dice y todo lo que puedes hacer con él,
// en cuatro pestañas: Hoy (pregunta del día, repite conmigo, objetos perdidos, tus errores, palabra del día),
// Su casa (tienda, ropa, álbum), Leer (su diario y sus postales) y Jugar (Trash panda y la entrevista).
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { hablar, useHayVoz } from "../../lib/voz.js";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import { ContenidoPestanas, Pestanas } from "../../components/Pestanas.jsx";
import { IconoAudio, IconoFlechaIzq } from "../../components/Iconos.jsx";
import { Casa } from "./Casa.jsx";
import { Album, Diario, Entrevista, ObjetosPerdidos, PalabraDelDia, Postales, PreguntaDelDia, RepiteConmigo, Ropa, Tienda, TrashPanda, TusErrores } from "./Actividades.jsx";
import estilos from "./PaginaMapache.module.css";

export const TEXTO_ESTADO = {
  nuevo: "Acaba de llegar. Come palabras en inglés: haz tu primera lección.",
  feliz: "Está feliz y lleno. Hoy comió bien.",
  normal: "Está bien, pero le cabe un poco más.",
  hambriento: "Tiene hambre: hoy casi no hubo inglés.",
  triste: "Está triste: se rompió la racha o te robó muchas palabras.",
  dormido: "Está dormido. Tócalo si quieres saber qué sueña.",
  escapado: "Se escapó a buscar comida. Vuelve apenas practiques inglés hoy.",
};

const PESTANAS = [
  { id: "hoy", texto: "Hoy" },
  { id: "casa", texto: "Su casa" },
  { id: "leer", texto: "Leer" },
  { id: "jugar", texto: "Jugar" },
];

export function PaginaMapache() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [pestana, setPestana] = useState("hoy");
  const [traduccion, setTraduccion] = useState(false);
  const [sueno, setSueno] = useState(false);
  const [editando, setEditando] = useState(false);
  const voz = useHayVoz();

  const cargar = () => api.mapache().then(setDatos, (e) => setError(e.message));
  useEffect(() => {
    cargar();
  }, []);

  if (error) return <p className={estilos.mensaje}>{error}</p>;
  if (!datos) return <Esqueleto variante="tarjetas" />;

  const dice = sueno && datos.estado === "dormido" ? datos.sueno : datos.frase;
  // Tocarlo: dice su frase en voz alta; si está dormido, te cuenta qué soñaba
  const tocarMapache = () => {
    const frase = datos.estado === "dormido" ? datos.sueno : datos.frase;
    if (datos.estado === "dormido") setSueno(true);
    if (voz && frase) hablar(frase.en);
  };

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

      <div className={estilos.arriba}>
        <Casa datos={datos} alTocarMapache={tocarMapache} />

        <div className={estilos.panel}>
          <div className={estilos.nombre}>
            {editando ? (
              <form onSubmit={renombrar} className={estilos.formNombre}>
                <input name="nombre" defaultValue={datos.nombre} maxLength={20} autoFocus aria-label="Nombre del mapache" />
                <button type="submit" className="boton boton-primario">
                  Guardar
                </button>
              </form>
            ) : (
              <>
                <h1>{datos.nombre}</h1>
                <button type="button" className={estilos.enlace} onClick={() => setEditando(true)}>
                  Cambiar nombre
                </button>
              </>
            )}
          </div>
          <p className={estilos.estado}>{TEXTO_ESTADO[datos.estado]}</p>

          {dice && (
            <div className={estilos.globo}>
              <p lang="en">{dice.en}</p>
              {traduccion && <small>{dice.es}</small>}
              {dice.expresion && (
                <span className={estilos.expresion}>
                  <strong lang="en">{dice.expresion.en}</strong> = {dice.expresion.es}
                </span>
              )}
              <div className={estilos.globoAcciones}>
                {voz && (
                  <button type="button" className={estilos.enlace} onClick={() => hablar(dice.en)}>
                    <IconoAudio tamano={15} /> Escuchar
                  </button>
                )}
                <button type="button" className={estilos.enlace} onClick={() => setTraduccion((t) => !t)}>
                  {traduccion ? "Ocultar traducción" : "¿Qué dijo?"}
                </button>
              </div>
            </div>
          )}

          <div className={estilos.barras}>
            <div>
              <span>Pancita de hoy</span>
              <strong>
                {Math.floor(datos.comidaHoy)} de {datos.meta}
              </strong>
            </div>
            <div className={estilos.barra} data-lleno={comida >= 1}>
              <i style={{ width: `${comida * 100}%` }} />
            </div>
            <div className={estilos.datosFila}>
              <span>
                Racha de inglés: <strong>{datos.racha}</strong> {datos.racha === 1 ? "día" : "días"}
              </span>
              <span>
                Nivel <strong>{datos.nivel}</strong> · vive en {datos.casa.texto}
              </span>
              <span>
                Te habla en <strong>{datos.nivelMapache}</strong>
                {datos.nivelMapache !== datos.nivel ? ", un nivel arriba del tuyo" : ""}
              </span>
            </div>
          </div>

          <div className={estilos.acciones}>
            <Link to="/leccion?ambito=ingles" className="boton boton-primario">
              Darle de comer: rutina de hoy
            </Link>
            {datos.totalRobados > 0 && (
              <button type="button" className="boton" onClick={() => setPestana("hoy")}>
                Recuperar {datos.totalRobados} {datos.totalRobados === 1 ? "palabra" : "palabras"}
              </button>
            )}
          </div>
          <p className={estilos.nota}>
            Come lo que aprendes en inglés: palabras nuevas, aciertos, lecciones, historias y lo que hagas aquí. Abrir la app no lo alimenta.
          </p>
        </div>
      </div>

      <div className={estilos.pestanas}>
        <Pestanas pestanas={PESTANAS} activa={pestana} alCambiar={setPestana} />
      </div>

      <ContenidoPestanas activa={pestana} orden={PESTANAS.map((p) => p.id)}>
        {pestana === "hoy" && (
          <div className={estilos.rejilla}>
            <PreguntaDelDia datos={datos} alCambiar={cargar} />
            <ObjetosPerdidos datos={datos} alCambiar={cargar} />
            <RepiteConmigo datos={datos} alCambiar={cargar} />
            <TusErrores datos={datos} />
            <PalabraDelDia datos={datos} />
          </div>
        )}
        {pestana === "casa" && (
          <div className={estilos.rejilla}>
            <Tienda datos={datos} alCambiar={cargar} />
            <Ropa datos={datos} alCambiar={cargar} />
            <Album datos={datos} />
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
