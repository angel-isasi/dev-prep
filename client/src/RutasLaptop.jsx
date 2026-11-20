import { Route, Routes } from "react-router";
import { Layout } from "./components/Layout.jsx";
import { perezoso } from "./lib/perezoso.js";

// Cada pantalla se descarga cuando se abre (ver lib/perezoso.js)
const Practicar = perezoso(() => import("./pages/Practicar.jsx"), "Practicar");
const ListaEjercicios = perezoso(() => import("./pages/ListaEjercicios.jsx"), "ListaEjercicios");
const Ejercicio = perezoso(() => import("./pages/Ejercicio.jsx"), "Ejercicio");
const EntrenaIa = perezoso(() => import("./pages/EntrenaIa.jsx"), "EntrenaIa");
const Proximamente = perezoso(() => import("./pages/Proximamente.jsx"), "Proximamente");
const Hoy = perezoso(() => import("./pages/Hoy.jsx"), "Hoy");
const Progreso = perezoso(() => import("./pages/Progreso.jsx"), "Progreso");
const Ajustes = perezoso(() => import("./pages/Ajustes.jsx"), "Ajustes");
const Entrevistas = perezoso(() => import("./pages/Entrevistas.jsx"), "Entrevistas");
const Aprender = perezoso(() => import("./pages/Aprender.jsx"), "Aprender");
const Tema = perezoso(() => import("./pages/Tema.jsx"), "Tema");
const Referencia = perezoso(() => import("./pages/Referencia.jsx"), "Referencia");

/** Las pantallas de la app local. La versión web las usa tal cual cuando está conectada a tu laptop. */
export function RutasLaptop({ ajustesExtra, children } = {}) {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Hoy />} />
        <Route path="practicar" element={<Practicar />} />
        <Route path="practicar/lista" element={<ListaEjercicios />} />
        <Route path="practicar/ia" element={<EntrenaIa />} />
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
