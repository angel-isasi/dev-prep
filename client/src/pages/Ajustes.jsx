import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { SeccionSync } from "../components/SeccionSync.jsx";
import { EnPestanas, SeccionRutina } from "../components/SeccionRutina.jsx";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { ContenidoPestanas, Pestanas } from "../components/Pestanas.jsx";
import { usePestanaUrl } from "../hooks/usePestanaUrl.js";
import { useTema } from "../hooks/useTema.js";
import { IconoLuna, IconoSol } from "../components/Iconos.jsx";
import { PanelInvitado } from "../components/PanelInvitado.jsx";
import seccion from "../components/SeccionSync.module.css";
import estilos from "./Ajustes.module.css";

/**
 * Ajustes: la misma pantalla en la laptop, en la web y en el celular, repartida en pestañas
 * (queda en la dirección: ?pestana=puntos):
 *  - Tú: nombre, objetivo, meta, deuda, fecha meta, mi semana y semanas de exámenes.
 *  - Puntos: la tabla de puntos y el tiempo libre.
 *  - Dispositivos: apariencia, sincronización, avisos, respaldo y lo demás.
 * `seccionExtra` trae lo que depende de dónde corre la app (QR en la laptop; sincronización,
 * respaldo y avisos en la web) y va en "Dispositivos".
 */
export function Ajustes({ seccionExtra }) {
  const { tema, alternar } = useTema();
  // El formulario vive aquí arriba: aunque cambies de pestaña, lo escrito sin guardar no se pierde.
  const [form, setForm] = useState(null);
  const [estado, setEstado] = useState("listo"); // listo | guardando | guardado | error

  // La rutina (mi semana, puntos) solo existe en la versión web: sin ella no hay pestaña "Puntos".
  const hayRutina = typeof api.rutina === "function";
  const pestanas = [
    { id: "tu", texto: "Tú" },
    ...(hayRutina ? [{ id: "puntos", texto: "Puntos" }] : []),
    { id: "dispositivos", texto: "Dispositivos" },
  ];
  const orden = pestanas.map((p) => p.id);
  const [pestana, setPestana] = usePestanaUrl(orden);

  useEffect(() => {
    api.config().then(setForm);
  }, []);

  if (!form) return <Esqueleto variante="texto" />;

  const cambiar = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setEstado("listo");
  };

  async function guardar(evento) {
    evento.preventDefault();
    setEstado("guardando");
    try {
      const guardado = await api.guardarConfig({
        nombre: form.nombre ?? "",
        objetivo: form.objetivo ?? "",
        metaDiaria: Number(form.metaDiaria),
        topeDeuda: Number(form.topeDeuda),
        fechaMeta: form.fechaMeta,
      });
      setForm(guardado);
      setEstado("guardado");
    } catch {
      setEstado("error");
    }
  }

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina etiqueta="Tu configuración" titulo="Ajustes">
        Lo que pongas aquí define tu meta diaria, la deuda y la cuenta regresiva. Todo lo que estudias suma puntos: la tabla está en la pestaña Puntos.
      </CabeceraPagina>

      <Pestanas pestanas={pestanas} activa={pestana} alCambiar={setPestana} />

      <ContenidoPestanas activa={pestana} orden={orden} className={estilos.contenido}>
        {pestana === "tu" && (
          <>
            {/* Un solo formulario con un solo Guardar: sus cinco campos están todos en esta pestaña */}
            <form className={estilos.formulario} onSubmit={guardar}>
              <div className={estilos.bloques}>
                <div className={estilos.bloque}>
                  <h2 className={estilos.seccion}>Sobre ti</h2>
                  <label>
                    <span>Tu nombre</span>
                    <input value={form.nombre ?? ""} maxLength={60} onChange={(e) => cambiar("nombre", e.target.value)} />
                  </label>
                  <label>
                    <span>Tu objetivo personal</span>
                    <textarea
                      rows={3}
                      maxLength={500}
                      title="Se muestra siempre en Hoy. Escríbelo con tus palabras y con una fecha."
                      placeholder="Conseguir mis prácticas como desarrollador frontend en marzo de 2027."
                      value={form.objetivo ?? ""}
                      onChange={(e) => cambiar("objetivo", e.target.value)}
                    />
                  </label>
                </div>

                <div className={estilos.bloque}>
                  <h2 className={estilos.seccion}>Tu ritmo</h2>
                  {/* Ayudas de una línea, para que los tres campos queden a la misma altura */}
                  <div className={estilos.fila}>
                    <label title="En unidades de 25 puntos: con 2, son 50 puntos al día">
                      <span>Meta diaria</span>
                      <small>1 = 25 puntos</small>
                      <input type="number" min={0} max={20} value={form.metaDiaria} onChange={(e) => cambiar("metaDiaria", e.target.value)} />
                    </label>
                    <label title="Máximo de deuda que se acumula, también en unidades de 25 puntos">
                      <span>Tope de deuda</span>
                      <small>Máximo acumulado</small>
                      <input type="number" min={0} max={50} value={form.topeDeuda} onChange={(e) => cambiar("topeDeuda", e.target.value)} />
                    </label>
                    <label title="Cuándo quieres empezar a postular">
                      <span>Fecha meta</span>
                      <small>Para postular</small>
                      <input type="date" value={form.fechaMeta} onChange={(e) => cambiar("fechaMeta", e.target.value)} />
                    </label>
                  </div>
                </div>
              </div>

              <div className={estilos.acciones}>
                <button type="submit" className="boton boton-primario" disabled={estado === "guardando"}>
                  Guardar
                </button>
                {estado === "guardado" && <span className={estilos.ok}>Guardado</span>}
                {estado === "error" && <span className={estilos.error}>No se pudo guardar</span>}
              </div>
            </form>

            {hayRutina && <SeccionRutina partes={["semana", "pausas"]} />}
          </>
        )}

        {pestana === "puntos" && <SeccionRutina partes={["puntos"]} />}

        {pestana === "dispositivos" && (
          <div className={estilos.columnas}>
            <section className={seccion.seccion}>
              <h2>Apariencia</h2>
              <div className={seccion.acciones}>
                <button type="button" className="boton" onClick={alternar}>
                  {tema === "oscuro" ? <IconoSol /> : <IconoLuna />}
                  {tema === "oscuro" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                </button>
              </div>
            </section>

            <PanelInvitado />

            {/* Con este contexto, la SeccionRutina que venga dentro de seccionExtra solo pinta lo que
                no se mostró ya en las otras pestañas (inglés y sonidos). */}
            <EnPestanas.Provider value={true}>{seccionExtra ?? <SeccionSync />}</EnPestanas.Provider>
          </div>
        )}
      </ContenidoPestanas>
    </section>
  );
}
