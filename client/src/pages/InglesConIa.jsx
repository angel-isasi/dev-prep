// Inglés > Con IA: lo que necesita a la IA para corregirte o crear algo distinto cada vez.
import { Link } from "react-router";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { InglesIa } from "../components/ia/InglesIa.jsx";

export function InglesConIa() {
  return (
    <section style={{ display: "grid", gap: "var(--espacio-4)" }}>
      <CabeceraPagina etiqueta="Inglés para el trabajo" titulo="Inglés con IA" />
      <p style={{ margin: 0, color: "var(--texto-suave)" }}>
        Las reuniones de trabajo (daily, revisión de código, planificación, demo con un cliente) están en <Link to="/ingles/conversa">Conversa</Link>.
      </p>
      <InglesIa />
    </section>
  );
}
