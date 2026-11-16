// Rutas de la versión celular. En el build "movil" Vite usa este archivo en lugar de App.jsx
// (ver vite.config.js), así el celular no carga las pantallas que solo sirven en la laptop.
import { Navigate, Route, Routes } from "react-router";
import { LayoutMovil } from "./LayoutMovil.jsx";
import { HoyMovil } from "./HoyMovil.jsx";
import { EjercicioMovil } from "./EjercicioMovil.jsx";
import { ChuletasMovil } from "./ChuletasMovil.jsx";
import { MasMovil } from "./MasMovil.jsx";
import { AjustesMovil } from "./AjustesMovil.jsx";
import { Practicar } from "../pages/Practicar.jsx";
import { ListaEjercicios } from "../pages/ListaEjercicios.jsx";
import { Aprender } from "../pages/Aprender.jsx";
import { Tema } from "../pages/Tema.jsx";
import { Referencia } from "../pages/Referencia.jsx";
import { Entrevistas } from "../pages/Entrevistas.jsx";
import { Proximamente } from "../pages/Proximamente.jsx";

export function App() {
  return (
    <Routes>
      <Route element={<LayoutMovil />}>
        <Route index element={<HoyMovil />} />
        <Route path="aprender" element={<Aprender />} />
        <Route path="aprender/:id" element={<Tema />} />
        <Route path="practicar" element={<Practicar />} />
        <Route path="practicar/lista" element={<ListaEjercicios />} />
        <Route path="practicar/:id" element={<EjercicioMovil />} />
        <Route path="entrevistas" element={<Entrevistas />} />
        <Route path="referencia" element={<Referencia />} />
        <Route path="chuletas" element={<ChuletasMovil />} />
        <Route path="mas" element={<MasMovil />} />
        <Route path="ajustes" element={<AjustesMovil />} />
        {/* Progreso de la laptop: en el celular, el resumen está en Hoy */}
        <Route path="progreso" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Proximamente titulo="Página no encontrada" texto="Esta ruta no existe." />} />
      </Route>
    </Routes>
  );
}
