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
import { useEffect, useState } from "react";
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
import { SeccionWeb } from "./SeccionWeb.jsx";
import { SeccionRutina } from "../components/SeccionRutina.jsx";
import { SeccionAvisos } from "../components/SeccionAvisos.jsx";
import { perezoso } from "../lib/perezoso.js";
import { api } from "../lib/api.js";
import { ES_VISITA } from "../lib/visita.js";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { MarcoVisita } from "./Visita.jsx";

// Cada pantalla se descarga cuando se abre (ver lib/perezoso.js)
const EjercicioMovil = perezoso(() => import("./EjercicioMovil.jsx"), "EjercicioMovil");
const ChuletasMovil = perezoso(() => import("./ChuletasMovil.jsx"), "ChuletasMovil");
const VincularMovil = perezoso(() => import("./VincularMovil.jsx"), "VincularMovil");
const LeccionMovil = perezoso(() => import("./leccion/LeccionMovil.jsx"), "LeccionMovil");
const RutaLecciones = perezoso(() => import("./leccion/RutaLecciones.jsx"), "RutaLecciones");
const InglesMovil = perezoso(() => import("./ingles/InglesMovil.jsx"), "InglesMovil");
const InglesUnidad = perezoso(() => import("./ingles/InglesUnidad.jsx"), "InglesUnidad");
const HistoriaMovil = perezoso(() => import("./ingles/Historias.jsx"), "HistoriaMovil");
const ListaHistorias = perezoso(() => import("./ingles/Historias.jsx"), "ListaHistorias");
const RoleplayMovil = perezoso(() => import("./ingles/Historias.jsx"), "RoleplayMovil");
const ParejasMovil = perezoso(() => import("./ingles/Parejas.jsx"), "ParejasMovil");
const ExamenNivel = perezoso(() => import("./ingles/ExamenNivel.jsx"), "ExamenNivel");
const PaginaMapache = perezoso(() => import("./mapache/PaginaMapache.jsx"), "PaginaMapache");
const CasoRevision = perezoso(() => import("./practica/Revision.jsx"), "CasoRevision");
const ListaRevision = perezoso(() => import("./practica/Revision.jsx"), "ListaRevision");
const Glosario = perezoso(() => import("./practica/Glosario.jsx"), "Glosario");
const GitPractico = perezoso(() => import("./practica/GitPractico.jsx"), "GitPractico");
const PaginaLogros = perezoso(() => import("../components/Logros.jsx"), "PaginaLogros");
const Trabajo = perezoso(() => import("./trabajo/Trabajo.jsx"), "Trabajo");
const Enfoque = perezoso(() => import("../components/Rutina.jsx"), "Enfoque");
const PaginaDiario = perezoso(() => import("../components/Rutina.jsx"), "PaginaDiario");
const Hoy = perezoso(() => import("../pages/Hoy.jsx"), "Hoy");
const Progreso = perezoso(() => import("../pages/Progreso.jsx"), "Progreso");
const Ajustes = perezoso(() => import("../pages/Ajustes.jsx"), "Ajustes");
const Practicar = perezoso(() => import("../pages/Practicar.jsx"), "Practicar");
const ListaEjercicios = perezoso(() => import("../pages/ListaEjercicios.jsx"), "ListaEjercicios");
const Aprender = perezoso(() => import("../pages/Aprender.jsx"), "Aprender");
const Tema = perezoso(() => import("../pages/Tema.jsx"), "Tema");
const Referencia = perezoso(() => import("../pages/Referencia.jsx"), "Referencia");
const Entrevistas = perezoso(() => import("../pages/Entrevistas.jsx"), "Entrevistas");
const Proximamente = perezoso(() => import("../pages/Proximamente.jsx"), "Proximamente");

export function App() {
  const grande = usePantallaGrande();
  const enMiLaptop = useConexionLocal(grande);

  // Une el progreso con la laptop cuando hay internet (si este dispositivo está vinculado).
  useEffect(() => iniciarSincronizacion(), []);

  // Modo visita (?visita=1): antes de mostrar nada se arma el progreso de ejemplo, en memoria
  const [visitaLista, setVisitaLista] = useState(!ES_VISITA);
  useEffect(() => {
    if (ES_VISITA) api.prepararVisita().finally(() => setVisitaLista(true));
  }, []);

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
      <Route path="camino" element={<RutaLecciones />} />
      <Route path="leccion" element={<LeccionMovil />} />
      <Route path="vincular" element={<VincularMovil />} />
      {/* "Más" ya no existe: sus opciones están en las 6 secciones y en el buscador */}
      <Route path="mas" element={<Navigate to="/" replace />} />
    </>
  );

  if (!visitaLista) return <Esqueleto variante="tarjetas" />;

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

  const rutas = (
    <>
      <Routes key="web">
        <Route element={grande ? <Layout /> : <LayoutMovil />}>
          <Route index element={<Hoy />} />
          <Route path="aprender" element={<Aprender />} />
          <Route path="aprender/:id" element={<Tema />} />
          <Route path="practicar" element={<Practicar />} />
          <Route path="practicar/lista" element={<ListaEjercicios />} />
          <Route path="practicar/:id" element={<EjercicioMovil />} />
          <Route path="entrevistas" element={<Entrevistas />} />
          <Route path="referencia" element={<Referencia />} />
          <Route path="progreso" element={<Progreso />} />
          <Route path="ajustes" element={<Ajustes seccionExtra={<SeccionWeb />} />} />
          {soloWeb}
          <Route path="*" element={<Proximamente titulo="Página no encontrada" texto="Esta ruta no existe." />} />
        </Route>
      </Routes>
      {/* A una visita no se le ofrece instalar la app */}
      {!ES_VISITA && <AvisoPWA />}
    </>
  );

  return ES_VISITA ? <MarcoVisita>{rutas}</MarcoVisita> : rutas;
}
