import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { Pestanas } from "../components/Pestanas.jsx";
import { Markdown } from "../components/Markdown.jsx";
import { Tarjeta } from "../components/Tarjeta.jsx";
import { Simulacro } from "../components/Simulacro.jsx";
import { PitchStar } from "../components/PitchStar.jsx";
import { Esqueleto } from "../components/Esqueleto.jsx";
import estilos from "./Entrevistas.module.css";

export function Entrevistas() {
  const [resumen, setResumen] = useState(null);
  const [pestana, setPestana] = useState("tarjetas");
  const [sesion, setSesion] = useState(null); // { titulo, tarjetas, indice, notas }

  const cargar = () => api.entrevistas().then(setResumen);
  useEffect(() => {
    cargar();
  }, []);

  async function empezar(titulo, filtro) {
    const tarjetas = await api.tarjetas(filtro);
    setSesion({ titulo, tarjetas: tarjetas.slice(0, 15), indice: 0, notas: [] });
  }

  async function calificar(nota) {
    const actual = sesion.tarjetas[sesion.indice];
    await api.calificar(actual.id, nota);
    setSesion((s) => ({ ...s, indice: s.indice + 1, notas: [...s.notas, nota] }));
  }

  function terminar() {
    setSesion(null);
    cargar();
  }

  if (!resumen) return <Esqueleto variante="tarjetas" />;

  const pestanas = [
    { id: "tarjetas", texto: "Tarjetas", extra: resumen.pendientesHoy ? `${resumen.pendientesHoy} hoy` : undefined },
    { id: "simulacro", texto: "Simulacro" },
    { id: "personal", texto: "Pitch y STAR" },
    { id: "guia", texto: "Cómo pensar en voz alta" },
  ];

  return (
    <section className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <h1>Entrevistas</h1>
        <p>Preguntas reales de entrevistas junior, con la respuesta que conviene dar. Respóndelas en voz alta.</p>
      </header>

      <Pestanas pestanas={pestanas} activa={pestana} alCambiar={(p) => (setPestana(p), setSesion(null))} />

      <div className={estilos.contenido}>
        {pestana === "tarjetas" &&
          (sesion ? (
            <SesionTarjetas sesion={sesion} alCalificar={calificar} alTerminar={terminar} />
          ) : (
            <ElegirMazo resumen={resumen} alEmpezar={empezar} />
          ))}
        {pestana === "simulacro" && <Simulacro />}
        {pestana === "personal" && <PitchStar guias={resumen.guias} />}
        {pestana === "guia" && (
          <article className={estilos.guia}>
            <Markdown>{resumen.guias.vozAlta}</Markdown>
          </article>
        )}
      </div>
    </section>
  );
}

function ElegirMazo({ resumen, alEmpezar }) {
  return (
    <div className={estilos.mazos}>
      <button
        type="button"
        className={`${estilos.mazo} ${estilos.destacado}`}
        disabled={resumen.pendientesHoy === 0}
        onClick={() => alEmpezar("Repaso de hoy", { modo: "repaso" })}
      >
        <strong>Repaso de hoy</strong>
        <span>
          {resumen.pendientesHoy
            ? `${resumen.pendientesHoy} tarjetas te tocan hoy`
            : "Nada pendiente. Practica una categoría nueva."}
        </span>
      </button>
      <button type="button" className={estilos.mazo} onClick={() => alEmpezar("Preguntas nuevas", { modo: "nuevas" })}>
        <strong>Preguntas nuevas</strong>
        <span>Las que nunca respondiste, de todas las categorías</span>
      </button>
      {resumen.categorias.map((c) => (
        <button
          key={c.nombre}
          type="button"
          className={estilos.mazo}
          onClick={() => alEmpezar(c.nombre, { categoria: c.nombre })}
        >
          <strong>{c.nombre}</strong>
          <span>
            {c.vistas}/{c.total} vistas · {c.dominadas} dominadas
            {c.pendientes > 0 && ` · ${c.pendientes} para hoy`}
          </span>
          <div className={estilos.barra}>
            <div style={{ width: `${(c.dominadas / c.total) * 100}%` }} />
          </div>
        </button>
      ))}
    </div>
  );
}

function SesionTarjetas({ sesion, alCalificar, alTerminar }) {
  const { tarjetas, indice, notas, titulo } = sesion;

  if (tarjetas.length === 0) {
    return (
      <div className={estilos.final}>
        <p>No hay tarjetas en este mazo.</p>
        <button type="button" className="boton" onClick={alTerminar}>
          Volver
        </button>
      </div>
    );
  }

  if (indice >= tarjetas.length) {
    const cuenta = (n) => notas.filter((x) => x === n).length;
    return (
      <div className={estilos.final}>
        <h2>Terminaste: {titulo}</h2>
        <p>
          Lo sabías: <strong>{cuenta("sabia")}</strong> · Dudaste: <strong>{cuenta("dude")}</strong> · No lo sabías:{" "}
          <strong>{cuenta("no")}</strong>
        </p>
        <p className={estilos.nota}>Las que no sabías vuelven mañana; las que sabías, en unos días.</p>
        <button type="button" className="boton boton-primario" onClick={alTerminar}>
          Volver a los mazos
        </button>
      </div>
    );
  }

  return (
    <div className={estilos.sesion}>
      <div className={estilos.sesionCabecera}>
        <span>{titulo}</span>
        <button type="button" className="boton boton-fantasma" onClick={alTerminar}>
          Salir
        </button>
      </div>
      <Tarjeta
        key={tarjetas[indice].id}
        pregunta={tarjetas[indice]}
        alCalificar={alCalificar}
        posicion={`${indice + 1}/${tarjetas.length}`}
      />
    </div>
  );
}
