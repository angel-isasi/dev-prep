// "Ofertas para ti": ofertas reales de bolsas de trabajo con API pública, ordenadas según cuánto
// te convienen (nivel, lugar, tecnologías que dominas, inglés y qué tan nuevas son). Sin IA:
// las reglas están en server/ofertas-auto.js.
import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { ListaAnimada } from "../../components/ListaAnimada.jsx";
import estilos from "./Ofertas.module.css";

const hace = (iso) => {
  if (!iso) return "";
  const dias = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  return dias <= 0 ? "hoy" : dias === 1 ? "ayer" : `hace ${dias} días`;
};
const salario = (s) => (!s ? null : (s.texto ?? [s.min, s.max].filter(Boolean).join(" a ") + (s.moneda ? ` ${s.moneda}` : "")));

export function OfertasParaTi() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [filtro, setFiltro] = useState("todas"); // todas | junior | peru

  async function cargar(nuevo = false) {
    setCargando(true);
    setError(null);
    try {
      setDatos(await api.ofertasParaTi({ nuevo }));
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => {
    cargar();
  }, []);

  const visibles = (datos?.ofertas ?? []).filter((o) =>
    filtro === "junior"
      ? o.razones.some((r) => r.texto.startsWith("Busca junior"))
      : filtro === "peru"
        ? o.razones.some((r) => /Perú|Latinoamérica/.test(r.texto))
        : true,
  );

  return (
    <div className={estilos.ofertas}>
      <p className={estilos.ayuda}>
        Ofertas reales de Get on Board, Remotive, RemoteOK y Arbeitnow, ordenadas por cuánto te convienen: que sean de frontend, para
        junior, abiertas a Perú o Latinoamérica, con lo que ya dominas y recientes. LinkedIn y Computrabajo no permiten leerlas
        automáticamente: para esas, usa "¿Estoy listo?".
      </p>

      <div className={estilos.barra}>
        <div className={estilos.filtros} role="group" aria-label="Filtrar ofertas">
          {[
            ["todas", "Todas"],
            ["junior", "Para junior"],
            ["peru", "Perú o Latinoamérica"],
          ].map(([id, texto]) => (
            <button key={id} type="button" className="boton" data-activo={filtro === id} onClick={() => setFiltro(id)}>
              {texto}
            </button>
          ))}
        </div>
        <button type="button" className="boton boton-fantasma" disabled={cargando} onClick={() => cargar(true)}>
          {cargando ? "Buscando…" : "Buscar de nuevo"}
        </button>
      </div>

      {datos && (
        <small className={estilos.estado}>
          {datos.sinConexion ? "Sin internet: es tu última búsqueda. " : ""}
          Buscado {hace(datos.buscadoEn)} en{" "}
          {datos.fuentes
            .filter((f) => f.ok)
            .map((f) => f.nombre)
            .join(", ") || "ninguna fuente"}
          {!datos.conLaptop && " · Get on Board (la de Latinoamérica) aparece cuando abres la web en tu laptop con dev-prep abierto"}
        </small>
      )}
      {error && <p className={estilos.ayuda}>No se pudo buscar: {error}</p>}
      {!datos && !error && <p className={estilos.ayuda}>Buscando ofertas…</p>}
      {datos && visibles.length === 0 && (
        <p className={estilos.ayuda}>No hay ofertas con ese filtro ahora. Prueba otro o busca más tarde.</p>
      )}

      <ListaAnimada className={estilos.lista}>
        {visibles.map((o) => (
          <li key={o.id}>
            <Oferta oferta={o} alGuardar={() => cargar()} />
          </li>
        ))}
      </ListaAnimada>
    </div>
  );
}

function Oferta({ oferta: o, alGuardar }) {
  const [abierta, setAbierta] = useState(false);
  const [guardada, setGuardada] = useState(o.guardada);
  const tono = o.puntaje >= 65 ? "alto" : o.puntaje >= 45 ? "medio" : "bajo";
  return (
    <article className={estilos.oferta}>
      <div className={estilos.puntaje} data-tono={tono} title="Cuánto te conviene, de 0 a 100">
        {o.puntaje}
      </div>
      <div className={estilos.cuerpo}>
        <a href={o.url} target="_blank" rel="noreferrer" className={estilos.titulo}>
          {o.titulo}
        </a>
        <small className={estilos.meta}>
          {[o.empresa, o.remoto ? "Remoto" : null, o.ubicacion, salario(o.salario), hace(o.fecha), o.fuente].filter(Boolean).join(" · ")}
        </small>
        <ul className={estilos.razones}>
          {o.razones.slice(0, abierta ? undefined : 3).map((r) => (
            <li key={r.texto} data-tipo={r.tipo}>
              {r.tipo === "a-favor" ? "+" : "−"} {r.texto}
            </li>
          ))}
        </ul>
        {abierta && o.tecnologias.length > 0 && (
          <div className={estilos.tecnologias}>
            {o.tecnologias.map((t) => (
              <span key={t.nombre} data-estado={t.estado}>
                {t.nombre}
              </span>
            ))}
          </div>
        )}
        <div className={estilos.acciones}>
          <button type="button" className="boton boton-fantasma" onClick={() => setAbierta((v) => !v)}>
            {abierta ? "Ver menos" : "Por qué este puntaje"}
          </button>
          <button
            type="button"
            className="boton"
            disabled={guardada}
            onClick={async () => {
              await api.guardarOfertaComoPostulacion(o);
              setGuardada(true);
              alGuardar?.();
            }}
          >
            {guardada ? "✓ En tus postulaciones" : "Guardar para postular"}
          </button>
        </div>
      </div>
    </article>
  );
}
