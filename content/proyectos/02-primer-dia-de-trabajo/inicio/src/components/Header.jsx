import { countByStatus } from "../utils/status.js";

// Cabecera del panel: nombre del local y cuántos pedidos hay en cada estado.
export function Header({ orders }) {
  const counts = countByStatus(orders);
  return (
    <header className="header">
      <div>
        <h1>MesaYa</h1>
        <p className="header__place">Sabor Norteño · Miraflores</p>
      </div>
      <ul className="header__counters" aria-label="Resumen de pedidos">
        <li>Pendientes: {counts.pendiente}</li>
        <li>En cocina: {counts.en_cocina}</li>
        <li>Listos: {counts.listo}</li>
      </ul>
    </header>
  );
}
