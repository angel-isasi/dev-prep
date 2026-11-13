import { Outlet } from "react-router";
import { BarraLateral } from "./BarraLateral.jsx";
import estilos from "./Layout.module.css";

export function Layout() {
  return (
    <div className={estilos.layout}>
      <BarraLateral />
      <main className={estilos.principal}>
        <Outlet />
      </main>
    </div>
  );
}
