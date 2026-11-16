import { Route, Routes } from "react-router";
import { Layout } from "./components/Layout.jsx";
import { Practicar } from "./pages/Practicar.jsx";
import { ListaEjercicios } from "./pages/ListaEjercicios.jsx";
import { Ejercicio } from "./pages/Ejercicio.jsx";
import { Proximamente } from "./pages/Proximamente.jsx";
import { Inicio } from "./pages/Inicio.jsx";
import { Progreso } from "./pages/Progreso.jsx";
import { Ajustes } from "./pages/Ajustes.jsx";
import { Entrevistas } from "./pages/Entrevistas.jsx";
import { Aprender } from "./pages/Aprender.jsx";
import { Tema } from "./pages/Tema.jsx";
import { Referencia } from "./pages/Referencia.jsx";

/** Las pantallas de la app local. La versión web las usa tal cual cuando está conectada a tu laptop. */
export function RutasLaptop({ ajustesExtra, children } = {}) {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="practicar" element={<Practicar />} />
        <Route path="practicar/lista" element={<ListaEjercicios />} />
        <Route path="practicar/:id" element={<Ejercicio />} />
        <Route path="aprender" element={<Aprender />} />
        <Route path="aprender/:id" element={<Tema />} />
        <Route path="referencia" element={<Referencia />} />
        <Route path="entrevistas" element={<Entrevistas />} />
        <Route path="progreso" element={<Progreso />} />
        <Route path="ajustes" element={<Ajustes seccionExtra={ajustesExtra} />} />
        {children}
        <Route path="*" element={<Proximamente titulo="Página no encontrada" texto="Esta ruta no existe." />} />
      </Route>
    </Routes>
  );
}
