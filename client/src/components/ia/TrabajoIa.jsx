// IA en Conseguir trabajo: prepararte para una oferta concreta, revisar tu CV y revisar la entrega de una
// prueba técnica o de una etapa del proyecto guiado como lo haría un senior.
import { useState } from "react";
import { api } from "../../lib/api.js";
import { encabezadoDe } from "../../../../server/cv-oferta.js";
import { EvaluadorIa } from "../EvaluadorIa.jsx";
import { CajaIa, ListaIa, Veredicto, estilosIa as base } from "./CajaIa.jsx";
import { useIa } from "./useIa.js";

/** Tu perfil en texto (sin datos de contacto): CV y lo que dominas. */
async function perfilTrabajo() {
  const [r, cvBase] = await Promise.all([api.cv?.().catch(() => null), api.cvBase?.().catch(() => null)]);
  if (!r) return "";
  const { correo: _c, telefono: _t, ...cv } = r.datos ?? {};
  return [
    cvBase?.texto ? encabezadoDe(cvBase.texto).cuerpo : `CV: ${JSON.stringify(cv)}`,
    r.habilidades?.length ? `Lo que domina de verdad (temas en verde): ${r.habilidades.map((h) => h.nombre ?? h).join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function PrepararOferta({ oferta }) {
  return (
    <CajaIa titulo="Prepárame para esta oferta" detalle="Qué destacar de tu perfil, qué te preguntarían y qué te falta, para esta oferta en concreto.">
      {(olvidar) => <PrepararContenido oferta={oferta} olvidar={olvidar} />}
    </CajaIa>
  );
}

function PrepararContenido({ oferta, olvidar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  const [r, setR] = useState(null);
  return (
    <>
      <div className={base.fila}>
        <button type="button" className="boton boton-primario" disabled={cargando || oferta.trim().length < 40} onClick={async () => setR(await pedir({ tarea: "oferta", oferta, datos: await perfilTrabajo() }))}>
          {cargando ? "Cruzando la oferta con tu perfil…" : r ? "Otra vez" : "Prepárame"}
        </button>
        {oferta.trim().length < 40 && <small className={base.suave}>Pega arriba el texto de la oferta.</small>}
      </div>
      {error && <p className={base.error}>{error}</p>}
      {r && (
        <div className={base.resultado}>
          <Veredicto valor={{ alto: "bien", medio: "casi", bajo: "mal" }[r.encaje]} texto={`Encaje ${r.encaje}`} />
          <p>{r.resumen}</p>
          <div className={base.columnas}>
            <ListaIa titulo="Destaca esto" items={r.destacar} tipo="bien" />
            <ListaIa titulo="Te falta" items={r.brechas} tipo="falta" />
          </div>
          <ListaIa titulo="Te podrían preguntar" items={r.preguntas} />
        </div>
      )}
    </>
  );
}

export function RevisarCv() {
  return (
    <CajaIa titulo="Revisión de tu CV" detalle="Como lo vería una reclutadora en 30 segundos. Guarda tus cambios antes de revisarlo.">
      {(olvidar) => <RevisarCvContenido olvidar={olvidar} />}
    </CajaIa>
  );
}

function RevisarCvContenido({ olvidar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  const [oferta, setOferta] = useState("");
  const [r, setR] = useState(null);
  return (
    <>
      <textarea className={base.texto} rows={2} value={oferta} onChange={(e) => setOferta(e.target.value)} placeholder="Opcional: pega una oferta para revisarlo pensando en ella" />
      <div className={base.fila}>
        <button type="button" className="boton boton-primario" disabled={cargando} onClick={async () => setR(await pedir({ tarea: "cv", cv: await perfilTrabajo(), oferta }))}>
          {cargando ? "Leyendo tu CV…" : "Revisar mi CV"}
        </button>
      </div>
      {error && <p className={base.error}>{error}</p>}
      {r && (
        <div className={base.resultado}>
          <Veredicto puntaje={r.puntaje} texto="Así lo vería una reclutadora" />
          <p>{r.resumen}</p>
          <div className={base.columnas}>
            <ListaIa titulo="Bien" items={r.bien} tipo="bien" />
            <ListaIa titulo="Para mejorar" items={r.mejoras} tipo="falta" />
          </div>
          {r.reescrituras.length > 0 && (
            <div className={base.mejor}>
              <span className={base.subtitulo}>Así quedaría mejor</span>
              <ul className={base.correcciones}>
                {r.reescrituras.map((x, i) => (
                  <li key={i}>
                    <span>
                      <del>{x.original}</del>
                    </span>
                    <ins>{x.mejor}</ins>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/** Revisión de senior de tu entrega (prueba técnica o etapa del proyecto guiado). Solo con la laptop conectada. */
export function RevisarEntrega({ proyecto, enunciado }) {
  const [codigo, setCodigo] = useState(null);
  const [error, setError] = useState(null);
  if (!api.codigoProyecto) return null;
  if (codigo) {
    return <EvaluadorIa tarea="codigo" respuestaFija={codigo} pedido={{ pregunta: enunciado.slice(0, 4000), categoria: proyecto.titulo }} />;
  }
  return (
    <div className={base.fila}>
      <button
        type="button"
        className="boton"
        onClick={async () => {
          const r = await api.codigoProyecto(proyecto.id).catch((e) => ({ error: e.message }));
          if (r?.codigo) setCodigo(r.codigo);
          else setError(r?.error ?? "Todavía no hay código tuyo en este proyecto. Ábrelo en VS Code y escribe tu solución.");
        }}
      >
        Revisión de un senior
      </button>
      {error && <small className={base.error}>{error}</small>}
    </div>
  );
}
