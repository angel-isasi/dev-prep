// Portafolio, pruebas técnicas para casa y el proyecto guiado. Necesitan el disco de tu laptop:
// funcionan cuando la web está conectada con dev-prep (o en la app local).
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { celebrar } from "../../lib/celebrar.js";
import { Markdown } from "../../components/Markdown.jsx";
import estilos from "./Trabajo.module.css";

function SinLaptop() {
  return (
    <p className={estilos.ayuda}>
      Esto crea carpetas en tu laptop y las abre en VS Code, así que funciona con dev-prep abierto en tu laptop. Ábrela ahí (la web se conecta sola) o ve a{" "}
      <Link to="/ajustes">Ajustes</Link> → "Conectar con dev-prep de esta laptop".
    </p>
  );
}

export function Portafolio() {
  const [fichas, setFichas] = useState(null);
  const [publicados, setPublicados] = useState({});
  const [aviso, setAviso] = useState(null);

  const cargar = () => {
    api.portafolio?.().then(setFichas, (e) => setAviso(e.message));
    api.portafolioPublicado?.().then(setPublicados);
  };
  useEffect(() => {
    cargar();
  }, []);
  if (!api.portafolio) return <SinLaptop />;
  if (!fichas) return null;

  return (
    <>
      <p className={estilos.ayuda}>
        Cuando resuelvas uno de estos componentes, expórtalo: se crea un mini proyecto en <code>Documentos\portafolio</code> con Vite, tu solución, sus tests y un
        README que incluye tu explicación. Luego lo subes a tu GitHub (instrucciones abajo).
      </p>
      {aviso && <p className={estilos.ayuda}>{aviso}</p>}
      <ul className={estilos.lista}>
        {fichas.map((f) => {
          const publicado = publicados[f.ejercicio];
          return (
            <li key={f.ejercicio} className={estilos.item} data-estado={publicado ? "dominas" : f.exportado ? "en-progreso" : ""}>
              <div>
                <strong>{f.titulo}</strong>
                <small>
                  {f.resuelto ? "Resuelto" : "Por resolver"}
                  {f.exportado && " · exportado"}
                  {publicado?.enlace && ` · publicado: ${publicado.enlace}`}
                </small>
              </div>
              <div className={estilos.acciones}>
                {!f.resuelto ? (
                  <Link to={`/practicar/${f.ejercicio}`} className="boton">
                    Resolverlo
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="boton boton-primario"
                    onClick={async () => {
                      try {
                        const r = await api.exportarPortafolio(f.ejercicio);
                        setAviso(`Creado en ${r.carpeta}${r.avisoVSCode ? "" : " y abierto en VS Code"}.`);
                        cargar();
                      } catch (e) {
                        setAviso(e.message);
                      }
                    }}
                  >
                    {f.exportado ? "Exportar de nuevo" : "Exportar"}
                  </button>
                )}
                {f.exportado && (
                  <button
                    type="button"
                    className="boton boton-fantasma"
                    onClick={async () => {
                      const enlace = window.prompt("Enlace del repositorio o de la demo publicada:", publicado?.enlace ?? "https://github.com/");
                      if (enlace) {
                        await api.marcarPortafolio(f.ejercicio, { titulo: f.titulo, enlace });
                        cargar();
                      }
                    }}
                  >
                    {publicado ? "Cambiar enlace" : "Ya lo publiqué"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <details className={estilos.panel}>
        <summary>Cómo subirlo a GitHub y publicar la demo</summary>
        <ol>
          <li>En GitHub, crea un repositorio nuevo con el nombre de la carpeta (sin README).</li>
          <li>
            En la terminal de VS Code, dentro de la carpeta: <code>git init</code>, <code>git add .</code>, <code>git commit -m "Primer commit"</code>.
          </li>
          <li>Copia los dos comandos que te da GitHub (git remote add y git push) y ejecútalos.</li>
          <li>Para la demo: en Vercel, "Add New Project", elige el repositorio y publica (detecta Vite solo).</li>
          <li>Vuelve aquí y toca "Ya lo publiqué" con el enlace: cuenta para tu CV y tu nivel.</li>
        </ol>
      </details>
    </>
  );
}

export function PruebasYProyecto() {
  const [lista, setLista] = useState(null);
  const [abierto, setAbierto] = useState(null);
  useEffect(() => {
    api.proyectos?.().then(setLista, () => setLista([]));
  }, []);
  if (!api.proyectos) return <SinLaptop />;
  if (!lista) return null;
  const elegido = lista.find((p) => p.id === abierto);
  if (elegido) return <DetalleProyecto proyecto={elegido} alVolver={() => setAbierto(null)} />;

  return (
    <>
      <p className={estilos.ayuda}>
        Pruebas técnicas para casa como las que mandan las empresas (2 a 4 horas, con rúbrica) y un proyecto guiado por etapas que termina siendo tu proyecto estrella.
      </p>
      <ul className={estilos.lista}>
        {lista.map((p) => (
          <li key={p.id} className={estilos.item}>
            <div>
              <strong>{p.titulo}</strong>
              <small>
                {p.tipo === "pruebas" ? `Prueba técnica · ${p.horas ?? "?"} h` : `Proyecto guiado · ${p.etapas.length} etapas`}
                {p.tecnologias?.length ? ` · ${p.tecnologias.join(", ")}` : ""}
              </small>
            </div>
            <button type="button" className="boton boton-primario" onClick={() => setAbierto(p.id)}>
              Abrir
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

const CLAVE_ETAPA = (id) => `devprep-etapa-${id}`;

function DetalleProyecto({ proyecto, alVolver }) {
  const guiado = proyecto.tipo === "proyectos";
  const [etapa, setEtapa] = useState(() => Number(localStorage.getItem(CLAVE_ETAPA(proyecto.id))) || 1);
  const [resultado, setResultado] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [rubrica, setRubrica] = useState({});
  const actual = guiado ? proyecto.etapas[etapa - 1] : null;

  async function abrir() {
    setOcupado(true);
    try {
      const r = await api.abrirProyecto(proyecto.id, guiado ? etapa : undefined);
      setAviso(`Carpeta: ${r.carpeta}${r.avisoVSCode ? ` (no se pudo abrir VS Code: ${r.avisoVSCode})` : ""}`);
    } catch (e) {
      setAviso(e.message);
    }
    setOcupado(false);
  }

  async function verificar() {
    setOcupado(true);
    setResultado(null);
    try {
      const r = await api.verificarProyecto(proyecto.id, guiado ? etapa : undefined);
      setResultado(r);
      if (r.total && r.pasan === r.total) {
        celebrar("logro");
        if (guiado && etapa < proyecto.etapas.length) {
          localStorage.setItem(CLAVE_ETAPA(proyecto.id), String(etapa + 1));
        }
      }
    } catch (e) {
      setAviso(e.message);
    }
    setOcupado(false);
  }

  const puntos = proyecto.rubrica?.reduce((s, c) => s + (rubrica[c.criterio] ? c.puntos : 0), 0) ?? 0;

  return (
    <>
      <button type="button" className="boton boton-fantasma" onClick={alVolver}>
        ← Volver
      </button>
      <h2>{proyecto.titulo}</h2>
      {guiado && (
        <div className={estilos.etapas}>
          {proyecto.etapas.map((e, i) => (
            <button key={e.id} type="button" className={estilos.etapa} data-actual={i + 1 === etapa} data-hecha={i + 1 < etapa} onClick={() => (setEtapa(i + 1), setResultado(null))}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
      <div className={estilos.panel}>
        <Markdown>{guiado ? `### Etapa ${etapa}: ${actual?.meta?.titulo ?? ""}\n\n${actual?.enunciado ?? ""}` : proyecto.enunciado}</Markdown>
      </div>
      <div className={estilos.fila}>
        <button type="button" className="boton boton-primario" onClick={abrir} disabled={ocupado}>
          Abrir en VS Code
        </button>
        <button type="button" className="boton" onClick={verificar} disabled={ocupado}>
          {ocupado ? "Corriendo tests…" : "Verificar con los tests"}
        </button>
      </div>
      {aviso && <p className={estilos.ayuda}>{aviso}</p>}
      {resultado && (
        <div className={estilos.panel} data-estado={resultado.pasan === resultado.total ? "dominas" : "rojo"}>
          <strong>
            {resultado.pasan} de {resultado.total} tests pasan
          </strong>
          {resultado.archivos.map((a) => (
            <div key={a.archivo}>
              <small className={estilos.tenue}>{a.archivo}</small>
              {a.error && <pre className={estilos.error}>{a.error}</pre>}
              <ul>
                {(a.casos ?? []).map((c) => (
                  <li key={c.nombre}>
                    {c.ok ? "✅" : "❌"} {c.nombre}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {guiado && resultado.pasan === resultado.total && etapa < proyecto.etapas.length && (
            <button type="button" className="boton boton-primario" onClick={() => (setEtapa(etapa + 1), setResultado(null))}>
              Siguiente etapa →
            </button>
          )}
        </div>
      )}
      {!guiado && proyecto.rubrica?.length > 0 && (
        <div className={estilos.panel}>
          <strong>Rúbrica: califícate como lo haría la empresa ({puntos}/100)</strong>
          <ul className={estilos.lista}>
            {proyecto.rubrica.map((c) => (
              <li key={c.criterio}>
                <label>
                  <input type="checkbox" checked={!!rubrica[c.criterio]} onChange={(e) => setRubrica({ ...rubrica, [c.criterio]: e.target.checked })} /> <strong>{c.criterio}</strong> ({c.puntos}):{" "}
                  {c.descripcion}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
