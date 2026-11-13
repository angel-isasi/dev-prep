import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { Esqueleto } from "../components/Esqueleto.jsx";
import estilos from "./Ajustes.module.css";

export function Ajustes() {
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
      <h1>Ajustes</h1>
      <form className={estilos.formulario} onSubmit={guardar}>
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

        <div className={estilos.fila}>
          <label>
            <span>Meta diaria</span>
            <small>Ejercicios resueltos + repasos por día</small>
            <input
              type="number"
              min={0}
              max={20}
              value={form.metaDiaria}
              onChange={(e) => cambiar("metaDiaria", e.target.value)}
            />
          </label>
          <label>
            <span>Tope de deuda</span>
            <small>Máximo que se acumula de días sin cumplir</small>
            <input
              type="number"
              min={0}
              max={50}
              value={form.topeDeuda}
              onChange={(e) => cambiar("topeDeuda", e.target.value)}
            />
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
    </section>
  );
}
