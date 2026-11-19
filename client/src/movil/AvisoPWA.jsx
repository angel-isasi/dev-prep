// Avisos de la app instalada:
// - "Lista para usar sin internet": la primera vez, cuando terminó de guardar todo el contenido.
// - Contenido nuevo (git push): se instala solo, sin botón. Se aplica al abrir la app, al volver a
//   ella o al cambiar de pantalla, pero nunca en medio de una lección, un ejercicio, una historia o un
//   simulacro: ahí espera a que salgas, para no cortarte lo que estás haciendo.
import { useEffect } from "react";
import { useLocation } from "react-router";
import { useRegisterSW } from "virtual:pwa-register/react";
import { estaOcupado } from "./ocupado.js";
import { AnimatePresence, motion } from "motion/react";
import estilos from "./AvisoPWA.module.css";

const UNA_HORA = 60 * 60 * 1000;

export function AvisoPWA() {
  const {
    offlineReady: [listaOffline, setListaOffline],
    needRefresh: [hayNuevo],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registro) {
      // Mientras la app está abierta, revisa cada hora si hay contenido nuevo (solo con internet).
      if (registro) setInterval(() => navigator.onLine && registro.update().catch(() => {}), UNA_HORA);
    },
  });

  const ubicacion = useLocation();

  // Hay versión nueva: se aplica sola en cuanto no estés en medio de algo (al cambiar de pantalla
  // o al volver a la app). updateServiceWorker(true) activa la versión nueva y recarga la página.
  useEffect(() => {
    if (!hayNuevo) return;
    const aplicar = () => {
      if (document.visibilityState === "visible" && !estaOcupado(window.location)) updateServiceWorker(true);
    };
    aplicar();
    document.addEventListener("visibilitychange", aplicar);
    return () => document.removeEventListener("visibilitychange", aplicar);
  }, [hayNuevo, ubicacion.pathname, ubicacion.search]);

  // Al volver a la app también se busca si hay algo nuevo (no solo cada hora)
  useEffect(() => {
    const revisar = () => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return;
      navigator.serviceWorker?.getRegistration().then((r) => r?.update().catch(() => {}));
    };
    document.addEventListener("visibilitychange", revisar);
    return () => document.removeEventListener("visibilitychange", revisar);
  }, []);

  const aviso = listaOffline
      ? { texto: "Lista para usar sin internet.", accion: "Entendido", alAccion: () => setListaOffline(false) }
      : null;

  return (
    <AnimatePresence>
      {aviso && (
        <motion.div
          className={estilos.aviso}
          role="status"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
        >
          <span>{aviso.texto}</span>
          {aviso.cerrar && (
            <button type="button" className={estilos.secundario} onClick={aviso.cerrar}>
              Luego
            </button>
          )}
          <button type="button" className={estilos.principal} onClick={aviso.alAccion}>
            {aviso.accion}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
