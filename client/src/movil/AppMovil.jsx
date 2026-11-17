// Rutas de la versión publicada (dev-prep.angel-isasi.com). En el build "movil" Vite usa este
// archivo en lugar de App.jsx (ver vite.config.js).
//
// Mismo diseño que la laptop en pantalla grande; diseño de celular en pantalla chica.
// - Pantalla grande (900 px o más): el Layout, Inicio, Progreso y Ajustes de la laptop, idénticos.
//   Solo cambia lo que no puede funcionar sin la laptop: no hay VS Code ni tests.
// - Pantalla chica: navegación abajo, Hoy y Ajustes del celular.
// - En las dos: los ejercicios se abren en modo estudio, y hay lecciones y chuletas.
// - En tu laptop con dev-prep abierto: exactamente la app local (VS Code, tests en vivo, resuelto),
//   más lecciones y chuletas. Ver lib/conexion-local.js.
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import { usePantallaGrande } from "../hooks/usePantallaGrande.js";
import { useConexionLocal } from "../hooks/useConexionLocal.js";
import { RutasLaptop } from "../RutasLaptop.jsx";
import { SeccionSync } from "../components/SeccionSync.jsx";
import { SeccionLaptop } from "./SeccionLaptop.jsx";
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
import { InglesMovil } from "./ingles/InglesMovil.jsx";
import { InglesUnidad } from "./ingles/InglesUnidad.jsx";
import { HistoriaMovil, ListaHistorias, RoleplayMovil } from "./ingles/Historias.jsx";
import { ParejasMovil } from "./ingles/Parejas.jsx";
import { ExamenNivel } from "./ingles/ExamenNivel.jsx";
import { PaginaMapache } from "./mapache/PaginaMapache.jsx";
import { CasoRevision, ListaRevision } from "./practica/Revision.jsx";
import { Glosario } from "./practica/Glosario.jsx";
import { GitPractico } from "./practica/GitPractico.jsx";
import { PaginaLogros } from "../components/Logros.jsx";
import { SeccionRutina } from "../components/SeccionRutina.jsx";
import { SeccionAvisos } from "../components/SeccionAvisos.jsx";
import { Trabajo } from "./trabajo/Trabajo.jsx";
import { Enfoque, PaginaDiario } from "../components/Rutina.jsx";
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
  const enMiLaptop = useConexionLocal(grande);

  // Une el progreso con la laptop cuando hay internet (si este dispositivo está vinculado).
  useEffect(() => iniciarSincronizacion(), []);

  // Lo que la web tiene además de la app local
  const soloWeb = (
    <>
      <Route path="chuletas" element={<ChuletasMovil />} />
      <Route path="ingles" element={<InglesMovil />} />
      <Route path="ingles/unidad/:id" element={<InglesUnidad />} />
      <Route path="ingles/historias" element={<ListaHistorias />} />
      <Route path="ingles/historia/:id" element={<HistoriaMovil />} />
      <Route path="ingles/roleplay/:id" element={<RoleplayMovil />} />
      <Route path="ingles/parejas" element={<ParejasMovil />} />
      <Route path="ingles/examen" element={<ExamenNivel />} />
      <Route path="ingles/mapache" element={<PaginaMapache />} />
      <Route path="revision" element={<ListaRevision />} />
      <Route path="revision/:id" element={<CasoRevision />} />
      <Route path="glosario" element={<Glosario />} />
      <Route path="git" element={<GitPractico />} />
      <Route path="logros" element={<PaginaLogros />} />
      <Route path="diario" element={<PaginaDiario />} />
      <Route path="enfoque" element={<Enfoque />} />
      <Route path="trabajo" element={<Trabajo />} />
      <Route path="camino" element={<CaminoMovil />} />
      <Route path="leccion" element={<LeccionMovil />} />
      <Route path="vincular" element={<VincularMovil />} />
    </>
  );

  if (enMiLaptop) {
    return (
      <>
        <RutasLaptop
          key="laptop"
          ajustesExtra={
            <>
              <SeccionSync />
              <SeccionLaptop />
              <SeccionAvisos />
              <SeccionRutina />
            </>
          }
        >
          {soloWeb}
        </RutasLaptop>
        <AvisoPWA />
      </>
    );
  }

  return (
    <>
      <Routes key="web">
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
          <Route path="ingles" element={<InglesMovil />} />
          <Route path="ingles/unidad/:id" element={<InglesUnidad />} />
          <Route path="ingles/historias" element={<ListaHistorias />} />
          <Route path="ingles/historia/:id" element={<HistoriaMovil />} />
          <Route path="ingles/roleplay/:id" element={<RoleplayMovil />} />
          <Route path="ingles/parejas" element={<ParejasMovil />} />
          <Route path="ingles/examen" element={<ExamenNivel />} />
          <Route path="ingles/mapache" element={<PaginaMapache />} />
      <Route path="revision" element={<ListaRevision />} />
      <Route path="revision/:id" element={<CasoRevision />} />
      <Route path="glosario" element={<Glosario />} />
      <Route path="git" element={<GitPractico />} />
      <Route path="logros" element={<PaginaLogros />} />
      <Route path="diario" element={<PaginaDiario />} />
      <Route path="enfoque" element={<Enfoque />} />
      <Route path="trabajo" element={<Trabajo />} />
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
