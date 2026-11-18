import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { SeccionSync } from "../components/SeccionSync.jsx";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { useTema } from "../hooks/useTema.js";
import { IconoLuna, IconoSol } from "../components/Iconos.jsx";
import seccion from "../components/SeccionSync.module.css";
import estilos from "./Ajustes.module.css";

/**
 * Ajustes: la misma pantalla en la laptop, en la web y en el celular. En pantallas anchas las
 * secciones se reparten en dos columnas. `seccionExtra` trae lo que depende de dónde corre la app
 * (QR en la laptop; sincronización, respaldo y avisos en la web).
 */
export function Ajustes({ seccionExtra }) {
  const { tema, alternar } = useTema();
  const [form, setForm] = useState(null);
  const [estado, setEstado] = useState("listo"); // listo | guardando | guardado | error

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
        Lo que pongas aquí define tu meta diaria, la deuda y la cuenta regresiva. Todo lo que estudias suma puntos: la tabla está más abajo.
      </CabeceraPagina>
      <div className={estilos.columnas}>
        <form className={estilos.formulario} onSubmit={guardar}>
          <h2 className={estilos.seccion}>Sobre ti</h2>
          <label>
            <span>Tu nombre</span>
            <input value={form.nombre ?? ""} maxLength={60} onChange={(e) => cambiar("nombre", e.target.value)} />
          </label>

          <label>
            <span>Tu objetivo personal</span>
            <small>Se muestra siempre en Inicio. Escríbelo con tus palabras y con una fecha.</small>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Conseguir mis prácticas como desarrollador frontend en marzo de 2027."
              value={form.objetivo ?? ""}
              onChange={(e) => cambiar("objetivo", e.target.value)}
            />
          </label>

          <h2 className={estilos.seccion}>Tu ritmo</h2>
          <div className={estilos.fila}>
            <label>
              <span>Meta diaria</span>
              <small>En unidades de 25 puntos: con 2, son 50 puntos al día</small>
              <input type="number" min={0} max={20} value={form.metaDiaria} onChange={(e) => cambiar("metaDiaria", e.target.value)} />
            </label>
            <label>
              <span>Tope de deuda</span>
              <small>Máximo que se acumula, también en unidades de 25</small>
              <input type="number" min={0} max={50} value={form.topeDeuda} onChange={(e) => cambiar("topeDeuda", e.target.value)} />
            </label>
            <label>
              <span>Fecha meta</span>
              <small>Cuándo quieres empezar a postular</small>
              <input type="date" value={form.fechaMeta} onChange={(e) => cambiar("fechaMeta", e.target.value)} />
            </label>
          </div>

          <div className={estilos.acciones}>
            <button type="submit" className="boton boton-primario" disabled={estado === "guardando"}>
              Guardar
            </button>
            {estado === "guardado" && <span className={estilos.ok}>Guardado</span>}
            {estado === "error" && <span className={estilos.error}>No se pudo guardar</span>}
          </div>
        </form>

        <section className={seccion.seccion}>
          <h2>Apariencia</h2>
          <div className={seccion.acciones}>
            <button type="button" className="boton" onClick={alternar}>
              {tema === "oscuro" ? <IconoSol /> : <IconoLuna />}
              {tema === "oscuro" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            </button>
          </div>
        </section>

        {seccionExtra ?? <SeccionSync />}
      </div>
    </section>
  );
}
