// Página del plan junior (/plan): todo el plan en una pantalla. La lógica está en components/plan/Plan.jsx.
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { PlanCompleto } from "../components/plan/Plan.jsx";
import pagina from "./Entrevistas.module.css";

export function Plan() {
  return (
    <section className={pagina.pagina}>
      <CabeceraPagina etiqueta="Lo necesario para una entrevista junior" titulo="Mi plan" />
      <PlanCompleto />
    </section>
  );
}
