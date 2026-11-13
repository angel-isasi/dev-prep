import { Navigate, Route, Routes } from "react-router";
import { Layout } from "./components/Layout.jsx";
import { Practicar } from "./pages/Practicar.jsx";
import { Ejercicio } from "./pages/Ejercicio.jsx";
import { Proximamente } from "./pages/Proximamente.jsx";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Inicio llega en la fase 4; mientras tanto, se entra directo a Practicar */}
        <Route index element={<Navigate to="/practicar" replace />} />
        <Route path="practicar" element={<Practicar />} />
        <Route path="practicar/:id" element={<Ejercicio />} />
        <Route
          path="aprender"
          element={<Proximamente titulo="Aprender" texto="Teoría corta, ejercicios guiados, quizzes y una referencia offline de JavaScript y React." />}
        />
        <Route
          path="entrevistas"
          element={<Proximamente titulo="Entrevistas" texto="Tarjetas de preguntas con respuesta modelo, método STAR, tu pitch y simulacros con tiempo." />}
        />
        <Route
          path="progreso"
          element={<Proximamente titulo="Progreso" texto="Racha, meta diaria, calendario de actividad y tu porcentaje de preparación." />}
        />
        <Route path="*" element={<Proximamente titulo="Página no encontrada" texto="Esta ruta no existe." />} />
      </Route>
    </Routes>
  );
}
