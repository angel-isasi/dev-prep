// "+ Tarjeta": la IA propone tarjetas de memoria a partir de algo que fallaste, y tú decides cuáles entran.
// Así el mazo no se llena de basura. Sin IA (o en la app local sin tarjetas) no se muestra.
import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { estadoIa, claveIa } from "../../lib/ia.js";
import { MAZOS } from "../../../../server/tarjetas-reglas.js";
import { useIa } from "./useIa.js";
import base from "../EvaluadorIa.module.css";
import estilos from "./Tarjetas.module.css";

/** Las propuestas de la IA, cada una con Guardar o Descartar. */
export function Propuestas({ propuestas, origen, alTerminar }) {
  const [lista, setLista] = useState(propuestas.map((p, i) => ({ ...p, clave: i, estado: "propuesta" })));
  const cambiar = (clave, estado) => {
    const nueva = lista.map((p) => (p.clave === clave ? { ...p, estado } : p));
    setLista(nueva);
    if (nueva.every((p) => p.estado !== "propuesta")) alTerminar?.(nueva.filter((p) => p.estado === "guardada").length);
  };
  return (
    <div className={estilos.propuestas}>
      {lista.map((p) => (
        <div key={p.clave} className={estilos.propuesta} data-estado={p.estado}>
          <span className={estilos.mazo}>{MAZOS[p.mazo] ?? p.mazo}</span>
          <strong>{p.frente}</strong>
          <span>{p.reverso}</span>
          {p.ejemplo && <code className={estilos.ejemplo}>{p.ejemplo}</code>}
          {p.estado === "propuesta" ? (
            <div className={base.fila}>
              <button
                type="button"
                className="boton boton-primario"
                onClick={async () => {
                  await api.guardarTarjeta({ mazo: p.mazo, frente: p.frente, reverso: p.reverso, ejemplo: p.ejemplo, origen });
                  cambiar(p.clave, "guardada");
                }}
              >
                Guardar
              </button>
              <button type="button" className="boton boton-fantasma" onClick={() => cambiar(p.clave, "descartada")}>
                Descartar
              </button>
            </div>
          ) : (
            <small className={base.suave}>{p.estado === "guardada" ? "Guardada en tus tarjetas" : "Descartada"}</small>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Botón pequeño para convertir algo en tarjeta.
 * @param {{ contenido: string, origen: string, texto?: string }} props
 */
export function CrearTarjeta({ contenido, origen, texto = "+ Tarjeta" }) {
  const [lista, setLista] = useState(null);
  const [disponible, setDisponible] = useState(false);
  const { cargando, error, pedir } = useIa();
  useEffect(() => {
    if (!api.guardarTarjeta || !claveIa()) return;
    estadoIa().then((e) => setDisponible(e.configurada));
  }, []);
  if (!disponible) return null;
  if (lista) return <Propuestas propuestas={lista} origen={origen} />;
  return (
    <>
      <button
        type="button"
        className={base.enlace}
        disabled={cargando}
        title="La IA te propone una tarjeta de memoria con esto"
        onClick={async () => {
          const r = await pedir({ tarea: "tarjeta-crear", contenido, origen });
          if (r?.tarjetas?.length) setLista(r.tarjetas);
        }}
      >
        {cargando ? "Creando tarjeta…" : texto}
      </button>
      {error && <small className={base.error}>{error}</small>}
    </>
  );
}
