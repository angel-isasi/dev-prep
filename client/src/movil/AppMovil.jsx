// Rutas de la versión publicada (dev-prep.angel-isasi.com). En el build "movil" Vite usa este
// archivo en lugar de App.jsx (ver vite.config.js).
//
// Mismo diseño que la laptop en pantalla grande; diseño de celular en pantalla chica.
// - Pantalla grande (900 px o más): el Layout, Inicio, Progreso y Ajustes de la laptop, idénticos.
//   Solo cambia lo que no puede funcionar sin la laptop: no hay VS Code ni tests.
// - Pantalla chica: navegación abajo, Hoy y Ajustes del celular.
// - En las dos: los ejercicios se abren en modo estudio, y hay lecciones y chuletas.
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import { usePantallaGrande } from "../hooks/usePantallaGrande.js";
import { iniciarSincronizacion } from "../lib/sync-movil.js";
import { Layout } from "../components/Layout.jsx";
import { LayoutMovil } from "./LayoutMovil.jsx";
import { AvisoPWA } from "./AvisoPWA.jsx";
import { HoyMovil } from "./HoyMovil.jsx";
import { EjercicioMovil } from "./EjercicioMovil.jsx";
import { ChuletasMovil } from "./ChuletasMovil.jsx";
import { MasMovil } from "./MasMovil.jsx";
import { AjustesMovil } from "./AjustesMovil.jsx";
import { SeccionWeb } from "./SeccionWeb.jsx";
import { VincularMovil } from "./VincularMovil.jsx";
import { LeccionMovil } from "./leccion/LeccionMovil.jsx";
import { CaminoMovil } from "./leccion/CaminoMovil.jsx";
import { Inicio } from "../pages/Inicio.jsx";
import { Progreso } from "../pages/Progreso.jsx";
import { Ajustes } from "../pages/Ajustes.jsx";
import { Practicar } from "../pages/Practicar.jsx";
import { ListaEjercicios } from "../pages/ListaEjercicios.jsx";
import { Aprender } from "../pages/Aprender.jsx";
import { Tema } from "../pages/Tema.jsx";
import { Referencia } from "../pages/Referencia.jsx";
import { Entrevistas } from "../pages/Entrevistas.jsx";
import { Proximamente } from "../pages/Proximamente.jsx";

export function App() {
  const grande = usePantallaGrande();

  // Une el progreso con la laptop cuando hay internet (si este dispositivo está vinculado).
  useEffect(() => iniciarSincronizacion(), []);

  return (
    <>
      <Routes>
        <Route element={grande ? <Layout /> : <LayoutMovil />}>
          <Route index element={grande ? <Inicio /> : <HoyMovil />} />
          <Route path="aprender" element={<Aprender />} />
          <Route path="aprender/:id" element={<Tema />} />
          <Route path="practicar" element={<Practicar />} />
          <Route path="practicar/lista" element={<ListaEjercicios />} />
          <Route path="practicar/:id" element={<EjercicioMovil />} />
          <Route path="entrevistas" element={<Entrevistas />} />
          <Route path="referencia" element={<Referencia />} />
          <Route path="progreso" element={grande ? <Progreso /> : <Navigate to="/" replace />} />
          <Route path="ajustes" element={grande ? <Ajustes seccionExtra={<SeccionWeb />} /> : <AjustesMovil />} />
          <Route path="chuletas" element={<ChuletasMovil />} />
          <Route path="camino" element={<CaminoMovil />} />
          <Route path="leccion" element={<LeccionMovil />} />
          <Route path="mas" element={grande ? <Navigate to="/" replace /> : <MasMovil />} />
          <Route path="vincular" element={<VincularMovil />} />
          <Route path="*" element={<Proximamente titulo="Página no encontrada" texto="Esta ruta no existe." />} />
        </Route>
      </Routes>
      <AvisoPWA />
    </>
  );
}
