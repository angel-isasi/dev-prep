// "Ofertas para ti": ofertas reales de bolsas de trabajo con API pública, ordenadas según cuánto
// te convienen (nivel, lugar, tecnologías que dominas, inglés y qué tan nuevas son). Sin IA:
// las reglas están en server/ofertas-auto.js.
//
// Cada oferta trae su nivel de confianza (según la bolsa), las señales de estafa que se vieron,
// qué te falta para ella, palabras clave para tu CV y un mensaje listo para postular.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { ListaAnimada } from "../../components/ListaAnimada.jsx";
import { mensajePostulacion } from "../../../../server/postulaciones.js";
import estilos from "./Ofertas.module.css";
import { IconoAlerta, IconoCandado, IconoEstrella } from "../../components/Iconos.jsx";

/** Cuántas ofertas se muestran de entrada y cuántas más con cada "Ver más". */
const POR_PAGINA = 20;
const CLAVE_FILTRO = "devprep-ofertas-filtro";

const hace = (iso) => {
  if (!iso) return "";
  const dias = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  return dias <= 0 ? "hoy" : dias === 1 ? "ayer" : `hace ${dias} días`;
};
const salario = (s) => (!s ? null : (s.texto ?? [s.min, s.max].filter(Boolean).join(" a ") + (s.moneda ? ` ${s.moneda}` : "")));

const FILTROS = {
  todas: () => true,
  "para-mi": (o) => o.paraMi,
  junior: (o) => o.junior,
  peru: (o) => o.lugarOk,
  nuevas: (o) => o.nueva,
};

export function OfertasParaTi() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [filtro, setFiltro] = useState(() => localStorage.getItem(CLAVE_FILTRO) ?? "todas");
  const [mostrar, setMostrar] = useState(POR_PAGINA);
  const [marcas, setMarcas] = useState({});
  const [fuera, setFuera] = useState([]);

  async function cargar(nuevo = false) {
    setCargando(true);
    setError(null);
    try {
      const d = await api.ofertasParaTi({ nuevo });
      setDatos(d);
      setMarcas(Object.fromEntries(d.ofertas.filter((o) => o.marca).map((o) => [o.id, o.marca])));
      setFuera(d.guardadasFuera ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => {
    cargar();
  }, []);

  function elegir(id) {
    setFiltro(id);
    setMostrar(POR_PAGINA);
    localStorage.setItem(CLAVE_FILTRO, id);
  }

  async function marcar(o, estado) {
    setMarcas((m) => {
      const copia = { ...m };
      if (estado) copia[o.id] = estado;
      else delete copia[o.id];
      return copia;
    });
    if (!estado) setFuera((f) => f.filter((x) => x.id !== o.id));
    await api.marcarOferta(o, estado);
  }

  const todas = datos?.ofertas ?? [];
  const marcaDe = (o) => marcas[o.id] ?? null;
  const sinOcultas = todas.filter((o) => marcaDe(o) !== "oculta");
  const cuenta = {
    nuevas: sinOcultas.filter((o) => o.nueva).length,
    guardadas: todas.filter((o) => marcaDe(o) === "guardada").length + fuera.length,
    ocultas: todas.length - sinOcultas.length,
    paraMi: sinOcultas.filter((o) => o.paraMi).length,
  };
  const visibles =
    filtro === "ocultas"
      ? todas.filter((o) => marcaDe(o) === "oculta")
      : filtro === "guardadas"
        ? todas.filter((o) => marcaDe(o) === "guardada")
        : sinOcultas.filter(FILTROS[filtro] ?? FILTROS.todas);

  const botones = [
    ["todas", "Todas"],
    ["para-mi", `Solo para mí (${cuenta.paraMi})`],
    ["junior", "Para junior"],
    ["peru", "Perú o Latinoamérica"],
    ["nuevas", `Nuevas (${cuenta.nuevas})`],
    ["guardadas", `Guardadas (${cuenta.guardadas})`],
    ...(cuenta.ocultas || filtro === "ocultas" ? [["ocultas", `Ocultas (${cuenta.ocultas})`]] : []),
  ];

  return (
    <div className={estilos.ofertas}>
      <p className={estilos.seguridad}>
        <IconoCandado tamano={14} /> Nunca pagues por postular ni des datos bancarios antes de un contrato. Ante la duda, abre "Ver detalle" y verifica la empresa.
      </p>
      <details className={estilos.ayuda}>
        <summary>De dónde salen estas ofertas</summary>
        Ofertas reales de Get on Board, Remotive, We Work Remotely, Himalayas, RemoteOK y Arbeitnow, ordenadas por cuánto te convienen: que
        sean de frontend, para junior, abiertas a Perú o Latinoamérica, con lo que ya dominas y recientes. Cada una dice qué tan confiable es
        su bolsa y si tiene señales de estafa. LinkedIn y Computrabajo no permiten leerlas automáticamente: para esas, usa "¿Estoy listo?".
      </details>

      <div className={estilos.barra}>
        <div className={estilos.filtros} role="group" aria-label="Filtrar ofertas">
          {botones.map(([id, texto]) => (
            <button key={id} type="button" className="boton" data-activo={filtro === id} onClick={() => elegir(id)}>
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
          {!datos.conLaptop && " · Get on Board (la de Latinoamérica) y Himalayas aparecen cuando abres la web en tu laptop con dev-prep abierto"}
        </small>
      )}
      {datos && cuenta.nuevas > 0 && filtro !== "nuevas" && (
        <button type="button" className={estilos.avisoNuevas} onClick={() => elegir("nuevas")}>
          {cuenta.nuevas === 1 ? "Hay 1 oferta nueva" : `Hay ${cuenta.nuevas} ofertas nuevas`} desde tu última visita. Verlas
        </button>
      )}
      {error && <p className={estilos.ayuda}>No se pudo buscar: {error}</p>}
      {!datos && !error && <p className={estilos.ayuda}>Buscando ofertas…</p>}
      {datos && visibles.length === 0 && !(filtro === "guardadas" && fuera.length) && (
        <p className={estilos.ayuda}>
          {filtro === "para-mi"
            ? "Ahora no hay ofertas junior de frontend abiertas a Perú o Latinoamérica. Mira \"Todas\" o vuelve a buscar mañana: salen nuevas cada día."
            : filtro === "guardadas"
              ? "No guardaste ofertas. Usa \"Guardar\" en las que quieras revisar con calma."
              : "No hay ofertas con ese filtro ahora. Prueba otro o busca más tarde."}
        </p>
      )}

      <ListaAnimada className={estilos.lista}>
        {visibles.slice(0, mostrar).map((o) => (
          <li key={o.id}>
            <Oferta oferta={o} marca={marcaDe(o)} alMarcar={(estado) => marcar(o, estado)} cv={datos.cv} />
          </li>
        ))}
      </ListaAnimada>
      {visibles.length > mostrar && (
        <button type="button" className={`boton ${estilos.verMas}`} onClick={() => setMostrar((n) => n + POR_PAGINA)}>
          Ver más ({visibles.length - mostrar} {visibles.length - mostrar === 1 ? "oferta" : "ofertas"} con menor puntaje)
        </button>
      )}

      {filtro === "guardadas" && fuera.length > 0 && (
        <>
          <small className={estilos.estado}>Guardadas que ya no salen en la búsqueda (puede que hayan cerrado):</small>
          <ul className={estilos.lista}>
            {fuera.map((o) => (
              <li key={o.id} className={`${estilos.oferta} ${estilos.fuera}`}>
                <div className={estilos.cuerpo}>
                  <a href={o.url} target="_blank" rel="noreferrer" className={estilos.titulo}>
                    {o.titulo}
                  </a>
                  <small className={estilos.meta}>{[o.empresa, o.fuente, o.puntaje && `${o.puntaje}/100`].filter(Boolean).join(" · ")}</small>
                  <div className={estilos.acciones}>
                    <button type="button" className="boton boton-fantasma" onClick={() => marcar(o, null)}>
                      Quitar de guardadas
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

const ESTADOS = {
  dominas: "Lo dominas",
  "en-progreso": "Estás aprendiendo",
  "por-empezar": "Está en dev-prep: por empezar",
  "no-esta": "No está en dev-prep",
};

const CHECKLIST = [
  "La empresa existe: tiene web propia y página en LinkedIn con empleados reales.",
  "La oferta también está en la web oficial de la empresa o en su LinkedIn.",
  "Nadie te pide pagar nada: ni equipo, ni cursos, ni \"inscripción\".",
  "La entrevista es por videollamada o en persona, no solo por chat (WhatsApp o Telegram).",
  "Si te mandan una prueba técnica, no corras código ajeno sin revisarlo (nada de \"clona y ejecuta\" un repo desconocido).",
];

function Oferta({ oferta: o, marca, alMarcar, cv }) {
  const [abierta, setAbierta] = useState(false);
  const [enPostulaciones, setEnPostulaciones] = useState(o.guardada);
  const tono = o.puntaje >= 65 ? "alto" : o.puntaje >= 45 ? "medio" : "bajo";
  const alertas = o.alertas ?? [];
  return (
    <article className={`aparecer brillo ${estilos.oferta}`} data-alerta={alertas.length > 0}>
      <div className={estilos.puntaje} data-tono={tono} title="Cuánto te conviene, de 0 a 100">
        {o.puntaje}
      </div>
      <div className={estilos.cuerpo}>
        <a href={o.url} target="_blank" rel="noreferrer" className={estilos.titulo}>
          {o.titulo}
        </a>
        <div className={estilos.insignias}>
          {o.nueva && <span data-tipo="nueva">Nueva</span>}
          {o.confianza && (
            <span data-tipo="confianza" data-nivel={o.confianza.nivel} title={o.confianza.detalle}>
              {o.confianza.nivel === "alta" ? "✓ " : o.confianza.nivel === "baja" ? "! " : ""}
              {o.fuente}: {o.confianza.texto}
            </span>
          )}
          {alertas.length > 0 && (
            <span data-tipo="alerta" title={alertas.join(". ")}>
              <IconoAlerta tamano={14} /> Posible estafa
            </span>
          )}
        </div>
        <small className={estilos.meta}>
          {[o.empresa, o.remoto ? "Remoto" : null, o.ubicacion, salario(o.salario), hace(o.fecha)].filter(Boolean).join(" · ")}
        </small>
        <ul className={estilos.razones}>
          {o.razones.slice(0, abierta ? undefined : 3).map((r) => (
            <li key={r.texto} data-tipo={r.tipo}>
              {r.tipo === "a-favor" ? "+" : "−"} {r.texto}
            </li>
          ))}
        </ul>

        {abierta && <Detalle oferta={o} cv={cv} />}

        <div className={estilos.acciones}>
          <button type="button" className="boton boton-fantasma" onClick={() => setAbierta((v) => !v)} aria-expanded={abierta}>
            {abierta ? "Ver menos" : "Ver detalle"}
          </button>
          {marca !== "oculta" && (
            <button type="button" className="boton" data-activo={marca === "guardada"} onClick={() => alMarcar(marca === "guardada" ? null : "guardada")}>
              <IconoEstrella tamano={14} llena={marca === "guardada"} /> {marca === "guardada" ? "Guardada" : "Guardar"}
            </button>
          )}
          <button type="button" className="boton boton-fantasma" onClick={() => alMarcar(marca === "oculta" ? null : "oculta")}>
            {marca === "oculta" ? "Volver a mostrar" : "No me interesa"}
          </button>
          <button
            type="button"
            className="boton"
            disabled={enPostulaciones}
            onClick={async () => {
              await api.guardarOfertaComoPostulacion(o);
              setEnPostulaciones(true);
            }}
          >
            {enPostulaciones ? "✓ En tus postulaciones" : "Agregar a postulaciones"}
          </button>
        </div>
      </div>
    </article>
  );
}

/** Lo que se ve al abrir una oferta: alertas, qué te falta, tu CV, verificar la empresa y el mensaje. */
function Detalle({ oferta: o, cv }) {
  const [revisado, setRevisado] = useState([]);
  const [idioma, setIdioma] = useState(o.idioma === "en" ? "en" : "es");
  const [copiado, setCopiado] = useState(false);
  const alertas = o.alertas ?? [];
  const faltan = o.tecnologias.filter((t) => t.estado !== "dominas");
  const practicar = faltan.find((t) => t.ruta);
  const mensaje = mensajePostulacion({ empresa: o.empresa, puesto: o.titulo, tecnologias: o.tecnologias, cv, idioma });
  const empresa = o.empresa?.trim();

  return (
    <div className={estilos.detalle}>
      {alertas.length > 0 && (
        <div className={estilos.cajaAlerta}>
          <strong>
<IconoAlerta tamano={16} /> Señales de posible estafa
</strong>
          <ul>
            {alertas.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <small>Una señal sola no prueba nada, pero no postules sin verificar la empresa con la lista de abajo.</small>
        </div>
      )}

      <section>
        <h4>Qué te falta para esta oferta</h4>
        {o.tecnologias.length === 0 ? (
          <p className={estilos.tenue}>No detecté tecnologías en el aviso. Ábrelo y léelo completo.</p>
        ) : faltan.length === 0 ? (
          <p className={estilos.tenue}>Dominas todo lo que pide. ¡Postula!</p>
        ) : (
          <ul className={estilos.faltan}>
            {faltan.map((t) => (
              <li key={t.nombre} data-estado={t.estado}>
                <span>
                  <strong>{t.nombre}</strong> · {ESTADOS[t.estado]}
                  {t.valor != null && t.valor > 0 ? ` (${Math.round(t.valor * 100)}%)` : ""}
                </span>
                {t.ruta && (
                  <Link to={t.ruta} className="boton boton-fantasma">
                    Practicar
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
        {o.tecnologias.some((t) => t.estado === "dominas") && (
          <div className={estilos.tecnologias}>
            {o.tecnologias
              .filter((t) => t.estado === "dominas")
              .map((t) => (
                <span key={t.nombre} data-estado="dominas">
                  ✓ {t.nombre}
                </span>
              ))}
          </div>
        )}
        {practicar && (
          <Link to={practicar.ruta} className="boton boton-primario">
            Practicar lo que falta: {practicar.nombre}
          </Link>
        )}
      </section>

      {(o.paraCv?.agregar.length > 0 || o.paraCv?.aprender.length > 0) && (
        <section>
          <h4>Palabras clave para tu CV</h4>
          {o.paraCv.agregar.length > 0 && (
            <p>
              <strong>Agrégalas a tu CV</strong> (las sabes o las estás aprendiendo y no aparecen): {o.paraCv.agregar.join(", ")}.
            </p>
          )}
          {o.paraCv.aprender.length > 0 && (
            <p className={estilos.tenue}>
              Pide {o.paraCv.aprender.join(", ")}: todavía no las tienes, así que no las pongas en tu CV hasta practicarlas.
            </p>
          )}
        </section>
      )}

      <section>
        <h4>Antes de postular: verifica la empresa</h4>
        {empresa && (
          <div className={estilos.acciones}>
            <a
              className="boton boton-fantasma"
              target="_blank"
              rel="noreferrer"
              href={`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(empresa)}`}
            >
              Buscar en LinkedIn
            </a>
            <a className="boton boton-fantasma" target="_blank" rel="noreferrer" href={`https://www.google.com/search?q=${encodeURIComponent(`"${empresa}"`)}`}>
              Buscar en Google
            </a>
            <a
              className="boton boton-fantasma"
              target="_blank"
              rel="noreferrer"
              href={`https://www.google.com/search?q=${encodeURIComponent(`"${empresa}" scam OR estafa OR fraude`)}`}
            >
              ¿Hay quejas?
            </a>
          </div>
        )}
        <ul className={estilos.checklist}>
          {CHECKLIST.map((c, i) => (
            <li key={c}>
              <label>
                <input
                  type="checkbox"
                  checked={revisado.includes(i)}
                  onChange={() => setRevisado((r) => (r.includes(i) ? r.filter((x) => x !== i) : [...r, i]))}
                />
                {c}
              </label>
            </li>
          ))}
        </ul>
        {revisado.length === CHECKLIST.length && <p className={estilos.tenue}>✓ Todo en orden: postula desde el enlace oficial.</p>}
      </section>

      <section>
        <div className={estilos.fila}>
          <h4>Mensaje para postular</h4>
          <div className={estilos.filtros} role="group" aria-label="Idioma del mensaje">
            {[
              ["es", "Español"],
              ["en", "English"],
            ].map(([id, texto]) => (
              <button key={id} type="button" className="boton" data-activo={idioma === id} onClick={() => (setIdioma(id), setCopiado(false))}>
                {texto}
              </button>
            ))}
          </div>
        </div>
        <textarea className={estilos.mensaje} readOnly rows={9} value={mensaje} />
        <div className={estilos.acciones}>
          <button
            type="button"
            className="boton"
            onClick={async () => {
              await navigator.clipboard?.writeText(mensaje);
              setCopiado(true);
            }}
          >
            {copiado ? "✓ Copiado" : "Copiar"}
          </button>
          <small className={estilos.tenue}>Es una plantilla: léela y cámbiala a tu manera antes de enviarla. Tus datos salen de "Mi CV".</small>
        </div>
      </section>
    </div>
  );
}
